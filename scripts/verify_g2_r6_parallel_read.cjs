// Execute the actual Edge source handler with controlled HTTP responses; no live DB writes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
let source=fs.readFileSync(process.env.G2_API_SOURCE || 'supabase/functions/game04-redesign-api/source.ts','utf8').replace(/^import .*;\n/gm,'');
if(process.env.G2_API_BUNDLE==='1'){
 // Isolate the deployed API layer; domain functions are the same test doubles as source mode.
 source=source.slice(source.indexOf('var oe = {'));
 source='var va=buildInitialState,m0=importLegacyAssets,je=captureMissionAssets,ru=synchronizeHomeBackgroundUnlocks,fu=applyAcquisitionEvents,Ru=reconcileRaidMissionProgress,Ua=applyGrowthAction,ht=gameplayMeasurementReceipt,N0=evaluateMissions,Jt=projectTerritory,Ct=FORMAL_MISSION_CONFIG,Ne=FORMAL_GACHA_VERSION,uu=GACHA_CATEGORIES,He=SPECIAL_GACHA_RULES,Fe=SPECIAL_GACHA_TICKET_IDS,Be=NORMAL_GACHA_RULE,Te=specialGachaPool,We=normalGachaPool,tu=formalGachaDisplayRates,eu=normalGachaDay;\n'+source;
}
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
async function run(options={}){
 const calls=[],pending=[];let handler,commits=0,acquisitions=0,parallelReached=false;
 const state={userId:'qa',version:5,cash:1,energy:100,characters:[],skills:[],equipment:[],deck:[],materials:{unlock:0},clearedStages:[]};
 const identity=s=>s;const context={URL,Response,Request,console,crypto:require('node:crypto').webcrypto,structuredClone,TextEncoder,
  Deno:{env:{get:n=>n==='SUPABASE_URL'?'https://lrgyllgzcdcphlbmkknc.supabase.co':'fake-service-key'},serve:f=>handler=f},
  buildInitialState:()=>state,importLegacyAssets:identity,applyAcquisitionEvents:identity,captureMissionAssets:identity,synchronizeHomeBackgroundUnlocks:identity,reconcileRaidMissionProgress:identity,
  FORMAL_GACHA_VERSION:'qa',GACHA_CATEGORIES:['character','skill','equipment'],SPECIAL_GACHA_RULES:{},SPECIAL_GACHA_TICKET_IDS:{character:'SPECIAL_TICKET_CHARACTER',skill:'SPECIAL_TICKET_SKILL',equipment:'SPECIAL_TICKET_EQUIPMENT'},NORMAL_GACHA_RULE:{},specialGachaPool:()=>[],normalGachaPool:()=>[],normalGachaCompatibilityPool:()=>[],formalGachaDisplayRates:()=>[],normalGachaDay:()=>'2026-09-25',
  FORMAL_MISSION_CONFIG:{enabled:true,missions:[]},evaluateMissions:()=>[],projectTerritory:()=>({}),gameplayMeasurementReceipt:()=>({}),applyGrowthAction:s=>({...s,cash:s.cash+1}),
  fetch:async(url,init)=>{const p=new URL(url).pathname+new URL(url).search;calls.push(p);let result;
   if(p==='/auth/v1/user')return Response.json(options.authFail?{}:{id:'qa'},{status:options.authFail?401:200});
   const isProfile=p.startsWith('/rest/v1/users?'),isPrior=p.startsWith('/rest/v1/game04_requests?'),isAcq=p.endsWith('/game04_acquisition_input');
   if(options.checkParallel&&(isProfile||isPrior||isAcq)&&acquisitions===0){await new Promise(resolve=>{pending.push(resolve);if(pending.length===3){parallelReached=true;pending.forEach(f=>f());}});}
   if(isProfile)result=options.noProfile?[]:[{id:'qa',username:'QA'}];
   else if(isPrior){if(options.priorFail)return Response.json({message:'request lookup unavailable'},{status:503});result=options.replay?[{request_id:'x',result:{receipt:{saved:'previous'},operation:options.priorOperation,requestPayload:options.priorPayload}}]:[];}
   else if(isAcq){acquisitions++;if(options.acqFail&&(options.replay?acquisitions===1:true))return Response.json({message:'acquisition unavailable'},{status:503});result={legacy:{},events:[],master:{}};}
   else if(p.startsWith('/rest/v1/user_items?'))result=[];
   else if(p.endsWith('/game04_get_session_state'))result=state;
   else if(p.endsWith('/game04_commit_growth_state')){commits++;if(options.conflict)return Response.json({code:'40001',message:'conflict'},{status:400});result={state:{...JSON.parse(init.body).p_state,version:6}};}
   else if(p.endsWith('/game04_raid_rooms_for_user')||p.includes('/game04_social_events?')||p.includes('/game04_battles?'))result=[];
   else if(p.endsWith('/game04_territory_context'))result={master:{},progress:{},items:{},activeHostingCount:0};
   else throw Error('unexpected '+p);
   return Response.json(result);
  }};
 vm.runInNewContext(js,context);
 const response=await Promise.race([handler(new Request('https://local.test',{method:'POST',headers:{authorization:'Bearer qa'},body:JSON.stringify({action:options.action||(options.read?'get_state':'save_deck'),requestId:options.invalidRequest?'invalid':'12345678-1234-1234-1234-123456789012',payload:options.payload||{}})})),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('parallel preparation did not start all three reads')),2000);timer.unref();})]);
 return{status:response.status,result:await response.json(),calls,commits,acquisitions,parallelReached};
}
(async()=>{
 let r=await run({checkParallel:true});assert.equal(r.status,200);assert(r.parallelReached);assert.equal(r.acquisitions,1);assert.equal(r.commits,1);assert.equal(r.result.state.version,6);
 r=await run({replay:true,acqFail:true});assert.equal(r.status,200);assert.equal(r.commits,0);assert.equal(r.result.saved,'previous');assert.equal(r.acquisitions,2,'replay uses existing fresh response path, not speculative failure');
 r=await run({noProfile:true});assert.equal(r.status,409);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.endsWith('/game04_get_session_state')));
 r=await run({acqFail:true});assert.equal(r.status,503);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.endsWith('/game04_get_session_state')));
 r=await run({priorFail:true});assert.equal(r.status,503);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.endsWith('/game04_get_session_state')));
 r=await run({invalidRequest:true});assert.equal(r.status,400);assert.equal(r.calls.length,1,'invalid request ID rejected before database preparation');
 r=await run({conflict:true});assert.equal(r.status,409);assert.equal(r.commits,1);
 r=await run({read:true});assert.equal(r.status,200);assert.equal(r.acquisitions,1);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.includes('/game04_requests?')));
 r=await run({authFail:true});assert.equal(r.status,401);assert.equal(r.calls.length,1);
 if(process.env.G2_G3_CONTRACT==='1'){
  for(const action of ['special_gacha_status','formal_gacha_status']){r=await run({action});assert.equal(r.status,200);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.includes('/game04_requests?')));}
  r=await run({action:'formal_gacha',payload:{mode:'special',category:'character',count:1,payment:'TICKET'},replay:true,acqFail:true,priorOperation:'special_gacha',priorPayload:{category:'character',count:1,payment:'TICKET'}});assert.equal(r.status,200);assert.equal(r.result.saved,'previous');assert.equal(r.commits,0);
  r=await run({action:'formal_gacha',payload:{mode:'special',category:'character',count:1,payment:'TICKET'},replay:true,priorOperation:'special_gacha',priorPayload:{category:'character',count:10,payment:'TICKET'}});assert.equal(r.status,409);assert.equal(r.commits,0);assert(!r.calls.some(p=>p.endsWith('/game04_get_session_state')));
 }
 console.log('PASS actual Edge handler: parallel readonly preparation; one acquisition read for new save; replay refresh/error isolation; absent profile/read failure do not mutate; CAS conflict preserved; read/auth paths unchanged. HTTP mocked, not live acceptance.');
})().catch(e=>{console.error(e);process.exitCode=1;});
