import { getThemedMasterName, getThemedItemDescription } from "../../../theme/masters";
import itemSource from "./data/items_20260822.json" with { type: "json" };

export type CanonicalItem = (typeof itemSource.items)[number];

export const CANONICAL_ITEM_VERSION = itemSource.version;
export const CANONICAL_ITEMS: readonly CanonicalItem[] = Object.freeze(itemSource.items.map((item) => ({ ...item, name: getThemedMasterName(item.id, item.name), description: getThemedItemDescription(item.id, item.description) })));
export const CANONICAL_ITEM_BY_ID = new Map(CANONICAL_ITEMS.map((item) => [item.id, item]));
const CANONICAL_REWARD_ALIAS_NAMES: Record<string, string> = {
  SKILL_LB_PART: "スキルLB素材",
  CHAR_EXP_XL: "武将EXP素材（特大）",
  EQUIP_EXP_XL: "装備EXP素材（特大）",
  NORMAL_GACHA_TICKET_RANDOM: "ランダム通常召喚札",
  SPECIAL_TICKET_RANDOM: "ランダム特選召喚札",
  SPECIAL_TICKET_SKILL_OR_EQUIPMENT: "特選・戦技／武具召喚札",
};

export function canonicalItemName(itemId: string): string {
  if (itemId === "PLAYER_XP") return "プレイヤー経験値";
  if (itemId === "CASH") return "銭";
  if (itemId === "DIAMOND" || itemId === "DIA") return "輝石";
  const soul = /^(SOUL_SELECTOR|GENERIC_SOUL)_(N|R|SR|SSR)$/.exec(itemId);
  if (soul) return `${soul[2]}${soul[1] === "SOUL_SELECTOR" ? "魂選択券" : "汎用魂"}`;
  return CANONICAL_ITEM_BY_ID.get(itemId)?.name ?? CANONICAL_REWARD_ALIAS_NAMES[itemId] ?? itemId;
}

export function canonicalItemEffectValue(itemId: string): number | null {
  const usage = CANONICAL_ITEM_BY_ID.get(itemId)?.runtimeUsage;
  if (!usage || !("effectValue" in usage)) return null;
  return typeof usage.effectValue === "number" ? usage.effectValue : null;
}
