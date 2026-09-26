import fs from 'node:fs';
import {OUT,hash} from './stage68_implementation_results.mjs';
import {gz,write} from './stage68_decision_lib.mjs';
const inputs=new Set(),trials=new Map(),folders={};
for(const dir of fs.readdirSync(OUT,{withFileTypes:true}).filter(d=>d.isDirectory()&&!['playback','stall-diagnostics','stages'].includes(d.name))){
 for(const f of fs.readdirSync(`${OUT}/${dir.name}`).filter(f=>f.endsWith('.json.gz'))){
  const walk=o=>{if(!o||typeof o!=='object')return;
   if(o.input){const h=hash({party:o.input.party,waves:o.input.waves,rules:o.input.rules,earlyQuestAssist:o.input.earlyQuestAssist});
    for(const k of ['screen','validation'])if(o[k]?.runs&&!(k==='screen'&&o.screenReused)){inputs.add(h);for(const r of o[k].runs){const key=h+':'+r.seed;if(!trials.has(key)){trials.set(key,k);folders[dir.name]=(folders[dir.name]??0)+1;}}}}
   for(const [k,v]of Object.entries(o))if(!['input','state','screen','validation','runs'].includes(k))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);
  };walk(gz(`${OUT}/${dir.name}/${f}`));
 }
}
const result={scope:'This implementation directory only; excludes prior recovered/decision/adoption trials and diagnostic/playback replays',uniqueCombatInputs:inputs.size,uniqueInputSeedTrials:trials.size,screening:[...trials.values()].filter(v=>v==='screen').length,independentValidation:[...trials.values()].filter(v=>v==='validation').length,firstOccurrenceByFolder:folders,notAClaimOfAllStagesPassing:true};write(`${OUT}/trial-counts.json`,result);console.log(JSON.stringify(result));
