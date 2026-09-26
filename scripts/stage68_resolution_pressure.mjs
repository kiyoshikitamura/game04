import fs from 'node:fs';
import {rows,stageResults,metrics,hash,assess} from './stage68_implementation_results.mjs';
import {write,gz} from './stage68_decision_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
const OUT='docs/verification/stage68-resolution-20260927',combined=process.argv.includes('--combined'),aoe=process.argv.includes('--aoe')||combined;
for(const row of rows){const x=stageResults(row),a=x.assessment;if(!a.stalled.length)continue;const ids=process.argv.slice(2).filter(x=>!x.startsWith('--'));if(ids.length&&!ids.includes(row.stage))continue;
 const path=`${OUT}/${combined?"pressure-combined":aoe?"pressure-aoe":"pressure"}/${row.stage}.json.gz`,saved=fs.existsSync(path)?gz(path):{stage:row.stage,variants:[],complete:false};if(saved.complete)continue;
 const cs=[...new Map([a.primary,a.alternative,...a.tiers,...[...a.stalled].sort((a,b)=>metrics(b.validation).actionLimit-metrics(a.validation).actionLimit).slice(0,3)].filter(Boolean).map(c=>[hash(c.input.party),c])).values()];
 const waves=new Set(a.stalled.flatMap(c=>c.validation.runs.filter(r=>r.reason==='action_limit').map(r=>r.waves))),hp=Math.max(...cs.flatMap(c=>c.input.party.map(p=>p.stats.hp))),def=Math.max(...cs.flatMap(c=>c.input.party.map(p=>p.stats.def)));
 for(const n of (aoe?[12,8,16]:[30,20,40])){const name=`periodic-${n}`;if(saved.variants.some(v=>v.name===name))continue;
  let stage=structuredClone(FORMAL_QUEST_STAGES.find(s=>s.designId===row.stage));const changes=[]; if(combined){for(const folder of ["stalls","stall-refine","stall-finisher","stall-terminal"]){const p=`docs/verification/stage68-implementation-20260927/${folder}/${row.stage}.json.gz`;if(fs.existsSync(p)){const d=gz(p),v=d.variants?.find(v=>v.name===d.selected);if(v)stage=structuredClone(v.stage);}} if(JSON.stringify(stage.waves)===JSON.stringify(FORMAL_QUEST_STAGES.find(s=>s.designId===row.stage).waves))for(const wave of stage.waves)for(const e of wave)e.stats.hp=Math.max(1,Math.round(e.stats.hp*.6));}
  for(const [wi,wave]of stage.waves.entries())if(waves.has(wi))for(const e of wave){const power=Math.ceil((def*2+hp*.65)/Math.max(1,e.stats.atk)*10)*10;
   const skill={id:`${e.id}/pressure-${n}`,name:'長期戦の強打',image:e.skills[0]?.image??'',rarity:'N',element:e.element,spCost:1,condition:{type:'every_n_actions',value:n},target:aoe?'all_enemies':'first',effects:[{type:'damage',power}],description:`自身の${n}回目の行動ごとに${aoe?"全体":"先頭"}へ強打。通常の属性・防御・乱数・反撃を適用。`};
   e.skills.unshift(skill);if(e.phases)for(const p of e.phases)if(p.skills)p.skills.unshift(structuredClone(skill));changes.push({enemy:e.id,wave:wi+1,skill});
  }
  const records=cs.map(c=>{const input=inputFor(stage,{party:c.input.party});return {name:c.name,family:c.family,state:c.state,input,inputHash:hash(input),screen:run(input,520001,16,true)};});
  const v={name,stage,changes,records};v.gate=records.find(c=>c.name===a.primary.name)?.screen.rate===1&&records.find(c=>c.name===a.alternative?.name)?.screen.rate>=.5&&records.every(c=>metrics(c.screen).actionLimit===0);saved.variants.push(v);write(path,saved);console.log(JSON.stringify({stage:row.stage,name,gate:v.gate,rates:records.map(c=>[c.name,c.screen.wins,metrics(c.screen).actionLimit])}));
 }
 const v=saved.variants.filter(v=>v.gate).sort((a,b)=>b.changes[0].skill.condition.value-a.changes[0].skill.condition.value)[0];
 if(v){saved.selected=v.name;for(const c of v.records)if(!c.validation){c.validation=run(c.input,521001,200,true);write(path,saved);}const q=assess(v.records);saved.result={missing:q.missing,stalled:q.stalled.map(c=>c.name),alternative:!!q.alternative,dependencyMissing:q.dependency.filter(d=>!d.without).map(d=>d.id)};}
 saved.complete=true;write(path,saved);console.log(JSON.stringify({stage:row.stage,selected:saved.selected,result:saved.result}));
}
