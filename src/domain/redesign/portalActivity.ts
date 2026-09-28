/** Only real input creates pending work. Timers never create activity. */
export function createActivityBuffer(options: {
  send: () => void; now: () => number;
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel: (timer: ReturnType<typeof setTimeout>) => void;
}) {
  let lastSent = -Infinity;
  let lastInput = -Infinity;
  let pending = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    if (timer !== undefined) options.cancel(timer);
    timer = undefined;
    if (!pending) return;
    pending = false;
    // A suspended/offline tab must not replay old activity when it wakes up.
    if (options.now() - lastInput > 10_000) return;
    lastSent = options.now();
    options.send();
  };
  return {
    input() {
      lastInput = options.now();
      pending = true;
      if (lastInput - lastSent >= 10_000) { flush(); return; }
      if (timer !== undefined) options.cancel(timer);
      // Debounce the final input, bounded by one write per 10s while continuous.
      timer = options.schedule(flush, Math.min(1_000, 10_000 - (lastInput - lastSent)));
    },
    flush,
    dispose() { flush(); },
  };
}

export function isManualGameInput(event: { isTrusted: boolean; type: string; key?: string; repeat?: boolean }, visible: boolean) {
  if (!visible || !event.isTrusted) return false;
  if (event.type === 'click' || event.type === 'input' || event.type === 'change') return true;
  return event.type === 'keydown' && !event.repeat
    && ['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key ?? '');
}
