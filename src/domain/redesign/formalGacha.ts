import { applyAcquisitionEvents, APPROVED_ACQUISITION_MASTER } from './acquisitions';
import {
  FORMAL_GACHA_VERSION,
  GACHA_CATEGORIES,
  NORMAL_GACHA_RULE,
  SPECIAL_GACHA_RULES,
  formalGachaProbability,
  normalGachaPool,
  specialGachaExchangePool,
  specialGachaPool,
  type FormalGachaPoolRow,
  type GachaCategory,
  type SpecialGachaPayment,
} from './formalGachaMaster';
import type { RedesignState, Rarity } from './types';

export type FormalGachaResult = FormalGachaPoolRow & {
  acquisition: 'new' | 'duplicate' | 'instance';
  convertedAmount: number;
};

export interface FormalGachaReceipt {
  requestId: string;
  kind: 'normal' | 'special' | 'exchange';
  category?: GachaCategory;
  count: number;
  payment?: 'CASH' | 'FREE' | SpecialGachaPayment | 'POINTS';
  cost: number;
  pointsAdded: number;
  results: FormalGachaResult[];
  masterVersion: string;
}

export type FormalGachaState = RedesignState & {
  specialGachaPoints?: Partial<Record<GachaCategory, number>>;
  appliedAcquisitionIds?: string[];
};

function randomIndex(length: number, random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('抽選値が不正です。');
  return Math.floor(value * length);
}

function weightedPick<T extends string>(weights: Readonly<Record<T, number>>, random: () => number): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = randomIndex(total, random);
  for (const [key, weight] of entries) {
    if (roll < weight) return key;
    roll -= weight;
  }
  throw new Error('抽選マスターが不正です。');
}

function drawRow(pool: readonly FormalGachaPoolRow[], rarity: Rarity, category: GachaCategory, random: () => number): FormalGachaPoolRow {
  const choices = pool.filter((row) => row.rarity === rarity && row.category === category);
  if (!choices.length) throw new Error('排出対象を確認できません。');
  return choices[randomIndex(choices.length, random)];
}

function applyResult(state: FormalGachaState, row: FormalGachaPoolRow, eventId: string): { state: FormalGachaState; result: FormalGachaResult } {
  const beforeSoul = state.souls[row.id] ?? 0;
  const beforeSkillMaterial = state.materials.skill;
  const existed = row.category === 'character'
    ? state.characters.some((owned) => owned.id === row.id)
    : row.category === 'skill' ? state.skills.some((owned) => owned.id === row.id) : false;
  const next = applyAcquisitionEvents(state, [{ id: eventId, kind: row.category, masterId: row.id, instanceId: eventId }], APPROVED_ACQUISITION_MASTER) as FormalGachaState;
  if (!next.appliedAcquisitionIds?.includes(eventId)) throw new Error('獲得資産の接続を確認できません。消費は行いません。');
  const acquisition = row.category === 'equipment' ? 'instance' : existed ? 'duplicate' : 'new';
  const convertedAmount = row.category === 'character' ? (next.souls[row.id] ?? 0) - beforeSoul
    : row.category === 'skill' ? next.materials.skill - beforeSkillMaterial : 0;
  return { state: next, result: { ...row, acquisition, convertedAmount } };
}

export function formalGachaJstDay(now: number): string {
  if (!Number.isFinite(now)) throw new Error('日時が不正です。');
  return new Date(now + 9 * 60 * 60 * 1_000).toISOString().slice(0, 10);
}

