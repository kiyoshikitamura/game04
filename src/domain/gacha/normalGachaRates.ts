import { getThemedGachaItemName } from "../../theme/masters";

type PoolRow = { gacha_id: string; item_id: string; item_type: string; rarity: string };
type RarityRate = { rarity: string; weight: number | string };
/** Normal RPC draws the rarity, then uniformly selects a row in that rarity's live pool. */
export function normalGachaRates(pool: readonly PoolRow[], gachaId: string, rates: readonly RarityRate[]) {
  const rows = pool.filter(item => item.gacha_id === gachaId);
  const total = rates.reduce((sum, rate) => sum + Number(rate.weight), 0);
  if (!rows.length || !rates.length || !Number.isFinite(total) || total <= 0) return [];
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.rarity, (counts.get(row.rarity) ?? 0) + 1);
  if (rates.some(rate => Number(rate.weight) < 0 || !Number.isFinite(Number(rate.weight)) || (Number(rate.weight) > 0 && !counts.has(rate.rarity)))) return [];
  return rows.map(row => ({
    ...row, name: getThemedGachaItemName(row.item_type, row.item_id, row.item_id),
    probability: Number(rates.find(rate => rate.rarity === row.rarity)?.weight ?? 0) / total * 100 / counts.get(row.rarity)!,
  }));
}
