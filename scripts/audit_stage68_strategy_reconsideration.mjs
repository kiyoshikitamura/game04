import{read,write,evaluate,stateFor,loadout,costs,OUT}from'./audit_stage68.mjs';
import{FORMAL_QUEST_STAGES as stages,createQuestBattleInput}from'../src/domain/redesign/questMaster.ts';
import{buildBattleParty,BATTLE_RULES}from'../src/domain/redesign/masters.ts';
const ids=['char_joe_01','char_yuki_01','char_daimon_01','char_jihoon_01','char_aoi_01'];
const routes=[['def-down',['SKD034','SKD038','SKD010','SKD009','SKD039']],['atk-up',['SKD034','SKD035','SKD010','SKD009','SKD039']],['dot',['SKD034','SKD035','SKD029','SKD009','SKD039']],['distributed-attacks',['SKD003','SKD035','SKD010','SKD009','SKD039']]];
const out=[];const stage=stages.find(s=>s.id==='mino-1');
for(const def of [620,550,500])for(const[name,skills]of routes){
 const state=stateFor(ids.map((id,i)=>({id,skills:[skills[i]]})),20,null,1,2),input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES);input.waves.forEach(w=>w[0].stats.def=def);
 const screen=evaluate(input,71001,20);out.push({status:'UNAPPROVED_SCREEN_ONLY',def,route:name,state,input,loadout:loadout(state),costs:costs(state),screen});console.log(def,name,screen.wins+'/20',screen.actions);
}
write('strategy-reconsideration-3-1-screen.json',out);
const substitutions=[];
for(const def of [550,500])for(const[name,skills]of [['guaranteed-rock-buff',['SKD034','SKD035','SKD009','SKD009','SKD039']],['other-elements-buff',['SKD034','SKD035','SKD008','SKD007','SKD039']],['no-buff-rock',['SKD034','SKD003','SKD009','SKD009','SKD039']]]){
 const state=stateFor(ids.map((id,i)=>({id,skills:[skills[i]]})),20,null,1,2),input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES);input.waves.forEach(w=>w[0].stats.def=def);const screen=evaluate(input,71001,20);substitutions.push({status:'UNAPPROVED_SCREEN_ONLY',def,route:name,state,input,loadout:loadout(state),costs:costs(state),screen});console.log(def,name,screen.wins+'/20',screen.actions);
}
write('strategy-reconsideration-3-1-substitutions.json',substitutions);
const finalists=[];
for(const[name,skills]of [['def-down',['SKD003','SKD038','SKD010','SKD009','SKD039']],['guaranteed-buff',['SKD003','SKD035','SKD009','SKD009','SKD039']],['other-elements-buff',['SKD003','SKD035','SKD008','SKD007','SKD039']],['no-support-control',['SKD003','SKD003','SKD009','SKD009','SKD039']]]){
 const state=stateFor(ids.map((id,i)=>({id,skills:[skills[i]]})),20,null,1,2),input=createQuestBattleInput(1,buildBattleParty(state),stage,BATTLE_RULES);input.waves.forEach(w=>w[0].stats.def=550);const validation=evaluate(input,72001,200);finalists.push({status:'UNAPPROVED_LOCAL_CANDIDATE_NOT_STAGE68_ACCEPTANCE',def:550,route:name,state,input,loadout:loadout(state),costs:costs(state),validation});console.log('independent',name,validation.wins+'/200',validation.actions);
}
write('strategy-reconsideration-3-1-validation.json',finalists);
