'use client';
import { supabase, usingMockSupabase } from './supabase';

export function sendPortalActivity(accessToken: string) {
  if (usingMockSupabase || !accessToken) return;
  // No UID or client timestamp: the authenticated server records both.
  void fetch('/api/portal/activity', {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}` },
    keepalive: true, cache: 'no-store', signal: AbortSignal.timeout(5_000),
  }).catch(() => {});
}

/** Called only by explicit start/continue handlers, never auth refresh. */
export async function recordPortalEntry() {
  if (usingMockSupabase) return;
  const { data } = await supabase.auth.getSession();
  if (data.session) sendPortalActivity(data.session.access_token);
}
