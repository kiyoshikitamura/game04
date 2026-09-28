require('./skill-vfx24/register.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs');
const audit=require('../docs/verification/enemy-art-coverage-20260929/assets.json');
const bounds=require('../src/theme/enemy-art-bounds.json');
const {characterArt}=require('../src/theme/creativeAssets.ts');
const {displayImage}=require('../src/theme/displayImages.ts');
const {FORMAL_QUEST_STAGES}=require('../src/domain/redesign/questMaster.ts');
const {FORMAL_ENCOUNTER_MASTERS}=require('../src/domain/redesign/raidFormalMaster.ts');
const {FORMAL_CASTLES,createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');
for(const row of audit){assert(fs.existsSync('public'+row.source));assert.equal(!!bounds[row.source],row.layout==='measured',row.name);assert(fs.existsSync('public'+displayImage(row.source)),row.name);}
const pools={quest:FORMAL_QUEST_STAGES.flatMap(s=>s.waves.flat()),encounter:FORMAL_ENCOUNTER_MASTERS.flatMap(s=>s.enemies||[s.enemy]),invasion:FORMAL_CASTLES.flatMap(c=>createFormalInvasionMaster(c.id,()=>0).stages.flatMap(s=>s.enemies))};
const report={status:'PASS',characters:audit.length,measured:audit.filter(r=>r.layout==='measured').length,standard:audit.filter(r=>r.layout==='square-standard').length,pools:{}};
for(const [pool,units] of Object.entries(pools)){const result={units:units.length,measured:0,standard:0,mitsuhide:[]};for(const unit of units){const source=characterArt(unit,'battle')||unit.image,row=audit.find(r=>r.source===source);assert(row,`${pool}/${unit.id}/${unit.name}: unclassified artwork ${source}`);assert.equal(!!bounds[source],row.layout==='measured');result[row.layout==='measured'?'measured':'standard']++;if(row.id==='char_miyabi_01'){assert(bounds[source]);result.mitsuhide.push(unit.id);}}report.pools[pool]=result;}
fs.writeFileSync('docs/verification/enemy-art-coverage-20260929/mapping.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

