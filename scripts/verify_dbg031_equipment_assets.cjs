const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const approved=require('../config/game04-local-other-assets.json').assets.filter(a=>a.category==='Equipment');
const connected=require('../config/game04-master-assets.json').assets;
const formal=require('../src/domain/redesign/data/formal-growth-equipment.json').equipment;
const names=require('../src/theme/sengoku-masters.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const ts=require('typescript');
require.extensions['.ts']=(module,name)=>module._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText,name);
(async()=>{
  assert.equal(approved.length,160);
  assert.deepEqual(approved.map(a=>a.id).sort(),formal.map(a=>a.id).sort());
  assert.equal(new Set(approved.map(a=>a.path)).size,160);
  const {FORMAL_GACHA_POOL}=require('../src/domain/redesign/formalGachaMaster.ts');
  const {applyFormalSpecialGacha}=require('../src/domain/redesign/formalGacha.ts');
  const {createInitialState}=require('../src/domain/redesign/masters.ts');
  for(const row of FORMAL_GACHA_POOL.filter(r=>r.category==='equipment'))assert.equal(row.image,approved.find(a=>a.id===row.id)?.path,row.id);
  const state=createInitialState('dbg031-offline');state.diamonds=10000;
  const receipt=applyFormalSpecialGacha(state,{requestId:'dbg031-offline',category:'equipment',count:10,payment:'DIAMONDS'},()=>0.5).receipt;
  receipt.results.forEach(r=>assert.equal(r.image,approved.find(a=>a.id===r.id)?.path));
  const rows=[];
  for(const a of approved){
    const m=connected.find(m=>m.id===a.id),bytes=fs.readFileSync('public'+a.path);
    assert.equal(m.path,a.path,a.id);assert.equal(m.status,'SENGOKU_CONNECTED');
    assert.equal(hash(bytes),a.sha256,a.id);assert.equal(m.sha256,a.sha256);
    assert.deepEqual(m.size,[bytes.readUInt32BE(16),bytes.readUInt32BE(20)],a.id);
    assert(names[a.id]);
    rows.push({id:a.id,name:names[a.id],path:a.path,sha256:a.sha256});
  }
  if(process.env.DBG031_BASE_URL){
    for(let start=0;start<rows.length;start+=8)await Promise.all(rows.slice(start,start+8).map(async a=>{
      const r=await fetch(process.env.DBG031_BASE_URL+a.path);assert.equal(r.status,200,a.id);
      assert.equal(hash(Buffer.from(await r.arrayBuffer())),a.sha256,a.id);a.deployedVerified=true;
    }));
  }
  const out='docs/verification/device-debug/dbg031';fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(out+'/assets.json',JSON.stringify({sourceCommit:'65d2a4b2dc1ffe9cf4a18a8e73539b6c079d1ff8',baseUrl:process.env.DBG031_BASE_URL||null,total:rows.length,missing:[],rows},null,2)+'\n');
  console.log('PASS: 160 formal IDs, unique paths, approved PNG hashes/dimensions'+(process.env.DBG031_BASE_URL?', deployed bytes':''));
})().catch(e=>{console.error(e);process.exitCode=1});
