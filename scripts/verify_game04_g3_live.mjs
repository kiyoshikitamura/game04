import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

// Isolated acceptance only. Modes:
// 1) bootstrap: create one anonymous QA/profile, persist its session under /tmp,
//    print the user ID, then stop so the separately reviewed seed can classify it.
// 2) acceptance: require the private seed attestation and in-state marker before
//    any draw; verify JST/free, canonical replay, KPI receipts, tickets and SSR.
// 3) relogin: consume a separately obtained fresh interactive-login session and
//    prove the selected SSR background survived. A refresh token is not relogin.
// Never point this script at the old lrgy dev, fixed Preview, retired, standard,
// Production, or an unapproved ref. No service-role credential is accepted.

const baseUrl=process.env.GAME04_QA_SUPABASE_URL;
const publishableKey=process.env.GAME04_QA_SUPABASE_KEY;
const approvedRef=process.env.GAME04_G3_APPROVED_PROJECT_REF;
const mode=process.env.GAME04_G3_MODE;
const sessionPath=process.env.GAME04_G3_SESSION_PATH;
const evidencePath=process.env.GAME04_G3_EVIDENCE_PATH;
const attestationPath=process.env.GAME04_G3_FIXTURE_ATTESTATION_PATH;
const fixtureTag=process.env.GAME04_G3_EXPECTED_FIXTURE_TAG;
const candidate=process.env.GAME04_G3_CANDIDATE;
const checkpointPath=process.env.GAME04_G3_CHECKPOINT_PATH;
const productionRef=process.env.GAME04_G3_PRODUCTION_PROJECT_REF;
const isolationAck='I_ACKNOWLEDGE_ISOLATED_QA_WRITES';
const isolatedAcceptanceRef='znakrkaazliexzwihxge';
assert(productionRef&&/^[a-z]{20}$/.test(productionRef),'Set the separately verified Production project ref for the deny guard.');
const forbiddenRefs=new Set([productionRef,'lrgyllgzcdcphlbmkknc','sufvuqdnqohpfzkwxohq','hggzvgdrgrboxmeywebw','ktpolnkyyfkowxdmijww',...(process.env.GAME04_G3_FORBIDDEN_PROJECT_REFS??'').split(',').map(value=>value.trim()).filter(Boolean)]);
assert(baseUrl&&publishableKey,'Set the isolated project URL and publishable key explicitly.');
assert(!publishableKey.startsWith('sb_secret_'),'Service/secret keys are forbidden for this acceptance script.');
if(publishableKey.split('.').length===3){
 const claims=JSON.parse(Buffer.from(publishableKey.split('.')[1],'base64url').toString('utf8'));
 assert.equal(claims.role,'anon','Only an anon-role legacy publishable key is accepted.');
}else assert(publishableKey.startsWith('sb_publishable_'),'Use a publishable key, never a service credential.');
assert(approvedRef&&/^[a-z]{20}$/.test(approvedRef),'Set GAME04_G3_APPROVED_PROJECT_REF to the newly approved isolated ref.');
assert.equal(approvedRef,isolatedAcceptanceRef,'This G3 acceptance candidate is fixed to the approved isolated project.');
const target=new URL(baseUrl);
const actualRef=target.hostname.match(/^([a-z]{20})\.supabase\.co$/)?.[1];
assert.equal(target.protocol,'https:','HTTPS Supabase URL required.');assert.equal(target.pathname,'/','Supabase URL must not include a path.');
assert.equal(actualRef,approvedRef,'Refusing mismatched Supabase target.');assert(!forbiddenRefs.has(approvedRef),'Refusing old development, Preview, retired, standard, or explicitly forbidden project ref.');
assert.equal(process.env.GAME04_G3_ISOLATED_ACCEPTANCE,isolationAck,'Explicit isolated-QA write acknowledgement required.');
assert(['bootstrap','acceptance','relogin'].includes(mode),'Set GAME04_G3_MODE to bootstrap, acceptance, or relogin.');
assert(sessionPath?.startsWith('/tmp/')&&sessionPath.endsWith('.json'),'Session must use an explicit /tmp/*.json path.');
const readPrivateJson=(path,label)=>{const modeBits=fs.statSync(path).mode&0o777;assert.equal(modeBits&0o077,0,`${label} must be mode 0600`);return JSON.parse(fs.readFileSync(path,'utf8'));};
if(mode!=='bootstrap')assert(evidencePath&&attestationPath?.startsWith('/tmp/')&&fixtureTag&&candidate,'Acceptance/relogin requires evidence path, /tmp fixture attestation, fixture tag, and candidate identity.');
if(mode==='acceptance')assert(checkpointPath?.startsWith('/tmp/')&&checkpointPath.endsWith('.json'),'Acceptance requires an explicit /tmp/*.json durable checkpoint path.');
const attestation=mode==='bootstrap'?null:readPrivateJson(attestationPath,'Fixture attestation');
if(attestation){
 assert.deepEqual({version:attestation.version,scope:attestation.scope,projectRef:attestation.projectRef,fixtureTag:attestation.fixtureTag,kpiClassification:attestation.kpiClassification},{version:1,scope:'GAME04_G3_ISOLATED_ACCEPTANCE',projectRef:approvedRef,fixtureTag,kpiClassification:'qa'});
 assert(Date.parse(attestation.expiresAt)>Date.now(),'Fixture attestation expired.');
 assert.equal(attestation.kpiProof?.activeQaPeriods,1,'Exactly one active QA classification period must be read back before acceptance.');
 assert.equal(attestation.kpiProof?.sourceUserId,attestation.userId,'KPI classification proof belongs to another user.');
 assert(Date.parse(attestation.kpiProof?.observedAt)<=Date.now()&&Date.parse(attestation.kpiProof?.observedAt)>Date.now()-15*60_000,'KPI classification readback must be recent.');
 assert.deepEqual(attestation.ticketFixture,{mode:'isolated-paid-lot',nonExpiredCategory:'skill',expiredCategory:'equipment'},'Paid-lot fixture attestation is incomplete.');
 assert(typeof attestation.exchangeItemId==='string'&&attestation.exchangeItemId.length>0,'Fixture attestation must identify the SSR exchange item.');
 assert(typeof attestation.exchangeMismatchItemId==='string'&&attestation.exchangeMismatchItemId.length>0&&attestation.exchangeMismatchItemId!==attestation.exchangeItemId,'Fixture attestation must identify a distinct exchange mismatch item.');
 assert(typeof attestation.expectedHomeBackgroundId==='string'&&attestation.expectedHomeBackgroundId.length>0,'Fixture attestation must identify the expected SSR background.');
 assert(Number.isSafeInteger(attestation.minimumCash)&&attestation.minimumCash>=1000,'Fixture needs at least one paid normal draw.');
 assert(Number.isSafeInteger(attestation.minimumDiamonds)&&attestation.minimumDiamonds>=300,'Fixture needs at least one character special draw.');
 assert(Number.isSafeInteger(attestation.minimumCharacterPoints)&&attestation.minimumCharacterPoints>=200,'Fixture needs one character SSR exchange.');
 assert(Number.isSafeInteger(attestation.minimumTickets?.SPECIAL_TICKET_SKILL)&&attestation.minimumTickets.SPECIAL_TICKET_SKILL>=1,'Fixture needs one non-expired skill ticket.');
 assert(Number.isSafeInteger(attestation.minimumTickets?.SPECIAL_TICKET_EQUIPMENT)&&attestation.minimumTickets.SPECIAL_TICKET_EQUIPMENT>=1,'Fixture needs one expired-lot equipment ticket for rollback verification.');
}
const attestationSha256=attestation?createHash('sha256').update(fs.readFileSync(attestationPath)).digest('hex'):null;
const saveSession=value=>{fs.writeFileSync(sessionPath,JSON.stringify({...value,projectRef:approvedRef}),{mode:0o600});fs.chmodSync(sessionPath,0o600);};
let session=fs.existsSync(sessionPath)?readPrivateJson(sessionPath,'QA session'):null;
if(session)assert.equal(session.projectRef,approvedRef,'Refusing session from another project.');

