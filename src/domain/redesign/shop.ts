import { CHARACTER_MASTERS } from './masters';
import type { Rarity, RedesignState } from './types';

export type ShopExchangeId = 'energy_drink' | 'cash_3000' | 'cash_5000' | 'cash_10000' | 'cash_30000' | 'cash_50000' | 'raid_unlock' | 'soul_generic';

export const SHOP_EXCHANGE_OPTIONS = [
  { id: 'energy_drink', title: '活力丸', description: '行動力を50回復するアイテム', cost: 50, reward: '活力丸 ×1', maxQuantity: 10 },
  { id: 'cash_3000', title: '銭 3,000', description: '育成や通常召喚に使う銭', cost: 300, reward: '銭 ×3,000', maxQuantity: 1 },
  { id: 'cash_5000', title: '銭 5,000', description: '育成や通常召喚に使う銭', cost: 500, reward: '銭 ×5,000', maxQuantity: 1 },
  { id: 'cash_10000', title: '銭 10,000', description: '育成や通常召喚に使う銭', cost: 1000, reward: '銭 ×10,000', maxQuantity: 1 },
  { id: 'cash_30000', title: '銭 30,000', description: '育成や通常召喚に使う銭', cost: 3000, reward: '銭 ×30,000', maxQuantity: 1 },
  { id: 'cash_50000', title: '銭 50,000', description: '育成や通常召喚に使う銭', cost: 5000, reward: '銭 ×50,000', maxQuantity: 1 },
  { id: 'raid_unlock', title: '侵攻令', description: '領土侵攻の主催に使用', cost: 100, reward: '侵攻令 ×1', maxQuantity: 1 },
  { id: 'soul_generic', title: '固有魂を汎用魂へ交換', description: '同じレアリティの固有魂2個を汎用魂1個へ交換', cost: 0, reward: '汎用魂 ×1 / 固有魂2個', maxQuantity: 0 },
] as const;

type CashExchangeId = Exclude<ShopExchangeId, 'energy_drink' | 'raid_unlock' | 'soul_generic'>;
const CASH_REWARDS: Record<CashExchangeId, number> = {
  cash_3000: 3000, cash_5000: 5000, cash_10000: 10000, cash_30000: 30000, cash_50000: 50000,
};
const CASH_COSTS: Record<CashExchangeId, number> = {
  cash_3000: 300, cash_5000: 500, cash_10000: 1000, cash_30000: 3000, cash_50000: 5000,
};
const isRarity = (value: unknown): value is Rarity => value === 'N' || value === 'R' || value === 'SR' || value === 'SSR';
const integer = (value: unknown, label: string) => {
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw new Error(`${label}が不正です。`);
  return result;
};

export function applyShopExchange(original: RedesignState, payload: Record<string, unknown>): RedesignState {
  const exchangeId = String(payload.exchangeId ?? '') as ShopExchangeId;
  const state = structuredClone(original);
  state.souls ??= {};
  state.growthInventory ??= { expItems: { character: { small: 0, medium: 0, large: 0, xlarge: 0 }, equipment: { small: 0, medium: 0, large: 0, xlarge: 0 } }, carryExp: { character: 0, equipment: 0 }, genericSouls: { N: 0, R: 0, SR: 0, SSR: 0 }, soulSelectors: { N: 0, R: 0, SR: 0, SSR: 0 } };
  const quantity = integer(payload.quantity ?? 1, '交換数');
  if (quantity < 1) throw new Error('交換数が不正です。');

  if (exchangeId === 'energy_drink') {
    if (quantity > 10) throw new Error('活力丸は1回につき10個まで交換できます。');
    const cost = 50 * quantity;
    if (state.diamonds < cost) throw new Error('輝石が足りません。');
    state.diamonds -= cost;
    state.energyDrinks = (state.energyDrinks ?? 0) + quantity;
    return state;
  }
  if (exchangeId === 'raid_unlock') {
    if (quantity !== 1) throw new Error('この交換は1回ずつ行います。');
    if (state.diamonds < 100) throw new Error('輝石が足りません。');
    state.diamonds -= 100;
    state.materials.unlock += 1;
    return state;
  }
  if (exchangeId === 'soul_generic') {
    const characterId = String(payload.characterId ?? '');
    const character = CHARACTER_MASTERS.find(master => master.id === characterId);
    const amount = integer(payload.amount, '固有魂の交換数');
    if (!character || !isRarity(character.rarity)) throw new Error('交換対象の武将が不正です。');
    if (amount < 10 || amount % 2 !== 0) throw new Error('固有魂は10個以上、2個単位で指定してください。');
    if ((state.souls[characterId] ?? 0) < amount) throw new Error('固有魂が足りません。');
    state.souls[characterId] -= amount;
    state.growthInventory.genericSouls[character.rarity] += amount / 2;
    return state;
  }
  if (!Object.prototype.hasOwnProperty.call(CASH_REWARDS, exchangeId)) throw new Error('交換対象が不正です。');
  if (quantity !== 1) throw new Error('この交換は1回ずつ行います。');
  const cashId = exchangeId as CashExchangeId;
  if (state.diamonds < CASH_COSTS[cashId]) throw new Error('輝石が足りません。');
  state.diamonds -= CASH_COSTS[cashId];
  state.cash += CASH_REWARDS[cashId];
  return state;
}

export function applyShopEnergyDrink(original: RedesignState): RedesignState {
  const state = structuredClone(original);
  if ((state.energyDrinks ?? 0) < 1) throw new Error('活力丸がありません。');
  if (state.energy >= state.energyMax) throw new Error('行動力が上限に達しています。');
  state.energyDrinks = (state.energyDrinks ?? 0) - 1;
  state.energy += 50;
  return state;
}
