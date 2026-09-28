import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  // Preview never writes production presence, even if its env is misconfigured.
  if (process.env.VERCEL_ENV !== 'production'
    || process.env.NEXT_PUBLIC_APP_ENV !== 'production'
    || process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://soiksqgtmcnspfedmanr.supabase.co') {
    return new NextResponse(null, { status: 204 });
  }
  if (request.headers.get('origin') !== 'https://sengoku-hime-ennbu.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return new NextResponse(null, { status: 401 });
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) return new NextResponse(null, { status: 503 });
  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization }, fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(4_000) }) },
    });
    // PostgREST validates JWT, RPC uses auth.uid(); never accept identity from body.
    const { error } = await client.rpc('game04_record_portal_activity');
    return new NextResponse(null, { status: error ? 503 : 204 });
  } catch { return new NextResponse(null, { status: 503 }); }
}
