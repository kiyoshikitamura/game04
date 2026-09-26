import fs from 'node:fs';
import {rows,stageResults,metrics,hash} from './stage68_implementation_results.mjs';
import {write,gz,assetCheck} from './stage68_decision_lib.mjs';
import {inputFor,run} from './rebuild_stage68_five_tier.mjs';
import {FORMAL_QUEST_STAGES} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
const focused=process.argv.includes('--focused');
const row=rows.find(r=>r.stage==='5-4'),old=stageResults(row),stage=FORMAL_QUEST_STAGES.find(s=>s.designId==='5-4'),path=`docs/verification/stage68-resolution-20260927/band-gap/5-4${focused?'-focused':''}.json.gz`,d=fs.existsSync(path)?gz(path):{stage:'5-4',records:[],complete:false};
if(!d.complete){const known=[...old.current,...gz('docs/verification/stage68-implementation-20260927/fill/5-4.json.gz').records],pool=focused?row.acquisition.trainedSkills:row.acquisition.trainedSkills.filter(s=>/^SKD0(0[1-9]|1[0-2]|19|2[0-7])$/.test(s.id));
 for(const skill of pool){for(const pattern of (focused?[0,1,2,3,4]:['all-high-cost','front-buff','rear-buff'])){const name=skill.id+'-'+pattern;if(d.records.some(c=>c.name===name))continue;
  const base=focused?known.filter(c=>c.validation&&metrics(c.validation).actionLimit===0).sort((a,b)=>a.validation.rate-b.validation.rate)[0]:old.assessment.primary;const state=structuredClone(base.state);if(focused)state.deck[pattern].skillIds=[skill.id];else for(const [i,member]of state.deck.entries())member.skillIds=[pattern==='front-buff'&&i===0||pattern==='rear-buff'&&i===state.deck.length-1?'SKD035':skill.id];
  state.skills=[...new Set(state.deck.flatMap(m=>m.skillIds))].map(id=>({id,level:row.acquisition.trainedSkills.find(s=>s.id===id).level}));if(!assetCheck({state},row).covered)throw Error('Unfunded');const input=inputFor(stage,{party:buildBattleParty(state)}),same=known.find(c=>hash(c.input.party)===hash(input.party));if(same)continue;
  const c={name,state,input,inputHash:hash(input),screen:run(input,542001,24,true)};
  if(c.screen.wins===0&&metrics(c.screen).actionLimit===0)c.validation=run(input,543001,200,true);d.records.push(c);write(path,d);
  if(c.validation){console.log(JSON.stringify({name,...metrics(c.validation)}));if(c.validation.wins===0&&metrics(c.validation).actionLimit===0){d.selected=name;break;}}
 }if(d.selected)break;}
 d.complete=true;write(path,d);console.log(JSON.stringify({stage:'5-4',selected:d.selected,screened:d.records.length}));}
