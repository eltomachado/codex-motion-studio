import React from 'react';
import {AbsoluteFill, Sequence, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import type {VideoProps} from './Root';
import type {Project, Scene} from './types';

const easing = Easing.bezier(.16,1,.3,1);
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

function Background({p}:{p:Project}) {
  const frame=useCurrentFrame(), {fps}=useVideoConfig();
  const t=frame/fps;
  const energy=p.peaks[Math.min(p.peaks.length-1, Math.floor(t*30))]??0;
  return <AbsoluteFill style={{background:p.theme.background,overflow:'hidden'}}>
    <AbsoluteFill style={{background:`radial-gradient(ellipse at ${72+Math.sin(t*.25)*7}% 40%, ${p.theme.secondary}28 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, ${p.theme.accent}20, transparent 45%)`}}/>
    <svg viewBox="0 0 1920 1080" style={{position:'absolute',width:'100%',height:'100%',opacity:.2}}>
      {Array.from({length:24},(_,i)=><line key={i} x1={i*100-250} y1="1080" x2={960+(i-12)*30} y2="540" stroke={p.theme.accent} strokeWidth="1"/>)}
      {Array.from({length:9},(_,i)=><line key={i} x1="0" x2="1920" y1={600+i*i*7} y2={600+i*i*7} stroke={p.theme.secondary} strokeWidth="1"/>)}
    </svg>
    <div style={{position:'absolute',right:155,top:140,width:560,height:560,border:`1px solid ${p.theme.accent}40`,borderRadius:'50%',scale:1+energy*.07,opacity:.55}}/>
    <div style={{position:'absolute',right:185,top:170,width:500,height:500,border:`2px dashed ${p.theme.secondary}70`,borderRadius:'50%',rotate:`${t*9}deg`}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:220,background:`linear-gradient(transparent, ${p.theme.background})`}}/>
    <div style={{position:'absolute',left:80,right:80,top:65,height:2,background:`linear-gradient(90deg,${p.theme.accent},transparent 65%)`}}/>
    <div style={{position:'absolute',right:80,top:67,width:8,height:60,background:p.theme.secondary}}/>
  </AbsoluteFill>;
}

function Wave({p,ms,width=1050,height=150}:{p:Project;ms:number;width?:number;height?:number}) {
  const center=Math.floor(ms/1000*30);
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    {Array.from({length:66},(_,i)=>{
      const level=p.peaks[Math.max(0,Math.min(p.peaks.length-1,center+i-33))]??0;
      const h=8+level*(height-20);
      return <rect key={i} x={i*width/66+2} y={(height-h)/2} width={Math.max(3,width/66-7)} height={h} rx={3} fill={i<33?p.theme.accent:p.theme.secondary} opacity={.4+level*.6}/>;
    })}
  </svg>;
}

