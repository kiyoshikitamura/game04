import {read,write,evaluate,stateFor,loadout,costs,OUT,parseGuides} from './audit_stage68.mjs';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty,BATTLE_RULES} from '../src/domain/redesign/masters.ts';
import {getFormalOwnedSkill} from '../src/domain/redesign/formalOwnedSkills.ts';
const stage=stages.find(s=>s.id==='mino-1'),g=parseGuides()['3-1'];const tests=[];
const saved=read(OUT+'/evidence/DBG047-input.json');
tests.push({label:'recorded',input:saved,validation:evaluate(saved,55001,60)});
const corrected=structuredClone(saved);corrected.party[2].skills=[getFormalOwnedSkill('SKD010',0)];corrected.party[3].skills=[getFormalOwnedSkill('SKD009',0)];tests.push({label:'recorded-with-guide-skills',input:corrected,validation:evaluate(corrected,55001,60)});
const screens=[];
for(const level of [20,22,25,28,30])for(const lb of [0,2,3])for(const gear of ['none','weapon','four']){
 const s=stateFor(g.members,level,gear==='none'?null:'R',20,lb);
 if(gear==='weapon')s.deck.forEach(m=>m.equipment=Object.fromEntries(Object.entries(m.equipment).filter(([slot])=>slot==='weapon')));
 if(gear==='four')s.deck.forEach(m=>{delete m.equipment.accessory1;delete m.equipment.accessory2;});
 const used=new Set(s.deck.flatMap(m=>Object.values(m.equipment)));s.equipment=s.equipment.filter(e=>used.has(e.instanceId));
 const x=createQuestBattleInput(1,buildBattleParty(s),stage,BATTLE_RULES),v=evaluate(x,56001,12);screens.push({level,lb,gear,state:s,input:x,costs:costs(s),validation:v});
}
const valid=screens.filter(s=>s.validation.wins===12).sort((a,b)=>a.costs.cash-b.costs.cash);write('DBG047-screen.json',screens);
if(valid.length){const c=valid[0];tests.push({label:'lower-cost-verified-current',loadout:loadout(c.state),state:c.state,input:c.input,costs:c.costs,validation:evaluate(c.input,57001,200,'DBG047-current')});console.log('current',c.level,c.lb,c.gear,c.costs);}
const proposals=[];
for(const def of [650,700,750,800,850,900]){
 const s=stateFor(g.members,20,null,1,2),x=createQuestBattleInput(1,buildBattleParty(s),stage,BATTLE_RULES);
 for(const w of x.waves)w[0].stats.def=def;
 const control=structuredClone(x);control.party[1].skills=[];
 proposals.push({def,input:x,state:s,validation:evaluate(x,58001,30),control:evaluate(control,58001,30)});
}
write('DBG047-proposal-screen.json',proposals);
const pick=proposals.filter(p=>p.validation.winRate>=.95).sort((a,b)=>b.def-a.def)[0];
if(pick){const control=structuredClone(pick.input);control.party[1].skills=[];const original=structuredClone(pick.input);for(const w of original.waves)w[0].stats.def=1140;
 write('DBG047-proposal.json',{status:'UNAPPROVED_ISOLATED_ONLY',fields:['3-1/W1/1.stats.def','3-1/W2/1.stats.def'],before:1140,after:pick.def,state:pick.state,loadout:loadout(pick.state),costs:costs(pick.state),input:pick.input,beforeResult:evaluate(original,59001,200),afterResult:evaluate(pick.input,59001,200,'DBG047-proposal'),withoutDebuff:evaluate(control,59001,200)});console.log('proposal',pick.def);}
write('DBG047-tests.json',tests);
