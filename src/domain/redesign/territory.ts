import { BATTLE_RULES } from './masters';
import { RAID_MASTERS, getRoomRaidMaster } from './raid';
import type { RaidRoom, RedesignState, TerritoryMaster, TerritoryProgress, TerritoryProjection, TerritorySnapshot } from './types';
export type { TerritoryMaster, TerritoryProgress, TerritoryProjection, TerritorySnapshot } from './types';

/** Development fixture only. No economy value here has formal approval. */
export const TERRITORY_MASTER:TerritoryMaster={
 version:'PREVIEW_PROVISIONAL_20260920_v1',status:'PREVIEW_PROVISIONAL',initialExp:0,legacyMigrationExp:0,levelCap:3,
 levels:[{level:1,requiredExp:0,hostingSlots:1},{level:2,requiredExp:100,hostingSlots:2},{level:3,requiredExp:300,hostingSlots:3}],
 destinations:[
  {id:'azuchi',name:'安土城への侵攻',castle:'安土城',difficulty:'通常',itemSource:'クエストのレア報酬',raidMasterId:'unlock_shadow',requiredLevel:1,itemName:'領土侵攻札',itemId:'raid_unlock',itemCount:1,durationMinutes:4320,clearExp:100},
  {id:'gifu',name:'岐阜城への侵攻',castle:'岐阜城',difficulty:'上位',itemSource:'クエストのレア報酬',raidMasterId:'unlock_shadow',requiredLevel:2,itemName:'領土侵攻札',itemId:'raid_unlock',itemCount:1,durationMinutes:4320,clearExp:100},
 ],
 battleRules:structuredClone(BATTLE_RULES),
 raidMasters:structuredClone(RAID_MASTERS.filter(m=>m.type==='unlock')),
};
export function validateTerritoryMaster(master:TerritoryMaster):void {
 const natural=(v:number)=>Number.isSafeInteger(v)&&v>=0;
 if(!master.version||!['PREVIEW_PROVISIONAL','APPROVED'].includes(master.status)||!natural(master.initialExp)||!natural(master.legacyMigrationExp)||!natural(master.levelCap)||master.levelCap<1||master.levels.length!==master.levelCap)throw Error('領土侵攻マスターの成長設定が不正です。');
 for(let i=0;i<master.levels.length;i++){const row=master.levels[i];if(row.level!==i+1||!natural(row.requiredExp)||!natural(row.hostingSlots)||row.hostingSlots<1||(i===0&&row.requiredExp!==0)||(i>0&&(row.requiredExp<=master.levels[i-1].requiredExp||row.hostingSlots<master.levels[i-1].hostingSlots)))throw Error('領土侵攻レベル表の順序が不正です。');}
 const positive=(v:number)=>Number.isFinite(v)&&v>0;
 const nonnegative=(v:number)=>Number.isFinite(v)&&v>=0;
 const rules=master.battleRules;
 if(!rules||!positive(rules.advantageMultiplier)||!positive(rules.disadvantageMultiplier)||!positive(rules.spRecoveryDivisor)||!positive(rules.burstLukDivisor)||!positive(rules.enemySpRecoveryDivisor)||!natural(rules.maxPlayerActions)||rules.maxPlayerActions<1||!nonnegative(rules.defenseFactor)||!nonnegative(rules.initialSpRatio)||rules.initialSpRatio>1)throw Error('領土侵攻の戦闘ルールが不正です。');
 for(const raid of master.raidMasters){
  if(!raid.id||!natural(raid.energyCost)||!natural(raid.durationMinutes)||raid.durationMinutes<1||!natural(raid.maxParticipants)||raid.maxParticipants<1||!natural(raid.maxLevel)||raid.maxLevel<1||!positive(raid.sharedHp)||!nonnegative(raid.victoryMultiplier)||!nonnegative(raid.enemyGrowthPerLevel)||!nonnegative(raid.sharedHpGrowthPerLevel))throw Error('領土侵攻のボス設定が不正です。');
  if(!raid.enemy||!positive(raid.enemy.stats.hp)||!Object.values(raid.enemy.stats).every(nonnegative)||!natural(raid.enemy.actionCount)||raid.enemy.actionCount<1||!raid.appearanceImages||!Array.isArray(raid.appearanceLevels)||raid.appearanceLevels[0]!==1||raid.appearanceLevels.some((lv,i)=>!natural(lv)||lv>raid.maxLevel||(i>0&&lv<=raid.appearanceLevels[i-1])))throw Error('領土侵攻の敵・見た目段階が不正です。');
  for(const reward of [...raid.participationRewards,...raid.defeatRewards])if(!natural(reward.amount)||(reward.chance!==undefined&&(!nonnegative(reward.chance)||reward.chance>1)))throw Error('領土侵攻の報酬設定が不正です。');
 }
 if(new Set(master.destinations.map(d=>d.id)).size!==master.destinations.length||new Set(master.raidMasters.map(m=>m.id)).size!==master.raidMasters.length)throw Error('領土侵攻マスターのIDが重複しています。');
 for(const d of master.destinations){const raid=master.raidMasters.find(m=>m.id===d.raidMasterId);if(!d.id||!d.itemId||!natural(d.requiredLevel)||d.requiredLevel<1||d.requiredLevel>master.levelCap||!natural(d.itemCount)||d.itemCount<1||!natural(d.durationMinutes)||d.durationMinutes<1||!natural(d.clearExp)||!raid||raid.type!=='unlock'||!natural(raid.maxLevel)||raid.maxLevel<1||!Number.isFinite(raid.enemyGrowthPerLevel)||raid.enemyGrowthPerLevel<0||!Number.isFinite(raid.sharedHpGrowthPerLevel)||raid.sharedHpGrowthPerLevel<0)throw Error('領土侵攻先の設定が不正です。');}
}
export function territoryLevel(master:TerritoryMaster,experience:number):number {
 const exp=Number.isFinite(experience)?Math.max(0,experience):0;
 return master.levels.reduce((level,row)=>row.requiredExp<=exp?row.level:level,1);
}
export function territoryItems(state:RedesignState):Record<string,number> {return {...state.territoryItems,raid_unlock:state.materials.unlock};}
export function activeTerritoryCount(userId:string,rooms:RaidRoom[],now=Date.now()):number {return rooms.filter(room=>room.ownerId===userId&&getRoomRaidMaster(room).type==='unlock'&&room.status==='active'&&Date.parse(room.expiresAt)>now).length;}
/** Display only. Hosting must repeat checks while holding the owner's database lock. */
export function projectTerritory(master:TerritoryMaster,progress:TerritoryProgress,items:Record<string,number>,activeHostingCount:number):TerritoryProjection {
 validateTerritoryMaster(master);
 const experience=Math.max(0,progress.experience),level=territoryLevel(master,experience),hostingSlots=master.levels.find(row=>row.level===level)!.hostingSlots;
 return {masterVersion:master.version,status:master.status,experience,level,nextLevelExp:master.levels.find(row=>row.level===level+1)?.requiredExp??null,hostingSlots,activeHostingCount,destinations:master.destinations.map(destination=>{
  const ownedItemCount=items[destination.itemId]??0,reasons:string[]=[];
  if(level<destination.requiredLevel)reasons.push(`領土侵攻Lv.${destination.requiredLevel}が必要です。`);
  if(activeHostingCount>=hostingSlots)reasons.push('同時開催枠が埋まっています。');
  if(ownedItemCount<destination.itemCount)reasons.push(`開催アイテムが${destination.itemCount-ownedItemCount}個不足しています。`);
  return {...destination,raidMaster:structuredClone(master.raidMasters.find(m=>m.id===destination.raidMasterId)!),ownedItemCount,canHost:reasons.length===0,reasons};
 })};
}
export function createTerritorySnapshot(master:TerritoryMaster,destinationId:string):TerritorySnapshot {
 validateTerritoryMaster(master);const destination=master.destinations.find(d=>d.id===destinationId);if(!destination)throw Error('侵攻先が見つかりません。');
 return structuredClone({masterVersion:master.version,status:master.status,destination,battleRules:master.battleRules,raidMaster:{...master.raidMasters.find(m=>m.id===destination.raidMasterId)!,durationMinutes:destination.durationMinutes}});
}
