import type { BattleInput, EnemyUnit, SkillMaster } from '@/domain/redesign/types';
import { BATTLE_RULES, CHARACTER_MASTERS, getCharacterPassive, getBalanceV2Skill } from '@/domain/redesign/masters';

export const SCENARIOS = { mixed: '単体・全体・回復・保護・妨害・解除', counter: '被弾誘導・反撃・シールド', periodic: '継続効果・回復・解除' };
/** Isolated synthetic data. No ownership, reward, gacha or production master mutations. */
export function additionsBattleFixture(designId: string, lb: number, scenario: string, firstTargetMode: 'fixed' | 'default' = 'fixed'): BattleInput {
  const skill = (id: number): SkillMaster => getBalanceV2Skill(`SKD${String(id).padStart(3,'0')}`, lb, {firstTargetMode})!;
  const selected = getBalanceV2Skill(designId, lb, {firstTargetMode})!;
  const decks = scenario === 'counter' ? [[48,49,45],[69,46,7],[19],[39,43],[52,71,32]] : scenario === 'periodic' ? [[29,30],[58],[43,39],[54,70],[71,19]] : [[7,29],[19,38],[39,43],[45,50],[71,32]];
  const characters = CHARACTER_MASTERS.filter(character => character.rarity !== 'N').slice(0,5);
  const party = characters.map((character,index) => ({ id: `qa-v2-${index}`, name: character.name, image: character.image, level: 50, element: character.element, stats: {hp: 1800,sp: 60,atk: 180,def: 30,luk: 60}, skills: index === 0 ? [selected, ...decks[index].map(skill).filter(s=>s.id!==selected.id)].slice(0,3) : decks[index].map(skill), passives: [getCharacterPassive(character,3)].filter((p): p is NonNullable<typeof p>=>!!p) }));
  const enemy = (index: number): EnemyUnit => ({id:`qa-v2-enemy-${index}`,name:`検証敵 ${index+1}`,image:characters[index].image,level:1,element:index===0?'earth':'water',stats:{hp:index===0?5500:3000,sp:200,atk:180,def:20,luk:0},skills:index===0?[skill(35),skill(29),skill(7)]:index===1?[skill(47),skill(58),skill(19)]:[skill(63),skill(32),skill(7)],passives:[],actionCount:4+index,order:index,hitSpGain:5});
  return { seed: 20260920, party, waves: [[enemy(0),enemy(1),enemy(2)]], rules: BATTLE_RULES };
}
