import { CHARACTER_MASTERS, SKILL_MASTERS, EQUIPMENT_MASTERS } from './masters';
import { applyAcquisitionEvents, type AcquisitionMaster } from './acquisitions';
import type { RedesignState, Rarity } from './types';
export type NormalKind = 'CHARACTER' | 'SKILL' | 'EQUIPMENT';
export interface NormalPoolRow { gacha_id: string; item_id: string; item_type: NormalKind; rarity: Rarity; }
export interface NormalGachaResult { id: string; kind: 'character' | 'skill' | 'equipment'; rarity: Rarity; name: string; image?: string; outcome: string; }
export const NORMAL_GACHA_MASTER: { version: string; singleCost: number; dailyFreeCount: number; buckets: [Rarity, NormalKind, number][] } = {
  version: "GROWTH_FIXED_20260921",
  singleCost: 1e3,
  dailyFreeCount: 10,
  // Existing daily contract: Asia/Tokyo midnight. Within-rarity pool rows remain uniform.
  buckets: [
    ["N", "CHARACTER", 980],
    ["N", "SKILL", 1470],
    ["N", "EQUIPMENT", 2450],
    ["R", "CHARACTER", 800],
    ["R", "SKILL", 1200],
    ["R", "EQUIPMENT", 2e3],
    ["SR", "CHARACTER", 200],
    ["SR", "SKILL", 300],
    ["SR", "EQUIPMENT", 500],
    ["SSR", "CHARACTER", 20],
    ["SSR", "SKILL", 30],
    ["SSR", "EQUIPMENT", 50]
  ]
};
const sources = { CHARACTER: "CHAR_NORMAL", SKILL: "SKILL_NORMAL", EQUIPMENT: "EQUIP_NORMAL" };
const masters = { CHARACTER: CHARACTER_MASTERS, SKILL: SKILL_MASTERS, EQUIPMENT: EQUIPMENT_MASTERS };
export function normalGachaDay(now: number) {
  return new Date(now + 9 * 36e5).toISOString().slice(0, 10);
}
export function normalGachaPool(pool: NormalPoolRow[]): NormalPoolRow[] {
  const rows = pool.filter((row) => sources[row.item_type] === row.gacha_id).map((row) => {
    const group = masters[row.item_type];
    const master = group?.find((item) => item.id === row.item_id);
    if (!master) throw new Error("\u6392\u51FA\u5BFE\u8C61\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
    return { ...row, rarity: master.rarity };
  });
  for (const [rarity, kind] of NORMAL_GACHA_MASTER.buckets) {
    const bucket = rows.filter((row) => row.rarity === rarity && row.item_type === kind);
    if (!bucket.length || bucket.some((row) => !masters[kind].some((master) => master.id === row.item_id))) throw new Error("\u6392\u51FA\u5BFE\u8C61\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
  }
  return rows;
}
export function applyNormalGacha(original: RedesignState, payload: {count: number; currency: string}, pool: NormalPoolRow[], requestId: string, now: number, policy: AcquisitionMaster, random: () => number) {
  const count = payload.count;
  if (count !== 1 && count !== 10) throw new Error("\u56DE\u6570\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  if (payload.currency !== "CASH" && payload.currency !== "FREE") throw new Error("\u652F\u6255\u65B9\u6CD5\u304C\u4E0D\u6B63\u3067\u3059\u3002");
  const rows = normalGachaPool(pool);
  const free = payload.currency === "FREE";
  let state = structuredClone(original);
  if (free && (count !== 10 || state.dailyNormalGachaDate === normalGachaDay(now))) throw new Error("\u672C\u65E5\u306E\u7121\u659910\u9023\u306F\u5229\u7528\u6E08\u307F\u3067\u3059\u3002");
  const cost = free ? 0 : NORMAL_GACHA_MASTER.singleCost * count;
  if (state.cash < cost) throw new Error("\u92AD\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059\u3002");
  state.cash -= cost;
  if (free) state.dailyNormalGachaDate = normalGachaDay(now);
  const results: NormalGachaResult[] = [];
  const draw = () => {
    const value = random();
    if (!(value >= 0 && value < 1)) throw new Error("\u62BD\u9078\u5024\u304C\u4E0D\u6B63\u3067\u3059\u3002");
    return value;
  };
  for (let i = 0; i < count; i++) {
    let roll = draw() * 1e4;
    const bucket = NORMAL_GACHA_MASTER.buckets.find((b) => {
      roll -= b[2];
      return roll < 0;
    });
    if (!bucket) throw new Error("抽選マスターが不正です。");
    const choices = rows.filter((row2) => row2.rarity === bucket[0] && row2.item_type === bucket[1]);
    const row = choices[Math.floor(draw() * choices.length)];
    const master = masters[bucket[1]].find((m) => m.id === row.item_id);
    if (!master) throw new Error("排出対象を確認できません。");
    const kind = bucket[1].toLowerCase() as NormalGachaResult["kind"];
    const beforeSouls = state.souls[row.item_id] ?? 0, beforeMaterial = state.materials.skill;
    const existed = kind === "character" ? state.characters.some((c) => c.id === row.item_id) : kind === "skill" ? state.skills.some((s) => s.id === row.item_id) : false;
    const eventId = `normal_gacha:${requestId}:${i}`;
    const acquired = applyAcquisitionEvents(state, [{ id: eventId, kind, masterId: row.item_id, instanceId: eventId }], policy);
    state = acquired;
    if (!acquired.appliedAcquisitionIds?.includes(eventId)) throw new Error("\u7372\u5F97\u8CC7\u7523\u306E\u63A5\u7D9A\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u6D88\u8CBB\u306F\u884C\u3044\u307E\u305B\u3093\u3002");
    results.push({
      id: row.item_id,
      kind,
      rarity: row.rarity,
      name: master.name,
      image: master.image,
      outcome: kind === "equipment" ? "\u88C5\u5099\u3092\u500B\u4F53\u3067\u7372\u5F97" : !existed ? "\u65B0\u898F\u7372\u5F97" : kind === "character" ? `\u56FA\u6709\u9B42 +${state.souls[row.item_id] - beforeSouls}` : `\u30B9\u30AD\u30EBLB\u7D20\u6750 +${state.materials.skill - beforeMaterial}`
    });
  }
  return { state, results, cost, masterVersion: NORMAL_GACHA_MASTER.version };
}


export function normalGachaRates(pool: NormalPoolRow[]) {
 const rows = normalGachaPool(pool);
 return rows.map(row => {
  const bucket = NORMAL_GACHA_MASTER.buckets.find(([rarity, kind]) => rarity === row.rarity && kind === row.item_type)!;
  const count = rows.filter(other => other.rarity === row.rarity && other.item_type === row.item_type).length;
  const master = masters[row.item_type].find(item => item.id === row.item_id)!;
  return {...row, name: master.name, probability: bucket[2] / 100 / count};
 });
}
