import type { RedesignState, ExpSize, Rarity } from './types';
import { emptyGrowthInventory, EXP_SIZES } from './growthMaster';
export type GrowthRewardKind = 'character_exp_item' | 'equipment_exp_item' | 'generic_soul' | 'soul_selector';
const RARITIES: Rarity[] = ["N", "R", "SR", "SSR"];
export function isGrowthRewardKind(kind: string): kind is GrowthRewardKind {
  return ["character_exp_item", "equipment_exp_item", "generic_soul", "soul_selector"].includes(kind);
}
export function grantGrowthReward(original: RedesignState, reward: {kind: GrowthRewardKind; id?: string; amount: number}): RedesignState {
  if (!Number.isSafeInteger(reward.amount) || reward.amount < 0) throw new Error("報酬数量が不正です");
  const state = structuredClone(original);
  state.growthInventory ??= emptyGrowthInventory();
  const inventory = state.growthInventory;
  const add = (old: number) => {
    const total = old + reward.amount;
    if (!Number.isSafeInteger(old) || old < 0 || !Number.isSafeInteger(total)) throw new Error("育成アイテム残高が不正です");
    return total;
  };
  if (reward.kind === "character_exp_item" || reward.kind === "equipment_exp_item") {
    if (!EXP_SIZES.includes(reward.id as ExpSize)) throw new Error("EXPアイテムの種類が不正です");
    const target = reward.kind === "character_exp_item" ? "character" : "equipment";
    const size = reward.id as ExpSize;
    inventory.expItems[target][size] = add(inventory.expItems[target][size]);
  } else if (reward.kind === "generic_soul" || reward.kind === "soul_selector") {
    if (!RARITIES.includes(reward.id as Rarity)) throw new Error("魂アイテムのレアリティが不正です");
    const target = reward.kind === "generic_soul" ? "genericSouls" : "soulSelectors";
    const rarity = reward.id as Rarity;
    inventory[target][rarity] = add(inventory[target][rarity]);
  } else throw new Error("育成報酬の種類が不正です");
  return state;
}
