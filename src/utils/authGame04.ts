import { supabase } from './supabase';
export const GAME04_AUTH_INTENT = 'game04_auth_intent_v1';
export type Game04Intent = { userId: string; method: 'GOOGLE' | 'EMAIL'; startedAt: number };
export function readGame04Intent(now = Date.now()): Game04Intent | null {
  const raw = localStorage.getItem(GAME04_AUTH_INTENT);
  if (!raw) return null;
  let intent: Game04Intent;
  try { intent = JSON.parse(raw); } catch { throw new Error('連携情報が不正です。連携画面からやり直してください。'); }
  const maxAge = intent.method === 'EMAIL' ? 24 * 60 * 60_000 : 30 * 60_000;
  if (!intent.userId || !['GOOGLE', 'EMAIL'].includes(intent.method) || !Number.isFinite(intent.startedAt)
    || now < intent.startedAt || now - intent.startedAt > maxAge) throw new Error('連携の有効期限が切れました。連携画面からやり直してください。');
  return intent;
}
export async function game04Binding(finalize = false) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('ログインしてください。');
  const response = await fetch('/api/auth/game04-binding', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ finalize }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '認証状態を確認できません。');
  if (result.userId !== data.session.user.id) throw new Error('ゲームデータの対応が一致しません。');
  return result as { userId: string; linked: boolean; method: 'EMAIL' | 'GOOGLE' | null; needsPassword: boolean };
}
