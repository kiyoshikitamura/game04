import { CHARACTER_MASTERS, EQUIPMENT_MASTERS } from './masters';
import { FORMAL_SKILL_MASTERS } from './formalOwnedSkills';
import { applyAcquisitionEvents, APPROVED_ACQUISITION_MASTER, type AcquisitionState } from './acquisitions';
import { captureMissionAssets, recordMissionEvent } from './missionProgress';
import { synchronizeHomeBackgroundUnlocks } from './home';
import { jstLoginDate } from './loginBonus';
import type { RedesignState, Rarity } from './types';

export type SpecialGachaCategory = 'character' | 'skill' | 'equipment';
export type GachaCategory = 'normal' | SpecialGachaCategory;
export type GachaPayment = 'cash' | 'free' | 'gems' | 'ticket';
export const GACHA_MASTER_VERSION = 'game04-g3-formal-20260925';
export const GACHA_CATEGORIES: Record<GachaCategory, { label: string; singleCost: number; ticketId?: string; exchangePoints?: number; rarityWeights: Record<Rarity, number> }> = {
 normal: { label: 'ノーマル', singleCost: 1000, rarityWeights: { N: 4900, R: 4000, SR: 1000, SSR: 100 } },
 character: { label: 'キャラ', singleCost: 300, ticketId: 'SPECIAL_TICKET_CHARACTER', exchangePoints: 200, rarityWeights: { N: 0, R: 6500, SR: 3200, SSR: 300 } },
 skill: { label: 'スキル', singleCost: 300, ticketId: 'SPECIAL_TICKET_SKILL', exchangePoints: 100, rarityWeights: { N: 0, R: 6000, SR: 3500, SSR: 500 } },
 equipment: { label: '装備', singleCost: 200, ticketId: 'SPECIAL_TICKET_EQUIPMENT', exchangePoints: 100, rarityWeights: { N: 0, R: 5000, SR: 4000, SSR: 1000 } },
};
const masters = { character: CHARACTER_MASTERS, skill: FORMAL_SKILL_MASTERS, equipment: EQUIPMENT_MASTERS };
const kinds: SpecialGachaCategory[] = ['character', 'skill', 'equipment'];
const rarities: Rarity[] = ['N', 'R', 'SR', 'SSR'];
const categoryWeight = { character: 20, skill: 30, equipment: 50 };
const expected = { character: [15, 20, 15, 10], skill: [9, 33, 16, 14], equipment: [35, 50, 55, 20] };
export interface GachaPoolRow { id: string; kind: SpecialGachaCategory; rarity: Rarity; name: string; image?: string; }
export interface GachaRateRow extends GachaPoolRow { probability: number; weightNumerator: number; weightDenominator: number; }
export interface GachaResult extends GachaPoolRow { outcome: string; isNew: boolean; conversion?: { kind: 'soul' | 'skill_material'; amount: number }; }
export interface GachaDrawPayload { category: GachaCategory; payment: GachaPayment; count: 1 | 10; }
export interface GachaSettlement { state: RedesignState; results: GachaResult[]; cost: number; pointGain: number; pointsAfter: number; masterVersion: string; category: GachaCategory; payment: GachaPayment | 'points'; count: number; ticketId?: string; }
function checkCategory(category: string): asserts category is GachaCategory {
 if (!Object.prototype.hasOwnProperty.call(GACHA_CATEGORIES, category)) throw new Error('ガチャの種類が不正です。');
}
/** Fail closed on a missing, duplicate, or nonformal master; equipment slots never expand this list. */
export function gachaPool(category: GachaCategory): GachaPoolRow[] {
 checkCategory(category);
 const rows: GachaPoolRow[] = [];
 for (const kind of kinds) {
  const group = masters[kind];
  if (new Set(group.map(m => m.id)).size !== group.length || rarities.some((r, i) => group.filter(m => m.rarity === r).length !== expected[kind][i])) throw new Error('排出対象を確認できません。');
  if (category !== 'normal' && kind !== category) continue;
  for (const master of group) if (category === 'normal' || master.rarity !== 'N') rows.push({ id: master.id, kind, rarity: master.rarity, name: master.name, image: master.image });
 }
 return rows;
}
/** probability is a display percentage. Sampling uses integer rarity/category weights, then uniform indices. */
export function gachaRates(category: GachaCategory): GachaRateRow[] {
 const rows = gachaPool(category);
 return rows.map(row => {
  const count = rows.filter(other => other.kind === row.kind && other.rarity === row.rarity).length;
  const weightNumerator = GACHA_CATEGORIES[category].rarityWeights[row.rarity] * (category === 'normal' ? categoryWeight[row.kind] : 100);
  const weightDenominator = 10000 * 100 * count;
  return { ...row, probability: weightNumerator / weightDenominator * 100, weightNumerator, weightDenominator };
 });
}
export function gachaExchangeTargets(category: SpecialGachaCategory): GachaPoolRow[] {
 if (category === ('normal' as string)) throw new Error('ノーマルは交換対象外です。');
 return gachaPool(category).filter(row => row.rarity === 'SSR');
}
function checkRequest(original: RedesignState, requestId: string, now: number) {
 if (!requestId || requestId.length > 200 || !Number.isFinite(now)) throw new Error('抽選の受付情報が不正です。');
 // The API returns its saved receipt for retries. Never charge again if called directly on settled state.
 if ((original as AcquisitionState).appliedAcquisitionIds?.some(id => id.startsWith(`g3:${requestId}:`))) throw new Error('この操作は完了済みです。結果を確認してください。');
}
function drawUnit(random: () => number) {
 const value = random();
 if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('抽選値が不正です。');
 return value;
}
function choose<T>(entries: [T, number][], random: () => number): T {
 let remaining = drawUnit(random) * entries.reduce((sum, entry) => sum + entry[1], 0);
 for (const [value, weight] of entries) { remaining -= weight; if (remaining < 0) return value; }
 throw new Error('抽選マスターが不正です。');
}
function acquire(state: RedesignState, row: GachaPoolRow, eventId: string): {state: RedesignState; result: GachaResult} {
 const isNew = row.kind === 'character' ? !state.characters.some(c => c.id === row.id) : row.kind === 'skill' ? !state.skills.some(s => s.id === row.id) : true;
 const beforeSouls = state.souls[row.id] ?? 0, beforeMaterials = state.materials.skill;
 const next = applyAcquisitionEvents(state, [{ id: eventId, kind: row.kind, masterId: row.id, instanceId: eventId }], APPROVED_ACQUISITION_MASTER);
 if (!next.appliedAcquisitionIds?.includes(eventId)) throw new Error('獲得内容を確認できません。');
 const conversion: GachaResult['conversion'] = isNew ? undefined : row.kind === 'character' ? {kind:'soul', amount:(next.souls[row.id] ?? 0) - beforeSouls} : {kind:'skill_material', amount:next.materials.skill - beforeMaterials};
 const outcome = row.kind === 'equipment' ? '装備を個体で獲得' : isNew ? '新規獲得' : conversion?.kind === 'soul' ? `固有魂 +${conversion.amount}` : `スキルLB素材 +${conversion?.amount}`;
 return { state: next, result: {...row, isNew, outcome, ...(conversion ? {conversion} : {})} };
}
export function applyGachaDraw(original: RedesignState, payload: GachaDrawPayload, requestId: string, now: number, random: () => number, context: { ticketBalance?: number } = {}): GachaSettlement {
 checkRequest(original, requestId, now);
 const {category, payment, count} = payload;
 checkCategory(category);
 if (count !== 1 && count !== 10) throw new Error('回数が不正です。');
 if (category === 'normal' ? payment !== 'cash' && payment !== 'free' : payment !== 'gems' && payment !== 'ticket') throw new Error('支払方法が不正です。');
 if (payment === 'ticket' && count !== 1) throw new Error('券は1枚で1回召喚できます。');
 const config = GACHA_CATEGORIES[category], rows = gachaPool(category);
 if (payment === 'free' && (count !== 10 || original.dailyNormalGachaDate === jstLoginDate(now))) throw new Error('本日の無料10連は利用済みです。');
 const cost = payment === 'free' ? 0 : payment === 'ticket' ? 1 : config.singleCost * count;
 const balance = payment === 'cash' ? original.cash : payment === 'gems' ? original.diamonds : payment === 'ticket' ? context.ticketBalance : 0;
 if (!Number.isSafeInteger(balance) || (balance ?? -1) < cost) throw new Error(payment === 'cash' ? '銭が不足しています。' : payment === 'ticket' ? '召喚券が不足しています。' : '輝石が不足しています。');
 let state = structuredClone(original);
 if (payment === 'cash') state.cash -= cost;
 if (payment === 'gems') state.diamonds -= cost;
 if (payment === 'free') state.dailyNormalGachaDate = jstLoginDate(now);
 const results: GachaResult[] = [];
 for (let i = 0; i < count; i++) {
  const rarity = choose(rarities.map(r => [r, config.rarityWeights[r]]), random);
  const kind = category === 'normal' ? choose(kinds.map(k => [k, categoryWeight[k]]), random) : category;
  const choices = rows.filter(row => row.kind === kind && row.rarity === rarity);
  const row = choices[Math.floor(drawUnit(random) * choices.length)];
  if (!row) throw new Error('排出対象を確認できません。');
  const acquired = acquire(state, row, `g3:${requestId}:${i}`); state = acquired.state; results.push(acquired.result);
  state = recordMissionEvent(state, {id:`g3:${requestId}:${i}`, counters:category === 'normal' ? ['normal_gacha'] : [], at:now});
 }
 const pointGain = category === 'normal' ? 0 : count;
 if (category !== 'normal') state.gachaPoints = {...state.gachaPoints, [category]: (state.gachaPoints?.[category] ?? 0) + pointGain};
 state = synchronizeHomeBackgroundUnlocks(captureMissionAssets(state));
 return {state, results, cost, pointGain, pointsAfter:category === 'normal' ? 0 : state.gachaPoints?.[category] ?? 0, masterVersion:GACHA_MASTER_VERSION, category, payment, count, ...(payment === 'ticket' ? {ticketId:config.ticketId} : {})};
}
export function applyGachaExchange(original: RedesignState, payload: {category: SpecialGachaCategory; masterId: string}, requestId: string, now: number): GachaSettlement {
 checkRequest(original, requestId, now);
 const {category, masterId} = payload;
 const row = gachaExchangeTargets(category).find(row => row.id === masterId);
 if (!row) throw new Error('交換対象が不正です。');
 const cost = GACHA_CATEGORIES[category].exchangePoints!, balance = original.gachaPoints?.[category] ?? 0;
 if (!Number.isSafeInteger(balance) || balance < cost) throw new Error('交換ポイントが不足しています。');
 const acquired = acquire(original, row, `g3:${requestId}:0`);
 let state = acquired.state;
 state.gachaPoints = {...state.gachaPoints, [category]:balance - cost};
 state = synchronizeHomeBackgroundUnlocks(captureMissionAssets(state));
 return {state, results:[acquired.result], cost, pointGain:0, pointsAfter:balance-cost, masterVersion:GACHA_MASTER_VERSION, category, payment:'points', count:1};
}
