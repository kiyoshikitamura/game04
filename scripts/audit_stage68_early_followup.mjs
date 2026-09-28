import {read,write,evaluate,stateFor,loadout,costs,OUT}from'./audit_stage68.mjs';
import{FORMAL_QUEST_STAGES as stages,createQuestBattleInput}from'../src/domain/redesign/questMaster.ts';
import{buildBattleParty,BATTLE_RULES}from'../src/domain/redesign/masters.ts';
const alternatives=read(OUT+'/alternatives.json'),proof=[];
const ids=['char_joe_01','char_yuki_01','char_daimon_01','char_jihoon_01','char_aoi_01'],skills=['SKD003','SKD035','SKD019','SKD009','SKD039'];
for(const stage of stages.filter(s=>s.designId.startsWith('2-'))){let chosen;const screens=[];
 for(const level of [9,10,12,14,16,18,20,23]){
  const state=stateFor(ids.map((id,i)=>({id,skills:[skills[i]]})),level),input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES),screen=evaluate(input,67001,12);screens.push({level,screen});
  if(screen.wins===12){const validation=evaluate(input,68001,200);if(validation.winRate>=.98){chosen={id:stage.id,designId:stage.designId,label:'starter-five-early-verified',state,input,loadout:loadout(state),costs:costs(state),screen,validation};break;}}
 }
 proof.push({stage:stage.designId,screens,chosen});console.log(stage.designId,chosen?.loadout[0].level,chosen?.validation.wins);
 // Retain this as a separate candidate when not all 200 seeds won.
 if(chosen?.validation.wins===200)alternatives[alternatives.findIndex(a=>a.id===stage.id)]=chosen;
 write('early-followup.json',proof);write('alternatives.json',alternatives);
}
