import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {main,projectDir,saveJson} from './common.mjs';
import {peaksFromPcm} from '../lib/project.mjs';

main(async()=>{
  const dir = projectDir('demo');
  if (existsSync(path.join(dir,'project.json'))) {console.log('Exemplo ja existe; mantido sem alteracoes.');return;}
  await mkdir(dir,{recursive:true});
  const rate=48000, seconds=12, samples=new Float32Array(16000*seconds);
  const wav=Buffer.alloc(44+rate*seconds*2);
  wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
  for(let i=0;i<rate*seconds;i++){
    const t=i/rate;
    const envelope=Math.exp(-9*(t%0.5))*Math.min(1,t*5,Math.max(0,(seconds-t)*4));
    const v=.10*envelope*(Math.sin(2*Math.PI*110*t)+.3*Math.sin(2*Math.PI*220*t));
    wav.writeInt16LE(Math.round(v*32767),44+i*2);
    if(i%3===0)samples[i/3]=v;
  }
  await writeFile(path.join(dir,'audio.wav'),wav);
  await saveJson(path.join(dir,'project.json'),{
    version:1,id:'demo',title:'Sua voz em movimento',status:'demo',durationMs:12000,fps:30,width:1920,height:1080,audio:'audio.wav',showCaptions:false,
    theme:{background:'#060915',accent:'#42F8D5',secondary:'#AC7DFF',text:'#F4F7FF'},captions:[],peaks:peaksFromPcm(samples),
    scenes:[
      {startMs:0,endMs:3000,visual:'title',headline:'Sua voz.\nEm movimento.',detail:'Uma ideia. Um áudio. Um novo começo.'},
      {startMs:3000,endMs:6000,visual:'waveform',headline:'O ritmo vem de você.',detail:'Motion graphics que acompanham a sua fala.'},
      {startMs:6000,endMs:9000,visual:'comparison',headline:'Mesmo áudio.\nDuas interpretações.',detail:'O seu pedido define a direção.',labels:['CODEX + REMOTION','HIGGSFIELD']},
      {startMs:9000,endMs:12000,visual:'finale',headline:'Agora é a sua vez.',detail:'Envie seu áudio e seu prompt no Codex.'},
    ]
  });
  console.log('Exemplo criado. Audio sintetico, sem narracao e sem arquivos de terceiros.');
});
