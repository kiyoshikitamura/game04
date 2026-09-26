import type { ExpSize, GrowthInventory, Rarity } from './types';
export type GrowthKind = 'character' | 'equipment';
export const GROWTH_VERSION = "APPROVED_GROWTH_V1_20260921";
export const EXP_SIZES: ExpSize[] = ["small", "medium", "large", "xlarge"];
export const EXP_VALUES = { small: 100, medium: 1e3, large: 5e3, xlarge: 2e4 };
export const SOUL_UNLOCK = { N: 20, R: 40, SR: 60, SSR: 80 };
export const AWAKENING_SOULS = { N: [4, 6, 8, 10, 12], R: [8, 12, 16, 20, 24], SR: [12, 18, 24, 30, 36], SSR: [20, 30, 40, 50, 60] };
export const LB_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
export const SKILL_LB_FACTORS = { N: 1, R: 2, SR: 4, SSR: 8 };
export const EQUIPMENT_LB_FACTORS = { N: 1, R: 2, SR: 3, SSR: 6 };
export const DUPLICATE_SKILL_MATERIALS = { N: 1, R: 2, SR: 5, SSR: 20 };
export const DISMANTLE_MATERIALS = DUPLICATE_SKILL_MATERIALS;
export const EXP_TOTALS = { character: { N: 3e5, R: 45e4, SR: 75e4, SSR: 12e5 }, equipment: { N: 18e4, R: 27e4, SR: 45e4, SSR: 72e4 } };
export function cumulativeExp(kind: GrowthKind, rarity: Rarity, level: number) {
  if (!Number.isInteger(level) || level < 1 || level > 100) throw new Error("Lvが不正です。");
  return level === 100 ? EXP_TOTALS[kind][rarity] : 10 * Math.floor(EXP_TOTALS[kind][rarity] * Math.pow((level - 1) / 99, 2.2) / 10 + 0.5);
}
export function cumulativeCash(kind: GrowthKind, rarity: Rarity, level: number) {
  const exp = cumulativeExp(kind, rarity, level);
  return kind === "character" ? exp : Math.floor(exp / 2);
}
export function playerCumulativeExp(level: number) {
  let exp = 0;
  for (let l = 1; l < Math.min(100, level); l++) exp += (l + 9) ** 2;
  return exp;
}
export function applyPlayerExperience(level: number, exp: number, gain: number, energy: number, energyMax: number) {
  if (!Number.isSafeInteger(gain) || gain < 0) throw new Error("プレイヤーEXPが不正です。");
  const nextExp = level >= 100 ? exp : Math.min(playerCumulativeExp(100), exp + gain);
  let nextLevel = level;
  while (nextLevel < 100 && nextExp >= playerCumulativeExp(nextLevel + 1)) nextLevel++;
  return { level: nextLevel, exp: nextExp, energy: nextLevel > level ? Math.max(energy, energyMax) : energy };
}
export function emptyGrowthInventory(): GrowthInventory {
  return { expItems: { character: { small: 0, medium: 0, large: 0, xlarge: 0 }, equipment: { small: 0, medium: 0, large: 0, xlarge: 0 } }, carryExp: { character: 0, equipment: 0 }, genericSouls: { N: 0, R: 0, SR: 0, SSR: 0 }, soulSelectors: { N: 0, R: 0, SR: 0, SSR: 0 } };
}
