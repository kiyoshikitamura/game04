import type { DeckMember, EquipmentSlot, RedesignState } from './types';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS, SKILL_MASTERS, getSkillSlots } from './masters';

/** Development balance only: replace after Economy approval, not a commercial authority. */
export const GROWTH_PREVIEW_RULES = {
  characterLevelCaps: [30, 40, 50, 60, 80, 100], characterCash: 100, characterMaterial: 1,
  awakeningSouls: [10, 20, 30, 40, 50], unlockSouls: 20, skillMax: 10, skillMaterial: 1,
  equipmentLevelCap: 100, equipmentLbMax: 10, equipmentCash: 50, equipmentMaterial: 1,
  equipmentLbMaterial: 1, dismantleCash: 50, dismantleLbMaterial: 1,
} as const;
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon', 'head', 'body', 'legs', 'accessory1', 'accessory2'];
export const SLOT_LABELS: Record<EquipmentSlot, string> = {weapon:'武器',head:'頭',body:'身体',legs:'脚',accessory1:'アクセ1',accessory2:'アクセ2'};
export type GrowthAction = 'save_deck'|'character_level'|'character_awaken'|'character_unlock'|'skill_level'|'equipment_level'|'equipment_lb'|'equipment_dismantle';
export const getCharacterLevelCap = (awakening: number) => GROWTH_PREVIEW_RULES.characterLevelCaps[Math.max(0, Math.min(5, awakening))];
const requireValue = (condition: unknown, message: string): void => { if (!condition) throw new Error(message); };
export function isEquipmentAssigned(state: RedesignState, id: string) { return state.deck.some(m => Object.values(m.equipment).includes(id)); }
export function equipmentFits(slot: EquipmentSlot, masterSlot: EquipmentSlot) { return slot.startsWith('accessory') ? masterSlot.startsWith('accessory') : slot === masterSlot; }
export function validateDeck(state: RedesignState, deck: DeckMember[]) {
  requireValue(Array.isArray(deck) && deck.length === 5, '武将を5人編成してください。');
  requireValue(new Set(deck.map(m=>m.characterId)).size === deck.length, '同じ武将は編成できません。');
  const usedEquipment = new Set<string>();
  for (const member of deck) {
    const owned = state.characters.find(c=>c.id===member.characterId);
    requireValue(owned && owned.level>0, '未所持の武将です。');
    requireValue(Array.isArray(member.skillIds) && member.skillIds.length <= getSkillSlots(owned!.awakening), 'スキル枠が不足しています。');
    requireValue(new Set(member.skillIds).size===member.skillIds.length, '同じ武将に同一スキルは装備できません。');
    requireValue(member.skillIds.every(id=>state.skills.some(s=>s.id===id)), '未所持のスキルです。');
    requireValue(member.equipment && typeof member.equipment === 'object', '装備設定を確認してください。');
    for (const [slot,id] of Object.entries(member.equipment)) {
      requireValue(EQUIPMENT_SLOTS.includes(slot as EquipmentSlot), '装備部位が不正です。');
      const equipment = state.equipment.find(e=>e.instanceId===id);
      const master = EQUIPMENT_MASTERS.find(e=>e.id===equipment?.masterId);
      requireValue(equipment && master && equipmentFits(slot as EquipmentSlot, master.slot), '装備と部位が一致しません。');
      requireValue(!usedEquipment.has(id), '同じ装備を複数の枠へ装備できません。'); usedEquipment.add(id);
    }
  }
}
export function applyGrowthAction(input: RedesignState, action: string, payload: Record<string, unknown>): RedesignState {
  const state = structuredClone(input);
  const rules=GROWTH_PREVIEW_RULES;
  if(action==='save_deck') { validateDeck(state,payload.deck as DeckMember[]); state.deck=structuredClone(payload.deck as DeckMember[]); return state; }
  if(action==='character_unlock') {
    const id=String(payload.characterId??'');
    requireValue(CHARACTER_MASTERS.some(c=>c.id===id),'武将が見つかりません。');
    const owned=state.characters.find(c=>c.id===id);
    requireValue(!owned,'この武将は既に所持しています。');
    requireValue((state.souls[id]??0)>=rules.unlockSouls,'武将の魂が不足しています。');
    state.souls[id]-=rules.unlockSouls; state.characters.push({id,level:1,awakening:0}); return state;
  }
  if(action==='character_level'||action==='character_awaken') {
    const owned=state.characters.find(c=>c.id===payload.characterId && c.level>0); requireValue(owned,'武将が見つかりません。');
    if(action==='character_level') { requireValue(owned!.level<getCharacterLevelCap(owned!.awakening),'Lv上限です。覚醒で上限を解放できます。'); requireValue(state.cash>=rules.characterCash && state.materials.character>=rules.characterMaterial,'銭または武将育成素材が不足しています。'); state.cash-=rules.characterCash;state.materials.character-=rules.characterMaterial;owned!.level++; }
    else { requireValue(owned!.awakening<5,'覚醒は最大です。'); const cost=rules.awakeningSouls[owned!.awakening]; requireValue((state.souls[owned!.id]??0)>=cost,'武将の魂が不足しています。'); state.souls[owned!.id]-=cost;owned!.awakening++; }
    return state;
  }
  if(action==='skill_level') { const skill=state.skills.find(s=>s.id===payload.skillId); requireValue(skill,'スキルが見つかりません。');requireValue(skill!.level<rules.skillMax,'スキルは最大Lvです。');requireValue(state.materials.skill>=rules.skillMaterial,'スキルLB素材が不足しています。');state.materials.skill-=rules.skillMaterial;skill!.level++;return state; }
  if(action==='equipment_level'||action==='equipment_lb') { const equipment=state.equipment.find(e=>e.instanceId===payload.instanceId);requireValue(equipment,'装備が見つかりません。');
    if(action==='equipment_level') { requireValue(equipment!.level<rules.equipmentLevelCap,'装備は最大Lvです。');requireValue(state.cash>=rules.equipmentCash && state.materials.equipment>=rules.equipmentMaterial,'銭または装備育成素材が不足しています。');state.cash-=rules.equipmentCash;state.materials.equipment-=rules.equipmentMaterial;equipment!.level++; }
    else {requireValue(equipment!.lb<rules.equipmentLbMax,'装備LBは最大です。');requireValue(state.materials.equipmentLb>=rules.equipmentLbMaterial,'装備LB素材が不足しています。');state.materials.equipmentLb-=rules.equipmentLbMaterial;equipment!.lb++;} return state;
  }
  if(action==='equipment_dismantle') { const ids=payload.instanceIds;requireValue(Array.isArray(ids)&&ids.length>0 && new Set(ids).size===ids.length,'分解する装備を選択してください。');for(const id of ids as string[]) {const equipment=state.equipment.find(e=>e.instanceId===id);requireValue(equipment && !equipment.locked && !isEquipmentAssigned(state,id),'装備中・ロック中の装備は分解できません。');} const count=(ids as string[]).length;state.equipment=state.equipment.filter(e=>!(ids as string[]).includes(e.instanceId));state.cash+=rules.dismantleCash*count;state.materials.equipmentLb+=rules.dismantleLbMaterial*count;return state; }
  throw new Error('対応していない育成操作です。');
}
export function autoEquipSkills(state:RedesignState): DeckMember[] { const skills=[...state.skills].sort((a,b)=>b.level-a.level || (SKILL_MASTERS.find(s=>s.id===b.id)?.spCost??0)-(SKILL_MASTERS.find(s=>s.id===a.id)?.spCost??0));return state.deck.map(m=>({...m,skillIds:skills.slice(0,getSkillSlots(state.characters.find(c=>c.id===m.characterId)?.awakening??0)).map(s=>s.id)})); }
export function autoEquipEquipment(state:RedesignState):DeckMember[] { const used=new Set<string>(); return state.deck.map(m=>{const equipment:DeckMember['equipment']={}; for(const slot of EQUIPMENT_SLOTS){const best=[...state.equipment].filter(e=>!used.has(e.instanceId)&&equipmentFits(slot,EQUIPMENT_MASTERS.find(master=>master.id===e.masterId)?.slot??'weapon')).sort((a,b)=>b.level-a.level||b.lb-a.lb)[0];if(best){equipment[slot]=best.instanceId;used.add(best.instanceId);}}return {...m,equipment};}); }
