import test from 'node:test';
import assert from 'node:assert/strict';
import {validId,validateProject,validateCaptions,toCaptions,parseSrt,peaksFromPcm} from '../lib/project.mjs';
const project=()=>({version:1,id:'teste',title:'Teste',status:'ready',durationMs:1000,width:1920,height:1080,fps:30,audio:'audio.wav',showCaptions:false,theme:{background:'#000000',accent:'#ffffff',secondary:'#8800ff',text:'#ffffff'},captions:[],peaks:[0,.5],scenes:[{startMs:0,endMs:1000,visual:'title',headline:'Olá',detail:''}]});
test('bloqueia fuga de diretorio nos IDs',()=>{
  for(const id of ['../fora','a/b','C:\\temp','teste;comando','', 'a'.repeat(65)])assert.throws(()=>validId(id));
  assert.equal(validId('minha-intro-2'),'minha-intro-2');
});
test('cenas precisam cobrir exatamente o audio',()=>{
  assert.equal(validateProject(project()).durationMs,1000);
  for(const [start,end] of [[1,1000],[0,1001],[0,999],[0,0]]){
    const p=project();p.scenes[0].startMs=start;p.scenes[0].endMs=end;assert.throws(()=>validateProject(p));
  }
});
test('rejeita dados que nao podem ser renderizados',()=>{
  for(const change of [{durationMs:NaN},{fps:0},{width:1919},{peaks:[Infinity]},{audio:'../../privado.wav'},{theme:{}}])assert.throws(()=>validateProject({...project(),...change}));
});
test('ASR nulo usa fim real; palavras impossiveis sao descartadas',()=>{
  const c=toCaptions([{text:'Olá',timestamp:[0,.3]},{text:'mundo',timestamp:[.3,null]},{text:'',timestamp:[null,null]}],1000);
  assert.equal(c.length,2);assert.equal(c[1].endMs,1000);validateCaptions(c,1000);
});
test('SRT preserva tempos por frase sem inventar palavras',()=>{
  const c=parseSrt('1\n00:00:00,000 --> 00:00:00,500\nOlá, mundo!\n\n2\n00:00:00,500 --> 00:00:01,000\nTudo bem?',1000);
  assert.equal(c.length,2);assert.equal(c[0].text,'Olá, mundo!');assert.equal(c[1].startMs,500);
  assert.throws(()=>parseSrt('1\n00:99:00,000 --> 00:00:01,000\nErro',1000));
});
test('rejeita legenda fora de ordem e fora do audio',()=>{
  assert.throws(()=>validateCaptions([{text:'a',startMs:500,endMs:800},{text:'b',startMs:0,endMs:200}],1000));
  assert.throws(()=>validateCaptions([{text:'a',startMs:0,endMs:2000}],1000));
});
test('forma de onda segue o sinal real entre 0 e 1',()=>{
  const silent=peaksFromPcm(new Float32Array(16000));assert.equal(silent.length,30);assert.ok(silent.every(v=>v===0));
  const full=peaksFromPcm(new Float32Array(16000).fill(1));assert.ok(full.every(v=>v===1));
});
