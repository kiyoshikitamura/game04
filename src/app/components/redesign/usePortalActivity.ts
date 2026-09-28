'use client';
import { useEffect, useRef } from 'react';
import { createActivityBuffer, isManualGameInput } from '@/domain/redesign/portalActivity';
import { sendPortalActivity } from '@/utils/portalActivity';

export function usePortalActivity(userId: string | undefined, token: string | undefined, enabled: boolean) {
  const current = useRef({ userId, token });
  current.current = { userId, token };
  useEffect(() => {
    if (!enabled || !userId) return;
    const buffer = createActivityBuffer({
      now: Date.now, schedule: setTimeout, cancel: clearTimeout,
      send: () => {
        if (current.current.userId === userId && current.current.token) sendPortalActivity(current.current.token);
      },
    });
    const input = (event: Event) => {
      if (isManualGameInput(event as KeyboardEvent, document.visibilityState === 'visible')) buffer.input();
    };
    const hidden = () => { if (document.visibilityState === 'hidden') buffer.flush(); };
    const events = ['click', 'input', 'change', 'keydown'];
    events.forEach(type => document.addEventListener(type, input, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', buffer.flush);
    return () => {
      events.forEach(type => document.removeEventListener(type, input, true));
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', buffer.flush);
      buffer.dispose();
    };
  }, [enabled, userId]);
}
