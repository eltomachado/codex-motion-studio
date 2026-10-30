import {parseArgs} from 'node:util';
import {main, loadProject} from './common.mjs';
main(async()=>{
  const {values} = parseArgs({options:{id:{type:'string',default:'demo'}}});
  const p = await loadProject(values.id);
  console.log(`Projeto ${p.id}: valido. ${p.scenes.length} cenas, ${(p.durationMs/1000).toFixed(2)}s, status ${p.status}.`);
});
