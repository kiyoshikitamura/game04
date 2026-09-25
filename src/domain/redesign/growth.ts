import type { RedesignState, DeckMember, EquipmentSlot, OwnedCharacter, OwnedEquipment, ExpSize } from './types';
import { CHARACTER_MASTERS, OWNABLE_SKILL_MASTERS as SKILL_MASTERS, EQUIPMENT_MASTERS, getSkillSlots } from './masters';
import { GROWTH_VERSION, EXP_SIZES, EXP_VALUES, SOUL_UNLOCK, AWAKENING_SOULS, LB_STEPS, SKILL_LB_FACTORS, EQUIPMENT_LB_FACTORS, DISMANTLE_MATERIALS, cumulativeExp, cumulativeCash, emptyGrowthInventory, type GrowthKind } from './growthMaster';
export const GROWTH_PREVIEW_RULES = { characterLevelCaps: [50, 60, 70, 80, 90, 100], skillMax: 10, equipmentLevelCap: 100, equipmentLbMax: 10 };
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "head", "body", "legs", "accessory1", "accessory2"];
export const getCharacterLevelCap = (awakening: number) => GROWTH_PREVIEW_RULES.characterLevelCaps[Math.max(0, Math.min(5, awakening))];
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
};
export function isEquipmentAssigned(state: RedesignState, id: string) {
  return state.deck.some((m) => Object.values(m.equipment).includes(id));
}
export function equipmentFits(slot: string, masterSlot: string) {
  return slot.startsWith("accessory") ? masterSlot.startsWith("accessory") : slot === masterSlot;
}
export function getUnlockedDeckSlots(state: RedesignState): number {
  const progressSlots = state.clearedStages.includes('mikawa-2') ? 5 : state.clearedStages.includes('mikawa-1') ? 4 : 3;
  return Math.min(5, Math.max(progressSlots, state.deck.length));
}
export function validateDeck(state: RedesignState, deck: DeckMember[]) {
  requireValue(Array.isArray(deck) && deck.length >= 1 && deck.length <= 5, "武将を1〜5人編成してください。");
  requireValue(deck.length <= getUnlockedDeckSlots(state), "編成枠が未解放です。");
  requireValue(new Set(deck.map((m) => m.characterId)).size === deck.length, "同じ武将は編成できません。");
  const usedEquipment = /* @__PURE__ */ new Set<string>();
  for (const member of deck) {
    const owned = state.characters.find((c) => c.id === member.characterId);
    requireValue(owned && owned.level > 0, "未所持の武将です。");
    requireValue(Array.isArray(member.skillIds) && member.skillIds.length <= getSkillSlots(owned.awakening), "スキル枠が不足しています。");
    requireValue(new Set(member.skillIds).size === member.skillIds.length, "同じ武将に同一スキルは装備できません。");
    requireValue(member.skillIds.every((id) => state.skills.some((s) => s.id === id) && SKILL_MASTERS.some((s) => s.id === id)), "未所持のスキルです。");
    requireValue(member.equipment && typeof member.equipment === "object", "装備設定を確認してください。");
    for (const [slot, id] of Object.entries(member.equipment)) {
      requireValue(EQUIPMENT_SLOTS.includes(slot as EquipmentSlot), "装備部位が不正です。");
      const equipment = state.equipment.find((e) => e.instanceId === id);
      const master = EQUIPMENT_MASTERS.find((e) => e.id === equipment?.masterId);
      requireValue(equipment && master && equipmentFits(slot, master.slot), "装備と部位が一致しません。");
      requireValue(!usedEquipment.has(id), "同じ装備を複数の枠へ装備できません。");
      usedEquipment.add(id);
    }
  }
}
const integer = (value: unknown, label: string): number => {
  requireValue(typeof value === "number" && Number.isSafeInteger(value) && value >= 0, `${label}が不正です。`);
  return value;
};
export const getEquipmentLevelCap = (lb: number) => 50 + Math.max(0, Math.min(10, lb)) * 5;
export function quoteLevelGrowth(state: RedesignState, kind: GrowthKind, id: string, items: Partial<Record<ExpSize, number>> = {}) {
  const owned = kind === "character" ? state.characters.find((c) => c.id === id) : state.equipment.find((e) => e.instanceId === id);
  const master = kind === "character" ? CHARACTER_MASTERS.find((c) => c.id === id) : EQUIPMENT_MASTERS.find((e) => e.id === state.equipment.find((o) => o.instanceId === id)?.masterId);
  requireValue(owned && master, "育成対象が見つかりません。");
  const levelBefore = owned.level;
  requireValue(owned.growthVersion === GROWTH_VERSION || levelBefore === 1 && (owned.exp === void 0 || owned.exp === 0), "旧育成データの移行確認待ちです。現在Lv・EXPは保持しています。");
  const levelCap = kind === "character" ? getCharacterLevelCap((owned as OwnedCharacter).awakening) : getEquipmentLevelCap((owned as OwnedEquipment).lb);
  requireValue(levelBefore < levelCap, "解放済みLv上限です。");
  const expBefore = owned.exp ?? 0, threshold = cumulativeExp(kind, master.rarity, levelBefore);
  requireValue(Number.isSafeInteger(expBefore) && expBefore >= threshold && expBefore < cumulativeExp(kind, master.rarity, levelBefore + 1), "Lv・EXPの移行確認が必要です。");
  const inventory = state.growthInventory ?? emptyGrowthInventory();
  const carryBefore = integer(inventory.carryExp[kind], "繰越EXP");
  const room = cumulativeExp(kind, master.rarity, levelCap) - expBefore;
  let applied = Math.min(room, carryBefore), carryAfter = carryBefore - applied;
  const consumedItems = { small: 0, medium: 0, large: 0, xlarge: 0 };
  for (const size of EXP_SIZES) {
    const selected = integer(items[size] ?? 0, "投入個数");
    requireValue(selected <= inventory.expItems[kind][size], "EXPアイテムが不足しています。");
    if (applied >= room) continue;
    const used = Math.min(selected, Math.ceil((room - applied) / EXP_VALUES[size]));
    consumedItems[size] = used;
    const value = used * EXP_VALUES[size];
    requireValue(Number.isSafeInteger(value), "投入個数が大きすぎます。");
    const accepted = Math.min(room - applied, value);
    applied += accepted;
    carryAfter += value - accepted;
  }
  requireValue(applied > 0, "EXPアイテムまたは繰越EXPを選択してください。");
  const expAfter = expBefore + applied;
  let levelAfter = levelBefore;
  while (levelAfter < levelCap && expAfter >= cumulativeExp(kind, master.rarity, levelAfter + 1)) levelAfter++;
  const cash = cumulativeCash(kind, master.rarity, levelAfter) - cumulativeCash(kind, master.rarity, levelBefore);
  return { levelBefore, levelAfter, expBefore, expAfter, cash, consumedItems, carryBefore, carryAfter, levelCap };
}
export function applyGrowthAction(input: RedesignState, action: string, payload: Record<string, unknown>): RedesignState {
  const state = structuredClone(input);
  if (action === "save_deck") {
    validateDeck(state, payload.deck as DeckMember[]);
    state.deck = structuredClone(payload.deck as DeckMember[]);
    return state;
  }
  if (action === "character_level" || action === "equipment_level") {
    const kind = action === "character_level" ? "character" : "equipment";
    const id = String(payload.characterId ?? payload.instanceId ?? "");
    const items = payload.items;
    requireValue(items === void 0 || items !== null && typeof items === "object" && !Array.isArray(items), "EXP個数を確認してください。");
    const quote = quoteLevelGrowth(state, kind, id, (items ?? {}) as Partial<Record<ExpSize, number>>);
    requireValue(state.cash >= quote.cash, "銭が不足しています。選択数を変更してください。");
    const inventory = state.growthInventory ??= emptyGrowthInventory();
    for (const size of EXP_SIZES) inventory.expItems[kind][size] -= quote.consumedItems[size];
    inventory.carryExp[kind] = quote.carryAfter;
    state.cash -= quote.cash;
    const owned = kind === "character" ? state.characters.find((c) => c.id === id) : state.equipment.find((e) => e.instanceId === id);
    requireValue(owned, "育成対象が見つかりません。");
    owned.level = quote.levelAfter;
    owned.exp = quote.expAfter;
    owned.growthVersion = GROWTH_VERSION;
    return state;
  }
  if (["character_unlock", "character_awaken", "soul_exchange", "soul_select"].includes(action)) {
    const id = String(payload.characterId ?? ""), master = CHARACTER_MASTERS.find((c) => c.id === id), owned = state.characters.find((c) => c.id === id);
    requireValue(master, "武将が見つかりません。");
    const rarity = master.rarity;
    const inventory = state.growthInventory ??= emptyGrowthInventory();
    if (action === "character_unlock") {
      requireValue(!owned, "この武将は既に所持しています。");
      const cost = SOUL_UNLOCK[rarity];
      requireValue((state.souls[id] ?? 0) >= cost, "固有魂が不足しています。汎用魂は初回解放に使えません。");
      state.souls[id] -= cost;
      state.characters.push({ id, level: 1, awakening: 0, exp: 0, growthVersion: GROWTH_VERSION });
    } else if (action === "soul_exchange") {
      const amount = integer(payload.amount, "交換数");
      requireValue(amount >= 10 && amount % 2 === 0, "固有魂を10個以上・2個単位で指定してください。");
      requireValue((state.souls[id] ?? 0) >= amount, "固有魂が不足しています。");
      state.souls[id] -= amount;
      inventory.genericSouls[rarity] += amount / 2;
    } else if (action === "soul_select") {
      const amount = integer(payload.amount ?? 1, "選択式アイテム数");
      requireValue(amount > 0 && owned && owned.awakening < 5, "同レアリティの所持・未最大覚醒武将を選択してください。");
      requireValue(inventory.soulSelectors[rarity] >= amount, "選択式アイテムが不足しています。");
      inventory.soulSelectors[rarity] -= amount;
      state.souls[id] = (state.souls[id] ?? 0) + amount * 10;
    } else {
      requireValue(owned && owned.awakening < 5, "未所持または最大覚醒です。");
      const cost = AWAKENING_SOULS[rarity][owned.awakening];
      const specific = integer(payload.specificSouls ?? Math.min(state.souls[id] ?? 0, cost), "固有魂");
      const generic = integer(payload.genericSouls ?? cost - specific, "汎用魂");
      requireValue(specific + generic === cost, "魂の合計必要数が一致しません。");
      requireValue((state.souls[id] ?? 0) >= specific && inventory.genericSouls[rarity] >= generic && state.cash >= cost * 2e3, "魂または銭が不足しています。");
      state.souls[id] = (state.souls[id] ?? 0) - specific;
      inventory.genericSouls[rarity] -= generic;
      state.cash -= cost * 2e3;
      owned.awakening++;
    }
    return state;
  }
  if (action === "skill_level") {
    const owned = state.skills.find((s) => s.id === payload.skillId), master = SKILL_MASTERS.find((s) => s.id === payload.skillId);
    requireValue(owned && master && owned.level < 10, "未所持または最大LBです。");
    const cost = LB_STEPS[owned.level] * SKILL_LB_FACTORS[master.rarity];
    requireValue(state.materials.skill >= cost && state.cash >= cost * 1e3, "スキルLB素材または銭が不足しています。");
    state.materials.skill -= cost;
    state.cash -= cost * 1e3;
    owned.level++;
    return state;
  }
  if (action === "equipment_lb") {
    const owned = state.equipment.find((e) => e.instanceId === payload.instanceId), master = EQUIPMENT_MASTERS.find((e) => e.id === owned?.masterId);
    requireValue(owned && master && owned.lb < 10, "未所持または最大LBです。");
    const cost = LB_STEPS[owned.lb] * EQUIPMENT_LB_FACTORS[master.rarity];
    requireValue(state.materials.equipmentLb >= cost && state.cash >= cost * 500, "装備LB素材または銭が不足しています。");
    state.materials.equipmentLb -= cost;
    state.cash -= cost * 500;
    owned.lb++;
    return state;
  }
  if (action === "equipment_lock") {
    const owned = state.equipment.find((e) => e.instanceId === payload.instanceId);
    requireValue(owned, "装備が見つかりません。");
    requireValue(typeof payload.locked === "boolean", "保護状態を指定してください。");
    owned.locked = payload.locked;
    return state;
  }
  if (action === "equipment_dismantle") {
    const ids = payload.instanceIds;
    requireValue(Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length, "分解する装備を選択してください。");
    let material = 0;
    for (const id of ids) {
      const owned = state.equipment.find((e) => e.instanceId === id), master = EQUIPMENT_MASTERS.find((e) => e.id === owned?.masterId);
      requireValue(owned && master && !owned.locked && !isEquipmentAssigned(state, id), "装備中・ロック中の装備は分解できません。");
      requireValue(owned.level === 1 && owned.lb === 0 && !(owned.exp ?? 0) || payload.confirmTrained === true, "育成済み装備の分解確認が必要です。投入資源は返還されません。");
      material += DISMANTLE_MATERIALS[master.rarity];
    }
    state.equipment = state.equipment.filter((e) => !ids.includes(e.instanceId));
    state.materials.equipmentLb += material;
    return state;
  }
  throw new Error("対応していない育成操作です。");
}

