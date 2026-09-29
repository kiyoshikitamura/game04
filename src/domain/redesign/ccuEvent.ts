/** Event context comes from the database clock, never from client payloads. */
export interface CcuEventContext {
  id: string;
  startsAt: string;
  endsAt: string;
  serverNow: string;
  enabled: boolean;
}

export function ccuEventActive(event: CcuEventContext | null | undefined, now?: number): boolean {
  if (!event?.enabled) return false;
  const time = now ?? Date.parse(event.serverNow);
  return Number.isFinite(time) && time >= Date.parse(event.startsAt) && time < Date.parse(event.endsAt);
}

export function ccuEventEnergyCost(base: number, event?: CcuEventContext | null, now?: number): number {
  return ccuEventActive(event, now) ? Math.ceil(base / 2) : base;
}

export function ccuEventEncounterChance(base: number, event?: CcuEventContext | null): number {
  // Keep stages with no encounter eligibility excluded.
  return base > 0 && ccuEventActive(event) ? 1 : base;
}
