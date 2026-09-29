import type { CcuEventContext } from './ccuEvent';
export type EventPromotionPhase = 'preview' | 'active' | 'hidden';
export function eventPromotionPhase(event: CcuEventContext | null, now: number): EventPromotionPhase {
  if (!event?.enabled || event.id !== 'ccu-20260929' || !Number.isFinite(now) || now < Date.parse('2026-09-29T00:00:00+09:00') || now >= Date.parse(event.endsAt)) return 'hidden';
  return now < Date.parse(event.startsAt) ? 'preview' : 'active';
}
export const EVENT_PROMOTION_IMAGE = '/display-images/57d17846225252b745ca3b20.webp';
