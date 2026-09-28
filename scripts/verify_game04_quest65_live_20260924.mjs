import fs from 'node:fs';
import assert from 'node:assert/strict';
async function main(){
const config=JSON.parse(fs.readFileSync('config/game04-preview-public.json','utf8'));
assert.equal(config.supabaseUrl,'https://lrgyllgzcdcphlbmkknc.supabase.co');
fs.mkdirSync('scratch',{recursive:true});
const sessionPath=`scratch/quest65-session-20260924-${crypto.randomUUID()}.json`;
let session;
if(fs.existsSync(sessionPath))session=JSON.parse(fs.readFileSync(sessionPath,'utf8'));
else {
  const response=await fetch(config.supabaseUrl+'/auth/v1/signup',{method:'POST',signal:AbortSignal.timeout(10000),headers:{apikey:config.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({data:{qa:true,purpose:'game04-quest65-ui-20260924'}})});
  assert.equal(response.status,200);session=await response.json();fs.writeFileSync(sessionPath,JSON.stringify(session),{mode:0o600});
}
const headers={apikey:config.supabaseAnonKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'};
const call=async(path,body)=>{
  const response=await fetch(config.supabaseUrl+path,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});
  const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));return result;
};
await call('/rest/v1/rpc/initialize_current_player',{p_username:'Q65'+session.user.id.slice(0,5),p_invite_code:null});
const api=(action,payload={},requestId=crypto.randomUUID())=>call('/functions/v1/game04-redesign-api',{action,payload,requestId});
const before=await api('get_state');
assert.equal(before.state.clearedStages.length,0,'Use a fresh QA account; never reset existing progress');
const id=crypto.randomUUID();
const one=await api('quest_battle',{stageId:'mikawa-1'},id);
assert.equal(one.battle.outcome,'win');assert.equal(one.firstClear,true);
assert.ok(one.state.clearedStages.includes('mikawa-1'));
assert.equal(one.state.questAttempts['mikawa-1'],1);
const balance=await call('/rest/v1/user_items?select=item_id,quantity&item_id=eq.SPECIAL_TICKET_SKILL');
const retry=await api('quest_battle',{stageId:'mikawa-1'},id);
assert.deepEqual(retry.rewards,one.rewards);
assert.equal(retry.state.questAttempts['mikawa-1'],1);
assert.deepEqual(await call('/rest/v1/user_items?select=item_id,quantity&item_id=eq.SPECIAL_TICKET_SKILL'),balance);
const two=await api('quest_battle',{stageId:'mikawa-2'});
assert.equal(two.battle.outcome,'win');assert.equal(two.firstClear,true);
const report={project:'lrgyllgzcdcphlbmkknc',qaUserId:session.user.id,firstBattleId:id,
  firstStage:{outcome:one.battle.outcome,firstClear:one.firstClear,energyBefore:before.state.energy,energyAfter:one.state.energy,rewards:one.rewards},
  repeatedRequest:{sameRewards:true,sameTicketBalance:true,attempts:retry.state.questAttempts['mikawa-1']},
  nextStage:{outcome:two.battle.outcome,firstClear:two.firstClear,cleared:two.state.clearedStages},
  scope:'New QA account only; no existing player edits'};
fs.writeFileSync('docs/design/quest/2026-09-24/LIVE_API_VERIFICATION.json',JSON.stringify(report,null,2)+'\n');
console.log(report);

}
main().catch(error=>{const report={status:'BLOCKED',project:'lrgyllgzcdcphlbmkknc',checkedAt:new Date().toISOString(),error:error.message,cause:error.cause?.code??error.code??null,scope:'New QA session only. No existing user edits. No database or API deployment.',verified:false};fs.mkdirSync('docs/design/quest/2026-09-24',{recursive:true});fs.writeFileSync('docs/design/quest/2026-09-24/LIVE_API_VERIFICATION.json',JSON.stringify(report,null,2)+'\n');console.error(JSON.stringify(report));process.exitCode=1;});
