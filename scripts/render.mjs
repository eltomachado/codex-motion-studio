import {parseArgs} from 'node:util';
import {mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {at,main,loadProject,projectDir,saveJson,remotionBrowser} from './common.mjs';

main(async()=>{
  const {values} = parseArgs({options:{id:{type:'string',default:'demo'},quality:{type:'string',default:'final'},stills:{type:'boolean',default:false}}});
  if(!['draft','final'].includes(values.quality))throw new Error('quality deve ser draft ou final.');
  const p = await loadProject(values.id);
  if(p.status==='awaiting-direction')throw new Error('O projeto ainda e um rascunho tecnico. O Codex precisa criar as cenas a partir do prompt e marcar status ready.');
  const runId=new Date().toISOString().replace(/[:.]/g,'-');
  const dir=at('renders',p.id,runId);
  await mkdir(dir,{recursive:true});
  // Only this project's files enter the bundle, not other users' recordings.
  const publicDir=path.join(dir,'assets');
  const target=path.join(publicDir,'projects',p.id);
  await mkdir(target,{recursive:true});
  await copyFile(path.join(projectDir(p.id),'project.json'),path.join(target,'project.json'));
  await copyFile(path.join(projectDir(p.id),'audio.wav'),path.join(target,'audio.wav'));
  const browser=await remotionBrowser();
  if(!('path' in browser))throw new Error('Nao foi possivel preparar o Chromium. Execute npm run setup.');
  const serveUrl=await bundle({entryPoint:at('src/index.ts'),publicDir,outDir:at('.cache','bundle',p.id,runId),enableCaching:true});
  const inputProps={projectId:p.id};
  const composition=await selectComposition({serveUrl,id:'AudioMotion',inputProps,browserExecutable:browser.path});
  const base={serveUrl,composition,inputProps,browserExecutable:browser.path,overwrite:false};
  // A still from each scene is used by Codex for visual review in chat.
  const frames=p.scenes.map(s=>Math.min(composition.durationInFrames-1,Math.round((s.startMs+Math.min(1000,(s.endMs-s.startMs)*.5))/1000*p.fps)));
  for(let i=0;i<frames.length;i++)await renderStill({...base,frame:frames[i],output:path.join(dir,`cena-${String(i+1).padStart(2,'0')}.png`),imageFormat:'png',scale:.75});
  if(!values.stills){
    let last=-1;
    await renderMedia({...base,codec:'h264',audioCodec:'aac',pixelFormat:'yuv420p',outputLocation:path.join(dir,`${p.id}.mp4`),concurrency:2,scale:values.quality==='draft'?.5:1,crf:values.quality==='draft'?26:18,onProgress:({progress})=>{const step=Math.floor(progress*10);if(step>last){console.log(`Render: ${Math.min(100,step*10)}%`);last=step;}}});
  }
  await saveJson(path.join(dir,'render-report.json'),{projectId:p.id,quality:values.quality,renderedVideo:!values.stills,durationInFrames:composition.durationInFrames,fps:p.fps,width:composition.width,height:composition.height,scale:values.quality==='draft'?.5:1,frames,createdAt:new Date().toISOString()});
  console.log(`\nArquivos prontos em: ${dir}\nO Codex deve conferir as imagens e apresentar o video no chat.`);
});
