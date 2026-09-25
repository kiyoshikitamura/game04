import { CHARACTER_MASTERS, EQUIPMENT_MASTERS } from './masters';
import { FORMAL_SKILL_MASTERS } from './formalOwnedSkills';
import type { Rarity } from './types';
import data from './data/formalGachaMaster.json';

export const FORMAL_GACHA_VERSION = data.version;

export const GACHA_CATEGORIES = ['character', 'skill', 'equipment'] as const;
export type GachaCategory = typeof GACHA_CATEGORIES[number];
export type SpecialGachaPayment = 'DIAMONDS' | 'TICKET';

export const SPECIAL_GACHA_TICKET_IDS = {
  character: 'SPECIAL_TICKET_CHARACTER',
  skill: 'SPECIAL_TICKET_SKILL',
  equipment: 'SPECIAL_TICKET_EQUIPMENT',
} as const;
export type SpecialGachaTicketId = typeof SPECIAL_GACHA_TICKET_IDS[GachaCategory];

export interface FormalGachaPoolRow {
  id: string;
  category: GachaCategory;
  rarity: Rarity;
  name: string;
  image?: string;
}

export interface SpecialGachaRule {
  category: GachaCategory;
  singleCost: number;
  tenCost: number;
  exchangePoints: number;
  rarityWeights: Readonly<Record<'R' | 'SR' | 'SSR', number>>;
  ticketId: SpecialGachaTicketId;
}

type FormalGachaData = {
  version: string;
  banners: Array<{
    id: string; category: GachaCategory | 'mixed'; singleCost: number; tenCost: number;
    currency: 'CASH' | 'DIAMONDS'; ticketId: SpecialGachaTicketId | null; exchangeThreshold: number | null;
    rates: Partial<Record<Rarity, number>>; categoryRates?: Record<GachaCategory, number>;
  }>;
  rows: Array<{ itemId: string; category: GachaCategory; rarity: Rarity; normal: boolean; special: boolean }>;
};
const authority = data as FormalGachaData;
const banner = (id: string) => {
  const value = authority.banners.find((candidate) => candidate.id === id);
  if (!value) throw new Error(`正式ガチャバナーがありません: ${id}`);
  return value;
};
const specialRule = (id: string, category: GachaCategory): SpecialGachaRule => {
  const value = banner(id);
  if (value.category !== category || !value.ticketId || value.exchangeThreshold === null) throw new Error(`特選${category}設定が不正です。`);
  return {
    category, singleCost: value.singleCost, tenCost: value.tenCost,
    exchangePoints: value.exchangeThreshold, ticketId: value.ticketId,
    rarityWeights: { R: value.rates.R ?? 0, SR: value.rates.SR ?? 0, SSR: value.rates.SSR ?? 0 },
  };
};

export const SPECIAL_GACHA_RULES: Readonly<Record<GachaCategory, SpecialGachaRule>> = {
  character: specialRule('SPECIAL_CHARACTER', 'character'),
  skill: specialRule('SPECIAL_SKILL', 'skill'),
  equipment: specialRule('SPECIAL_EQUIPMENT', 'equipment'),
};

const normalBanner = banner('NORMAL');
export const NORMAL_GACHA_RULE = {
  singleCost: normalBanner.singleCost,
  tenCost: normalBanner.tenCost,
  dailyFreeCount: 10,
  rarityWeights: { N: normalBanner.rates.N ?? 0, R: normalBanner.rates.R ?? 0, SR: normalBanner.rates.SR ?? 0, SSR: normalBanner.rates.SSR ?? 0 },
  categoryWeights: normalBanner.categoryRates ?? { character: 0, skill: 0, equipment: 0 },
};

