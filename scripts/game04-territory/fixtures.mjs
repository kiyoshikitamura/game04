/** QA-only seeded battle inputs. This verifies settlement, not balance or stamina charging. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRaidRoom,raidEnemy} from '../../src/domain/redesign/raid.ts';
import {TERRITORY_MASTER,createTerritorySnapshot} from '../../src/domain/redesign/territory.ts';
import {buildBattleParty,BATTLE_RULES} from '../../src/domain/redesign/masters.ts';
const root=process.env.GAME04_TERRITORY_QA_DIR;
assert.ok(root?.startsWith('/tmp/'));
const ids=JSON.parse(fs.readFileSync(`${root}/ids.json`));
for(const id of Object.values(ids))assert.match(id,/^[0-9a-f-]{36}$/);
const sql=x=>`'${JSON.stringify(x).replaceAll("'","''")}'::jsonb`;
const phase=process.argv[2]||'prepare';
let q='begin;\n';const fixtures={},plan=[];
function room(name,ownerWins,maxLevel=1){
 const id=crypto.randomUUID(),r=createRaidRoom('unlock_shadow',ids.owner,id,Date.now());
 r.territorySnapshot=createTerritorySnapshot(TERRITORY_MASTER,'azuchi');r.territorySnapshot.masterVersion='QA_ONLY_SETTLEMENT_20260920';
 r.territorySnapshot.raidMaster.maxLevel=maxLevel;r.hp=1;r.maxHp=200000;
 r.participants[0].wins=ownerWins;r.participants[0].attempts=ownerWins;
 for(const label of ['helper','helper2'])r.participants.push({userId:ids[label],name:`QA侵攻${label}`,wins:0,attempts:0,totalDamage:0,joinedLevel:1});
 q+=`insert into public.game04_raid_rooms(id,version,state) values('${id}',0,${sql(r)});\n`;
 fixtures[name]={roomId:id,ownerWins,maxLevel};return r;
}
function battle(r,user){
 const id=crypto.randomUUID(),state=JSON.parse(fs.readFileSync(`${root}/${user}-state.json`));state.characters.forEach(c=>c.level=1000);
 const input={seed:41,party:buildBattleParty(state),waves:[[raidEnemy(r.territorySnapshot.raidMaster,r.level)]],rules:BATTLE_RULES,raidLevel:r.level};
 q+=`insert into public.game04_battles(id,user_id,kind,target_id,seed,input,status) values('${id}','${ids[user]}','raid','${r.id}',41,${sql(input)},'started');\n`;
 return {user,action:'raid_battle',payload:{roomId:r.id},requestId:id};
}
if(phase==='prepare'){
 for(const [name,wins,levels,actor] of [['intermediate',3,2,'helper'],['two_wins',2,1,'helper'],['absent_owner',3,1,'helper'],['third_win',2,1,'owner']]){const r=room(name,wins,levels);const b=battle(r,actor);fixtures[name].battleId=b.requestId;plan.push({name,...b});plan.push({name:`${name}_replay`,...b});}
 const late=room('late_third',2);const ownerBattle=battle(late,'owner'),helperBattle=battle(late,'helper');plan.push({name:'late_clear',...helperBattle},{name:'late_third',...ownerBattle});
 fixtures.late_third.ownerBattleId=ownerBattle.requestId;
 const multiA=room('multi_a',3),multiB=room('multi_b',3);plan.push({name:'parallel_clear',requests:[battle(multiA,'helper'),battle(multiB,'helper2')]});
 const expired=room('expired',3);q+=`update public.game04_raid_rooms set state=jsonb_set(jsonb_set(state,'{expiresAt}',to_jsonb((clock_timestamp()-interval '1 second')::text)),'{rewardGrants}',${sql([{id:`participation:${ids.owner}`,userId:ids.owner,level:1,rewards:[{kind:'skill_material',amount:2}],claimed:false}])}),version=version+1 where id='${expired.id}';\n`;
 plan.push({name:'expired_claim',user:'owner',action:'raid_claim',payload:{roomId:expired.id},requestId:crypto.randomUUID()});
 q+='commit;\n';
 fs.writeFileSync(`${root}/fixtures.json`,JSON.stringify(fixtures,null,2));fs.writeFileSync(`${root}/plan.json`,JSON.stringify(plan,null,2));
 fs.writeFileSync(`${root}/prepare.sql`,q);console.log(`${root}/prepare.sql`);
}

if(phase==='normal'){
 const r=room('normal',0,3);const roomSql=q; q='begin;\n';const stale=battle(r,'owner');fs.writeFileSync(`${root}/normal-stale.sql`,q+'commit;');q=roomSql;fixtures.normal.staleBattleId=stale.requestId;
 q+=`update public.game04_player_state set state=jsonb_set(state,'{characters}',(select jsonb_agg(jsonb_set(c,'{level}','1000'::jsonb)) from jsonb_array_elements(state->'characters') c)),version=version+1 where user_id='${ids.owner}';\nupdate public.users set vitality=50 where id='${ids.owner}';\ncommit;`;
 fs.writeFileSync(`${root}/normal-fixture.json`,JSON.stringify(fixtures));fs.writeFileSync(`${root}/normal.sql`,q);console.log(`${root}/normal.sql`);
}
if(phase==='low'){
 q+=`update public.game04_player_state set state=jsonb_set(state,'{characters}',(select jsonb_agg(jsonb_set(c,'{level}','1'::jsonb)) from jsonb_array_elements(state->'characters') c)),version=version+1 where user_id='${ids.owner}';\ncommit;`;
 fs.writeFileSync(`${root}/low.sql`,q);console.log(`${root}/low.sql`);
}

if(phase==='lose-room'){
 const r=room('lose',0,20);q+=`update public.game04_raid_rooms set state=jsonb_set(state,'{level}','14'::jsonb),version=version+1 where id='${r.id}';\ncommit;`;
 fs.writeFileSync(`${root}/lose-fixture.json`,JSON.stringify(fixtures.lose));fs.writeFileSync(`${root}/lose-room.sql`,q);console.log(`${root}/lose-room.sql`);
}
