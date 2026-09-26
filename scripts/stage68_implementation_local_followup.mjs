import fs from 'node:fs';
import {OUT,rows,stageResults,metrics,hash} from './stage68_implementation_results.mjs';
import {write,gz,inBand} from './stage68_decision_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
const plans=JSON.parse(fs.readFileSync(`${OUT}/stall-next-candidates.json`));
for(const plan of plans){if(process.argv.length>2&&!process.argv.slice(2).includes(plan.stage))continue;
 const path=`${OUT}/local-followup/${plan.stage}.json.gz`;if(fs.existsSync(path)&&gz(path).complete)continue;
 const x=stageResults(rows.find(r=>r.stage===plan.stage)),a=x.assessment,proposal=structuredClone(FORMAL_QUEST_STAGES.find(s=>s.designId===plan.stage));
 for(const p of plan.changes)proposal.waves.flat().find(e=>e.id===p.enemy).stats[p.field]=p.after;
 const roles=[{role:'primary',c:a.primary},{role:'alternative',c:a.alternative},...a.tiers.map((c,i)=>({role:`band${i}`,c})),{role:'worst-stall',c:[...a.stalled].sort((a,b)=>metrics(b.validation).actionLimit-metrics(a.validation).actionLimit)[0]}].filter(r=>r.c);
 const d=fs.existsSync(path)?gz(path):{stage:plan.stage,stageProposal:proposal,plan,records:[],roles:roles.map(r=>({role:r.role,name:r.c.name})),complete:false};
 for(const {c}of roles){if(d.records.some(r=>r.name===c.name))continue;const input=inputFor(proposal,{party:c.input.party});d.records.push({name:c.name,state:c.state,input,inputHash:hash(input),screen:run(input,510001,24,true)});write(path,d);}
 const v=role=>d.records.find(c=>c.name===roles.find(r=>r.role===role)?.c.name),noTimeout=d.records.every(c=>metrics(c.screen).actionLimit===0);
 d.screenPass=v('primary')?.screen.rate===1&&v('alternative')?.screen.rate>=.5&&noTimeout;
 if(d.screenPass){for(const c of d.records)if(!c.validation){c.validation=run(c.input,511001,200,true);write(path,d);}}
 d.missing=d.screenPass?[0,1,2,3,4].filter(b=>!d.records.some(c=>inBand(c.validation.rate,b))):null;
 d.independentNoStall=d.screenPass&&d.records.every(c=>metrics(c.validation).actionLimit===0);
 d.status=d.screenPass?'INDEPENDENT_COMPARISON_COMPLETE_NOT_IMPLEMENTED':'SCREEN_REJECTED_NOT_IMPLEMENTED';d.complete=true;write(path,d);
 console.log(JSON.stringify({stage:plan.stage,screenPass:d.screenPass,independentNoStall:d.independentNoStall,missing:d.missing}));
}