async function createSession(){
 const response=await fetch(`${baseUrl}/auth/v1/signup`,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:'{}'}),body=await response.json();
 assert.equal(response.ok,true,body?.message||'anonymous signup failed');
 session={accessToken:body.access_token,refreshToken:body.refresh_token,userId:body.user.id,createdAt:new Date().toISOString()};saveSession(session);
 const initialized=await rest('/rest/v1/rpc/initialize_current_player',{p_username:`G3${session.userId.slice(0,6)}`,p_invite_code:null});
 assert.equal(initialized.status,200,initialized.body?.message||'profile initialization failed');
 console.log(JSON.stringify({event:'QA_FIXTURE_REQUIRED',userId:session.userId,sessionPath}));
 process.exit(2);
}
async function refreshSession(){
 const response=await fetch(`${baseUrl}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken})}),body=await response.json();
 assert.equal(response.ok,true,body?.message||'refresh failed');assert.equal(body.user?.id,session.userId);
 session={...session,accessToken:body.access_token,refreshToken:body.refresh_token,refreshedAt:new Date().toISOString()};saveSession(session);
}
async function rest(path,payload){const response=await fetch(`${baseUrl}${path}`,{method:'POST',headers:{apikey:publishableKey,Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});return{status:response.status,body:await response.json()};}
if(!session){assert.equal(mode,'bootstrap','Acceptance/relogin requires a pre-created scoped QA session.');await createSession();}
if(mode==='bootstrap'){console.log(JSON.stringify({event:'QA_FIXTURE_REQUIRED',userId:session.userId,sessionPath}));process.exit(2);}
assert.equal(session.userId,attestation.userId,'Session user does not match the scoped fixture attestation.');
if(mode!=='relogin')await refreshSession();

const apiUrl=`${baseUrl}/functions/v1/game04-redesign-api`;
async function call(action,payload={},requestId=randomUUID()){
 const started=performance.now(),response=await fetch(apiUrl,{method:'POST',headers:{apikey:publishableKey,Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId})});
 return{status:response.status,body:await response.json(),elapsedMs:Math.round(performance.now()-started),requestId};
}
const expectStatus=(result,status,label)=>assert.equal(result.status,status,`${label}: HTTP ${result.status} ${result.body?.error||result.body?.message||''}`);
const compact=state=>({version:state.version,cash:state.cash,diamonds:state.diamonds,dailyNormalGachaDate:state.dailyNormalGachaDate,grantLedger:state.questTicketGrants??{},points:state.specialGachaPoints??{},characters:state.characters.length,skills:state.skills.length,equipment:state.equipment.length,souls:state.souls,skillMaterial:state.materials.skill});
const resources=state=>{const {version:ignored,...snapshot}=compact(state);return snapshot;};
const timing=(label,result)=>({label,status:result.status,elapsedMs:result.elapsedMs,replay:false});
const stateFixture=(state)=>state?.g3AcceptanceFixture;
const assertFixtureState=state=>assert.deepEqual(stateFixture(state),{scope:'GAME04_G3_ISOLATED_ACCEPTANCE',projectRef:approvedRef,fixtureTag});
const writeEvidence=value=>{const serialized=JSON.stringify(value,null,2);assert(!/(access_token|refresh_token|service_role|anonKey|publishableKey|authorization|apikey)/i.test(serialized),'Refusing evidence containing credential-like keys.');fs.writeFileSync(evidencePath,`${serialized}\n`);};
if(mode==='relogin'){
 assert.equal(process.env.GAME04_G3_FRESH_LOGIN_ATTESTED,'FRESH_INTERACTIVE_LOGIN_COMPLETED','Relogin evidence requires an independently authenticated fresh-session attestation.');
 assert.equal(session.freshInteractiveLogin?.method,'browser','Relogin session must be exported by the approved browser authentication route.');
 assert(Date.parse(session.freshInteractiveLogin?.observedAt)<=Date.now()&&Date.parse(session.freshInteractiveLogin?.observedAt)>Date.now()-15*60_000,'Fresh interactive login evidence must be recent.');
 const restored=await call('get_state');expectStatus(restored,200,'fresh-login state');assertFixtureState(restored.body.state);assert.equal(restored.body.state.homeBackgroundId,attestation.expectedHomeBackgroundId);
 const reloginEvidence={candidate,testedAt:new Date().toISOString(),projectRef:approvedRef,qaUserId:session.userId,fixtureTag,attestationSha256,sessionEvidence:'externally authenticated fresh interactive login',selectedHomeBackground:restored.body.state.homeBackgroundId,timing:timing('fresh-login-get-state',restored),status:'PASS'};
 writeEvidence(reloginEvidence);console.log(JSON.stringify({event:'G3_ISOLATED_RELOGIN_PASS',projectRef:approvedRef,evidencePath}));process.exit(0);
}
assert.equal(mode,'acceptance','Bootstrap exits before acceptance; select acceptance explicitly after scoped seed and attestation.');
const operationNames=['normalFree','invalidPayment','specialDiamond','ticketSkill','ticketEquipmentExpired','normalCashParallel','ssrExchange','setHome'];
let checkpoint=fs.existsSync(checkpointPath)?readPrivateJson(checkpointPath,'Acceptance checkpoint'):{
 version:1,scope:'GAME04_G3_ISOLATED_ACCEPTANCE',projectRef:approvedRef,userId:session.userId,fixtureTag,candidate,
 createdAt:new Date().toISOString(),attempts:0,operations:Object.fromEntries(operationNames.map(name=>[name,randomUUID()])),completed:{},timings:[],checks:[],
};
assert.deepEqual({version:checkpoint.version,scope:checkpoint.scope,projectRef:checkpoint.projectRef,userId:checkpoint.userId,fixtureTag:checkpoint.fixtureTag,candidate:checkpoint.candidate},
 {version:1,scope:'GAME04_G3_ISOLATED_ACCEPTANCE',projectRef:approvedRef,userId:session.userId,fixtureTag,candidate},'Checkpoint belongs to another acceptance candidate.');
for(const name of operationNames)assert(/^[0-9a-f-]{36}$/i.test(checkpoint.operations?.[name]),`Checkpoint operation ID missing: ${name}`);
const saveCheckpoint=()=>{fs.writeFileSync(checkpointPath,JSON.stringify(checkpoint),{mode:0o600});fs.chmodSync(checkpointPath,0o600);};
checkpoint.attempts+=1;checkpoint.lastStartedAt=new Date().toISOString();saveCheckpoint();
const evidence={candidate,testedAt:new Date().toISOString(),projectRef:approvedRef,qaUserId:session.userId,fixtureTag,fixtureAttestation:{sha256:attestationSha256,kpiClassification:'qa',expiresAt:attestation.expiresAt},checkpoint:{path:checkpointPath,attempt:checkpoint.attempts,resumed:Object.keys(checkpoint.completed).length>0},animationMs:4000,observations:{},timings:[...checkpoint.timings],checks:[...checkpoint.checks]};
const persistProgress=step=>{checkpoint.completed[step]=new Date().toISOString();checkpoint.timings=evidence.timings;checkpoint.checks=evidence.checks;checkpoint.lastCompletedStep=step;delete checkpoint.lastFailure;saveCheckpoint();writeEvidence(evidence);};
let recordingFailure=false;
const recordFailure=reason=>{if(recordingFailure)return;recordingFailure=true;const message=reason instanceof Error?reason.message:String(reason);checkpoint.lastFailure={at:new Date().toISOString(),message:message.slice(0,500)};saveCheckpoint();evidence.failure=checkpoint.lastFailure;writeEvidence(evidence);console.error(message);process.exit(1);};
process.on('uncaughtException',recordFailure);process.on('unhandledRejection',recordFailure);

let cold=await call('formal_gacha_status');expectStatus(cold,200,'cold status');
let warm=await call('formal_gacha_status');expectStatus(warm,200,'warm status');
assert.equal(warm.body.formalGacha.masterVersion,'GAME04_G3_FORMAL_20260925');assert.equal(warm.body.formalGacha.normal.pool.length,292);
assertFixtureState(warm.body.state);
if(!checkpoint.completed.normalFree)assert.equal(warm.body.formalGacha.normal.freeAvailable,true,'Dedicated fixture must start with the JST free ten available.');
if(!checkpoint.completed.normalCashParallel)assert(warm.body.state.cash>=attestation.minimumCash,'Scoped cash fixture is incomplete.');
if(!checkpoint.completed.specialDiamond)assert(warm.body.state.diamonds>=attestation.minimumDiamonds,'Scoped diamond fixture is incomplete.');
if(!checkpoint.completed.ssrExchange)assert(Number(warm.body.state.specialGachaPoints?.character??0)>=attestation.minimumCharacterPoints,'Scoped exchange-point fixture is incomplete.');
for(const [ticketId,minimum] of Object.entries(attestation.minimumTickets??{}))if(ticketId!=='SPECIAL_TICKET_SKILL'||!checkpoint.completed.ticketSkill)assert(Number(warm.body.formalGacha.special.tickets[ticketId]??0)>=minimum,`Scoped ticket fixture is incomplete: ${ticketId}`);
evidence.timings.push(timing('status-cold',cold),timing('status-warm',warm));evidence.checks.push('authenticated status and 292-item normal manifest');
persistProgress('status');

const freeId=checkpoint.operations.normalFree,freePayload={mode:'normal',count:10,payment:'FREE'},freeWasCompleted=Boolean(checkpoint.completed.normalFree);
const free=await call('formal_gacha',freePayload,freeId);expectStatus(free,200,'JST free ten');assert.equal(free.body.formalGachaResults.length,10);assert.equal(free.body.state.dailyNormalGachaDate,free.body.formalGacha.normal.day);assert.equal(free.body.gameplayMeasurement?.action,'normal_gacha');
if(freeWasCompleted)assert.equal(free.body.replayed,true,'Resumed free draw must replay the durable operation ID.');
const freeReplay=await call('formal_gacha',freePayload,freeId);expectStatus(freeReplay,200,'JST free replay');assert.equal(freeReplay.body.replayed,true);assert.deepEqual(freeReplay.body.formalGachaResults,free.body.formalGachaResults);
const freeMismatch=await call('formal_gacha',{mode:'normal',count:1,payment:'FREE'},freeId);expectStatus(freeMismatch,409,'JST free replay mismatch');
evidence.timings.push(timing('normal-free-ten',free),{...timing('normal-free-replay',freeReplay),replay:true},timing('normal-free-mismatch',freeMismatch));evidence.checks.push('JST free ten, normal KPI receipt, canonical replay, and mismatch rejection');
persistProgress('normalFree');

const invalidBaseline=await call('formal_gacha_status');expectStatus(invalidBaseline,200,'invalid payment pre-status');
const beforeInvalid=resources(invalidBaseline.body.state);
const invalid=await call('formal_gacha',{mode:'special',category:'equipment',count:1,payment:'CASH'},checkpoint.operations.invalidPayment);expectStatus(invalid,400,'invalid payment');
const afterInvalid=await call('formal_gacha_status');expectStatus(afterInvalid,200,'status after invalid');assert.deepEqual(resources(afterInvalid.body.state),beforeInvalid);
evidence.timings.push(timing('invalid-payment',invalid));evidence.checks.push('invalid payment is non-consuming');
persistProgress('invalidPayment');

const paidPayload={mode:'special',category:'character',count:1,payment:'DIAMONDS'},paidId=checkpoint.operations.specialDiamond,paidWasCompleted=Boolean(checkpoint.completed.specialDiamond);
const paid=await call('formal_gacha',paidPayload,paidId);expectStatus(paid,200,'special diamond');
assert.equal(paid.body.gameplayMeasurement?.action,'special_gacha');
if(paidWasCompleted)assert.equal(paid.body.replayed,true,'Resumed diamond draw must replay the durable operation ID.');
const paidReplay=await call('formal_gacha',paidPayload,paidId);expectStatus(paidReplay,200,'special replay');
assert.equal(paidReplay.body.replayed,true);assert.deepEqual(paidReplay.body.formalGachaResults,paid.body.formalGachaResults);assert.equal(paidReplay.body.state.version,paid.body.state.version);
const paidMismatch=await call('formal_gacha',{...paidPayload,count:10},paidId);expectStatus(paidMismatch,409,'special replay mismatch');
evidence.timings.push(timing('special-diamond',paid),{...timing('special-replay',paidReplay),replay:true},timing('special-replay-mismatch',paidMismatch));evidence.checks.push('special jsonb DB replay is key-order independent and payload mismatch is rejected');
persistProgress('specialDiamond');

for(const category of ['skill']){
 const status=await call('formal_gacha_status');expectStatus(status,200,`${category} ticket pre-status`);
 const ticketId=status.body.formalGacha.special.categories[category].rule.ticketId;
 const before=Number(status.body.formalGacha.special.tickets[ticketId]),ledgerBefore=Number(status.body.state.questTicketGrants?.[ticketId]??0);
 const ticketWasCompleted=Boolean(checkpoint.completed.ticketSkill);
 const draw=await call('formal_gacha',{mode:'special',category,count:1,payment:'TICKET'},checkpoint.operations.ticketSkill);expectStatus(draw,200,`${category} ticket`);
 if(ticketWasCompleted){assert.equal(draw.body.replayed,true,'Resumed ticket draw must replay the durable operation ID.');assert.equal(draw.body.formalGacha.special.tickets[ticketId],before);}
 else assert.equal(draw.body.formalGacha.special.tickets[ticketId],before-1);
 assert.equal(Number(draw.body.state.questTicketGrants?.[ticketId]??0),ledgerBefore);
 evidence.timings.push(timing(`ticket-${category}`,draw));evidence.checks.push(`${category} user_items ticket decremented; grant ledger unchanged`);
}
persistProgress('ticketSkill');

const expiredBefore=await call('formal_gacha_status');expectStatus(expiredBefore,200,'expired ticket pre-status');
const expiredTicketId=expiredBefore.body.formalGacha.special.categories.equipment.rule.ticketId;
const expiredBalance=expiredBefore.body.formalGacha.special.tickets[expiredTicketId],expiredState=resources(expiredBefore.body.state);
const expired=await call('formal_gacha',{mode:'special',category:'equipment',count:1,payment:'TICKET'},checkpoint.operations.ticketEquipmentExpired);expectStatus(expired,400,'expired ticket');
const expiredAfter=await call('formal_gacha_status');expectStatus(expiredAfter,200,'expired ticket post-status');
assert.equal(expiredAfter.body.formalGacha.special.tickets[expiredTicketId],expiredBalance);assert.deepEqual(resources(expiredAfter.body.state),expiredState);
evidence.timings.push(timing('ticket-expired-rejected',expired));evidence.checks.push('expired paid-lot ticket rejected with transaction rollback and no state/inventory mutation');
persistProgress('ticketEquipmentExpired');

const normalId=checkpoint.operations.normalCashParallel,normalPayload={mode:'normal',count:1,payment:'CASH'},normalWasCompleted=Boolean(checkpoint.completed.normalCashParallel);
const parallel=await Promise.all([call('formal_gacha',normalPayload,normalId),call('formal_gacha',normalPayload,normalId)]);
parallel.forEach((result,index)=>expectStatus(result,200,`parallel normal ${index}`));
if(normalWasCompleted)parallel.forEach(result=>assert.equal(result.body.replayed,true,'Resumed normal draw must replay the durable operation ID.'));
assert.deepEqual(parallel[0].body.formalGachaResults,parallel[1].body.formalGachaResults);assert.equal(parallel[0].body.state.version,parallel[1].body.state.version);
evidence.timings.push(timing('parallel-normal-a',parallel[0]),{...timing('parallel-normal-b',parallel[1]),replay:true});evidence.checks.push('concurrent same request settles exactly once');
persistProgress('normalCashParallel');

const exchangeStatus=await call('formal_gacha_status');expectStatus(exchangeStatus,200,'exchange pre-status');
const points=Number(exchangeStatus.body.state.specialGachaPoints?.character??0),exchangeWasCompleted=Boolean(checkpoint.completed.ssrExchange);
if(!exchangeWasCompleted)assert(points>=200,'character exchange fixture needs 200 points');
const exchangeId=checkpoint.operations.ssrExchange,exchangePayload={category:'character',itemId:attestation.exchangeItemId};
const exchange=await call('formal_gacha_exchange',exchangePayload,exchangeId);expectStatus(exchange,200,'exchange');
assert.equal(exchange.body.gameplayMeasurement?.action,'special_gacha_exchange');
if(exchangeWasCompleted){assert.equal(exchange.body.replayed,true,'Resumed exchange must replay the durable operation ID.');assert.equal(exchange.body.state.specialGachaPoints.character,points);}
else assert.equal(exchange.body.state.specialGachaPoints.character,points-200);
assert(exchange.body.state.unlockedHomeBackgroundIds.includes(attestation.expectedHomeBackgroundId));
const exchangeReplay=await call('formal_gacha_exchange',exchangePayload,exchangeId);expectStatus(exchangeReplay,200,'exchange replay');
assert.equal(exchangeReplay.body.replayed,true);assert.equal(exchangeReplay.body.state.version,exchange.body.state.version);assert.deepEqual(exchangeReplay.body.formalGachaResults,exchange.body.formalGachaResults);
const exchangeMismatch=await call('formal_gacha_exchange',{category:'character',itemId:attestation.exchangeMismatchItemId},exchangeId);expectStatus(exchangeMismatch,409,'exchange replay mismatch');
evidence.timings.push(timing('ssr-exchange',exchange),{...timing('ssr-exchange-replay',exchangeReplay),replay:true},timing('ssr-exchange-mismatch',exchangeMismatch));evidence.checks.push('SSR exchange spends only threshold, unlocks background, replays over DB jsonb, and rejects mismatch');
persistProgress('ssrExchange');

const setHome=await call('set_home',{backgroundId:attestation.expectedHomeBackgroundId},checkpoint.operations.setHome);expectStatus(setHome,200,'set home background');
await refreshSession();const restored=await call('get_state');expectStatus(restored,200,'restored state');assert.equal(restored.body.state.homeBackgroundId,attestation.expectedHomeBackgroundId);
evidence.timings.push(timing('set-home-background',setHome),timing('refresh-token-get-state',restored));evidence.checks.push('refresh-token reauthentication preserves selected SSR background');
persistProgress('setHome');

evidence.observations={finalVersion:restored.body.state.version,finalCharacterPoints:restored.body.state.specialGachaPoints.character,performanceTargetMs:1000,exceptionCeilingMs:1500,overTarget:evidence.timings.filter(row=>row.elapsedMs>1000).map(({label,elapsedMs})=>({label,elapsedMs})),overException:evidence.timings.filter(row=>row.elapsedMs>1500).map(({label,elapsedMs})=>({label,elapsedMs}))};
writeEvidence(evidence);
checkpoint.finishedAt=new Date().toISOString();checkpoint.observations=evidence.observations;saveCheckpoint();
console.log(JSON.stringify({event:'G3_ISOLATED_LIVE_PASS',projectRef:approvedRef,qaUserId:session.userId,evidencePath,checks:evidence.checks.length,overTarget:evidence.observations.overTarget,overException:evidence.observations.overException}));
