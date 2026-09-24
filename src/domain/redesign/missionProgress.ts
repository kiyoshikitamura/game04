import type { RedesignState } from './types';
import { jstLoginDate } from './loginBonus';
export interface MissionProgress {
  version: 'game04-missions-v1';
  counters: Record<string, number>;
  daily: Record<string, Record<string, number>>;
  seenEvents: string[];
  character: Record<string, { level: number; awakening: number }>;
  skill: Record<string, number>;
  equipment: Record<string, { masterId: string; level: number; lb: number }>;
}
export type MissionState = RedesignState & { missionProgress?: MissionProgress };
export function captureMissionAssets(original: RedesignState): MissionState {
 const state: MissionState=structuredClone(original);
 const p=state.missionProgress??={version:'game04-missions-v1',counters:{},daily:{},seenEvents:[],character:{},skill:{},equipment:{}};
 for(const c of state.characters) p.character[c.id]={level:Math.max(p.character[c.id]?.level??0,c.level),awakening:Math.max(p.character[c.id]?.awakening??0,c.awakening)};
 for(const s of state.skills) p.skill[s.id]=Math.max(p.skill[s.id]??0,s.level);
 for(const e of state.equipment) p.equipment[e.instanceId]={masterId:e.masterId,level:Math.max(p.equipment[e.instanceId]?.level??0,e.level),lb:Math.max(p.equipment[e.instanceId]?.lb??0,e.lb)};
 return state;
}
/** Only called after an authoritative settled battle/growth action, in the same CAS transaction. */
export function recordMissionEvent(original: RedesignState, event: { id: string; counters: string[]; at: number }): MissionState {
 const state=captureMissionAssets(original),p=state.missionProgress!;
 if(!event.id||event.counters.some(k=>!k||['__proto__','constructor','prototype'].includes(k)))throw new Error('任務の進行イベントが不正です。');
 if(p.seenEvents.includes(event.id))return state;
 const date=jstLoginDate(event.at),daily=p.daily[date]??={};
 for(const key of new Set(event.counters)){p.counters[key]=(p.counters[key]??0)+1;daily[key]=(daily[key]??0)+1;}
 p.seenEvents.push(event.id);
 return state;
}
