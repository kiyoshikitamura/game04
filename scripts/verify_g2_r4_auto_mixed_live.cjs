// Parent-run only: dedicated QA fixture must be initialized and classified first.
const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
const {autoEquipSkills,autoEquipEquipment}=require('../src/domain/redesign/growth.ts');
const {CHARACTER_MASTERS}=require('../src/domain/redesign/masters.ts');
const config=JSON.parse(fs.readFileSync('config/game04-preview-public.json'));
assert.equal(new URL(config.supabaseUrl).hostname,'lrgyllgzcdcphlbmkknc.supabase.co');
const session=JSON.parse(fs.readFileSync(process.argv[2]));
const out=process.argv[3]||'docs/verification/g2-20260925/r4/r01-mixed-inventory-live.json';
const report={checkedAt:new Date().toISOString(),userId:session.user.id,checks:[],requests:[],scope:'Authenticated HTTP and get_state, not browser / physical device verification'};
async function call(action,payload={},requestId=crypto.randomUUID()){
 const r=await fetch(config.supabaseUrl+'/functions/v1/game04-redesign-api',{method:'POST',headers:{apikey:config.supabaseAnonKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId}),signal:AbortSignal.timeout(30000)});
 const data=await r.json();report.requests.push({action,requestId,status:r.status,version:data.state?.version,error:data.error});return {status:r.status,data};
}
async function ok(action,payload,id){const r=await call(action,payload,id);assert.equal(r.status,200,action+': '+r.data.error);return r.data.state;}
function sameAssets(a,b){for(const k of ['skills','equipment','characters'])assert.deepEqual(a[k],b[k],k);}
function check(name,detail={}){report.checks.push({name,pass:true,...detail});}
(async()=>{
 let s=await ok('get_state'); assert(s.skills.some(x=>x.id==='G2QA_R4_UNKNOWN_SKILL'));assert(s.equipment.some(x=>x.masterId==='G2QA_R4_UNKNOWN_MASTER'));
 report.original={souls:s.souls,growthInventory:s.growthInventory??null};
 const original=structuredClone(s);
 for(const [name,fn] of [['skills',autoEquipSkills],['equipment',autoEquipEquipment]]){
  const deck=fn(s);s=await ok('save_deck',{deck});const read=await ok('get_state');assert.deepEqual(read.deck,deck);sameAssets(read,original);s=read;
  assert(!deck.some(x=>x.skillIds.includes('G2QA_R4_UNKNOWN_SKILL')));assert(!deck.some(x=>Object.values(x.equipment).includes('G2QA_R4_UNKNOWN_EQUIP')));
  const ids=deck.flatMap(x=>Object.values(x.equipment));assert.equal(new Set(ids).size,ids.length);check('R01 '+name+' auto selection / save / reload / unresolved inventory retained',{version:s.version});
 }
 report.final={version:s.version,deck:s.deck,skillInventory:s.skills,equipmentInventory:s.equipment};report.pass=true;
})().catch(e=>{report.pass=false;report.error=e.message;process.exitCode=1;}).finally(()=>{fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:report.pass,checks:report.checks,error:report.error,out}));});
