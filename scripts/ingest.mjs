import {parseArgs} from 'node:util';
import {createHash} from 'node:crypto';
import {readFile, mkdir, copyFile, writeFile, stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import {main, projectDir, workDir, saveJson, run} from './common.mjs';
import {MAX_SECONDS, validId, peaksFromPcm, parseSrt, validateCaptions, validateProject} from '../lib/project.mjs';

main(async () => {
  const {values} = parseArgs({options:{audio:{type:'string'},id:{type:'string'},'prompt-file':{type:'string'},captions:{type:'string'},language:{type:'string',default:'pt'}}});
  if (!values.audio || !values.id || !values['prompt-file']) throw new Error('Uso: npm run ingest -- --audio "arquivo.mp3" --id minha-intro --prompt-file "pedido.txt" [--captions arquivo.srt]');
  const id = validId(values.id);
  const audio = path.resolve(values.audio);
  if (!(await stat(audio)).isFile()) throw new Error('O audio precisa ser um arquivo local.');
  const prompt = (await readFile(path.resolve(values['prompt-file']),'utf8')).trim();
  if (!prompt || prompt.length > 50000) throw new Error('O prompt deve ter de 1 a 50000 caracteres.');
  const dir = projectDir(id), work = workDir(id);
  await mkdir(path.dirname(dir),{recursive:true});
  // Never reuse an existing ID: no audio or edited project is overwritten.
  await mkdir(dir);
  await mkdir(work,{recursive:true});
  if (!ffmpeg) throw new Error('FFmpeg nao disponivel nesta plataforma.');
  const buffer = execFileSync(ffmpeg,['-v','error','-i',audio,'-t',String(MAX_SECONDS+1),'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'],{maxBuffer:64*1024*1024,windowsHide:true});
  const samples = new Float32Array(buffer.length/4);
  for (let i=0;i<samples.length;i++) samples[i]=buffer.readFloatLE(i*4);
  const durationMs = Math.round(samples.length/16000*1000);
  if (durationMs < 100 || durationMs > MAX_SECONDS*1000) throw new Error('Use um audio entre 0,1 segundo e 15 minutos.');
  await run(ffmpeg,['-v','error','-n','-i',audio,'-vn','-c:a','pcm_s16le','-ar','48000',path.join(dir,'audio.wav')]);
  await copyFile(audio,path.join(work,`original${path.extname(audio) || '.audio'}`));
  await writeFile(path.join(work,'prompt.txt'),prompt+'\n');
  let captions, transcript, source;
  if (values.captions) {
    const data = await readFile(path.resolve(values.captions),'utf8');
    captions = values.captions.toLowerCase().endsWith('.srt') ? parseSrt(data,durationMs) : validateCaptions(JSON.parse(data),durationMs);
    transcript = captions.map(c=>c.text).join(' ');
    source='user-supplied';
  } else {
    const result = await (await import('./transcribe.mjs')).transcribe(samples,durationMs,values.language);
    ({captions,text:transcript}=result); source=result.model;
  }
  const project = {
    version:1,id,title:'Minha introdução',status:'awaiting-direction',durationMs,width:1920,height:1080,fps:30,audio:'audio.wav',showCaptions:false,
    theme:{background:'#060915',accent:'#42F8D5',secondary:'#AC7DFF',text:'#F4F7FF'},
    peaks:peaksFromPcm(samples),captions,
    scenes:[{startMs:0,endMs:durationMs,visual:'waveform',headline:'Sua voz. Sua ideia.',detail:'Rascunho técnico. O Codex ainda vai criar as cenas a partir do seu pedido.'}],
  };
  validateProject(project);
  await saveJson(path.join(dir,'project.json'),project);
  await saveJson(path.join(work,'transcript.json'),captions);
  await writeFile(path.join(work,'transcript.txt'),transcript+'\n');
  await saveJson(path.join(work,'source.json'),{originalBasename:path.basename(audio),sha256:createHash('sha256').update(await readFile(audio)).digest('hex'),durationMs,transcription:source});
  console.log(`\nAudio preparado: ${id} (${(durationMs/1000).toFixed(2)}s).\nO prompt NAO foi interpretado por este script. Agora o Codex deve ler work/projects/${id}/prompt.txt e transcript.json, criar as cenas em public/projects/${id}/project.json e marcar status ready.\nDepois: npm run render -- --id ${id}`);
});
