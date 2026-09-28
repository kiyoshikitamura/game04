require('./register.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {createSkillVfxFixture}=require('../../src/app/qa/skill-vfx24/fixture.ts');
const {recordedEffects,effectAssetPaths,minimumEffectFrameDuration}=require('../../src/app/components/redesign/battle-effects/recordedEffects.ts');
const {resolveBattleFrameEffects}=require('../../src/app/components/redesign/battleEffectPresentation.ts');
const {SKILL_VFX24,skillVfxForId}=require('../../src/app/components/redesign/battle-effects/skillVfx24.ts');
const {tutorialCutin,minimumTutorialEffectDuration}=require('../../src/app/components/redesign/battle-effects/tutorialEffects.ts');
const hash=r=>crypto.createHash('sha256').update(JSON.stringify(r)).digest('hex');
const checked=[];
assert.equal(SKILL_VFX24.length,24);
for(const effect of SKILL_VFX24)for(const skillId of effect.skillIds)for(const side of ['ally','enemy']) {
  const result=createSkillVfxFixture({skillId,side,enemies:3,success:true,burst:side==='ally',cutin:'SSR'}),before=hash(result);
  const resolved=result.frames.flatMap((f,i)=>recordedEffects(result,i).map(e=>({...e,index:i,event:f.event})));
  const mapped=resolved.filter(e=>e.vfx);
  assert(mapped.length,skillId+' '+side);
  assert(mapped.every(e=>e.vfx.id===effect.id));
  assert.equal(new Set(mapped.filter(e=>e.vfx.leadIn).map(e=>e.index)).size,1,'one preparation per activation');
  assert(tutorialCutin(result,1),'existing SSR cutin is retained');
  assert(minimumTutorialEffectDuration(result,1)>=800);
  for(const e of mapped) {
    assert(result.frames[e.index].targetIds.includes(e.targetId),'only recorded targets');
    assert(minimumEffectFrameDuration(result,e.index)>0);
    for(const asset of effectAssetPaths([e]))assert(fs.existsSync('public'+asset),asset);
  }
  if(['formation-break','power-break-flash'].includes(effect.id)) {
    assert.deepEqual([...new Set(mapped.map(e=>e.vfx.phase))],['cleanse','strike']);
  }
  if(effect.id==='counter-stance')assert(mapped.every(e=>e.vfx.phase==='support'));
  const failed=createSkillVfxFixture({skillId,side,enemies:3,success:false,burst:false,cutin:'SR'});
  assert(tutorialCutin(failed,1),'existing SR cutin is retained');
  for(let i=0;i<failed.frames.length;i++)if(['cleanse','effect_miss'].includes(failed.frames[i].event))assert.deepEqual(recordedEffects(failed,i),[],'failed/no-op status must not flash success');
  assert.equal(hash(result),before,'presentation must never mutate recordings');
  checked.push({skillId,side,effect:effect.id,events:mapped.map(e=>e.event)});
}
assert.equal(skillVfxForId('SKD026'),undefined,'projectile kept');
assert.equal(skillVfxForId('unknown'),undefined);
const legacy=createSkillVfxFixture({skillId:'SKD026',side:'ally',enemies:1,success:true,burst:false,cutin:'SR'});
const projectile=legacy.frames.findIndex(f=>f.event==='damage');
assert.equal(recordedEffects(legacy,projectile)[0].family,'projectile');
assert.equal(recordedEffects(legacy,projectile)[0].vfx,undefined);
const sample=createSkillVfxFixture({skillId:'SKD013',side:'ally',enemies:3,success:true,burst:false,cutin:'SSR'});
const damage=sample.frames.findIndex(f=>f.event==='damage');
const dead=structuredClone(sample);dead.frames[damage-1].enemies[0].dead=true;dead.frames[damage-1].enemies[0].hp=0;
assert.deepEqual(recordedEffects(dead,damage),[],'no success on pre-existing dead target');
const wave={...sample.frames[damage],event:'effect_applied',wave:2};
assert.deepEqual(resolveBattleFrameEffects(wave,sample.frames[damage-1]),[]);
const old={...sample.frames[damage],skillId:'basic'};
assert.equal(resolveBattleFrameEffects(old,sample.frames[damage-1])[0].vfx,undefined);
// Actual engine recordings, not only synthetic QA, must use the same explicit IDs.
const {simulateBalanceBattle}=require('../../src/domain/redesign/battleBalanceV2.ts');
const {BALANCE_V2_CONFIG}=require('../../src/domain/redesign/balanceV2Masters.ts');
const {getFormalOwnedSkill}=require('../../src/domain/redesign/formalOwnedSkills.ts');
const engine=[];
for(const side of ['ally','enemy'])for(const effect of SKILL_VFX24.filter(e=>!['grand-healing','purification','formation-break','power-break-flash'].includes(e.id))) {
  const fixture=createSkillVfxFixture({skillId:effect.skillIds[0],side,enemies:3,success:true,burst:false,cutin:'SSR'});
  // No changes to the formal skill. Plenty of SP ensures eligibility in this isolated input.
  const basic=getFormalOwnedSkill('SKD001',0);
  for(const u of [...fixture.party,...fixture.waves[0]]) {u.stats.hp=100000;u.stats.sp=1000;u.stats.luk=0;u.stats.atk=600;u.stats.def=30;u.skills=[];}
  (side==='ally'?fixture.party:fixture.waves[0])[0].skills=[getFormalOwnedSkill(effect.skillIds[0],0)];
  for(const e of fixture.waves[0]){e.actionCount=1;e.initialCount=1;e.initialSp=1000;e.hitSpGain=10;}
  const input={seed:20260929,party:fixture.party,waves:fixture.waves,rules:{version:'balance-v2-20260920',inputVersion:'wave-sp-v1-20260921',balanceV2:BALANCE_V2_CONFIG,burstPolicy:'attack-free-enemy-pause-v2-20260927',defenseFactor:1,advantageMultiplier:1.5,disadvantageMultiplier:.75,spRecoveryDivisor:1,burstLukDivisor:1,enemySpRecoveryDivisor:1,maxPlayerActions:40,initialSpRatio:1}};
  const result=simulateBalanceBattle(input),before=hash(result);
  const events=result.frames.flatMap((_,i)=>recordedEffects(result,i)).filter(e=>e.vfx?.id===effect.id);
  assert(events.length,`engine ${side} ${effect.id}`);assert.equal(hash(result),before);engine.push({side,id:effect.id,events:events.length});
}
fs.writeFileSync('docs/verification/skill-vfx24/unit-report.json',JSON.stringify({status:'PASS',checked,engine},null,2));
console.log(`PASS ${checked.length} formal-ID/side fixtures, ${engine.length} real-engine cases, failure/dead/fallback/order/immutable guards`);

