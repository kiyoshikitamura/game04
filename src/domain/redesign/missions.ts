import { hasQuestClear } from './earlyProgress';
import type { RedesignState, Reward } from './types';
import { QUEST_AREAS, QUEST_STAGES } from './quests';
import { CHARACTER_MASTERS, OWNABLE_SKILL_MASTERS, EQUIPMENT_MASTERS } from './masters';
import { captureMissionAssets } from './missionProgress';
import { jstLoginDate } from './loginBonus';

export interface MissionMaster {
  id: string; name: string; description: string; enabled: boolean;
  condition: { type: 'stage_clear'; stageId: string } | { type: 'area_clear'; areaId: string } | {type:'metric';key:string;target:number;threshold?:number;daily?:boolean};
  rewards: Reward[];
}
export interface MissionConfig { enabled: boolean; missions: MissionMaster[]; }
export interface MissionProjection {
  id: string; name: string; description: string; rewards: Reward[];
  status: 'progress' | 'claimable' | 'claimed'; current: number; target: number;
}
/** No release conditions, quantities, or schedules are inferred from legacy missions. */
export const EMPTY_MISSION_CONFIG: MissionConfig = { enabled: false, missions: [] };
export function evaluateMissions(state: RedesignState, config: MissionConfig, now=Date.now()): MissionProjection[] {
  if (!config.enabled) return [];
  const cleared = new Set(state.clearedStages.filter(id=>hasQuestClear(id,state.clearedStages,state.earlyProgress)));
  const ids = new Set<string>();
  const progress = captureMissionAssets(state).missionProgress!;
  return config.missions.filter(master => master.enabled).map(master => {
    if (!master.id || ids.has(master.id)) throw new Error('任務マスターのIDが重複しています。');
    ids.add(master.id);
    if(master.condition.type==='metric'){
      const c=master.condition,p=progress;
      let value=0;
      if(c.daily) {
        const daily=p.daily[jstLoginDate(now)]??{};
        value=c.key==='daily_completed' ? [1,3,5].filter(n=>(daily.battle??0)>=n).length+[1,3,5].filter(n=>(daily.quest_clear??0)>=n).length+Number((daily.normal_gacha??0)>=1)+Number((daily.growth??0)>=1) : daily[c.key]??0;
      } else switch(c.key){
        case 'quest_clear': value=Object.values(state.questClearCounts??{}).reduce((a,b)=>a+b,0);break;
        case 'player_level': value=state.playerProgress?.level??0;break;
        case 'character_count':value=Object.keys(p.character).length;break;
        case 'ssr_character_count':value=Object.keys(p.character).filter(id=>CHARACTER_MASTERS.some(m=>m.id===id&&m.rarity==='SSR')).length;break;
        case 'character_level':value=Object.values(p.character).filter(v=>v.level>=(c.threshold??0)).length;break;
        case 'character_awakening':value=Object.values(p.character).filter(v=>v.awakening>=(c.threshold??0)).length;break;
        case 'skill_count':value=Object.keys(p.skill).length;break;
        case 'ssr_skill_count':value=Object.keys(p.skill).filter(id=>OWNABLE_SKILL_MASTERS.some(m=>m.id===id&&m.rarity==='SSR')).length;break;
        case 'skill_lb':value=Object.values(p.skill).filter(v=>v>=(c.threshold??0)).length;break;
        case 'ssr_equipment_count':value=new Set(Object.values(p.equipment).filter(v=>EQUIPMENT_MASTERS.some(m=>m.id===v.masterId&&m.rarity==='SSR')).map(v=>v.masterId)).size;break;
        case 'equipment_level':value=Object.values(p.equipment).filter(v=>v.level>=(c.threshold??0)).length;break;
        case 'equipment_lb':value=Object.values(p.equipment).filter(v=>v.lb>=(c.threshold??0)).length;break;
        default:value=p.counters[c.key]??0;
      }
      const claimId=c.daily?`${master.id}:${jstLoginDate(now)}`:master.id;
      return {id:claimId,name:master.name,description:master.description,rewards:master.rewards,current:Math.min(value,c.target),target:c.target,status:state.claimedMissionIds?.includes(claimId)?'claimed':value>=c.target?'claimable':'progress'};
    }
    let stages: string[];
    if (master.condition.type === 'stage_clear') {
      const stageId = master.condition.stageId;
      if (!QUEST_STAGES.some(stage => stage.id === stageId)) throw new Error('任務の対象ステージが存在しません。');
      stages = [stageId];
    } else if (master.condition.type === 'area_clear') {
      const areaId = master.condition.areaId;
      const area = QUEST_AREAS.find(candidate => candidate.id === areaId);
      if (!area?.stages.length) throw new Error('任務の対象エリアが存在しません。');
      stages = area.stages.map(stage => stage.id);
    } else throw new Error('任務条件が未対応です。');
    const preserved=master.condition.type==='area_clear'&&state.earlyProgress?.completedAreas.includes(master.condition.areaId);
    const current = preserved ? stages.length : stages.filter(id => cleared.has(id)).length;
    return { id: master.id, name: master.name, description: master.description, rewards: master.rewards,
      current, target: stages.length, status: state.claimedMissionIds?.includes(master.id) ? 'claimed' : current === stages.length ? 'claimable' : 'progress' };
  });
}
export function getClaimableMission(state: RedesignState, config: MissionConfig, id: string, now=Date.now()): MissionMaster {
  const row = evaluateMissions(state, config, now).find(candidate => candidate.id === id);
  if (!row || row.status !== 'claimable') throw new Error('この任務の報酬は受け取れません。');
  const master=config.missions.find(master => master.id === id || (master.condition.type==='metric' && master.condition.daily && `${master.id}:${jstLoginDate(now)}`===id));
  if(!master)throw new Error('任務が見つかりません。');
  return {...master,id};
}
