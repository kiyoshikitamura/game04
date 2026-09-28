import { raidEnemy, raidEnemies } from './raid';
import { characterArt } from '../../theme/creativeAssets';
import type { EnemyUnit, RaidMaster, Reward } from './types';

export interface TerritoryPreviewStage {
  key: 'start' | 'middle' | 'final';
  label: '開始' | '中間' | '最終';
  /** Shared invasion progression; enemy.level is the separate combatant level. */
  level: number;
  enemy: EnemyUnit;
  enemies: EnemyUnit[];
  isRepresentative: boolean;
  defeatRewards: Reward[];
  sharedHp: number;
}

/** Read-only preview of supplied formal data. Hosting still draws and snapshots its own formation. */
export function getTerritoryPreviewStages(master: RaidMaster): TerritoryPreviewStage[] {
  const available = master.stages?.map(stage => stage.level).sort((a, b) => a - b);
  const maximum = available?.at(-1) ?? master.maxLevel;
  const targetLevels = [available?.[0] ?? 1, Math.ceil(maximum / 2), maximum];
  const keys = ['start', 'middle', 'final'] as const;
  const labels = ['開始', '中間', '最終'] as const;
  return targetLevels.map((target, index) => {
    const level = available?.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best, available[0]) ?? target;
    const stage = master.stages?.find(entry => entry.level === level);
    return {
      key: keys[index], label: labels[index], level,
      enemy: raidEnemy(master, level), enemies: raidEnemies(master, level),
      isRepresentative: Boolean(stage?.source?.startsWith('invasion source tables')),
      defeatRewards: structuredClone(stage?.defeatRewards ?? master.defeatRewards),
      sharedHp: stage?.sharedHp ?? Math.round(master.sharedHp * (1 + (level - 1) * master.sharedHpGrowthPerLevel)),
    };
  });
}

export function territoryEnemyArt(enemy: EnemyUnit, variant: 'full' | 'portrait' | 'card' | 'battle' = 'full'): string {
  return characterArt(enemy, variant) ?? enemy.image;
}

export function territoryDuration(minutes: number): string {
  return minutes % 1440 === 0 ? `${minutes / 1440}日` : minutes % 60 === 0 ? `${minutes / 60}時間` : `${minutes}分`;
}