const presentationMasters = { character: CHARACTER_MASTERS, skill: FORMAL_SKILL_MASTERS, equipment: EQUIPMENT_MASTERS };
export const FORMAL_GACHA_POOL: readonly FormalGachaPoolRow[] = authority.rows.map((row) => {
  const presentation = presentationMasters[row.category].find((candidate) => candidate.id === row.itemId);
  if (!presentation || presentation.rarity !== row.rarity) throw new Error(`正式排出IDの表示マスターが不正です: ${row.category}:${row.itemId}`);
  return { id: row.itemId, category: row.category, rarity: row.rarity, name: presentation.name, image: presentation.image };
});

export function normalGachaPool(): readonly FormalGachaPoolRow[] {
  const ids = new Set(authority.rows.filter((row) => row.normal).map((row) => `${row.category}:${row.itemId}`));
  return FORMAL_GACHA_POOL.filter((row) => ids.has(`${row.category}:${row.id}`));
}

export function specialGachaPool(category: GachaCategory): readonly FormalGachaPoolRow[] {
  const ids = new Set(authority.rows.filter((row) => row.special).map((row) => `${row.category}:${row.itemId}`));
  return FORMAL_GACHA_POOL.filter((row) => row.category === category && ids.has(`${row.category}:${row.id}`));
}

export function specialGachaExchangePool(category: GachaCategory): readonly FormalGachaPoolRow[] {
  return specialGachaPool(category).filter((row) => row.rarity === 'SSR');
}

export function formalGachaProbability(row: FormalGachaPoolRow, mode: 'normal' | 'special'): number {
  const pool = mode === 'normal' ? normalGachaPool() : specialGachaPool(row.category);
  if (!pool.some((candidate) => candidate.category === row.category && candidate.id === row.id)) return 0;
  const sameBucket = pool.filter((candidate) => candidate.category === row.category && candidate.rarity === row.rarity).length;
  if (!sameBucket) return 0;
  if (mode === 'special') {
    if (row.rarity === 'N') return 0;
    return SPECIAL_GACHA_RULES[row.category].rarityWeights[row.rarity] / sameBucket;
  }
  return NORMAL_GACHA_RULE.rarityWeights[row.rarity] * NORMAL_GACHA_RULE.categoryWeights[row.category] / 100 / sameBucket;
}

export function validateFormalGachaMaster(): void {
  const expected = {
    character: { N: 15, R: 20, SR: 15, SSR: 10, total: 60, special: 45 },
    skill: { N: 9, R: 33, SR: 16, SSR: 14, total: 72, special: 63 },
    equipment: { N: 35, R: 50, SR: 55, SSR: 20, total: 160, special: 125 },
  } as const;
  const ids = new Set<string>();
  for (const category of GACHA_CATEGORIES) {
    const rows = FORMAL_GACHA_POOL.filter((row) => row.category === category);
    for (const rarity of ['N', 'R', 'SR', 'SSR'] as const) {
      if (rows.filter((row) => row.rarity === rarity).length !== expected[category][rarity]) throw new Error(`正式${category} ${rarity}件数が不正です。`);
    }
    if (rows.length !== expected[category].total || specialGachaPool(category).length !== expected[category].special) throw new Error(`正式${category}排出件数が不正です。`);
    const rates = SPECIAL_GACHA_RULES[category].rarityWeights;
    if (rates.R + rates.SR + rates.SSR !== 100) throw new Error(`特選${category}確率合計が不正です。`);
    for (const row of rows) {
      const key = `${category}:${row.id}`;
      if (ids.has(key)) throw new Error(`正式排出IDが重複しています: ${key}`);
      ids.add(key);
    }
  }
  const normalRarityTotal = Object.values(NORMAL_GACHA_RULE.rarityWeights).reduce((sum, value) => sum + value, 0);
  const normalCategoryTotal = Object.values(NORMAL_GACHA_RULE.categoryWeights).reduce((sum, value) => sum + value, 0);
  if (normalRarityTotal !== 100 || normalCategoryTotal !== 100) throw new Error('ノーマルガチャ確率合計が不正です。');
}
