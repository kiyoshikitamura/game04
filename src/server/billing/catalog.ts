import { VIP_PRODUCT } from "@/domain/redesign/vip";
import { SHOP_CATALOG_VERSION } from "@/utils/shop_master_data";

export const CATALOG_VERSION = SHOP_CATALOG_VERSION;
export const PAID_PACKS = [
  { id: "beginner_pack_01", amount_jpy: 100, purchase_limit: 1, items: { SPECIAL_TICKET_CHARACTER: 1, SPECIAL_TICKET_SKILL: 3, SPECIAL_TICKET_EQUIPMENT: 1, ENERGY_DRINK: 2, CASH: 10000 } },
  { id: "ticket_pack_01", amount_jpy: 1500, purchase_limit: 3, items: { SPECIAL_TICKET_CHARACTER: 5, SPECIAL_TICKET_SKILL: 5, SPECIAL_TICKET_EQUIPMENT: 5 } },
  { id: "growth_pack_01", amount_jpy: 500, purchase_limit: 3, items: { CHAR_EXP_XL: 5, EQUIP_EXP_XL: 15, CASH: 100000 } },
  { id: "awakening_pack_01", amount_jpy: 1000, purchase_limit: 3, items: { SOUL_SELECTOR_SSR: 3, SKILL_LB_PART: 100, EQUIP_LB_PART: 150, CASH: 50000 } },
] as const;
export const DIA_PRODUCTS = [[300,300,0],[500,500,0],[1000,1000,0],[3000,3000,0],[5000,5000,0],[10000,10000,0]].map(([total,paid,free]) => ({
  id: `diamond_${total}`, amount_jpy: paid, purchase_limit: 0,
  items: [{itemId:"DIAMOND",quantity:paid,validity_days:120}, ...(free ? [{itemId:"DIAMOND",quantity:free,validity_days:null}] : [])],
}));
export const VIP_CATALOG_PRODUCT = { id: VIP_PRODUCT.id, amount_jpy: VIP_PRODUCT.priceJpy, purchase_limit: 0, validity_days: 120, items: [] };
export const PAID_PRODUCT_IDS = [...PAID_PACKS.map(p=>p.id),...DIA_PRODUCTS.map(p=>p.id), VIP_PRODUCT.id];
type CatalogRow = { id: string; amount_jpy: number; purchase_limit: number; validity_days: number; items: { itemId: string; quantity: number; validity_days?: number | null }[] };
/** UIとDBの価格・内容・有償無償内訳が一致する場合だけ販売可能。 */
export function catalogMatches(rows: CatalogRow[]) {
  const vip = rows.find(row => row.id === VIP_PRODUCT.id);
  // VIP contains no ordinary assets: U09 alone creates entitlement and 30 deliveries.
  const vipValid = !!vip && (vip.amount_jpy === VIP_PRODUCT.priceJpy && vip.purchase_limit === 0 &&
    vip.validity_days === 120 && Array.isArray(vip.items) && vip.items.length === 0);
  return vipValid && PAID_PACKS.every(expected => {
    const actual = rows.find(row => row.id === expected.id);
    const quantities = Object.entries(expected.items);
    return actual?.amount_jpy === expected.amount_jpy && actual.purchase_limit === expected.purchase_limit &&
      actual.validity_days === 120 && Array.isArray(actual.items) && actual.items.length === quantities.length &&
      quantities.every(([id, quantity]) => actual.items.filter(item => item.itemId === id && item.quantity === quantity).length === 1);
  }) && DIA_PRODUCTS.every(expected => {
    const actual = rows.find(row => row.id === expected.id);
    return actual?.amount_jpy === expected.amount_jpy && actual.purchase_limit === 0 && actual.validity_days === 120 &&
      Array.isArray(actual.items) && actual.items.length === expected.items.length && expected.items.every(wanted =>
        actual.items.filter(item => item.itemId === wanted.itemId && item.quantity === wanted.quantity && item.validity_days === wanted.validity_days).length === 1);
  });
}
