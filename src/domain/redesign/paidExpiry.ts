import type { RedesignState } from './types';
import type { StoredItem } from './inventory';

export type PaidLot = { id?: string; item_id: string; quantity: number; expires_at: string; claimed: boolean };
export const paidItemPaths: Record<string, string[]> = {
  ENERGY_DRINK: ['energyDrinks'], RAID_UNLOCK_TICKET: ['materials','unlock'],
  SKILL_LB_PART: ['materials','skill'], EQUIP_LB_PART: ['materials','equipmentLb'],
  CHAR_EXP_XL: ['growthInventory','expItems','character','xlarge'],
  EQUIP_EXP_XL: ['growthInventory','expItems','equipment','xlarge'],
  SOUL_SELECTOR_SSR: ['growthInventory','soulSelectors','SSR'],
};
export function isExpired(expiresAt: string | null | undefined, now: number): boolean {
  return expiresAt != null && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= now);
}
/** Project only known expired paid stock while the authoritative refresh is in flight. */
export function projectPaidExpiry(state: RedesignState, items: StoredItem[], lots: PaidLot[], now: number) {
  const next = structuredClone(state), stored = items.map(item => ({...item}));
  for (const lot of lots) {
    if (!lot.claimed || !isExpired(lot.expires_at, now)) continue;
    const path = paidItemPaths[lot.item_id];
    if (path) {
      let container: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (const key of path.slice(0,-1)) container = (container?.[key] ?? {}) as Record<string, unknown>;
      const key = path[path.length-1];
      if (typeof container[key] === 'number') container[key] = Math.max(0, (container[key] as number)-lot.quantity);
    } else {
      const item = stored.find(row => row.item_id === lot.item_id);
      if (item) item.quantity = Math.max(0,item.quantity-lot.quantity);
    }
  }
  return {state:next,items:stored};
}
