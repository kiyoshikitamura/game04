import { CHARACTER_MASTERS, SKILL_MASTERS, EQUIPMENT_MASTERS } from './masters';
import { GROWTH_VERSION, DUPLICATE_SKILL_MATERIALS } from './growthMaster';
import type { RedesignState, Rarity } from './types';

/** Approved acquisition conversion; legacy snapshot importer remains unchanged. */
export interface AcquisitionMaster {
 characterDuplicateSouls: number | null;
 skillDuplicateMaterials: number | Partial<Record<Rarity,number>> | null;
 characterAtCap: 'pending' | 'convert';
 skillAtCap: 'pending' | 'convert';
}
export const APPROVED_ACQUISITION_MASTER: AcquisitionMaster = {
 characterDuplicateSouls: 20, skillDuplicateMaterials: DUPLICATE_SKILL_MATERIALS,
 characterAtCap: 'convert', skillAtCap: 'convert',
};
export const PREVIEW_ACQUISITION_MASTER = APPROVED_ACQUISITION_MASTER;
export interface AcquisitionEvent {
 id: string; kind: 'character' | 'skill' | 'equipment'; masterId: string;
 instanceId?: string; legacyId?: string;
}
export interface PendingAcquisition extends AcquisitionEvent { reason: string; }
export type AcquisitionState = RedesignState & {
 appliedAcquisitionIds?: string[]; pendingAcquisitions?: PendingAcquisition[];
};
/** Input is a trusted, immutable DB event stream. CAS persists state + receipt IDs atomically. */
export function applyAcquisitionEvents(original: RedesignState, events: AcquisitionEvent[], master: AcquisitionMaster): AcquisitionState {
 const state: AcquisitionState = structuredClone(original);
 const applied = new Set(state.appliedAcquisitionIds ?? []);
 const pending = new Map((state.pendingAcquisitions ?? []).map(p => [p.id, p]));
 for (const event of [...pending.values(), ...events]) {
  if (applied.has(event.id)) continue;
  // During deployment overlap the previous Edge may already have imported this exact new row.
  if(event.legacyId && state.legacyImportedIds?.includes(`${event.kind}:${event.legacyId}`)){applied.add(event.id);pending.delete(event.id);continue;}
  const defer = (reason: string) => pending.set(event.id, {...event,reason});
  if (event.kind === 'character') {
   if (!CHARACTER_MASTERS.some(m => m.id === event.masterId)) {defer('master_missing'); continue;}
   const owned = state.characters.find(c => c.id === event.masterId);
   if (!owned) state.characters.push({id:event.masterId,level:1,awakening:0,exp:0,growthVersion:GROWTH_VERSION});
   else {
    if (owned.awakening >= 5 && master.characterAtCap !== 'convert') {defer('character_cap_policy_unfixed'); continue;}
    const amount = master.characterDuplicateSouls;
    if (!Number.isSafeInteger(amount) || typeof amount !== "number" || amount < 0) {defer('conversion_master_unfixed'); continue;}
    state.souls ??= {}; state.souls[event.masterId] = (state.souls[event.masterId] ?? 0) + amount;
   }
  } else if (event.kind === 'skill') {
   const skillMaster=SKILL_MASTERS.find(m => m.id === event.masterId);
   if (!skillMaster) {defer('master_missing'); continue;}
   const owned = state.skills.find(s => s.id === event.masterId);
   if (!owned) state.skills.push({id:event.masterId,level:0});
   else {
    if (owned.level >= 10 && master.skillAtCap !== 'convert') {defer('skill_cap_policy_unfixed'); continue;}
    const configured=master.skillDuplicateMaterials;
    const amount = configured && typeof configured === "object" ? configured[skillMaster.rarity] : configured;
    if (!Number.isSafeInteger(amount) || typeof amount !== "number" || amount < 0) {defer('conversion_master_unfixed'); continue;}
    state.materials.skill += amount;
   }
  } else if (event.kind === 'equipment') {
   if (!EQUIPMENT_MASTERS.some(m => m.id === event.masterId)) {defer('master_missing'); continue;}
   const instanceId = event.instanceId ?? event.id;
   if (!state.equipment.some(e => e.instanceId === instanceId)) state.equipment.push({instanceId,masterId:event.masterId,level:1,lb:0,exp:0,growthVersion:GROWTH_VERSION});
  } else {defer('unsupported_kind'); continue;}
  applied.add(event.id); pending.delete(event.id);
 }
 state.appliedAcquisitionIds = [...applied];
 state.pendingAcquisitions = [...pending.values()];
 return state;
}

