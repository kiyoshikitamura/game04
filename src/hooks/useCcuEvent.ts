'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ccuEventActive, ccuEventEnergyCost } from '../domain/redesign/ccuEvent';
import { ccuEventSnapshot, ccuEventServerSnapshot, ccuEventClockNow, subscribeCcuEvent } from '../utils/ccuEventClock';

export function useCcuEvent() {
  const event = useSyncExternalStore(subscribeCcuEvent, ccuEventSnapshot, ccuEventServerSnapshot);
  const [revision, tick] = useState(0);
  useEffect(() => {
    if (!event) return;
    const update = () => tick(value => value + 1);
    const now = ccuEventClockNow();
    const boundary = [Date.parse(event.startsAt), Date.parse(event.endsAt)].find(time => time > now);
    const timer = boundary === undefined ? undefined : setTimeout(update, Math.min(2147483647, Math.max(1, boundary - now + 10))); 
    window.addEventListener('focus', update);
    return () => { clearTimeout(timer); window.removeEventListener('focus', update); };
  }, [event, revision]);
  const now = ccuEventClockNow();
  return { active: ccuEventActive(event, now), energyCost: (base: number) => ccuEventEnergyCost(base, event, now) };
}
