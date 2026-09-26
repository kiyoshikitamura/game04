import fs from 'node:fs';
import {rows,assess,metrics,hash} from './stage68_implementation_results.mjs';
import {gz,write} from './stage68_decision_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
const OUT='docs/verification/stage68-resolution-20260927';
for(const row of rows){const id=row.stage;if(process.argv.length>2&&!process.argv.slice(2).includes(id))continue;
 if(['fill-pressure-aoe','fill-pressure-combined'].some(f=>fs.existsSync(`${OUT}/${f}/${id}.json.gz`)&&gz(`${OUT}/${f}/${id}.json.gz`).passed))continue;
 const src=`${OUT}/pressure-combined/${id}.json.gz`;if(!fs.existsSync(src))continue;const source=gz(src);if(!source.complete)continue;
 const path=`${OUT}/pressure-refined/${id}.json.gz`,d=fs.existsSync(path)?gz(path):{stage:id,variants:[],complete:false};if(d.complete)continue;
 const base=source.variants.find(v=>v.name===source.selected)??source.variants.at(-1),candidates=[{name:'cached-12',reuse:source.variants.find(v=>v.name==='periodic-12'&&v.gate&&!v.records.some(c=>c.validation))},...[[1,1.6,16],[.6,1,16],[.6,1.6,12]].map(([hp,power,n])=>({name:`hp${hp}-power${power}-period${n}`,hp,power,n}))];
 for(const config of candidates){if(d.variants.some(v=>v.name===config.name))continue;if(config.name==='cached-12'&&!config.reuse)continue;let v;
  if(config.reuse)v={...structuredClone(config.reuse),name:config.name,screenReused:true};else{const stage=structuredClone(base.stage);
   for(const w of stage.waves)for(const e of w){e.stats.hp=Math.max(1,Math.round(e.stats.hp*config.hp));for(const s of [...e.skills,...(e.phases??[]).flatMap(p=>p.skills??[])])if(s.id.includes('/pressure-')){s.condition.value=config.n;s.id=s.id.replace(/pressure-\d+/,`pressure-${config.n}-p${config.power}`);s.effects[0].power=Math.round(s.effects[0].power*config.power);s.description=`自身の${config.n}行動ごとに全体へ強打。共通計算式を使用。`;}}
   const records=base.records.map(c=>{const input=inputFor(stage,{party:c.input.party});return {name:c.name,state:c.state,family:c.family,input,inputHash:hash(input),screen:run(input,550001,16,true)};});v={name:config.name,stage,records,config};
  }
  const q=assess(v.records.map(c=>({...c,validation:c.screen})));v.gate=!q.stalled.length&&!!q.primary&&!!q.alternative;d.variants.push(v);write(path,d);console.log(JSON.stringify({stage:id,name:v.name,gate:v.gate}));
 }
 // Prefer the less disruptive cached input, then stronger late pressure, then shorter HP.
 for(const v of d.variants.filter(v=>v.gate)){for(const c of v.records)if(!c.validation){c.validation=run(c.input,551001,200,true);write(path,d);}const q=assess(v.records);if(q.primary&&q.alternative&&!q.stalled.length){d.selected=v.name;d.result={missing:q.missing,stalled:[],dependencyMissing:q.dependency.filter(x=>!x.without).map(x=>x.id)};break;}}
 d.complete=true;write(path,d);console.log(JSON.stringify({stage:id,selected:d.selected,result:d.result}));
}