export function autoEquipSkills(state: RedesignState): DeckMember[] {
  const masters = new Map(SKILL_MASTERS.map(master => [master.id, master]));
  // Preserve unresolved retained assets in inventory without selecting an invalid deck.
  const skills = state.skills.filter(skill => masters.has(skill.id)).sort((a, b) =>
    b.level - a.level || masters.get(b.id)!.spCost - masters.get(a.id)!.spCost);
  return state.deck.map(member => ({ ...member,
    skillIds: skills.slice(0, getSkillSlots(state.characters.find(character => character.id === member.characterId)?.awakening ?? 0)).map(skill => skill.id),
  }));
}
export function autoEquipEquipment(state: RedesignState): DeckMember[] {
  const masters = new Map(EQUIPMENT_MASTERS.map(master => [master.id, master]));
  const candidates = state.equipment.filter(item => masters.has(item.masterId));
  const used = new Set<string>();
  return state.deck.map(member => {
    const equipment: DeckMember['equipment'] = {};
    for (const slot of EQUIPMENT_SLOTS) {
      const best = candidates.filter(item => !used.has(item.instanceId) && equipmentFits(slot, masters.get(item.masterId)!.slot))
        .sort((a, b) => b.level - a.level || b.lb - a.lb)[0];
      if (best) { equipment[slot] = best.instanceId; used.add(best.instanceId); }
    }
    return { ...member, equipment };
  });
}


export const SLOT_LABELS: Record<EquipmentSlot,string> = {weapon:"武器",head:"頭",body:"身体",legs:"脚",accessory1:"アクセ1",accessory2:"アクセ2"};
export type GrowthAction = "save_deck" | "character_level" | "character_awaken" | "character_unlock" | "soul_exchange" | "soul_select" | "skill_level" | "equipment_level" | "equipment_lb" | "equipment_dismantle" | "equipment_lock";
