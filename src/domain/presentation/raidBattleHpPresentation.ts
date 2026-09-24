import type { RaidBattleStartSnapshot } from '../redesign/types';

export interface CurrentRaidHp { current: number; max: number; level?: number; }
/** Shared HP is a fixed start context, not an interpolation of personal battle damage. */
export function projectRaidBattleHp(start: RaidBattleStartSnapshot | undefined, current: CurrentRaidHp | undefined) {
  if (start) return { current: start.hp, max: start.maxHp, label: `開始時の共通HP（Lv.${start.level}）` };
  // Old recordings have no start context. Preserve their explicit current-state fallback.
  if (current) return { ...current, label: `現在の共通HP${current.level !== undefined ? `（Lv.${current.level}）` : ''}` };
  return undefined;
}
