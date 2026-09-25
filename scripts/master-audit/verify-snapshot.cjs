const fs=require('fs'),assert=require('assert/strict');const {root}=require('./runtime.cjs'),{diff}=require('./compare.cjs');
const dir=process.argv[2];if(!dir)throw Error('Usage: node verify-snapshot.cjs EVIDENCE_DIRECTORY');const base=root+'/docs/verification/master-audit-20260925';const expected=JSON.parse(fs.readFileSync(base+'/approved-values.json'));const actual=JSON.parse(fs.readFileSync(dir+'/runtime.json'));const db=JSON.parse(fs.readFileSync(dir+'/database.json'));const meta=JSON.parse(fs.readFileSync(dir+'/metadata.json'));let differences=[];
// Later explicit name approval overrides only the legacy baseline's quest name fields.
const nameAuthority=JSON.parse(fs.readFileSync(base+'/name-authority.json'));
for(const row of nameAuthority.quests){
 if(!row.approvedName||!row.approvalRef)continue;
 if(expected.runtime.quests[row.id])expected.runtime.quests[row.id].name=row.approvedName;
 const stage=expected.database.quest65.stages.find(s=>s.id===row.id);if(stage)stage.name=row.approvedName;
}
// 20:50 JST user-approved supply revision; independent prose is the oracle.
const supply=require('./supply-authority.cjs');
for(const q of [...Object.values(expected.runtime.quests),...expected.database.quest65.stages]){
 const [area,index]=q.designId.split('-').map(Number);q.encounterChance=area===1&&index<3?0:supply.areas[area].encounterChance;
}
const roster=JSON.parse(fs.readFileSync(root+'/src/theme/sengoku-characters.json'));
for(const m of Object.values(expected.runtime.encounters)){
 const rarity=roster.find(c=>c.characterId===m.characterId).sourceRarity;
 Object.assign(m.victoryRewards.find(r=>r.kind==='soul'),supply.areas[m.area][rarity]);
}
for(const m of [...Object.values(expected.runtime.invasions),...Object.values(expected.database.invasionMasters)]){
 m.stages.find(s=>s.level===12).defeatRewards.find(r=>r.kind==='soul').amount=supply.castles[m.id];
}
for(const [key,value]of Object.entries(expected.runtime))differences.push(...diff(value,actual[key],'/runtime/'+key));
for(const [key,value]of Object.entries(expected.database))differences.push(...diff(value,db[key],'/database/'+key));
for(const key of ['sourceSha','apiVersion','apiSha256','databaseProject','capturedAt'])if(!meta[key])differences.push({path:'/metadata/'+key,kind:'missing'});
const unresolvedAuthorityIssues=JSON.parse(fs.readFileSync(base+'/unresolved-authority.json'));
const missingIntegration=expected.requiredIntegration.filter(k=>meta.integration?.[k]!==true);
if(meta.sourceSha!==meta.verifiedSourceSha)missingIntegration.push('same source SHA verified');
console.log(JSON.stringify({status:differences.length||missingIntegration.length||unresolvedAuthorityIssues.length?'STOP':'MATCH',differenceCount:differences.length,differences,missingIntegration,unresolvedAuthorityIssues},null,2));process.exitCode=differences.length||missingIntegration.length||unresolvedAuthorityIssues.length?1:0;
