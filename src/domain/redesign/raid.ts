import { CHARACTER_MASTERS, SKILL_MASTERS, grantReward } from './masters';
import type { AcquisitionMaster } from './acquisitions';
import type { EnemyUnit, RaidMaster, RaidRoom, RedesignState, Reward, TerritorySnapshot } from './types';

const base = CHARACTER_MASTERS[12];
const attack = SKILL_MASTERS.find(s=>s.effects.some(e=>e.type==='damage'))!;
const boss:EnemyUnit={id:'raid_boss',name:'炎影の守将',image:base.image,level:1,element:'fire',stats:{hp:6500,sp:110,atk:160,def:45,luk:20},skills:[attack],passives:[],actionCount:4,order:0,boss:true,phases:[{hpBelow:0.4,name:'烈火の陣',actionCount:3}]};
/** All numbers beyond rule FIX are Preview balance, replaceable without changing UI. */
export const RAID_MASTERS:RaidMaster[]=[
 {id:'encounter_flame',name:'炎影の守将',type:'encounter',enemy:boss,energyCost:5,durationMinutes:60,maxParticipants:10,maxLevel:1,appearanceLevels:[1],appearanceImages:{},enemyGrowthPerLevel:0.15,sharedHpGrowthPerLevel:0.2,victoryMultiplier:1.5,sharedHp:150000,participationRewards:[{kind:'character_material',amount:2}],defeatRewards:[{kind:'character_material',amount:30}]},
 {id:'unlock_shadow',name:'常闇の覇将',type:'unlock',enemy:{...boss,id:'raid_shadow',name:'常闇の覇将',element:'dark',image:CHARACTER_MASTERS[24].image},energyCost:5,durationMinutes:4320,maxParticipants:20,maxLevel:20,appearanceLevels:[1,10,20],appearanceImages:{10:CHARACTER_MASTERS[30].image,20:CHARACTER_MASTERS[36].image},enemyGrowthPerLevel:0.15,sharedHpGrowthPerLevel:0.2,victoryMultiplier:1.5,sharedHp:200000,participationRewards:[{kind:'skill_material',amount:2}],defeatRewards:[{kind:'skill_material',amount:15},{kind:'equipment_material',amount:5}]}
];
export function getRaidMaster(id:string) {const master=RAID_MASTERS.find(m=>m.id===id);if(!master)throw new Error('対象レイドが見つかりません。');return master;}
export function getRoomRaidMaster(room:RaidRoom):RaidMaster { return room.territorySnapshot?.raidMaster ?? getRaidMaster(room.masterId); }
/** Visual stage only: never used for joining, combat access, or rewards. */
export function raidAppearanceLevel(master:RaidMaster,level:number){return Math.max(1,...master.appearanceLevels.filter(n=>n<=level));}
export function raidEnemy(master:RaidMaster,level:number):EnemyUnit {const appearanceLevel=raidAppearanceLevel(master,level);return {...structuredClone(master.enemy),level,image:master.appearanceImages[String(appearanceLevel)]??master.enemy.image,stats:Object.fromEntries(Object.entries(master.enemy.stats).map(([key,value])=>[key,Math.round(value*(1+(level-1)*master.enemyGrowthPerLevel))])) as EnemyUnit['stats']};}
export function createRaidRoom(masterId:string,ownerId:string,id:string,now:number,territorySnapshot?:TerritorySnapshot):RaidRoom{const m=territorySnapshot?.raidMaster??getRaidMaster(masterId);return {...(territorySnapshot?{territorySnapshot:structuredClone(territorySnapshot)}:{}),id,masterId,ownerId,level:1,hp:m.sharedHp,maxHp:m.sharedHp,createdAt:new Date(now).toISOString(),expiresAt:new Date(now+m.durationMinutes*60000).toISOString(),status:'active',rescueCount:0,rescueWindowStartedAt:new Date(now).toISOString(),participants:[{userId:ownerId,name:'主催者',wins:0,attempts:0,totalDamage:0,joinedLevel:1}],settledBattleIds:[],rewardGrants:[]};}
export type RaidActionPayload={name?:string;battleId?:string;battleLevel?:number;energyAlreadyPaid?:boolean;result?:{outcome:string;totalDamage:number}};
/** Server-only transition: caller must lock room + account and supply a server-simulated result, never client damage. */
export function applyRaidAction(original:RaidRoom,originalState:RedesignState,action:string,payload:RaidActionPayload={},now=Date.now(),acquisitionMaster?:AcquisitionMaster){
 // Historical JSON may retain participant.checkpoint; it is intentionally ignored.
 const room=structuredClone(original),state=structuredClone(originalState),master=getRoomRaidMaster(room);
 if(room.status==='active'&&Date.parse(room.expiresAt)<=now)room.status='expired';
 let me=room.participants.find(p=>p.userId===state.userId);
 if(action==='raid_claim') {for(const g of room.rewardGrants)if(g.userId===state.userId&&!g.claimed){g.rewards.forEach((r,i)=>Object.assign(state,grantReward(state,r,`${room.id}:${g.id}:${i}`,acquisitionMaster)));g.claimed=true;}return {room,state};}
 if(action==='raid_refresh')return {room,state};
 if(action==='raid_battle'&&payload.battleId&&room.settledBattleIds.includes(payload.battleId))return {room,state};
 if(action==='encounter_ignore'){if(master.type!=='encounter'||room.ownerId!==state.userId||!me||me.attempts>0)throw new Error('この遭遇は無視できません。');me.leftAt=new Date(now).toISOString();room.status='expired';return {room,state};}
 if(room.status!=='active'&&action!=='raid_battle')throw new Error('このレイドは終了しました。');
 if(me?.leftAt&&action!=='raid_battle')throw new Error('退出済みのレイドには再参加できません。');
 if(action==='raid_join'){
  if(!me){if(room.participants.filter(p=>!p.leftAt).length>=master.maxParticipants)throw new Error('参加人数が上限に達しています。');me={userId:state.userId,name:payload.name||'参戦者',wins:0,attempts:0,totalDamage:0,joinedLevel:room.level};room.participants.push(me);}return {room,state};
 }
 if(!me)throw new Error('先にレイドへ参加してください。');
 if(action==='raid_leave'){if(room.ownerId===state.userId)throw new Error('主催者は退出できません。');me.leftAt=new Date(now).toISOString();return {room,state};}
 if(action==='raid_rescue'){
  if(master.type==='unlock'&&now-Date.parse(room.rescueWindowStartedAt)>=21600000){room.rescueCount=0;room.rescueWindowStartedAt=new Date(now).toISOString();}
  if(room.rescueCount>=3)throw new Error('救援依頼の残り回数がありません。');room.rescueCount++;return {room,state};
 }
 if(action==='raid_battle'){
  if(!payload.battleId||!payload.result)throw new Error('サーバーの戦闘結果が必要です。');
  if(room.settledBattleIds.includes(payload.battleId))return {room,state};
  const appliesToSharedHp=payload.battleLevel===room.level&&room.status==='active'&&!me.leftAt;
  if(!payload.energyAlreadyPaid){if(state.energy<master.energyCost)throw new Error('行動力が足りません。');state.energy-=master.energyCost;}
  const damage=Math.max(0,Math.floor(payload.result.totalDamage*(payload.result.outcome==='win'?master.victoryMultiplier:1)));
  if(!Number.isFinite(damage))throw new Error('戦闘結果が不正です。');
  me.attempts++;me.wins+=payload.result.outcome==='win'?1:0;me.totalDamage+=damage;me.lastResult=payload.result.outcome==='win'?'勝利':'敗北';if(appliesToSharedHp)room.hp=Math.max(0,room.hp-damage);room.settledBattleIds.push(payload.battleId);
  if(me.attempts===1)room.rewardGrants.push({id:`participation:${state.userId}`,userId:state.userId,level:room.level,rewards:master.participationRewards,claimed:false});
  if(appliesToSharedHp&&room.hp===0){for(const p of room.participants)if(!p.leftAt&&p.wins>=3&&p.joinedLevel<=room.level)room.rewardGrants.push({id:`defeat:${room.level}:${p.userId}`,userId:p.userId,level:room.level,rewards:master.defeatRewards,claimed:false});
   if(master.type==='unlock'&&room.level<master.maxLevel){room.level++;room.maxHp=Math.round(master.sharedHp*(1+(room.level-1)*master.sharedHpGrowthPerLevel));room.hp=room.maxHp;}else room.status='defeated';
  }
  return {room,state};
 }
 throw new Error('対応していないレイド操作です。');
}