export function applyFormalSpecialGacha(
  original: FormalGachaState,
  input: { requestId: string; category: GachaCategory; count: 1 | 10; payment: SpecialGachaPayment },
  random: () => number,
): { state: FormalGachaState; receipt: FormalGachaReceipt } {
  if (!GACHA_CATEGORIES.includes(input.category) || ![1, 10].includes(input.count)) throw new Error('抽選条件が不正です。');
  if (input.payment !== 'DIAMONDS' && input.payment !== 'TICKET') throw new Error('支払方法が不正です。');
  if (input.payment === 'TICKET' && input.count !== 1) throw new Error('ガチャ券は単発で使用してください。');
  const rule = SPECIAL_GACHA_RULES[input.category];
  let state = structuredClone(original);
  const cost = input.payment === 'DIAMONDS' ? (input.count === 10 ? rule.tenCost : rule.singleCost) : input.count;
  if (input.payment === 'DIAMONDS') {
    if (state.diamonds < cost) throw new Error('輝石が不足しています。');
    state.diamonds -= cost;
  } else {
    state.gachaTicketBalances ??= {};
    const owned = state.gachaTicketBalances[rule.ticketId] ?? 0;
    if (owned < cost) throw new Error('対応するガチャ券が不足しています。');
    state.gachaTicketBalances[rule.ticketId] = owned - cost;
  }
  const results: FormalGachaResult[] = [];
  const pool = specialGachaPool(input.category);
  for (let index = 0; index < input.count; index++) {
    const rarity = weightedPick(rule.rarityWeights, random);
    const applied = applyResult(state, drawRow(pool, rarity, input.category, random), `formal_gacha:${input.requestId}:${index}`);
    state = applied.state;
    results.push(applied.result);
  }
  state.specialGachaPoints ??= {};
  state.specialGachaPoints[input.category] = (state.specialGachaPoints[input.category] ?? 0) + input.count;
  const receipt: FormalGachaReceipt = { requestId: input.requestId, kind: 'special', category: input.category, count: input.count, payment: input.payment, cost, pointsAdded: input.count, results, masterVersion: FORMAL_GACHA_VERSION };
  return { state, receipt };
}

export function applyFormalNormalGacha(
  original: FormalGachaState,
  input: { requestId: string; count: 1 | 10; payment: 'CASH' | 'FREE'; now: number },
  random: () => number,
): { state: FormalGachaState; receipt: FormalGachaReceipt } {
  if (input.payment !== 'CASH' && input.payment !== 'FREE') throw new Error('支払方法が不正です。');
  if (![1, 10].includes(input.count) || (input.payment === 'FREE' && input.count !== NORMAL_GACHA_RULE.dailyFreeCount)) throw new Error('抽選条件が不正です。');
  let state = structuredClone(original);
  const free = input.payment === 'FREE';
  const day = formalGachaJstDay(input.now);
  if (free && state.dailyNormalGachaDate === day) throw new Error('本日の無料10連は利用済みです。');
  const cost = free ? 0 : input.count === 10 ? NORMAL_GACHA_RULE.tenCost : NORMAL_GACHA_RULE.singleCost;
  if (state.cash < cost) throw new Error('銭が不足しています。');
  state.cash -= cost;
  if (free) state.dailyNormalGachaDate = day;
  const results: FormalGachaResult[] = [];
  const pool = normalGachaPool();
  for (let index = 0; index < input.count; index++) {
    const rarity = weightedPick(NORMAL_GACHA_RULE.rarityWeights, random);
    const category = weightedPick(NORMAL_GACHA_RULE.categoryWeights, random);
    const applied = applyResult(state, drawRow(pool, rarity, category, random), `formal_gacha:${input.requestId}:${index}`);
    state = applied.state;
    results.push(applied.result);
  }
  const receipt: FormalGachaReceipt = { requestId: input.requestId, kind: 'normal', count: input.count, payment: input.payment, cost, pointsAdded: 0, results, masterVersion: FORMAL_GACHA_VERSION };
  return { state, receipt };
}

export function applyFormalSsrExchange(
  original: FormalGachaState,
  input: { requestId: string; category: GachaCategory; itemId: string },
): { state: FormalGachaState; receipt: FormalGachaReceipt } {
  if (!GACHA_CATEGORIES.includes(input.category)) throw new Error('交換カテゴリが不正です。');
  const target = specialGachaExchangePool(input.category).find((row) => row.id === input.itemId);
  if (!target) throw new Error('交換対象のSSRではありません。');
  let state = structuredClone(original);
  state.specialGachaPoints ??= {};
  const required = SPECIAL_GACHA_RULES[input.category].exchangePoints;
  const points = state.specialGachaPoints[input.category] ?? 0;
  if (points < required) throw new Error('交換ポイントが不足しています。');
  state.specialGachaPoints[input.category] = points - required;
  const applied = applyResult(state, target, `formal_gacha_exchange:${input.requestId}`);
  state = applied.state;
  const receipt: FormalGachaReceipt = { requestId: input.requestId, kind: 'exchange', category: input.category, count: 1, payment: 'POINTS', cost: required, pointsAdded: 0, results: [applied.result], masterVersion: FORMAL_GACHA_VERSION };
  return { state, receipt };
}

export function formalGachaDisplayRates(mode: 'normal' | 'special', category?: GachaCategory) {
  const pool = mode === 'normal' ? normalGachaPool() : specialGachaPool(category!);
  return pool.map((row) => ({ ...row, probabilityPercent: formalGachaProbability(row, mode) }));
}
