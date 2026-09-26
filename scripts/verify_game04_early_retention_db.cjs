const fs=require('fs'),assert=require('assert/strict');const {PGlite}=require(process.env.EARLY_TOOLS+'/node_modules/@electric-sql/pglite');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
create table users(id uuid primary key,neon_diamonds integer not null default 0,cash bigint not null default 0);
create table game04_player_state(user_id uuid primary key,state jsonb not null,version bigint not null);
create table game04_requests(user_id uuid,request_id uuid,result jsonb,primary key(user_id,request_id));
create function game04_commit_growth_state(p_user_id uuid,p_expected_version bigint,p_state jsonb,p_cash_delta bigint,p_energy_delta integer,p_request_id uuid,p_battle jsonb default null,p_raid jsonb default null,p_raid_expected_version bigint default null,p_receipt jsonb default '{}') returns jsonb language plpgsql as $$
declare v bigint;r jsonb;begin
 select version into v from game04_player_state where user_id=p_user_id for update;
 if v<>p_expected_version then raise exception 'STATE_CONFLICT';end if;
 if p_state ? 'failSave' then raise exception 'INJECTED_SAVE_FAILURE';end if;
 update users set cash=cash+p_cash_delta where id=p_user_id;
 p_state:=p_state||jsonb_build_object('diamonds',(select neon_diamonds from users where id=p_user_id));
 update game04_player_state set state=p_state,version=version+1 where user_id=p_user_id;
 r:=jsonb_build_object('state',p_state,'receipt',p_receipt);insert into game04_requests values(p_user_id,p_request_id,r);return r;end $$;`);
 await db.exec(fs.readFileSync('supabase/manual/game04_early_retention_mission_rewards.sql','utf8'));
 const user='00000000-0000-4000-8000-000000000001';const base={clearedStages:['mikawa-1','mikawa-2','mikawa-3','mikawa-4','mikawa-5'],claimedMissionIds:[]};
 await db.query('insert into users values($1,100,0)',[user]);await db.query('insert into game04_player_state values($1,$2,0)',[user,base]);
 const claim=(version,st,req,mission='NM066')=>db.query('select game04_commit_mission_reward($1,$2,$3,500,$4,$5) result',[user,version,st,`00000000-0000-4000-8000-${String(req).padStart(12,'0')}`,mission]);
 await assert.rejects(claim(0,{...base,claimedMissionIds:['NM066'],failSave:true},1),/INJECTED_SAVE_FAILURE/);
 assert.equal((await db.query('select neon_diamonds from users')).rows[0].neon_diamonds,100);assert.equal((await db.query('select count(*)::int n from game04_mission_free_diamond_grants')).rows[0].n,0);
 const next={...base,claimedMissionIds:['NM066']};const first=await claim(0,next,2);assert.equal(first.rows[0].result.state.diamonds,400);assert.deepEqual(await claim(0,next,2),first);
 await assert.rejects(claim(1,next,3),/MISSION_ALREADY_CLAIMED/);await assert.rejects(claim(0,next,2,'NM067'),/REQUEST_ID_REUSED/);
 assert.equal((await db.query('select count(*)::int n from game04_mission_free_diamond_grants')).rows[0].n,1);
 // Simultaneously queued requests: transaction/unique/CAS guards. PGlite is single-connection; production lock interleaving is separate acceptance.
 const old={...base,earlyProgress:{completedAreas:['owari']},claimedMissionIds:['NM066']};await db.query('update game04_player_state set state=$1 where user_id=$2',[old,user]);
 const results=await Promise.allSettled([claim(1,{...old,claimedMissionIds:['NM066','NM067']},4,'NM067'),claim(1,{...old,claimedMissionIds:['NM066','NM067']},5,'NM067')]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal((await db.query('select neon_diamonds from users')).rows[0].neon_diamonds,700);
 await db.exec('set role authenticated');await assert.rejects(db.query('select * from game04_mission_free_diamond_grants'),/permission denied/);await db.exec('reset role');
 const report={engine:'PGlite PostgreSQL',scope:'candidate SQL + minimal commit fixture; not shared API/DB',checks:['formal balance + grant history + mission receipt atomic','injected save failure rolls back balance and ledger','same-request replay no duplication','different request ID cannot reclaim','request reuse for another mission rejected','queued competing claims yield one winner','legacy completed-area eligibility retained','authenticated ledger access denied'],notVerified:['two independent PostgreSQL connections','existing production growth/expiry trigger integration']};fs.writeFileSync('docs/verification/early-retention-20260926/db-results.json',JSON.stringify(report,null,2)+'\n');console.log(report);await db.close();})().catch(e=>{console.error(e);process.exitCode=1});
