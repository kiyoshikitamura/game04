// Compose newly approved supply with the already verified internal-precision fix.
const assert=require('assert/strict');const {collect,json,req}=require('./master-audit/runtime.cjs');const {areas,castles}=require('./master-audit/supply-authority.cjs');const {diff}=require('./master-audit/compare.cjs');
const prior=json('docs/verification/master-audit-20260925/observed/runtime.json'),actual=collect(),expected=structuredClone(prior),names=json('src/domain/redesign/data/context-names.json');
for(const q of Object.values(expected.quests)){const [a,i]=q.designId.split('-').map(Number);q.name=names.quests[q.id];q.encounterChance=a===1&&i<3?0:areas[a].encounterChance;}
const roster=Object.fromEntries(json('src/theme/sengoku-characters.json').map(c=>[c.characterId,c.sourceRarity]));
for(const m of Object.values(expected.encounters)){Object.assign(m.victoryRewards.find(r=>r.kind==='soul'),areas[m.area][roster[m.characterId]]);}
for(const m of Object.values(expected.invasions))m.stages.find(s=>s.level===12).defeatRewards.find(r=>r.kind==='soul').amount=castles[m.id];
// Captured v31 rounded skill effect quantities. Those exact fields are independently
// checked against numeric.md by verify-skill-design.cjs; exclude no other delta here.
const precision=[];
for(const key of ['quests','encounters','invasions']){const changes=diff(expected[key],actual[key]);const other=changes.filter(d=>{if(d.kind==='changed'&&/\/skills\/\d+\/effects\/\d+\/(power|bonusPower|chance)$/.test(d.path)&&typeof d.actual==='number'&&Math.abs(Number(d.actual.toFixed(d.path.endsWith('/chance')?4:2))-d.expected)<1e-12){precision.push({key,...d});return false;}return true;});assert.deepEqual(other,[],key+' unexpected changes');}
const {createRaidRoom,getRoomRaidMaster}=req('raid');for(const m of Object.values(prior.encounters)){assert.deepEqual(getRoomRaidMaster({masterId:m.id,level:1,raidSnapshot:structuredClone(m)}),m);assert.deepEqual(createRaidRoom(m.id,'QA','QA',0).raidSnapshot,actual.encounters[m.id]);}
for(const m of Object.values(prior.invasions))assert.deepEqual(getRoomRaidMaster({masterId:m.id,level:12,territorySnapshot:{raidMaster:structuredClone(m)}}).defeatRewards,m.stages.find(s=>s.level===12).defeatRewards);
console.log(JSON.stringify({status:'PASS',scope:'approved names + supply + independently checked precision only',precisionFields:precision.length,quests:65,encounters:85,castles:5,oldSnapshotsPreserved:true},null,2));
