import type { RedesignState } from './types';
import { CHARACTER_MASTERS, getSkillSlots, getCharacterStats, getEquipmentStats, EQUIPMENT_MASTERS } from './masters';
import { getCharacterPassive } from './balanceV2Masters';
import { getCharacterLevelCap, getEquipmentLevelCap } from './growth';
import { emptyGrowthInventory } from './growthMaster';

export interface GrowthResultRow { label: string; before: string | number; after: string | number }
export interface GrowthResult { title: string; rows: GrowthResultRow[]; changed: boolean }
/** 成功応答として受け取った状態同士の実差分。見込み値を結果に流用しない。 */
export function getGrowthResult(before: RedesignState, after: RedesignState, action: string, payload: Record<string, unknown>): GrowthResult {
  const rows: GrowthResultRow[] = [];
  const add = (label: string, a: string | number, b: string | number, showUnchanged = false) => { if (a !== b || showUnchanged) rows.push({ label, before: a, after: b }); };
  const titles: Record<string, string> = { character_level: '武将育成結果', character_awaken: '覚醒結果', character_unlock: '魂解放結果', soul_exchange: '魂交換結果', soul_select: '魂獲得結果', skill_level: 'スキルLB結果', equipment_level: '装備育成結果', equipment_lb: '装備LB結果', equipment_lock: '保護設定結果', equipment_dismantle: '装備分解結果', save_deck: '編成保存結果' };
  const aInventory = before.growthInventory ?? emptyGrowthInventory(), bInventory = after.growthInventory ?? emptyGrowthInventory();
  add('銭', before.cash, after.cash);
  const id = String(payload.characterId ?? '');
  const ca = before.characters.find(c => c.id === id), cb = after.characters.find(c => c.id === id);
  if (cb) {
    add('Lv', ca?.level ?? 0, cb.level, action === 'character_awaken');
    if (ca?.exp !== undefined && cb.exp !== undefined) add('累計EXP', ca.exp, cb.exp);
    add('覚醒', ca?.awakening ?? 0, cb.awakening);
    add('Lv上限', ca ? getCharacterLevelCap(ca.awakening) : 0, getCharacterLevelCap(cb.awakening));
    add('スキル枠', ca ? getSkillSlots(ca.awakening) : 0, getSkillSlots(cb.awakening));
    const master = CHARACTER_MASTERS.find(c => c.id === id);
    if (master && ca) {
      const pa = getCharacterPassive(master, ca.awakening), pb = getCharacterPassive(master, cb.awakening);
      if (pa && pb) add(pa.name, `${pa.percent.toFixed(2)}%`, `${pb.percent.toFixed(2)}%`);
      const a = getCharacterStats(master, ca.level, ca.awakening), b = getCharacterStats(master, cb.level, cb.awakening);
      for (const stat of ['hp', 'atk', 'def', 'luk'] as const) add(stat.toUpperCase(), Math.floor(a[stat]), Math.floor(b[stat]));
    }
  }
  if (id) {
    add('固有魂', before.souls[id] ?? 0, after.souls[id] ?? 0);
    const rarity = CHARACTER_MASTERS.find(c => c.id === id)?.rarity;
    if (rarity) { add('汎用魂', aInventory.genericSouls[rarity], bInventory.genericSouls[rarity]); add('魂選択券', aInventory.soulSelectors[rarity], bInventory.soulSelectors[rarity]); }
  }
  const sa = before.skills.find(s => s.id === payload.skillId), sb = after.skills.find(s => s.id === payload.skillId);
  if (sa && sb) add('LB', sa.level, sb.level);
  const ea = before.equipment.find(e => e.instanceId === payload.instanceId), eb = after.equipment.find(e => e.instanceId === payload.instanceId);
  if (ea && eb) {
    add('Lv', ea.level, eb.level, action === 'equipment_lb');
    if (ea.exp !== undefined && eb.exp !== undefined) add('累計EXP', ea.exp, eb.exp);
    add('LB', ea.lb, eb.lb); add('Lv上限', getEquipmentLevelCap(ea.lb), getEquipmentLevelCap(eb.lb));
    add('保護', ea.locked ? '保護中' : '未保護', eb.locked ? '保護中' : '未保護');
    const master = EQUIPMENT_MASTERS.find(e => e.id === eb.masterId);
    if (master) {
      const a = getEquipmentStats(master, ea.level, ea.lb), b = getEquipmentStats(master, eb.level, eb.lb);
      for (const stat of ['hp', 'atk', 'def', 'luk'] as const) add(stat.toUpperCase(), Math.floor(a[stat]), Math.floor(b[stat]));
    }
  }
  add('スキルLB素材', before.materials.skill, after.materials.skill);
  add('装備LB素材', before.materials.equipmentLb, after.materials.equipmentLb);
  for (const kind of ['character', 'equipment'] as const) {
    const prefix = kind === 'character' ? '武将' : '装備';
    add(`${prefix}繰越EXP`, aInventory.carryExp[kind], bInventory.carryExp[kind]);
    for (const [size, label] of [['small', '小'], ['medium', '中'], ['large', '大'], ['xlarge', '特大']] as const) add(`${prefix}EXP素材・${label}`, aInventory.expItems[kind][size], bInventory.expItems[kind][size]);
  }
  if (action === 'equipment_dismantle') add('装備所持数', before.equipment.length, after.equipment.length);
  if (action === 'save_deck' && JSON.stringify(before.deck) !== JSON.stringify(after.deck)) rows.push({ label: '編成', before: '変更前', after: '保存済み' });
  return { title: titles[action] ?? '操作結果', rows, changed: rows.some(row => row.before !== row.after) };
}
