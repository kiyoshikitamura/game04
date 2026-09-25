import { getRoomRaidMaster } from './raid';
import { recordMissionEvent, type MissionState } from './missionProgress';
import type { RaidRoom, RedesignState } from './types';

export interface RaidMissionEvent { id: string; counters: string[]; at: number }
const castleKeys: Record<string, string> = { TI01:'okazaki', TI02:'nagahama', TI03:'kasugayama', TI04:'tsutsujigasaki', TI05:'azuchi' };

/** Call only for a server-produced transition, inside its settlement CAS. */
export function raidBattleMissionEvent(before: RaidRoom, after: RaidRoom, userId: string, battleId: string, outcome: string, at: number): RaidMissionEvent | null {
 if(before.id!==after.id || before.settledBattleIds.includes(battleId) || !after.settledBattleIds.includes(battleId) || !after.participants.some(p=>p.userId===userId))return null;
 const type=getRoomRaidMaster(after).type;
 const counters=['battle',type==='encounter'?'encounter_battle':'invasion_battle'];
 if(outcome==='win'){
  counters.push(type==='encounter'?'encounter_win':'invasion_win');
  if(type==='encounter'&&after.ownerId!==userId)counters.push('encounter_other_win');
 }
 return {id:`raid-battle:${after.id}:${battleId}:${userId}`,counters,at};
}

/** Rescue has succeeded before calling. Only the host's encounter counts (NM164). */
export function raidRescueMissionEvent(room: RaidRoom, userId: string, requestId: string, at: number): RaidMissionEvent | null {
 if(getRoomRaidMaster(room).type!=='encounter'||room.ownerId!==userId||!room.participants.some(p=>p.userId===userId&&!p.leftAt)||room.rescueCount<1)return null;
 return {id:`raid-rescue:${room.id}:${requestId}:${userId}`,counters:['encounter_rescue'],at};
}

/** The durable hosted room, never a button click, proves hosting success. */
export function raidHostMissionEvent(room: RaidRoom, userId: string): RaidMissionEvent | null {
 if(room.ownerId!==userId||getRoomRaidMaster(room).type!=='unlock')return null;
 const at=Date.parse(room.createdAt);
 if(!Number.isFinite(at))return null;
 return {id:`invasion-host:${room.id}:${userId}`,counters:['invasion_host'],at};
}

/** A defeat grant is the immutable eligibility proof written when that stage fell.
 * Current wins, room membership, a personal victory, or joining an advanced room
 * cannot produce this proof. Claimed grants still count, once, for returning users.
 * `at` is observation time; these are cumulative NM counters, not daily objectives.
 */
export function raidQualificationMissionEvents(room: RaidRoom, userId: string, at: number): RaidMissionEvent[] {
 const master=getRoomRaidMaster(room),castle=castleKeys[master.id];
 const events:RaidMissionEvent[]=[];
 for(const grant of room.rewardGrants){
  if(grant.userId!==userId||grant.id!==`defeat:${grant.level}:${userId}`||!Number.isInteger(grant.level)||grant.level<1)continue;
  const defeated=room.level>grant.level||(room.status==='defeated'&&room.level===grant.level);
  if(!defeated)continue;
  const counters:string[]=[];
  if(master.type==='encounter'){
   if(room.status==='defeated'&&grant.level===master.maxLevel)counters.push('encounter_qualified_defeat');
  }else{
   if(castle&&[3,6,9].includes(grant.level))counters.push(`invasion_${castle}_gate`);
   if(castle&&grant.level===12&&room.status==='defeated')counters.push(`invasion_${castle}_lord`);
   if(grant.level===master.maxLevel&&room.status==='defeated'&&room.ownerId===userId)counters.push('invasion_host_qualified_clear');
  }
  if(counters.length)events.push({id:`raid-qualified:${room.id}:${grant.id}`,counters,at});
 }
 return events;
}

/** Apply durable hosting/qualification evidence when the account next synchronizes.
 * Caller must persist returned state with its usual version/CAS checks. This is
 * necessary for qualified participants other than the final damaging player.
 */
export function reconcileRaidMissionProgress(original: RedesignState, rooms: RaidRoom[], at: number): MissionState {
 let state:MissionState=original;
 for(const room of rooms){
  const hosted=raidHostMissionEvent(room,state.userId);
  const events=[...(hosted?[hosted]:[]),...raidQualificationMissionEvents(room,state.userId,at)];
  for(const event of events)state=recordMissionEvent(state,event);
 }
 return state;
}
