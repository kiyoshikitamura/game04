import type { RedesignState, RaidRoom } from './types';

const ACTIONS = new Set([
  'save_deck', 'character_level', 'character_awaken', 'equipment_level', 'skill_level',
  'equipment_lb', 'soul_exchange', 'soul_select', 'character_unlock', 'use_energy_drink',
  'claim_mission', 'set_home', 'raid_join', 'raid_leave', 'raid_rescue', 'encounter_ignore',
]);
/** Server-only call after successful domain validation; persist inside the state transaction. */
export function gameplayMeasurementReceipt(action: string, before: RedesignState, after: RedesignState) {
  if (!ACTIONS.has(action)) return {};
  return { gameplayMeasurement: {
    contractVersion: 'game04-gameplay-v1', action,
    stateVersionBefore: before.version, stateVersionAfter: before.version + 1,
    cashDelta: after.cash - before.cash, energyDelta: after.energy - before.energy,
  } };
}

/** Only grants that changed from unclaimed to claimed in this room transaction. */
export function raidClaimMeasurementReceipt(before: RedesignState, after: RedesignState, prior: RaidRoom, next: RaidRoom) {
  const grants = prior.rewardGrants.filter(g => g.userId === before.userId && !g.claimed
    && next.rewardGrants.some(n => n.id === g.id && n.userId === g.userId && n.claimed))
    .map(g => ({ grantId: g.id, rewards: g.rewards.map(r => ({ kind: r.kind, id: r.id ?? null, amount: r.amount })) }));
  if (!grants.length) return {};
  return { gameplayMeasurement: { contractVersion: 'game04-gameplay-v1', action: 'raid_claim',
    stateVersionBefore: before.version, stateVersionAfter: before.version + 1,
    cashDelta: after.cash - before.cash, energyDelta: after.energy - before.energy,
    roomId: prior.id, grants } };
}
