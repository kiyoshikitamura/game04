import fs from 'node:fs';import crypto from 'node:crypto';
import {createRaidRoom,getRaidMaster,raidEnemy} from '../../src/domain/redesign/raid.ts';
import {buildBattleParty,BATTLE_RULES} from '../../src/domain/redesign/masters.ts';
const root=process.env.GAME04_RAID_QA_DIR;if(!root)throw Error('GAME04_RAID_QA_DIR required');
const ids=JSON.parse(fs.readFileSync(root+'/ids.json')),phase=process.argv[2];
const sql=s=>`'${JSON.stringify(s).replaceAll("'","''")}'::jsonb`;
const setLevels=(id,level)=>`update public.game04_player_state set state=jsonb_set(state,'{characters}',(select jsonb_agg(jsonb_set(c,'{level}','${level}'::jsonb)) from jsonb_array_elements(state->'characters') c)),version=version+1 where user_id='${id}';`;
let q='begin;\n';
if(phase==='prepare'){const room={...createRaidRoom('unlock_shadow',ids.owner,ids.room,Date.now()),level:14,hp:100000000,maxHp:100000000};room.participants[0].name='QA共有Lv主催';q+=`insert into public.game04_raid_rooms(id,version,state) values('${ids.room}',0,${sql(room)});\n`+setLevels(ids.late,1000)+`\nupdate public.users set vitality=50 where id in('${ids.owner}','${ids.late}');\n`;}
if(phase==='low')q+=setLevels(ids.late,1);
if(phase==='high')q+=setLevels(ids.late,1000);
if(phase==='prepare-resume'||phase==='prepare-concurrent'){const level=phase==='prepare-resume'?14:16;const lateBattle=crypto.randomUUID(),ownerBattle=crypto.randomUUID();fs.writeFileSync(root+'/resume-ids.json',JSON.stringify({lateBattle,ownerBattle}));for(const [label,userId,battleId] of [['a',ids.owner,ownerBattle],['b',ids.late,lateBattle]]){const state=JSON.parse(fs.readFileSync(`${root}/${label}-state.json`));state.characters.forEach(c=>c.level=1000);const input={seed:41,party:buildBattleParty(state),waves:[[raidEnemy(getRaidMaster('unlock_shadow'),level)]],rules:BATTLE_RULES,raidLevel:level};q+=`insert into public.game04_battles(id,user_id,kind,target_id,seed,input,status) values('${battleId}','${userId}','raid','${ids.room}',41,${sql(input)},'started');\nupdate public.users set vitality=vitality-5 where id='${userId}';\n`;}
q+=`update public.game04_raid_rooms set state=jsonb_set(state,'{hp}','${phase==='prepare-resume'?1:100000000}'::jsonb),version=version+1 where id='${ids.room}';\n`;}
if(phase==='hp1')q+=`update public.game04_raid_rooms set state=jsonb_set(state,'{hp}','1'::jsonb),version=version+1 where id='${ids.room}';\n`;
q+='commit;';fs.writeFileSync(`${root}/${phase}.sql`,q);console.log(`${root}/${phase}.sql`);
