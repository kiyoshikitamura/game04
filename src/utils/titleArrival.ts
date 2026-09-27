import { supabase, usingMockSupabase } from './supabase';

const STORAGE_KEY = 'game04_title_visitor_v1';
let memoryId: string | undefined;
function visitorId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved)) return saved;
  } catch { /* Storage-disabled browsers use a page-lifetime ID. */ }
  memoryId ??= crypto.randomUUID();
  try { localStorage.setItem(STORAGE_KEY, memoryId); } catch { /* No gameplay dependency. */ }
  return memoryId;
}

/** Non-blocking, retry-idempotent telemetry. Does not create an auth user. */
export async function recordTitleArrival(eventId: string): Promise<void> {
  if (typeof window === 'undefined' || usingMockSupabase) return;
  try {
    const id = visitorId();
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.rpc('game04_record_title_arrival_v1', {
        p_event_id: eventId, p_visitor_id: id,
      });
      if (!error) return;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
    }
    console.warn('Title arrival measurement was not saved');
  } catch { /* Measurement failures must never block game entry. */ }
}
