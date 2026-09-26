import {gz,write,rows,assetCheck} from './stage68_decision_lib.mjs';
import {hash} from './audit_stage68.mjs';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
import fs from 'node:fs';
const OUT='docs/verification/stage68-implementation-20260927',id='1-3',path=`${OUT}/early-dependency/${id}.json.gz`,source=gz(`${OUT}/early-validation/${id}.json.gz`),base=source.records.find(c=>c.validation.rate===1),row=rows.find(r=>r.stage===id);
const result=fs.existsSync(path)?gz(path):{stage:id,records:[],complete:false};
if(!result.complete){for(const replacement of ['SKD003',null,'SKD035']){if(result.records.some(c=>c.replacement===replacement))continue;const state=structuredClone(base.state);for(const m of state.deck)m.skillIds=m.skillIds.flatMap(id=>id==='SKD009'?(replacement?[replacement]:[]):[id]);state.skills=[...new Set(state.deck.flatMap(m=>m.skillIds))].map(id=>({id,level:0}));if(!assetCheck({state},row).covered)throw Error('Asset mismatch');const input=inputFor(source.stageProposal,{party:buildBattleParty(state)}),validation=run(input,462001,200,true);result.records.push({name:`without-SKD009-${replacement??'normal'}`,replacement,removed:'SKD009',state,input,inputHash:hash(input),validation});write(path,result);console.log({replacement,wins:validation.wins});if(validation.rate>=.3)break;}result.complete=true;write(path,result);}
