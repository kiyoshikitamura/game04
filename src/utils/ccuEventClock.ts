import type { CcuEventContext } from '../domain/redesign/ccuEvent';

let current: CcuEventContext | null = null;
let receivedAt = 0;
const listeners = new Set<() => void>();
export function synchronizeCcuEvent(event: CcuEventContext | null | undefined) {
  if (!event || !Number.isFinite(Date.parse(event.serverNow))) return;
  current = event;
  receivedAt = performance.now();
  listeners.forEach(listener => listener());
}
export const ccuEventSnapshot = () => current;
export const ccuEventServerSnapshot = () => null;
export const ccuEventClockNow = () => current ? Date.parse(current.serverNow) + Math.max(0, performance.now() - receivedAt) : 0;
export function subscribeCcuEvent(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
