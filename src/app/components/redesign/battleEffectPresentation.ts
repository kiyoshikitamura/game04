import type { BattleFrame } from '../../../domain/redesign/battle';
import type { SkillMaster } from '../../../domain/redesign/types';

export const BATTLE_EFFECT_FAMILIES = ['slash', 'slash_all', 'impact', 'impact_all', 'projectile', 'heal', 'heal_all', 'atk_up', 'def_up', 'spd_up', 'atk_down', 'def_down', 'poison', 'blind', 'silence', 'stun'] as const;
export type BattleEffectFamily = typeof BATTLE_EFFECT_FAMILIES[number];
export interface RecordedBattleEffect { targetId: string; family: BattleEffectFamily }
const statusFamilies: Readonly<Record<string, BattleEffectFamily>> = { atk_up: 'atk_up', def_up: 'def_up', spd_up: 'spd_up', atk_down: 'atk_down', def_down: 'def_down', poison: 'poison', dot: 'poison', blind: 'blind', darkness: 'blind', silence: 'silence', stun: 'stun', hot: 'heal' };

/** Visual classification only. Never changes targeting, damage, or skill eligibility. */
export function classifyBattleDamageEffect(skill?: SkillMaster): BattleEffectFamily {
  const all = skill?.target === 'all_enemies' || skill?.effects.some(effect => effect.type === 'damage' && effect.target === 'all_enemies');
  const name = skill?.name ?? '';
  if (/弓|矢|射|針|火薬|鉄砲|銃|弾|投げ|飛道具/.test(name)) return 'projectile';
  if (/拳|槌|棒|打撃|衝撃|地裂|砕|震|轟/.test(name)) return all ? 'impact_all' : 'impact';
  return all ? 'slash_all' : 'slash';
}

/** Only recorded successful events can cause a success effect. Statuses use a multiset delta
 * so pre-existing effects from the same skill are not flashed again. */
export function resolveBattleFrameEffects(frame: BattleFrame, previous: BattleFrame | undefined, skill?: SkillMaster): RecordedBattleEffect[] {
  const targets = frame.targetIds ?? [];
  if (['damage', 'counter'].includes(frame.event ?? '')) return targets.map(targetId => ({ targetId, family: classifyBattleDamageEffect(skill) }));
  if (['heal', 'revive', 'hot'].includes(frame.event ?? '')) return targets.map(targetId => ({ targetId, family: frame.event === 'heal' && (skill?.target === 'all_allies' || skill?.effects.some(effect => effect.type === 'heal' && effect.target === 'all_allies')) ? 'heal_all' : 'heal' }));
  if (frame.event === 'dot') return targets.map(targetId => ({ targetId, family: 'poison' }));
  if (frame.event !== 'effect_applied' || !previous || previous.wave !== frame.wave) return [];
  const before = [...previous.party, ...previous.enemies];
  const current = [...frame.party, ...frame.enemies];
  const effects: RecordedBattleEffect[] = [];
  const fingerprint = (status: BattleFrame['party'][number]['statuses'][number]) => JSON.stringify([status.type, status.sourceId, status.sourceSkillId, status.appliedAction, status.power]);
  for (const targetId of targets) {
    const oldStatuses = (before.find(unit => unit.id === targetId)?.statuses ?? []).map(fingerprint);
    for (const status of current.find(unit => unit.id === targetId)?.statuses ?? []) {
      const found = oldStatuses.indexOf(fingerprint(status));
      if (found >= 0) { oldStatuses.splice(found, 1); continue; }
      const family = statusFamilies[status.type];
      if (family && !effects.some(effect => effect.targetId === targetId && effect.family === family)) effects.push({ targetId, family });
    }
  }
  return effects;
}
