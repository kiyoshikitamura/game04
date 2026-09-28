const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
const {createInitialState}=require('../src/domain/redesign/masters.ts');const {captureMissionAssets}=require('../src/domain/redesign/missionProgress.ts');
// PostgreSQL jsonb emits object keys by byte length then lexical bytes; arrays preserve order.
const dbOrder=v=>Array.isArray(v)?v.map(dbOrder):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort((a,b)=>Buffer.byteLength(a)-Buffer.byteLength(b)||Buffer.compare(Buffer.from(a),Buffer.from(b))).map(k=>[k,dbOrder(v[k])])):v;
const s=createInitialState('g2-r4-read-stability');s.equipment.push({instanceId:'retained-equip',masterId:'unknown-master',level:100,lb:10});
const persisted=dbOrder(captureMissionAssets(s));const reread=captureMissionAssets(persisted);assert.equal(JSON.stringify(reread),JSON.stringify(persisted),'unchanged persisted assets must not create a false save');
reread.equipment[0].level=99;assert.equal(captureMissionAssets(reread).missionProgress.equipment[reread.equipment[0].instanceId].level,100,'max achievement remains retained');
const next=structuredClone(persisted);next.characters[0].level+=1;const changed=captureMissionAssets(next);assert.equal(changed.missionProgress.character[next.characters[0].id].level,next.characters[0].level);assert.notEqual(JSON.stringify(changed),JSON.stringify(persisted));
console.log('PASS mission asset capture stable after jsonb ordering; real achievements update; historical maxima retained');
