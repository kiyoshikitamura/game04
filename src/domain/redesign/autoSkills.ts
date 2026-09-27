import { buildBattleParty, getOwnedSkillMaster, getSkillSlots } from './masters';
import type { BattleUnit, DeckMember, Rarity, RedesignState, SkillMaster } from './types';

const rarityRank: Record<Rarity, number> = { N: 0, R: 1, SR: 2, SSR: 3 };

/** Selection preferences only: never used by battle calculations or manual equipment. */
export function evaluateAutoSkill(skill: SkillMaster, lb: number, unit: BattleUnit) {
  const attack = skill.effects.some(effect => effect.type === 'damage');
  const types = new Set(skill.effects.map(effect => effect.type));
  const areaAttack = skill.effects.some(effect => effect.type === 'damage' && (effect.target ?? skill.target) === 'all_enemies');
  const passiveMatch = unit.passives.some(passive =>
    (passive.type === 'P06' && attack && !areaAttack) ||
    (passive.type === 'P07' && areaAttack) ||
    (passive.type === 'P10' && types.has('heal')) ||
    (passive.type === 'P12' && types.has('shield')) ||
    (passive.type === 'P13' && types.has('counter')));
  // Bounded utility estimates allow comparison of unlike effects; these are not damage forecasts.
  const effects = skill.effects.reduce((total, effect) => {
    const area = ['all_enemies', 'all_allies'].includes(effect.target ?? skill.target) ? 1.5 : 1;
    const magnitude = Math.min(60, Math.max(0, effect.power) * 0.3);
    return total + (10 + magnitude + Math.min(3, effect.duration ?? 0) * 2) * area * (effect.chance ?? 1);
  }, 0);
  const casterAtk = attack || skill.effects.some(effect => effect.healingFormula === 'caster_atk_percent');
  const compatibility = (skill.element === unit.element ? 12 : 0) + (passiveMatch ? 20 : 0)
    + (casterAtk ? Math.min(20, unit.stats.atk / 100) : 0);
  const growth = Math.max(0, lb) * 3;
  const rarity = rarityRank[skill.rarity];
  const availability = skill.condition.type === 'always' ? 8 : 0;
  return { attack, effects, compatibility, growth, rarity, availability,
    score: effects + compatibility + growth + rarity * 6 + availability };
}

export interface AutoSkillChoice {
  characterId: string;
  skillId: string;
  slot: number;
  duplicateFallback: boolean;
  evaluation: ReturnType<typeof evaluateAutoSkill>;
}

export function planAutoSkills(state: RedesignState): { deck: DeckMember[]; choices: AutoSkillChoice[] } {
  const deck = state.deck.map(member => ({ ...member, skillIds: [] as string[] }));
  const units = buildBattleParty({ ...state, deck });
  const slots = deck.map(member => getSkillSlots(state.characters.find(owned => owned.id === member.characterId)?.awakening ?? 0));
  // Ownership is a reusable skill kind + LB, not a consumable equipment instance.
  // Use the first owned record, just like battle playback, even for retained duplicate records.
  const seen = new Set<string>();
  const candidates = state.skills.flatMap(owned => {
    if (seen.has(owned.id)) return [];
    seen.add(owned.id);
    const master = getOwnedSkillMaster(owned.id, owned.level);
    return master ? [{ id: master.id, master, lb: owned.level }] : [];
  });
  const evaluations = units.map(unit => new Map(candidates.map(candidate =>
    [candidate.id, evaluateAutoSkill(candidate.master, candidate.lb, unit)])));
  const used = new Set<string>();
  const choices: AutoSkillChoice[] = [];
  // Fill everybody's first slot before additional slots. Only the second pass may reuse a kind.
  for (const duplicateFallback of [false, true]) {
    for (let slot = 0; slot < Math.max(0, ...slots); slot++) {
      const pending = new Set(deck.flatMap((member, index) =>
        slots[index] > slot && member.skillIds.length === slot ? [index] : []));
      while (pending.size) {
        const pairs = [...pending].flatMap(index => candidates.filter(candidate =>
          !deck[index].skillIds.includes(candidate.id) && (duplicateFallback || !used.has(candidate.id)))
          .map(candidate => ({ index, candidate, evaluation: evaluations[index].get(candidate.id)! })));
        pairs.sort((a, b) => Number(b.evaluation.attack) - Number(a.evaluation.attack)
          || b.evaluation.score - a.evaluation.score || b.evaluation.rarity - a.evaluation.rarity
          || (a.candidate.id < b.candidate.id ? -1 : a.candidate.id > b.candidate.id ? 1 : 0)
          || a.index - b.index);
        const best = pairs[0];
        if (!best) break;
        deck[best.index].skillIds.push(best.candidate.id);
        used.add(best.candidate.id);
        choices.push({ characterId: deck[best.index].characterId, skillId: best.candidate.id,
          slot, duplicateFallback, evaluation: best.evaluation });
        pending.delete(best.index);
      }
    }
  }
  return { deck, choices };
}

export function autoEquipSkills(state: RedesignState): DeckMember[] {
  return planAutoSkills(state).deck;
}
