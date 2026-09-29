import { usingMockSupabase } from './supabase';
import { titleVisitorId } from './titleArrival';
import { onlinePresentation, type TitleOnline } from './titleOnline';

export type TitleProofEvent = 'TITLE_ARRIVED' | 'TAP_TO_START' | 'SELECTION_VIEWED' | 'ONLINE_CHANGED' | 'START_NEW_TAPPED' | 'CONTINUE_TAPPED';
export function recordTitleProofEvent(visit: string, event: TitleProofEvent, online: TitleOnline, eligible: boolean, selectionId: string | null) {
  if (typeof window === 'undefined' || usingMockSupabase) return;
  const eventId = crypto.randomUUID();
  const presentation = onlinePresentation(online.count);
  const metadata = { active_count: online.count, counted_at: online.countedAt, display_range: presentation.range,
    displayed: event !== 'TITLE_ARRIVED' && event !== 'TAP_TO_START' && presentation.visible,
    new_game_eligible: eligible, selection_id: selectionId, fixture: Boolean(online.fixture) };
  // Frozen payload and ID across retries; analytics never delays a CTA.
  void (async () => {
    try {
      const visitor = titleVisitorId();
      for (let attempt = 0; attempt < 3; attempt++) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
        if (!url || !key) return;
        // Anonymous RPC needs no session refresh; start the keepalive request before
        // a continue CTA navigates away. Same hashed visitor ID as title arrivals.
        const response = await fetch(`${url}/rest/v1/rpc/game04_record_title_proof_event_v1`, {
          method: 'POST', keepalive: true, signal: AbortSignal.timeout(4000),
          headers: { apikey: key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_event_id: eventId, p_visit_id: visit, p_visitor_id: visitor, p_event_type: event, p_metadata: metadata }),
        });
        if (response.ok) return;
        await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
      }
    } catch { /* Entry remains independent of telemetry. */ }
  })();
}
