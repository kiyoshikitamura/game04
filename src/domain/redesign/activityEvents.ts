import { CHARACTER_MASTERS,EQUIPMENT_MASTERS,OWNABLE_SKILL_MASTERS } from './masters';
import { QUEST_AREAS } from './quests';
import { getRoomRaidMaster } from './raid';
import type { RedesignState,RaidRoom } from './types';
export type ActivityEvent={key:string;kind:string;actorId:string;objectId:string;title:string};
/** Only confirmed before -> after edges. Persisted with the original request transaction. */
export function progressionActivities(before:RedesignState,after:RedesignState,action:string,roomBefore?:RaidRoom,roomAfter?:RaidRoom):ActivityEvent[]{
 const events:ActivityEvent[]=[];
 const add=(key:string,kind:string,objectId:string,title:string,actorId=after.userId)=>events.push({key,kind,objectId,title,actorId});
 if(action==='character_awaken'||action==='character_unlock')for(const c of after.characters){
  const old=before.characters.find(o=>o.id===c.id),master=CHARACTER_MASTERS.find(m=>m.id===c.id);if(!master)continue;
  if(action==='character_awaken'&&old&&old.awakening<5&&c.awakening===5)add(`awaken:${c.id}:5`,'CHARACTER_MAX_AWAKEN',c.id,`「${master.name}」が最大覚醒に到達`);
  if(action==='character_unlock'&&!old&&master.rarity==='SSR')add(`soul-unlock:${c.id}`,'SSR_SOUL_UNLOCK',c.id,`SSR武将「${master.name}」を魂で解放`);
 }
 if(action==='skill_level')for(const s of after.skills){const old=before.skills.find(o=>o.id===s.id);if(old&&old.level<10&&s.level===10)add(`skill-lb:${s.id}:10`,'SKILL_MAX_LB',s.id,`「${OWNABLE_SKILL_MASTERS.find(m=>m.id===s.id)?.name??s.id}」が最大限界突破に到達`);}
 if(action==='equipment_lb')for(const e of after.equipment){const old=before.equipment.find(o=>o.instanceId===e.instanceId);if(old&&old.lb<10&&e.lb===10)add(`equipment-lb:${e.instanceId}:10`,'EQUIPMENT_MAX_LB',e.masterId,`「${EQUIPMENT_MASTERS.find(m=>m.id===e.masterId)?.name??e.masterId}」が最大限界突破に到達`);}
 if(action==='quest_settle')for(const a of QUEST_AREAS){if(a.stages.length&&a.stages.every(s=>after.clearedStages.includes(s.id))&&!a.stages.every(s=>before.clearedStages.includes(s.id)))add(`quest-area:${a.id}`,'QUEST_AREA_CLEAR',a.id,`出陣「${a.name}」を初制覇`);}
 if(action==='raid_settle'&&roomBefore&&roomAfter&&roomBefore.status==='active'&&roomAfter.status==='defeated'){
  const master=getRoomRaidMaster(roomBefore);
  if(master.type==='unlock'&&roomBefore.level===master.maxLevel)add(`territory-final:${roomAfter.id}`,'TERRITORY_FINAL_CLEAR',roomAfter.id,`主催した領土侵攻「${master.name}」が最終Lvをクリア`,roomAfter.ownerId);
 }
 return events;
}
