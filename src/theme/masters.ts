import masterNames from "./sengoku-masters.json" with { type: "json" };
import { getThemedCharacterName } from "./characters";

// NAME FIX 2026-09-16。ID・排出条件・効果・価格には触れない表示projection。
export function getThemedMasterName(id: string, fallback: string): string {
  return (masterNames as Readonly<Record<string, string>>)[id] ?? fallback;
}

export function getThemedGachaItemName(type: string, id: string, fallback: string): string {
  return type === "CHARACTER" ? getThemedCharacterName(id, fallback) : getThemedMasterName(id, fallback);
}

export function getThemedItemDescription(id: string, fallback: string): string {
  const names: Readonly<Record<string, string>> = {
    ENERGY_DRINK: "活力を回復します。",
    PVP_POINT_TICKET: "合戦ポイントを1回復します。",
    RAID_POINT_TICKET: "討伐ポイントを1回復します。",
    NORMAL_GACHA_TICKET_CHARACTER: "姫武将の通常登用を1回行えます。",
    NORMAL_GACHA_TICKET_SKILL: "戦技の通常登用を1回行えます。",
    NORMAL_GACHA_TICKET_EQUIPMENT: "武具の通常登用を1回行えます。",
    SPECIAL_TICKET_CHARACTER: "姫武将の特選登用を1回行えます。",
    SPECIAL_TICKET_SKILL: "戦技の特選登用を1回行えます。",
    SPECIAL_TICKET_EQUIPMENT: "武具の特選登用を1回行えます。",
  };
  return names[id] ?? fallback.replaceAll("Character", "姫武将").replaceAll("Equipment", "武具").replaceAll("Skill", "戦技");
}
