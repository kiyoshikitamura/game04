// Names are an independent acceptance surface, not implied by numeric equality.
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const {collect,json,root}=require('./runtime.cjs');
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const base='docs/verification/master-audit-20260925/';
const local=collect(),live=json(base+'observed/runtime.json'),db=json(base+'observed/database.json');
const quest=json('src/domain/redesign/data/quest65.json'),roster=json('src/theme/sengoku-characters.json');
const design=json('docs/product/masters_20260921/GAME04_DESIGN_MASTER_EXTRACT.json');
const byId=Object.fromEntries(roster.map(c=>[c.characterId,c]));
assert.equal(roster.length,60);assert.equal(new Set(roster.map(c=>c.name)).size,60);
for(const c of design.characters)assert.equal(byId[c.id].name,c.display_name_provisional,'roster identity '+c.id);
const names=new Set(roster.map(c=>c.name));
const concepts=new Map(json('docs/product/balance_audits_20260922/round17_ledger.json').ledger.map(r=>[r.stage,r.concept]));
for(const line of read('docs/product/master_sources_20260921/area09_10.md').split('\n')){const r=line.split('|').slice(1,-1).map(x=>x.trim());if(/^10-(8|9|10)$/.test(r[0])&&/^\d$/.test(r[2])&&!concepts.has(r[0]))concepts.set(r[0],r[1]);}
assert.equal(concepts.size,65);
const authority=json(base+'name-authority.json');
assert.equal(authority.quests.length,65);assert.equal(new Set(authority.quests.map(q=>q.id)).size,65);
const approved=Object.fromEntries(authority.quests.map(q=>[q.id,q]));
const results={};
for(const [scope,stages]of Object.entries({repository:Object.values(local.quests),capturedApiV31:Object.values(live.quests),capturedDatabase:db.quest65.stages})){
 assert.equal(stages.length,65);let checkedEnemies=0;const questIssues=[],enemyIssues=[];
 for(const s of stages){const a=approved[s.id];assert(a,'unknown stage '+s.id);const concept=concepts.get(s.designId);
  const reasons=[];if(s.name===concept)reasons.push('攻略コンセプトを名称に使用');if(s.name===s.description)reasons.push('名称と攻略説明が同一');if(!a.approvedName||!a.approvalRef)reasons.push('正式名称・承認根拠未確定');else if(s.name!==a.approvedName)reasons.push('承認名称と不一致');
  if(reasons.length)questIssues.push({id:s.id,designId:s.designId,name:s.name,description:s.description,concept,approvedName:a.approvedName,reasons});
  for(const [wi,wave]of s.waves.entries())for(const [pi,e]of wave.entries()){checkedEnemies++;const binding=quest.bindings.find(b=>b.stage===s.designId&&b.wave===wi+1&&b.position===pi+1&&b.enemyId===e.id);const expected=byId[binding?.characterId]?.name;if(!expected||e.name!==expected)enemyIssues.push({id:e.id,name:e.name,expected:expected??null});}
 }
 results[scope]={quests:stages.length,questIssues,questEnemyReferences:checkedEnemies,enemyIssues};
}
// Raid names: all 85 encounters; all 12 stages of 15 sampled invasion masters;
// fixed invasion enemy identities also independently parsed from source prose.
const fixedNames=Object.fromEntries(read('docs/product/master_sources_20260921/invasion.md').split('\n').map(l=>l.split('|').slice(1,-1).map(x=>x.trim())).filter(r=>/^TI0[1-5]\/\d+\/\d+$/.test(r[0])).map(r=>[r[0],r[1]]));
assert(Object.keys(fixedNames).length>20);
const raidResults={};
for(const [scope,encounters,invasions]of [['repository',local.encounters,local.invasions],['capturedApiV31',live.encounters,live.invasions],['capturedDatabase',{},db.invasionMasters]]){
 let encounterEnemies=0,invasionEnemies=0,fixedIdentityChecks=0;const issues=[];
 const check=(path,e)=>{if(!e.name||!names.has(e.name))issues.push({path,id:e.id,name:e.name,reason:'正式60名称にない敵名称'});};
 for(const [key,m]of Object.entries(encounters)){assert.equal(m.name,byId[m.characterId].name);assert.equal(m.enemy.name,m.name);for(const e of m.enemies){encounterEnemies++;check('/encounters/'+key,e);}}
 for(const [key,m]of Object.entries(invasions))for(const stage of m.stages)for(const e of stage.enemies){invasionEnemies++;check('/invasions/'+key+'/'+stage.level,e);if(fixedNames[e.id]){fixedIdentityChecks++;if(e.name!==fixedNames[e.id])issues.push({id:e.id,name:e.name,expected:fixedNames[e.id]});}}
 raidResults[scope]={encounterMasters:Object.keys(encounters).length,encounterEnemies,invasionMasters:Object.keys(invasions).length,invasionEnemies,fixedIdentityChecks,issues};
}
// Cover every normal candidate, including choices outside the three runtime samples.
const invasion=json('src/domain/redesign/data/raid-invasion.json');const candidateIssues=[];
for(const c of invasion.candidates)for(const name of c.names)if(!names.has(name))candidateIssues.push({source:c.source,name});
const sourcePaths=['scripts/generate_game04_quest65.mjs','src/domain/redesign/questMaster.ts','src/app/components/redesign/QuestView.tsx','src/app/components/redesign/HomeView.tsx','src/app/components/redesign/BattleView.tsx','src/theme/sengoku-characters.json'];
const report={status:Object.values(results).some(r=>r.questIssues.length||r.enemyIssues.length)||Object.values(raidResults).some(r=>r.issues.length)||candidateIssues.length?'STOP':'PASS',scope:'Fixed G2 / captured API v31 / captured DB. Source-traced display paths, not a new browser or live capture.',rule:'User 2026-09-25: strategy text must not become quest names; no invented approval.',results,raidResults,normalInvasionCandidates:{rows:invasion.candidates.length,nameReferences:invasion.candidates.reduce((n,c)=>n+c.names.length,0),issues:candidateIssues},sourceHashes:Object.fromEntries(sourcePaths.map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]))};
console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='STOP'?1:0;
