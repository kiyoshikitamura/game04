const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const Module = require('node:module');
function load(file) { const js = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText; const m=new Module(file,module);m._compile(js,file);return m.exports; }
const api=load('src/domain/redesign/approvedBackgrounds.ts');
const manifest=JSON.parse(fs.readFileSync('docs/verification/g2-20260925/r5/background-manifest.json'));
assert.equal(manifest.assets.length,35);
assert.equal(new Set(manifest.assets.map(r=>r.path)).size,35);
for(const r of manifest.assets){const b=fs.readFileSync(`public${r.path}`);assert(b.length>0);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),r.sha256);assert.equal(b.toString('ascii',0,4),'RIFF');}
assert.equal(manifest.assets.filter(r=>r.kind==='quest').length,10);
assert.equal(manifest.assets.filter(r=>r.kind==='ssr').length,10);
for(const r of manifest.assets.filter(r=>r.kind==='quest'))assert.equal(api.QUEST_BACKGROUND_PATHS[r.areaId],r.path);
let stageChecks=0;
for(const r of manifest.assets.filter(r=>r.kind==='invasion'))for(const lv of r.levels){assert.equal(api.invasionBackground(r.castleId,lv),r.path);stageChecks++;}
assert.equal(stageChecks,60);
assert.equal(api.invasionBackground('legacy',1),undefined);
assert.equal(api.invasionBackground('TI01',13),undefined);
const master={id:'TI01',backgroundUrl:'/old.png'},room={id:'qa',level:4};
assert.equal(api.raidBattleBackground(room,master,{roomId:'qa',level:3}),'/bg/approved-20260925/invasion-TI01-gate.webp');
assert.equal(api.raidBattleBackground(room,master,undefined),'/old.png');
assert.equal(api.raidBattleBackground(room,master,{roomId:'other',level:3}),'/old.png');
console.log(JSON.stringify({assets:35,quest:10,invasionStageMappings:60,ssrPreparedOnly:10,savedStartLevelAndOldSnapshotFallback:'PASS',result:'PASS'}));
