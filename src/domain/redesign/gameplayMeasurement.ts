import type { RedesignState } from './types';

const ACTIONS = new Set([
  'save_deck', 'character_level', 'equipment_level', 'skill_level',
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
