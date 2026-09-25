// Execute the actual Edge source handler with controlled HTTP responses; no live DB writes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
let source=fs.readFileSync(process.env.G2_API_SOURCE || 'supabase/functions/game04-redesign-api/source.ts','utf8').replace(/^import .*;\n/gm,'');
if(process.env.G2_API_BUNDLE==='1'){
 // Isolate the deployed API layer; domain functions are the same test doubles as source mode.
 source=source.slice(source.indexOf('var oe = {'));
 if(process.env.G2_API_BUNDLE_VERSION==='30'){
 source='var La=buildInitialState,g0=importLegacyAssets,$e=captureMissionAssets,nu=synchronizeHomeBackgroundUnlocks,hu=applyAcquisitionEvents,Lu=reconcileRaidMissionProgress,Ja=applyGrowthAction,bt=gameplayMeasurementReceipt,O0=evaluateMissions,ii=projectTerritory,yt=FORMAL_MISSION_CONFIG,Ne=FORMAL_GACHA_VERSION,au=GACHA_CATEGORIES,Ue=SPECIAL_GACHA_RULES,Be=NORMAL_GACHA_RULE,Te=specialGachaPool,Ye=normalGachaPool,iu=formalGachaDisplayRates,We=normalGachaDay,Na={character:"SPECIAL_TICKET_CHARACTER",skill:"SPECIAL_TICKET_SKILL",equipment:"SPECIAL_TICKET_EQUIPMENT"};\n'+source;
 }else{
 source='var va=buildInitialState,m0=importLegacyAssets,je=captureMissionAssets,ru=synchronizeHomeBackgroundUnlocks,fu=applyAcquisitionEvents,Ru=reconcileRaidMissionProgress,Ua=applyGrowthAction,ht=gameplayMeasurementReceipt,N0=evaluateMissions,Jt=projectTerritory,Ct=FORMAL_MISSION_CONFIG,Ne=FORMAL_GACHA_VERSION,uu=GACHA_CATEGORIES,He=SPECIAL_GACHA_RULES,Be=NORMAL_GACHA_RULE,Te=specialGachaPool,We=normalGachaPool,tu=formalGachaDisplayRates,eu=normalGachaDay;\n'+source;
 }
}
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
async function run(options={}){
 const calls=[],pending=[];let handler,commits=0,acquisitions=0,parallelReached=false;
 const state={userId:'qa',version:5,cash:1,energy:100,characters:[],skills:[],equipment:[],deck:[],materials:{unlock:0},clearedStages:[]};
 const roomRows=[{state:{id:'room',ownerId:'qa',status:'active',expiresAt:'2099-01-01',participants:[{userId:'qa',name:'before'},{userId:'other',name:'other'}]},version:4,ownerName:'after',ownerLeaderCharacterId:'new-leader'}],eventRows=[{id:'event'}],pendingRows=[{id:'pending',kind:'quest',target_id:'1-1'}],territoryRow={master:{},progress:{},items:{},activeHostingCount:0};
 const identity=s=>s;const context={URL,Response,Request,console,crypto:require('node:crypto').webcrypto,structuredClone,TextEncoder,
  Deno:{env:{get:n=>n==='GAME04_SAVE_CONTEXT_RPC'?(options.flag?'true':'false'):n==='SUPABASE_URL'?'https://lrgyllgzcdcphlbmkknc.supabase.co':'fake-service-key'},serve:f=>handler=f},
  buildInitialState:()=>state,importLegacyAssets:identity,applyAcquisitionEvents:identity,captureMissionAssets:identity,synchronizeHomeBackgroundUnlocks:identity,reconcileRaidMissionProgress:s=>options.reconcile&&!s.reconciled?{...s,reconciled:true}:s,
  FORMAL_GACHA_VERSION:'qa',GACHA_CATEGORIES:['character','skill','equipment'],SPECIAL_GACHA_RULES:{},NORMAL_GACHA_RULE:{},specialGachaPool:()=>[],normalGachaPool:()=>[],normalGachaCompatibilityPool:()=>[],formalGachaDisplayRates:()=>[],normalGachaDay:()=>'2026-09-25',
  FORMAL_MISSION_CONFIG:{enabled:true,missions:[]},evaluateMissions:()=>[],projectTerritory:()=>({}),gameplayMeasurementReceipt:action=>({gameplayMeasurement:{action}}),applyGrowthAction:s=>({...s,deck:[{characterId:'new-leader'}]}),
  CHARACTER_MASTERS:[{id:'new-leader'}],characterArt:()=>'/new-leader.webp',
  applyHomeSelection:s=>s,
  fetch:async(url,init)=>{const p=new URL(url).pathname+new URL(url).search;calls.push(p);let result;
   if(p==='/auth/v1/user')return Response.json(options.authFail?{}:{id:'qa'},{status:options.authFail?401:200});
   const isProfile=p.startsWith('/rest/v1/users?'),isPrior=p.startsWith('/rest/v1/game04_requests?'),isAcq=p.endsWith('/game04_acquisition_input');
   if(options.checkParallel&&(isProfile||isPrior||isAcq)&&acquisitions===0){await new Promise(resolve=>{pending.push(resolve);if(pending.length===3){parallelReached=true;pending.forEach(f=>f());}});}
   if(isProfile)result=options.noProfile?[]:[{id:'qa',username:'QA'}];
   else if(isPrior){if(options.priorFail)return Response.json({message:'request lookup unavailable'},{status:503});result=options.replay?[{request_id:'x',result:{receipt:{saved:'previous'},operation:options.priorOperation,requestPayload:options.priorPayload}}]:[];}
   else if(isAcq){acquisitions++;if(options.acqFail&&(options.replay?acquisitions===1:true))return Response.json({message:'acquisition unavailable'},{status:503});result={legacy:{},events:[],master:{}};}
   else if(p.endsWith('/game04_get_session_state'))result=state;
   else if(p.endsWith('/game04_commit_growth_state')||p.endsWith('/game04_commit_deck_with_context')){commits++;if(options.conflict)return Response.json({code:'40001',message:'conflict'},{status:400});result={state:{...JSON.parse(init.body).p_state,version:6}};if(p.endsWith('/game04_commit_deck_with_context')){const args=JSON.parse(init.body);assert.equal(args.p_receipt.gameplayMeasurement.action,'save_deck');assert.equal(args.p_cash_delta,0);assert.equal(args.p_energy_delta,0);assert.equal(args.p_battle,null);assert.equal(args.p_raid,null);}if(p.endsWith('/game04_commit_deck_with_context')&&!options.missingContext){if(options.contextFail)return Response.json({message:'context unavailable'},{status:503});result.responseContext={rooms:roomRows,socialEvents:eventRows,pending:pendingRows,territory:territoryRow};}}
   else if(p.includes('/user_items?'))result=[];
   else if(p.endsWith('/game04_raid_rooms_for_user')||p.endsWith('/game04_raid_rooms_with_owners'))result=roomRows;
   else if(p.includes('/game04_social_events?'))result=eventRows;
   else if(p.includes('/game04_battles?'))result=pendingRows;
   else if(p.endsWith('/game04_territory_context'))result=territoryRow;
   else throw Error('unexpected '+p);
   return Response.json(result);
  }};
 vm.runInNewContext(js,context);
 const response=await Promise.race([handler(new Request('https://local.test',{method:'POST',headers:{authorization:'Bearer qa'},body:JSON.stringify({action:options.action||(options.read?'get_state':'save_deck'),requestId:options.invalidRequest?'invalid':'12345678-1234-1234-1234-123456789012',payload:options.payload||{}})})),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('parallel preparation did not start all three reads')),2000);timer.unref();})]);
 return{status:response.status,result:await response.json(),calls,commits,acquisitions,parallelReached};
}

