import type { DeckMember, RedesignState } from './types';
import { EQUIPMENT_MASTERS, getSkillSlots } from './masters';
import { EQUIPMENT_SLOTS, equipmentFits, getUnlockedDeckSlots, validateDeck } from './growth';
export const EARLY_RECOMMENDED_SKILLS: Record<string,string> = {char_joe_01:'SKD003',char_daimon_01:'SKD019',char_aoi_01:'SKD039',char_jihoon_01:'SKD009',char_yuki_01:'SKD035'};
export function earlyLoadoutPlan(state: RedesignState): DeckMember[] {
 const starters=Object.keys(EARLY_RECOMMENDED_SKILLS);
 const owned=state.characters.filter(c=>c.level>0);
 // Retain investments, including a trained non-starter outside the current party.
 const trained=owned.filter(c=>!starters.includes(c.id)&&(c.level>1||c.awakening>0)).sort((a,b)=>b.awakening-a.awakening||b.level-a.level||a.id.localeCompare(b.id));
 const ids=[...new Set([...trained.map(c=>c.id),...state.deck.filter(m=>!starters.includes(m.characterId)).map(m=>m.characterId),...starters,...state.deck.map(m=>m.characterId)])].filter(id=>owned.some(c=>c.id===id)).slice(0,getUnlockedDeckSlots(state));
 const used=new Set<string>();
 const deck=ids.map(characterId=>{
  const old=state.deck.find(m=>m.characterId===characterId),c=owned.find(c=>c.id===characterId)!;
  const preferred=EARLY_RECOMMENDED_SKILLS[characterId];
  const skillIds=[...new Set([...(preferred&&state.skills.some(s=>s.id===preferred)?[preferred]:[]),...(old?.skillIds??[])])].filter(id=>state.skills.some(s=>s.id===id)).slice(0,getSkillSlots(c.awakening));
  const equipment:DeckMember['equipment']={};
  for(const slot of EQUIPMENT_SLOTS){const id=old?.equipment[slot],e=state.equipment.find(e=>e.instanceId===id),m=EQUIPMENT_MASTERS.find(m=>m.id===e?.masterId);if(id&&m&&equipmentFits(slot,m.slot)&&!used.has(id)){equipment[slot]=id;used.add(id);}}
  return {characterId,skillIds,equipment};
 });
 for(const member of deck)for(const slot of EQUIPMENT_SLOTS)if(!member.equipment[slot]){
  const equipment=state.equipment.filter(e=>!used.has(e.instanceId)&&EQUIPMENT_MASTERS.some(m=>m.id===e.masterId&&equipmentFits(slot,m.slot))).sort((a,b)=>b.level-a.level||b.lb-a.lb||a.instanceId.localeCompare(b.instanceId))[0];
  if(equipment){member.equipment[slot]=equipment.instanceId;used.add(equipment.instanceId);}
 }
 validateDeck(state,deck);return deck;
}
/** In-guide actions use the same role map; do not auto-level, awaken, LB or spend assets. */
export function earlyGuideDeck(state: RedesignState, action:'join-maeda'|'equip-iwadan'): DeckMember[] {
 const deck=structuredClone(state.deck),id='char_jihoon_01';
 if(!state.characters.some(c=>c.id===id))throw Error('前田利家の加入を確認できません。再読み込みしてください。');
 if(action==='join-maeda') {
  if(!deck.some(m=>m.characterId===id)){
   if(deck.length>=getUnlockedDeckSlots(state))throw Error('編成が更新されています。部隊の空き枠を確認してください。');
   deck.push({characterId:id,skillIds:[],equipment:{}});
  }
 }else{
  const member=deck.find(m=>m.characterId===id),skill=EARLY_RECOMMENDED_SKILLS[id];
  if(!member||!state.skills.some(s=>s.id===skill))throw Error('前田利家と岩断の所持・編成を確認してください。');
  member.skillIds=[skill,...member.skillIds.filter(s=>s!==skill)].slice(0,getSkillSlots(state.characters.find(c=>c.id===id)!.awakening));
 }
 validateDeck(state,deck);return deck;
}
