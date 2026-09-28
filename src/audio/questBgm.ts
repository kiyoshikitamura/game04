import type { BgmScene } from './audioContract';

// Explicit presentation assignment: each area's closing stage is its milestone.
// Other bosses keep the normal battle track; combat masters are not rewritten.
const MILESTONE_STAGES = new Set([
  'mikawa-3', 'owari-4', 'mino-5', 'omi-5', 'kai-6',
  'echigo-6', 'kyoto-8', 'izumo-8', 'satsuma-10', 'sekigahara-10',
]);
export function questBattleBgm(stageId?: string): BgmScene {
  return stageId && MILESTONE_STAGES.has(stageId) ? 'BATTLE_BOSS' : 'BATTLE';
}
