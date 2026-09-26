import type { BattleFrame, BattleResult, BattleUnitState } from '../redesign/battle';
import type { BattleUnit, SkillMaster } from '../redesign/types';

export interface RecordedBattleImpact {
  targetId: string;
  amount: number;
  type: 'damage' | 'heal' | 'miss' | 'status';
  hits: number[];
}
export interface RecordedBattlePresentation {
  actor?: BattleUnit;
  actorState?: BattleUnitState;
  skill?: SkillMaster;
  isSkill: boolean;
  activeActorId?: string;
  cutIn: 'burst' | 'skill' | null;
  impacts: RecordedBattleImpact[];
  targets: string[];
}
const damageEvents = new Set(['damage', 'counter', 'dot']);
const healEvents = new Set(['heal', 'hot', 'revive']);
const idleEvents = new Set(['start', 'wave', 'end', 'counts', 'action_end', 'interrupt_end', 'burst_end', 'burst_failed', 'burst_interrupted']);

/** Project only recorded snapshots. No combat decisions, HP changes or SP calculations occur here. */
export function projectRecordedBattleFrame(result: BattleResult, index: number): RecordedBattlePresentation {
  const frame = result.frames[index];
  if (!frame) return { isSkill: false, cutIn: null, impacts: [], targets: [] };
  const actor = result.party.find(unit => unit.id === frame.actorId)
    ?? result.waves[frame.wave - 1]?.find(unit => unit.id === frame.actorId);
  const actorState = [...frame.party, ...frame.enemies].find(unit => unit.id === frame.actorId);
  const skill = (actorState?.skills ?? actor?.skills)?.find(entry => entry.id === frame.skillId);
  const isSkill = Boolean(frame.skillId && !['basic', 'BASIC_ATTACK'].includes(frame.skillId));
  const event = frame.event ?? '';
  const previous = result.frames[index - 1];
  // Never compare identical IDs across waves: they may refer to a fresh enemy.
  const previousStates = previous?.wave === frame.wave ? [...previous.party, ...previous.enemies] : [];
  const currentStates = [...frame.party, ...frame.enemies];
  const targets = [...(frame.targetIds ?? [])];
  const impacts: RecordedBattleImpact[] = [];
  for (const targetId of targets) {
    const current = currentStates.find(unit => unit.id === targetId);
    const before = previousStates.find(unit => unit.id === targetId);
    if (damageEvents.has(event)) {
      // Recorded hit totals include overkill; clamped HP deltas do not. Prefer the
      // server total, retaining the snapshot delta only for older saved frames.
      const recordedHits = targets.length === 1 && frame.hits?.length ? frame.hits.reduce((sum, hit) => sum + hit, 0) : undefined;
      const recordedDot = event === 'dot' && targets.length === 1 ? frame.text.match(/[−-]([\d,]+)\s*$/)?.[1] : undefined;
      const amount = recordedHits ?? (recordedDot ? Number(recordedDot.replace(/,/g, '')) : before && current ? Math.max(0, before.hp - current.hp) : 0);
      impacts.push({ targetId, amount, type: 'damage', hits: targets.length === 1 ? [...(frame.hits ?? [])] : [] });
    } else if (healEvents.has(event)) {
      impacts.push({ targetId, amount: before && current ? Math.max(0, current.hp - before.hp) : 0, type: 'heal', hits: [] });
    } else if (event === 'miss') {
      impacts.push({ targetId, amount: 0, type: 'miss', hits: [] });
    } else if (['effect_applied', 'effect_miss', 'cleanse', 'shield_absorbed'].includes(event)) {
      impacts.push({ targetId, amount: 0, type: 'status', hits: [] });
    }
  }
  return {
    actor, actorState, skill, isSkill,
    activeActorId: idleEvents.has(event) || frame.kind === 'end' ? undefined : frame.actorId,
    // The cut-in is removed on the first outcome frame, so it cannot cover the impact or HP change.
    cutIn: frame.kind === 'end' ? null : event === 'burst_start' ? 'burst' : event === 'action_start' && isSkill ? 'skill' : null,
    impacts, targets,
  };
}

/** Milliseconds of presentation time, before playback speed. Saved frames are never discarded. */
export function recordedBattleFrameDuration(frame?: BattleFrame): number {
  if (!frame?.event) return 850;
  const event = frame.event;
  // Resume is bookkeeping within the same BURST, including before a recorded stun skip.
  if (['counts', 'action_end', 'interrupt_end', 'burst_resume'].includes(event)) return 60;
  if (event === 'burst_start') return 900;
  if (event === 'action_start') return frame.skillId && !['basic', 'BASIC_ATTACK'].includes(frame.skillId) ? 650 : 350;
  if (['phase', 'burst_failed', 'burst_interrupted', 'wave', 'death', 'revive'].includes(event)) return 600;
  if (damageEvents.has(event) || healEvents.has(event) || event === 'stun_skip') return 450;
  return 250;
}
