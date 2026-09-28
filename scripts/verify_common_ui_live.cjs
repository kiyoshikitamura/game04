// Dedicated isolated Preview users only. Session material stays outside Git.
const fs=require('fs'),assert=require('assert/strict'),{parseEnv}=require('util'),{createClient}=require('@supabase/supabase-js');
const env=parseEnv(fs.readFileSync('.env.local','utf8')),url=env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(url,'https://znakrkaazliexzwihxge.supabase.co');
const dir='../common-ui-live';fs.mkdirSync(dir,{recursive:true});
const client=()=>createClient(url,env.NEXT_PUBLIC_SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ok=r=>{if(r.error)throw r.error;return r.data;};
async function action(c,name,payload={},requestId=crypto.randomUUID()){const r=await c.functions.invoke('game04-redesign-api',{body:{action:name,payload,requestId}});if(r.error)throw Error(r.error.context?await r.error.context.text():r.error.message);return r.data;}
(async()=>{
if(process.argv[2]==='prepare'){
 const ids=[];for(const label of ['a','b']){const c=client(),auth=ok(await c.auth.signInAnonymously());fs.writeFileSync(`${dir}/${label}-session.json`,JSON.stringify(auth.session));ok(await c.rpc('game04_begin_tutorial'));const data=await action(c,'get_state');fs.writeFileSync(`${dir}/${label}-state.json`,JSON.stringify(data.state));ids.push({label,id:auth.user.id});}fs.writeFileSync(`${dir}/users.json`,JSON.stringify(ids));console.log(ids);return;
}
const users=JSON.parse(fs.readFileSync(`${dir}/users.json`)),clients=[];
for(const u of users){const c=client();const session=ok(await c.auth.setSession(JSON.parse(fs.readFileSync(`${dir}/${u.label}-session.json`)))).session;fs.writeFileSync(`${dir}/${u.label}-session.json`,JSON.stringify(session));clients.push(c);}
const [a,b]=clients,report={project:'znakrkaazliexzwihxge',users,checkedAt:new Date().toISOString(),checks:[]};
if(process.argv[2]==='shop'){
 const before=(await action(b,'get_state')).state,rid=crypto.randomUUID();
 const after=(await action(b,'shop_exchange',{exchangeId:'energy_drink',quantity:1},rid)).state;
 assert.equal(after.diamonds,before.diamonds-50);assert.equal(after.energyDrinks,before.energyDrinks+1);
 await action(b,'shop_exchange',{exchangeId:'energy_drink',quantity:1},rid);
 const saved=(await action(b,'get_state')).state;assert.equal(saved.diamonds,after.diamonds);assert.equal(saved.energyDrinks,after.energyDrinks);
 report.checks.push('approved gem product -> shop_exchange -> debit 50 gems / credit 1 energy drink','reload and repeated request do not grant twice');
}
if(process.argv[2]==='community'){
 const rid=crypto.randomUUID();const before=await action(a,'get_state');const id=before.state.skills.find(s=>s.level===9).id;
 const leveled=await action(a,'skill_level',{skillId:id},rid);assert.equal(leveled.state.skills.find(s=>s.id===id).level,10);
 const events=ok(await b.rpc('game04_get_community_activity',{p_limit:50}));assert(events.some(e=>e.actor_user_id===users[0].id&&e.activity_type==='SKILL_MAX_LB'));
 await action(a,'skill_level',{skillId:id},rid);const repeat=ok(await b.rpc('game04_get_community_activity',{p_limit:50}));assert.equal(repeat.filter(e=>e.actor_user_id===users[0].id&&e.activity_type==='SKILL_MAX_LB').length,1);
 report.checks.push('real action -> saved activity -> second-user feed; same request no duplicate');
 const text='共通UI検証 '+Date.now();const sent=ok(await a.rpc('send_chat_message',{p_target_type:'GLOBAL',p_content:text,p_reply_to_message_id:null}));const read=ok(await b.from('board_posts').select('id,content').eq('id',sent.id));assert.equal(read[0].content,text);
 const dm=ok(await b.rpc('send_direct_message',{p_recipient_id:users[0].id,p_message:text+' DM'}));const received=ok(await a.from('direct_messages').select('id,message').eq('id',dm.id));assert.equal(received[0].message,text+' DM');
 report.checks.push('global chat A -> B persisted','DM B -> A persisted');report.message=text;report.activityTitle=repeat.find(e=>e.actor_user_id===users[0].id&&e.activity_type==='SKILL_MAX_LB').display_payload.title;
}
if(process.argv[2]==='presents'){
 const gifts=ok(await a.from('presents').select('*').eq('user_id',users[0].id).like('source_key','common-ui-%'));
 const gift=key=>gifts.find(g=>g.source_key==='common-ui-'+key);
 const before=(await action(a,'get_state')).state;const rid=gift('energy').id;
 const results=await Promise.all([a.rpc('claim_present',{p_present_id:rid}),a.rpc('claim_present',{p_present_id:rid})]);assert.equal(results.filter(r=>!r.error).length,1);
 let state=(await action(a,'get_state')).state;assert.equal(state.energyDrinks,before.energyDrinks+2);
 assert((await b.rpc('claim_present',{p_present_id:gift('ticket').id})).error);
 assert((await a.rpc('claim_present',{p_present_id:gift('expired').id})).error);
 ok(await a.rpc('claim_present',{p_present_id:gift('ticket').id}));const stock=ok(await a.from('user_items').select('quantity').eq('user_id',users[0].id).eq('item_id','SPECIAL_TICKET_SKILL'));assert.equal(stock[0].quantity,3);
 ok(await a.rpc('claim_all_presents'));assert((await a.rpc('claim_present',{p_present_id:rid})).error);assert.equal(ok(await a.rpc('claim_all_presents')).claimed_count,0);
 state=(await action(a,'get_state')).state;assert.equal(state.energyDrinks,before.energyDrinks+2);assert.equal(state.cash,before.cash+123);
 report.checks.push('receipt -> inventory -> get_state reload','concurrent/same receipt only once','foreign owner rejected','expired receipt rejected','ticket user_items projection','bulk claim and repeated bulk no extra grant');
}
const out='../../outputs/common-ui-continuation';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/${process.argv[2]}-live.json`,JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>process.exit(process.exitCode||0));
