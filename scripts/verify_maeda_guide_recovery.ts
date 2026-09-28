import assert from 'node:assert/strict';
import { createInitialState } from '../src/domain/redesign/masters';
import { initializeEarlyProgress, nextEarlyGuide } from '../src/domain/redesign/earlyProgress';
import { applyEarlyAction } from '../src/domain/redesign/earlyActions';

const context={battlePlaying:false,resultOpen:false};
for(const guide of ['join-maeda','equip-iwadan'] as const){
 const before=initializeEarlyProgress(createInitialState('qa-maeda-guide'));
 before.characters=['char_joe_01','char_aoi_01','char_daimon_01','char_yuki_01','char_jihoon_01'].map(id=>({id,level:1,awakening:0,exp:0}));
 before.deck=before.characters.slice(0,4).map(c=>({characterId:c.id,skillIds:[],equipment:{}}));
 before.skills=[{id:'SKD009',level:1}];
 before.clearedStages=['mikawa-1','mikawa-2'];
 before.earlyProgress!.deckSlots=4;
 before.earlyProgress!.guides={[guide]:'pending'};
 const snapshot=structuredClone(before);
 assert.throws(()=>applyEarlyAction(before,'early_guide',{guide,choice:'save'}));
 assert.deepEqual(before,snapshot);
 for(const choice of ['later','characters']){
  const after=applyEarlyAction(before,'early_guide',{guide,choice});
  assert.equal(after.earlyProgress!.guides[guide],'deferred');
  assert.equal(nextEarlyGuide(after,context),null);
  const expected=structuredClone(before);expected.earlyProgress!.guides[guide]='deferred';
  assert.deepEqual(after,expected,'Only the guide status may change');
  assert.equal(nextEarlyGuide(JSON.parse(JSON.stringify(after)),context),null,'Reload must not block again');
  assert.throws(()=>applyEarlyAction(after,'early_guide',{guide,choice}),'Repeated operation must be rejected');
 }
 assert.throws(()=>applyEarlyAction(before,'early_guide',{guide,choice:'invalid'}));
 const ready=structuredClone(before);
 if(guide==='join-maeda')ready.deck.pop();
 else ready.deck[3]={characterId:'char_jihoon_01',skillIds:[],equipment:{}};
 const saved=applyEarlyAction(ready,'early_guide',{guide,choice:'save'});
 assert.equal(saved.earlyProgress!.guides[guide],'completed');
 assert(saved.deck.some(m=>m.characterId==='char_jihoon_01'));
 if(guide==='equip-iwadan')assert(saved.deck.find(m=>m.characterId==='char_jihoon_01')!.skillIds.includes('SKD009'));
}
const mission=initializeEarlyProgress(createInitialState('qa-mission'));
mission.earlyProgress!.guides={missions:'pending'};
assert.throws(()=>applyEarlyAction(mission,'early_guide',{guide:'missions',choice:'later'}));
console.log('PASS missing Maeda / full party / later / characters / reload / immutable assets / normal save / mission guard');