(async()=>{
 const base=await run(); const fast=await run({flag:true});
 assert.equal(base.status,200);assert.equal(fast.status,200);
 assert.deepEqual(fast.result,base.result,'full state/rooms/events/pending/missions/territory response retained');
 assert.equal(base.calls.length-fast.calls.length,4,'four post-commit HTTP requests collapse into commit RPC');
 assert.equal(fast.calls.filter(p=>p.endsWith('/game04_commit_deck_with_context')).length,1);
 assert(!base.calls.some(p=>p.endsWith('/game04_commit_deck_with_context')),'flag off preserves existing path');
 assert.equal(fast.result.rooms[0].participants[0].portraitUrl,'/new-leader.webp');
 assert.equal(fast.result.rooms[0].participants[0].name,'after');
 assert.equal(fast.result.rooms[0].participants[1].name,'other');
 assert(!('responseContext' in fast.result),'internal context does not leak into HTTP result');
 for(const options of [{authFail:true},{invalidRequest:true},{noProfile:true},{priorFail:true},{acqFail:true}]){
  const r=await run({...options,flag:true});assert(r.status>=400);assert.equal(r.commits,0);
 }
 const replay=await run({flag:true,replay:true,acqFail:true});assert.equal(replay.status,200);assert.equal(replay.commits,0);assert.equal(replay.result.saved,'previous');assert(!replay.calls.some(p=>p.endsWith('/game04_commit_deck_with_context')));
 const conflict=await run({flag:true,conflict:true});assert.equal(conflict.status,409);assert.equal(conflict.commits,1);
 const failed=await run({flag:true,contextFail:true});assert.equal(failed.status,503,'context failure is not reported as success');
 const fallback=await run({flag:true,missingContext:true});assert.equal(fallback.status,200);assert.deepEqual(fallback.result,base.result);
 const reconciliation=await run({flag:true,reconcile:true});assert.equal(reconciliation.status,200);assert.equal(reconciliation.commits,2,'mission reconciliation retains existing commit authority');assert.equal(reconciliation.result.state.reconciled,true);
 for(const action of ['get_state','set_home']){const r=await run({flag:true,action});assert.equal(r.status,200);assert(!r.calls.some(p=>p.endsWith('/game04_commit_deck_with_context')));}
 console.log(JSON.stringify({status:'PASS',scope:'actual Edge handler with controlled HTTP; not SQL/runtime performance acceptance',checks:17,baselineHttp:base.calls.length,candidateHttp:fast.calls.length,removedDependentHttpWave:1,liveWrites:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
