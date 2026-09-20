import type { BattleInput, BattleUnit, EnemyUnit, SkillMaster } from '@/domain/redesign/types';
import { BATTLE_RULES, CHARACTER_MASTERS, LEGACY_BATTLE_RULES } from '@/domain/redesign/masters';

/** Synthetic acceptance data only. Never added to playable/reward masters. */
export function commonBattleFixture(scenario: string): BattleInput {
  const portrait = CHARACTER_MASTERS[0].image;
  const skill = (id: string, effects: SkillMaster['effects'], spCost = 40, target: SkillMaster['target'] = 'first'): SkillMaster => ({ id, name: `検証用 ${id}`, image: '/menu/event_banner_placeholder.png', rarity: 'N', element: 'fire', spCost, condition: { type: 'always' }, target, effects, description: '動作確認専用の仮倍率・仮消費SPです。正式バランスには使用しません。' });
  const attack = skill('攻撃', [{ type: 'damage', power: 160, displayHits: 3 }]);
  const heal = skill('回復', [{ type: 'heal', power: 80, healingFormula: 'caster_atk_percent' }], 25, 'lowest_ally');
  const buff = skill('強化', [{ type: 'atk_up', power: 25, duration: 3 }], 30, 'all_allies');
  const party: BattleUnit[] = CHARACTER_MASTERS.slice(0, 5).map((character, index) => ({
    id: `qa-player-${index}`, name: character.name, image: character.image, level: 1, element: character.element,
    stats: { hp: 1000, sp: 60, atk: 100, def: 20, luk: 100 }, skills: index === 0 ? [heal, buff, attack] : [attack], passives: [],
  }));
  const enemy: EnemyUnit = { id: 'qa-enemy', name: '検証用の敵', image: portrait, level: 1, element: 'wind', stats: { hp: 7500, sp: 40, atk: 60, def: 20, luk: 0 }, skills: [skill('敵攻撃', [{ type: 'damage', power: 100 }], 20)], passives: [], actionCount: 3, order: 0, hitSpGain: 5 };
  if (scenario === 'limit') {
    for (const unit of party) { unit.stats.hp = 100000; unit.skills = []; }
    enemy.stats = { hp: 1000000, sp: 1, atk: 1, def: 100000, luk: 0 }; enemy.skills = []; enemy.actionCount = 100;
  }
  if (scenario === 'interrupt') {
    enemy.actionCount = 1; enemy.skills = [skill('敵行動不能', [{ type: 'stun', power: 0, chance: 1 }], 20)];
  }
  const waves = scenario === 'waves' ? [[{ ...enemy, stats: { ...enemy.stats, hp: 3000 } }], [{ ...enemy, id: 'qa-enemy-wave2', stats: { ...enemy.stats, hp: 3000 } }]] : [[enemy]];
  return { seed: 7, party, waves, rules: scenario === 'legacy' ? LEGACY_BATTLE_RULES : BATTLE_RULES };
}
