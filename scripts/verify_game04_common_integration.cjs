const assert=require('node:assert/strict');const {req}=require('./master-audit/runtime.cjs');const d={...req('masters'),...req('tutorial/integration'),...req('tutorial/content'),...req('activityEvents')};
let st=d.createInitialState('qa');st.characters=[];st.skills=[];st.deck=[];st.tutorial={version:'tutorial-fixed-20260925',step:0,name:'',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false};
assert.throws(()=>d.applyTutorialTransition(st,'tutorial_next',{step:2}));const original=structuredClone(st);
for(let i=0;i<d.SCENES.length;i++){const before=st;st=d.applyTutorialTransition(st,'tutorial_next',{step:i,name:'確認者'});assert.equal(before.tutorial.step,i);assert.equal(st.tutorial.step,i+1);}
assert.equal(original.characters.length,0);assert.equal(st.characters.length,3);assert.equal(st.skills.length,3);assert.equal(st.deck.length,3);assert.equal(st.tutorial.loginEligible,false);assert.equal(st.tutorial.name,'確認者');assert.throws(()=>d.applyTutorialTransition(st,'tutorial_next',{step:d.SCENES.length-1}));
st=d.applyTutorialTransition(st,'tutorial_depart',{});assert.equal(st.tutorial.loginEligible,false);st=d.applyTutorialTransition(st,'tutorial_home',{});assert.equal(st.tutorial.loginEligible,true);
const before=structuredClone(st),after=structuredClone(st);before.characters[0].awakening=4;after.characters[0].awakening=5;assert.equal(d.progressionActivities(before,after,'character_awaken').length,1);assert.equal(d.progressionActivities(after,after,'character_awaken').length,0);
assert.equal(d.progressionActivities(before,after,'raid_encounter').length,0);
console.log(JSON.stringify({tutorialSequence:d.SCENES.length,grants:3,skills:3,replayGuard:true,secondHomeLogin:true,activityEdges:true,encounterPublication:false}));

const names=req('contextNames');assert.match(names.raidRescueDisplayLabel('TI01',12),/Lv.12/);assert.equal(names.raidRescueDisplayLabel('unknown',1),null);