function SceneView({scene,p,index}:{scene:Scene;p:Project;index:number}) {
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const duration=Math.max(1,Math.round((scene.endMs-scene.startMs)/1000*fps));
  const entranceFrames=Math.min(22,Math.max(1,Math.floor(duration*.4)));
  const enter=interpolate(frame,[0,entranceFrames],[0,1],{...clamp,easing});
  const exit=duration>12?interpolate(frame,[duration-8,duration],[1,0],clamp):1;
  const comparison=scene.visual==='comparison';
  const fontSize=scene.headline.length>55?86:scene.headline.length>35?110:138;
  const now=scene.startMs+frame/fps*1000;
  return <AbsoluteFill style={{padding:'115px 110px',color:p.theme.text,opacity:enter*exit,fontFamily:'Arial, Helvetica, sans-serif',translate:`0 ${(1-enter)*45}px`,scale:.98+enter*.02}}>
    <div style={{display:'flex',alignItems:'center',gap:18,color:p.theme.accent,fontSize:21,fontWeight:700,letterSpacing:5}}>
      <span style={{width:28,height:3,background:p.theme.accent}}/>
      {String(index+1).padStart(2,'0')} / {String(p.scenes.length).padStart(2,'0')}
    </div>
    <div style={{marginTop:47,width:comparison?1640:1260,fontSize:comparison?Math.min(104,fontSize):fontSize,fontWeight:800,lineHeight:1.03,letterSpacing:-5,whiteSpace:'pre-line',overflowWrap:'break-word',textShadow:`0 0 70px ${p.theme.accent}18`}}>{scene.headline}</div>
    {comparison ? <div style={{display:'flex',gap:36,marginTop:55}}>
      {(scene.labels??['VERSÃO A','VERSÃO B']).map((label,i)=><div key={i} style={{width:790,height:235,padding:'32px 35px',border:`1px solid ${i?p.theme.secondary:p.theme.accent}80`,background:`linear-gradient(120deg,${i?p.theme.secondary:p.theme.accent}15,transparent)`,borderRadius:16}}>
        <div style={{fontSize:20,letterSpacing:3,color:i?p.theme.secondary:p.theme.accent,marginBottom:18}}>0{i+1}</div>
        <div style={{fontSize:label.length>20?40:52,fontWeight:700,letterSpacing:-1}}>{label}</div>
        <Wave p={p} ms={now} width={680} height={64}/>
      </div>)}
    </div>:<div style={{marginTop:45,opacity:.95}}><Wave p={p} ms={now} width={scene.visual==='waveform'?1500:1080} height={scene.visual==='waveform'?180:100}/></div>}
    <div style={{marginTop:comparison?35:34,maxWidth:1500,fontSize:35,lineHeight:1.35,color:`${p.theme.text}BD`}}>{scene.detail}</div>
  </AbsoluteFill>;
}

function Captions({p}:{p:Project}) {
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const now=frame/fps*1000;
  const current=p.captions.findIndex(c=>now>=c.startMs&&now<c.endMs);
  if(current<0)return null;
  const start=Math.floor(current/5)*5;
  return <div style={{position:'absolute',bottom:65,left:100,right:100,textAlign:'center',fontSize:34,lineHeight:1.3,fontFamily:'Arial, Helvetica, sans-serif',fontWeight:700}}>
    <span style={{background:'#050815E8',padding:'15px 24px',borderRadius:12}}>
      {p.captions.slice(start,start+5).map((c,i)=><span key={start+i} style={{color:start+i===current?p.theme.accent:p.theme.text}}> {c.text} </span>)}
    </span>
  </div>;
}

export const MotionVideo:React.FC<VideoProps> = ({project}) => {
  const {fps,width,height}=useVideoConfig();
  if(!project)throw new Error('Metadados ausentes. Selecione AudioMotion pelo renderizador do projeto.');
  const p=project;
  return <AbsoluteFill>
    <Audio src={staticFile(`projects/${p.id}/${p.audio}`)} premountFor={fps}/>
    <div style={{position:'absolute',width:1920,height:1080,transformOrigin:'top left',transform:`scale(${width/1920},${height/1080})`,overflow:'hidden'}}>
      <Background p={p}/>
      {p.scenes.map((scene,index)=>{
        const from=Math.round(scene.startMs/1000*fps);
        const until=index===p.scenes.length-1?Math.ceil(p.durationMs/1000*fps):Math.round(scene.endMs/1000*fps);
        return <Sequence key={index} name={scene.headline} from={from} durationInFrames={Math.max(1,until-from)} premountFor={fps}><SceneView scene={scene} p={p} index={index}/></Sequence>;
      })}
      {p.showCaptions&&<Captions p={p}/>}
      {p.status==='demo'&&<div style={{position:'absolute',right:110,bottom:38,color:'#9AA7BF',fontFamily:'Arial',fontSize:17,letterSpacing:2}}>DEMO VISUAL / ÁUDIO SINTÉTICO</div>}
    </div>
  </AbsoluteFill>;
};
