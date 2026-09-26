import { getThemedGachaItemName } from "../../theme/masters";

export const SPECIAL_GACHA_IDS = [
  "CHAR_JUSTICE_EVIL_SPECIAL", "CHAR_ORDER_CHAOS_SPECIAL", "SKILL_SPECIAL", "EQUIP_SPECIAL",
] as const;
export type SpecialGachaId = typeof SPECIAL_GACHA_IDS[number];
export type SpecialGachaItem = {
  item_id: string; item_type: "CHARACTER" | "SKILL" | "EQUIPMENT";
  name: string; rarity: "R" | "SR" | "SSR"; is_exclusive: boolean; probability: number;
};
export type SpecialGacha = { id: SpecialGachaId; name: string; cost_diamond: number; pity_points?: number; items: SpecialGachaItem[] };
export const SPECIAL_GACHA_COPY: Record<SpecialGachaId, { title: string; description: string }> = {
  CHAR_JUSTICE_EVIL_SPECIAL: { title: "正義・悪 特選登用", description: "正義と悪属性の姫武将のみ出現！" },
  CHAR_ORDER_CHAOS_SPECIAL: { title: "秩序・混沌 特選登用", description: "秩序と混沌属性の姫武将のみ出現！" },
  SKILL_SPECIAL: { title: "戦技の特選登用", description: "SSRとSR姫武将専用戦技入り！" },
  EQUIP_SPECIAL: { title: "武具の特選登用", description: "SSR姫武将専用武具入り！" },
};
export type SpecialGachaCatalog = { available: boolean; pity_points: number; pity_cost: number; gachas: SpecialGacha[] };
export function isSpecialGachaId(id: string): id is SpecialGachaId {
  return (SPECIAL_GACHA_IDS as readonly string[]).includes(id);
}
export function parseSpecialGachaCatalog(value: unknown): SpecialGachaCatalog | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.available !== "boolean" || !Number.isInteger(input.pity_points) || Number(input.pity_points) < 0 || input.pity_cost !== 100 || !Array.isArray(input.gachas)) return null;
  const ids = new Set<string>();
  for (const gacha of input.gachas) {
    if (!gacha || !isSpecialGachaId(gacha.id) || ids.has(gacha.id) || typeof gacha.name !== "string" ||
      gacha.cost_diamond !== (gacha.id.startsWith("CHAR_") ? 300 : 200) || !Array.isArray(gacha.items) || !gacha.items.length) return null;
    ids.add(gacha.id);
    const itemIds = new Set<string>();
    let total = 0;
    for (const item of gacha.items) {
      const expectedType = gacha.id.startsWith("CHAR_") ? "CHARACTER" : gacha.id.startsWith("SKILL_") ? "SKILL" : "EQUIPMENT";
      if (!item || typeof item.item_id !== "string" || itemIds.has(item.item_id) || item.item_type !== expectedType ||
        typeof item.name !== "string" || !["R", "SR", "SSR"].includes(item.rarity) || typeof item.is_exclusive !== "boolean" ||
        !Number.isFinite(Number(item.probability)) || Number(item.probability) <= 0) return null;
      itemIds.add(item.item_id);
      item.probability = Number(item.probability);
      total += item.probability;
    }
    if (Math.abs(total - 100) > 0.00001) return null;
  }
  if (ids.size !== 4) return null;
  const catalog = input as SpecialGachaCatalog;
  return { ...catalog, gachas: catalog.gachas.map(gacha => ({ ...gacha, items: gacha.items.map(item => ({ ...item, name: getThemedGachaItemName(item.item_type, item.item_id, item.name) })) })) };
}
export function specialTicketId(gacha: SpecialGachaId): string {
  return gacha.startsWith("CHAR_") ? "SPECIAL_TICKET_CHARACTER" : gacha === "SKILL_SPECIAL" ? "SPECIAL_TICKET_SKILL" : "SPECIAL_TICKET_EQUIPMENT";
}
export function exchangeItems(gachas: SpecialGacha[]): SpecialGachaItem[] {
  const unique = new Map<string, SpecialGachaItem>();
  for (const gacha of gachas) for (const item of gacha.items) {
    if (item.rarity === "SSR") unique.set(`${item.item_type}:${item.item_id}`, item);
  }
  return [...unique.values()];
}
