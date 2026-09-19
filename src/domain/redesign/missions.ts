import type { RedesignState, Reward } from './types';
import { QUEST_AREAS, QUEST_STAGES } from './quests';

export interface MissionMaster {
  id: string; name: string; description: string; enabled: boolean;
  condition: { type: 'stage_clear'; stageId: string } | { type: 'area_clear'; areaId: string };
  rewards: Reward[];
}
export interface MissionConfig { enabled: boolean; missions: MissionMaster[]; }
export interface MissionProjection {
  id: string; name: string; description: string; rewards: Reward[];
  status: 'progress' | 'claimable' | 'claimed'; current: number; target: number;
}
/** No release conditions, quantities, or schedules are inferred from legacy missions. */
export const EMPTY_MISSION_CONFIG: MissionConfig = { enabled: false, missions: [] };
export function evaluateMissions(state: RedesignState, config: MissionConfig): MissionProjection[] {
  if (!config.enabled) return [];
  const cleared = new Set(state.clearedStages);
  const ids = new Set<string>();
  return config.missions.filter(master => master.enabled).map(master => {
    if (!master.id || ids.has(master.id)) throw new Error('任務マスターのIDが重複しています。');
    ids.add(master.id);
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
    const current = stages.filter(id => cleared.has(id)).length;
    return { id: master.id, name: master.name, description: master.description, rewards: master.rewards,
      current, target: stages.length, status: state.claimedMissionIds?.includes(master.id) ? 'claimed' : current === stages.length ? 'claimable' : 'progress' };
  });
}
export function getClaimableMission(state: RedesignState, config: MissionConfig, id: string): MissionMaster {
  const row = evaluateMissions(state, config).find(candidate => candidate.id === id);
  if (!row || row.status !== 'claimable') throw new Error('この任務の報酬は受け取れません。');
  return config.missions.find(master => master.id === id)!;
}
