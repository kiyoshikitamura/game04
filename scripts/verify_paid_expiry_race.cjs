const fs=require('node:fs'),assert=require('node:assert/strict');
const s=JSON.parse(fs.readFileSync(process.env.QA_SESSION_FILE||'.expiry-local/session.json','utf8')),key=fs.readFileSync('.env.local','utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const root='https://znakrkaazliexzwihxge.supabase.co',headers={apikey:key,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json'};
async function call(path,body){const r=await fetch(root+path,{method:'POST',headers,body:JSON.stringify(body),signal:AbortSignal.timeout(360000)});return {status:r.status,data:await r.json()};}
(async()=>{
 const requestId=crypto.randomUUID(),pid=process.argv[2];if(!pid)throw Error('Dedicated fixture present id required');
 const action={action:'use_energy_drink',payload:{},requestId};
 const results=await Promise.all([
  call('/rest/v1/rpc/claim_present',{p_present_id:pid}),call('/rest/v1/rpc/claim_present',{p_present_id:pid}),
  call('/functions/v1/game04-redesign-api',action),call('/functions/v1/game04-redesign-api',action),
  ...Array.from({length:4},()=>call('/rest/v1/rpc/billing_refresh_paid_assets',{})),
 ]);
 // A concurrent state conflict may be retried with the same id, never with a fresh id.
 const replay=await call('/functions/v1/game04-redesign-api',action);
 const after=await call('/rest/v1/rpc/billing_refresh_paid_assets',{});
 assert.equal(results.slice(0,2).filter(r=>r.status===200).length,1);
 assert.equal(after.status,200);assert.equal(after.data.state.energyDrinks,15);
 assert.equal(replay.status,200);
 const denied=await call('/rest/v1/rpc/game04_run_paid_expiry_job',{});
 assert.ok(denied.status===401||denied.status===403||denied.status===404);
 const report={requestId,claimStatuses:results.slice(0,2).map(r=>r.status),useStatuses:results.slice(2,4).map(r=>r.status),refreshStatuses:results.slice(4).map(r=>r.status),replayStatus:replay.status,expected:15,actual:after.data.state.energyDrinks,history:after.data.history.filter(l=>l.item_id==='ENERGY_DRINK'),workerDenied:denied.status};
 fs.mkdirSync('docs/verification/paid-expiry-20260927',{recursive:true});fs.writeFileSync('docs/verification/paid-expiry-20260927/race.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.message);process.exit(1)});
