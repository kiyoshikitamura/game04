import equipment from './data/formal-growth-equipment.json';
import assets from '../../../config/game04-master-assets.json';
import names from '../../theme/sengoku-masters.json';
import skillValues from './data/raid-skill-values.json';
import type { EquipmentMaster, EquipmentSlot, Rarity, Stats } from './types';

const slots: Record<string, EquipmentSlot> = { WEAPON: 'weapon', HEAD: 'head', BODY: 'body', LEGS: 'legs', ACCESSORY: 'accessory1' };
export function getFormalEquipmentStats(id: string, level: number): Stats {
  if (!Number.isInteger(level) || level < 1 || level > 100) throw new Error('装備Lvが不正です。');
  const row = equipment.equipment.find((e) => e.id === id);
  if (!row) throw new Error('正式装備が見つかりません。');
  const factor = 0.03 + 0.97 * ((level - 1) / 99) ** 1.5;
  return { hp: row.level100.hp * factor, atk: row.level100.atk * factor, def: row.level100.def * factor, luk: row.level100.luk * factor, sp: 0 };
}
export const FORMAL_GROWTH_EQUIPMENT_MASTERS: EquipmentMaster[] = equipment.equipment.map((row) => {
  const asset = assets.assets.find((a) => a.id === row.id);
  if (!asset || !slots[row.slot]) throw new Error(`正式装備の素材・部位がありません: ${row.id}`);
  return { id: row.id, rarity: row.rarity as Rarity, slot: slots[row.slot], name: (names as Record<string, string>)[row.id] ?? row.id, image: asset.path, stats: getFormalEquipmentStats(row.id, 1) };
});
export const FORMAL_GROWTH_SKILL_IDS = skillValues.filter((row) => row.lb === 0).map((row) => row.design_id);
