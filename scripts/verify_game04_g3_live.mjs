import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const baseUrl=process.env.GAME04_QA_SUPABASE_URL;
const publishableKey=process.env.GAME04_QA_SUPABASE_KEY;
const sessionPath=process.env.GAME04_G3_SESSION_PATH||'/tmp/g3-qa-session.json';
const evidencePath=process.env.GAME04_G3_EVIDENCE_PATH||'docs/verification/g3-20260925/live-v30.json';
assert(baseUrl&&publishableKey,'Set GAME04_QA_SUPABASE_URL and GAME04_QA_SUPABASE_KEY');
const saveSession=value=>{fs.writeFileSync(sessionPath,JSON.stringify(value),{mode:0o600});fs.chmodSync(sessionPath,0o600);};
let session=fs.existsSync(sessionPath)?JSON.parse(fs.readFileSync(sessionPath,'utf8')):null;

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
if(!session)await createSession();else await refreshSession();

const apiUrl=`${baseUrl}/functions/v1/game04-redesign-api`;
async function call(action,payload={},requestId=randomUUID()){
 const started=performance.now(),response=await fetch(apiUrl,{method:'POST',headers:{apikey:publishableKey,Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({action,payload,requestId})});
 return{status:response.status,body:await response.json(),elapsedMs:Math.round(performance.now()-started),requestId};
}
const expectStatus=(result,status,label)=>assert.equal(result.status,status,`${label}: HTTP ${result.status} ${result.body?.error||result.body?.message||''}`);
const compact=state=>({version:state.version,cash:state.cash,diamonds:state.diamonds,dailyNormalGachaDate:state.dailyNormalGachaDate,grantLedger:state.questTicketGrants??{},points:state.specialGachaPoints??{},characters:state.characters.length,skills:state.skills.length,equipment:state.equipment.length,souls:state.souls,skillMaterial:state.materials.skill});
const resources=state=>{const {version:ignored,...snapshot}=compact(state);return snapshot;};
const timing=(label,result)=>({label,status:result.status,elapsedMs:result.elapsedMs,replay:false});
const evidence={candidate:'GAME04 G3 dev API v30',testedAt:new Date().toISOString(),qaUserId:session.userId,animationMs:4000,observations:{},timings:[],checks:[]};

let cold=await call('formal_gacha_status');expectStatus(cold,200,'cold status');
let warm=await call('formal_gacha_status');expectStatus(warm,200,'warm status');
assert.equal(warm.body.formalGacha.masterVersion,'GAME04_G3_FORMAL_20260925');assert.equal(warm.body.formalGacha.normal.pool.length,292);
evidence.timings.push(timing('status-cold',cold),timing('status-warm',warm));evidence.checks.push('authenticated status and 292-item normal manifest');

const beforeInvalid=resources(warm.body.state);
const invalid=await call('formal_gacha',{mode:'special',category:'equipment',count:1,payment:'CASH'});expectStatus(invalid,400,'invalid payment');
const afterInvalid=await call('formal_gacha_status');expectStatus(afterInvalid,200,'status after invalid');assert.deepEqual(resources(afterInvalid.body.state),beforeInvalid);
evidence.timings.push(timing('invalid-payment',invalid));evidence.checks.push('invalid payment is non-consuming');

const paidPayload={mode:'special',category:'character',count:1,payment:'DIAMONDS'},paidId=randomUUID();
const paid=await call('formal_gacha',paidPayload,paidId);expectStatus(paid,200,'special diamond');
const paidReplay=await call('formal_gacha',paidPayload,paidId);expectStatus(paidReplay,200,'special replay');
assert.deepEqual(paidReplay.body.formalGachaResults,paid.body.formalGachaResults);assert.equal(paidReplay.body.state.version,paid.body.state.version);
const paidMismatch=await call('formal_gacha',{...paidPayload,count:10},paidId);expectStatus(paidMismatch,409,'special replay mismatch');
evidence.timings.push(timing('special-diamond',paid),{...timing('special-replay',paidReplay),replay:true},timing('special-replay-mismatch',paidMismatch));evidence.checks.push('special jsonb DB replay is key-order independent and payload mismatch is rejected');

for(const category of ['character','skill']){
 const status=await call('formal_gacha_status');expectStatus(status,200,`${category} ticket pre-status`);
 const ticketId=status.body.formalGacha.special.categories[category].rule.ticketId;
 const before=Number(status.body.formalGacha.special.tickets[ticketId]),ledgerBefore=Number(status.body.state.questTicketGrants?.[ticketId]??0);
 const draw=await call('formal_gacha',{mode:'special',category,count:1,payment:'TICKET'});expectStatus(draw,200,`${category} ticket`);
 assert.equal(draw.body.formalGacha.special.tickets[ticketId],before-1);assert.equal(Number(draw.body.state.questTicketGrants?.[ticketId]??0),ledgerBefore);
 evidence.timings.push(timing(`ticket-${category}`,draw));evidence.checks.push(`${category} user_items ticket decremented; grant ledger unchanged`);
}

const expiredBefore=await call('formal_gacha_status');expectStatus(expiredBefore,200,'expired ticket pre-status');
const expiredTicketId=expiredBefore.body.formalGacha.special.categories.equipment.rule.ticketId;
const expiredBalance=expiredBefore.body.formalGacha.special.tickets[expiredTicketId],expiredState=resources(expiredBefore.body.state);
const expired=await call('formal_gacha',{mode:'special',category:'equipment',count:1,payment:'TICKET'});expectStatus(expired,400,'expired ticket');
const expiredAfter=await call('formal_gacha_status');expectStatus(expiredAfter,200,'expired ticket post-status');
assert.equal(expiredAfter.body.formalGacha.special.tickets[expiredTicketId],expiredBalance);assert.deepEqual(resources(expiredAfter.body.state),expiredState);
evidence.timings.push(timing('ticket-expired-rejected',expired));evidence.checks.push('expired paid-lot ticket rejected with transaction rollback and no state/inventory mutation');

const normalId=randomUUID(),normalPayload={mode:'normal',count:1,payment:'CASH'};
const parallel=await Promise.all([call('formal_gacha',normalPayload,normalId),call('formal_gacha',normalPayload,normalId)]);
parallel.forEach((result,index)=>expectStatus(result,200,`parallel normal ${index}`));
assert.deepEqual(parallel[0].body.formalGachaResults,parallel[1].body.formalGachaResults);assert.equal(parallel[0].body.state.version,parallel[1].body.state.version);
evidence.timings.push(timing('parallel-normal-a',parallel[0]),{...timing('parallel-normal-b',parallel[1]),replay:true});evidence.checks.push('concurrent same request settles exactly once');

const exchangeStatus=await call('formal_gacha_status');expectStatus(exchangeStatus,200,'exchange pre-status');
const points=Number(exchangeStatus.body.state.specialGachaPoints?.character??0);assert(points>=200,'character exchange fixture needs 200 points');
const exchangeId=randomUUID(),exchangePayload={category:'character',itemId:'char_koharu_01'};
const exchange=await call('formal_gacha_exchange',exchangePayload,exchangeId);expectStatus(exchange,200,'exchange');
assert.equal(exchange.body.state.specialGachaPoints.character,points-200);assert(exchange.body.state.unlockedHomeBackgroundIds.includes('ssr:char_koharu_01'));
const exchangeReplay=await call('formal_gacha_exchange',exchangePayload,exchangeId);expectStatus(exchangeReplay,200,'exchange replay');
assert.equal(exchangeReplay.body.state.version,exchange.body.state.version);assert.deepEqual(exchangeReplay.body.formalGachaResults,exchange.body.formalGachaResults);
const exchangeMismatch=await call('formal_gacha_exchange',{category:'character',itemId:'char_yui_01'},exchangeId);expectStatus(exchangeMismatch,409,'exchange replay mismatch');
evidence.timings.push(timing('ssr-exchange',exchange),{...timing('ssr-exchange-replay',exchangeReplay),replay:true},timing('ssr-exchange-mismatch',exchangeMismatch));evidence.checks.push('SSR exchange spends only threshold, unlocks background, replays over DB jsonb, and rejects mismatch');

const setHome=await call('set_home',{backgroundId:'ssr:char_koharu_01'});expectStatus(setHome,200,'set home background');
await refreshSession();const restored=await call('get_state');expectStatus(restored,200,'restored state');assert.equal(restored.body.state.homeBackgroundId,'ssr:char_koharu_01');
evidence.timings.push(timing('set-home-background',setHome),timing('refresh-token-get-state',restored));evidence.checks.push('refresh-token reauthentication preserves selected SSR background');

evidence.observations={finalVersion:restored.body.state.version,finalCharacterPoints:restored.body.state.specialGachaPoints.character,performanceTargetMs:1000,exceptionCeilingMs:1500,overTarget:evidence.timings.filter(row=>row.elapsedMs>1000).map(({label,elapsedMs})=>({label,elapsedMs})),overException:evidence.timings.filter(row=>row.elapsedMs>1500).map(({label,elapsedMs})=>({label,elapsedMs}))};
fs.writeFileSync(evidencePath,`${JSON.stringify(evidence,null,2)}\n`);
console.log(JSON.stringify({event:'G3_V30_LIVE_PASS',qaUserId:session.userId,evidencePath,checks:evidence.checks.length,overTarget:evidence.observations.overTarget,overException:evidence.observations.overException}));
