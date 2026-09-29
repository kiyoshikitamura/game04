'use client';
import { useEffect, useState } from 'react';
import { UNKNOWN_ONLINE, validOnline, type TitleOnline } from '@/utils/titleOnline';

export function useTitleOnline(active: boolean) {
  const [online, setOnline] = useState<TitleOnline>(UNKNOWN_ONLINE);
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let busy = false;
    let current = UNKNOWN_ONLINE;
    const read = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        const fixture = new URLSearchParams(window.location.search).get('titleOnline');
        const response = await fetch(`/api/title/online${fixture ? `?fixture=${encodeURIComponent(fixture)}` : ''}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
        const data = await response.json() as TitleOnline;
        current = response.ok && validOnline(data) ? data : { ...UNKNOWN_ONLINE, fixture: data.fixture };
      } catch { current = UNKNOWN_ONLINE; }
      if (!stopped) setOnline(current);
      busy = false;
    };
    const visible = () => {
      if (!validOnline(current)) setOnline(previous => previous.count === null ? previous : UNKNOWN_ONLINE);
      void read();
    };
    void read();
    const interval = setInterval(() => void read(), 60_000);
    // Expire a stalled request/cache even between polling ticks.
    const expiry = setInterval(() => { if (!validOnline(current)) setOnline(previous => previous.count === null ? previous : UNKNOWN_ONLINE); }, 1000);
    document.addEventListener('visibilitychange', visible);
    return () => { stopped = true; clearInterval(interval); clearInterval(expiry); document.removeEventListener('visibilitychange', visible); };
  }, [active]);
  return active ? online : UNKNOWN_ONLINE;
}
