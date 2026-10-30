export type Caption = {text:string;startMs:number;endMs:number;timestampMs:number|null;confidence:number|null};
export type Scene = {startMs:number;endMs:number;visual:'title'|'waveform'|'comparison'|'keywords'|'finale';headline:string;detail:string;labels?:string[]};
export type Project = {
  version:1;id:string;title:string;status:'awaiting-direction'|'ready'|'demo';durationMs:number;
  fps:number;width:number;height:number;audio:string;showCaptions:boolean;
  theme:{background:string;accent:string;secondary:string;text:string};
  peaks:number[];captions:Caption[];scenes:Scene[];
};
