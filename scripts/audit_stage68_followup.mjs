import {read,write,evaluate,stateFor,loadout,costs,OUT,parseGuides} from './audit_stage68.mjs';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty,BATTLE_RULES} from '../src/domain/redesign/masters.ts';
const results=read(OUT+'/results.json'),old=read(OUT+'/evidence/endgame-record.json').validation.decks;
for(const row of results.filter(x=>x.validation&&x.validation.wins<x.validation.n)){
 const input=read(OUT+'/evidence/'+row.designId+'-input.json');row.additionalValidation=evaluate(input,51001,200);console.log('additional',row.designId,row.additionalValidation.wins+'/200');
}
for(const row of results.slice(-3)){
 const stage=stages.find(x=>x.id===row.id),screens=[];let selected;
 for(const eq of ['SR','SSR']){
  for(const [name,party] of Object.entries(old).filter(([k])=>!k.startsWith('SR'))){
   const members=party.map(p=>({id:p.id,skills:p.skills.map(s=>s.id)}));const state=stateFor(members,100,eq,100,10),input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES),v=evaluate(input,52001,16);
   screens.push({name,eq,state,input,validation:v});console.log(row.designId,name,eq,v.wins+'/16');
  }
  selected=screens.filter(s=>s.validation.wins===16).sort((a,b)=>a.validation.meanActions-b.validation.meanActions)[0];if(selected)break;
 }
 if(!selected)selected=screens.slice().sort((a,b)=>b.validation.wins-a.validation.wins||a.validation.meanActions-b.validation.meanActions)[0];
 write('endgame-'+row.designId+'-screen.json',screens);
 row.endgameScreen=screens.map(s=>({name:s.name,eq:s.eq,validation:s.validation}));
 row.endgameSelection={name:selected.name,eq:selected.eq};row.validation=evaluate(selected.input,53001,200,row.designId+'-revised');row.loadout=loadout(selected.state);row.costs=costs(selected.state);
 const control=structuredClone(selected.input);control.party.forEach(p=>p.skills=p.skills.filter(s=>s.effects.some(e=>e.type==='damage')));row.control=evaluate(control,54001,30);
 const alt=screens.filter(s=>s.name!==selected.name).sort((a,b)=>b.validation.wins-a.validation.wins)[0];row.alternative={name:alt.name,eq:alt.eq,...evaluate(alt.input,54001,30)};
 write('evidence/'+row.designId+'-input.json',selected.input);write('evidence/'+row.designId+'-state.json',selected.state);
 row.status=row.validation.winRate>=.95?'conditional':row.validation.wins?'unstable':'not-established';console.log('VALIDATION',row.designId,row.validation.wins+'/200');write('results.json',results);
}
write('results.json',results);
