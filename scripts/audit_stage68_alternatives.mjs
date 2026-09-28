import {read,write,evaluate,stateFor,loadout,costs,OUT,parseGuides} from './audit_stage68.mjs';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty,BATTLE_RULES,CHARACTER_MASTERS} from '../src/domain/redesign/masters.ts';
const rows=read(OUT+'/results.json'),guides=parseGuides();const proofs=[];
for(const row of rows){
 const stage=stages.find(s=>s.id===row.id);let state;
 if(row.designId.startsWith('1-')){
  const level=[1,3,5,7,9][stage.index-1];state=stateFor(guides[row.designId].members,level);
 }else{
  state=read(OUT+'/evidence/'+row.designId+'-state.json');
  const ids=['char_joe_01','char_yuki_01','char_daimon_01','char_jihoon_01','char_aoi_01'];
  state.characters=state.characters.map((c,i)=>({...c,id:ids[i]}));state.deck=state.deck.map((m,i)=>({...m,characterId:ids[i]}));
  if(+row.designId.split('-')[0]<=3){const skills=['SKD003','SKD035','SKD019','SKD009','SKD039'];state.skills=skills.map(id=>({id,level:0}));state.deck.forEach((m,i)=>m.skillIds=[skills[i]]);}
 }
 const input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES),screen=evaluate(input,61001,20);
 let validation=screen;if(screen.winRate===1)validation=evaluate(input,62001,60);
 const item={id:row.id,designId:row.designId,label:row.designId.startsWith('1-')?'early-lower-level':'starter-five-alternative',state,input,loadout:loadout(state),costs:costs(state),screen,validation};proofs.push(item);console.log(row.designId,validation.wins+'/'+validation.n);
 write('alternatives.json',proofs);
}
