import type { BattleResult } from '../domain/redesign/battle';
import { projectRecordedBattleFrame } from '../domain/presentation/recordedBattlePresentation';
import { classifyBattleDamageEffect, resolveBattleFrameEffects } from '../app/components/redesign/battleEffectPresentation';
import type { SeEvent } from './audioContract';

/** Audio follows saved presentation events, never recalculates combat outcomes. */
export function recordedBattleSounds(result: BattleResult, index: number): SeEvent[] {
  const frame = result.frames[index];
  if (!frame) return [];
  const event = frame.event ?? frame.kind;
  if (event === 'end') return [result.outcome === 'win' ? 'VICTORY' : 'DEFEAT'];
  if (event === 'phase') return ['BATTLE_PHASE'];
  if (event === 'burst_start') return ['BATTLE_BURST'];
  const { skill, isSkill } = projectRecordedBattleFrame(result, index);
  if (event === 'action_start') return isSkill ? ['BATTLE_SKILL'] : [];
  if (event === 'critical' || (event === 'damage' && /クリティカル|critical/i.test(frame.text))) return ['BATTLE_CRITICAL'];
  if (event === 'damage' || event === 'counter') {
    if (!skill && !isSkill) return ['BATTLE_ATTACK'];
    const family = classifyBattleDamageEffect(skill);
    return [({ slash: 'BATTLE_SLASH', slash_all: 'BATTLE_SLASH', impact: 'BATTLE_IMPACT', impact_all: 'BATTLE_IMPACT_ALL', projectile: 'BATTLE_GUN' } as Partial<Record<string, SeEvent>>)[family] ?? 'BATTLE_ATTACK'];
  }
  if (['heal', 'hot', 'revive'].includes(event)) return ['BATTLE_HEAL'];
  if (event === 'effect_applied') {
    const families = resolveBattleFrameEffects(frame, result.frames[index - 1], skill).map(effect => effect.family);
    const sounds = new Set<SeEvent>();
    for (const family of families) sounds.add(['atk_up', 'def_up', 'spd_up'].includes(family) ? 'BATTLE_BUFF' : family.startsWith('heal') ? 'BATTLE_HEAL' : 'BATTLE_DEBUFF');
    // Shield, counter and taunt have no visual family but are successful buffs.
    if (!sounds.size && skill?.effects.some(effect => ['shield', 'counter', 'taunt', 'sp'].includes(effect.type))) sounds.add('BATTLE_BUFF');
    return [...sounds];
  }
  // No damage-received, per-enemy death, failed-status, or error sounds.
  return [];
}
