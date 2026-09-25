import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const authorization = request.headers.get('authorization') || '';
  if (!/^Bearer \S+$/.test(authorization)) return Response.json({ error: '認証が必要です。' }, { status: 401, headers });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  // This preview bridge must never address GAME03 or an unapproved live project.
  if (url.replace(/\/$/, '') !== 'https://lrgyllgzcdcphlbmkknc.supabase.co' || !key) {
    return Response.json({ error: '認証環境の設定を確認中です。' }, { status: 503, headers });
  }
  let finalize = false;
  try { const body = await request.json(); finalize = body.finalize === true; }
  catch { return Response.json({ error: '要求が不正です。' }, { status: 400, headers }); }
  const client = createClient(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data: identity, error: identityError } = await client.auth.getUser(authorization.slice(7));
  if (identityError || !identity.user) return Response.json({ error: 'ログインし直してください。' }, { status: 401, headers });
  const { data, error } = await client.rpc('game04_auth_binding', { p_finalize: finalize });
  if (error) return Response.json({ error: 'ゲームデータと認証の対応を確認できません。連携は完了していません。' }, { status: error.code === 'PGRST202' ? 503 : 409, headers });
  if (data?.userId !== identity.user.id) return Response.json({ error: 'ゲームデータの対応が一致しません。' }, { status: 409, headers });
  return Response.json(data, { headers });
}
