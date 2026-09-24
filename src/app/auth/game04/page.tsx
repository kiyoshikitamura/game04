'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { GAME04_AUTH_INTENT, game04Binding, readGame04Intent } from '@/utils/authGame04';
import type { User } from '@supabase/supabase-js';

export default function Game04AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [binding, setBinding] = useState<Awaited<ReturnType<typeof game04Binding>> | null>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState('認証状態を確認しています。');
  const [busy, setBusy] = useState(true); const lock = useRef(false);
  async function refresh() {
    const { data, error } = await supabase.auth.getUser();
    setUser(data.user); setBinding(null);
    if (!data.user) { setMessage('連携済みのアカウントでログインしてください。'); return; }
    if (error) throw error;
    const status = await game04Binding(); setBinding(status);
    setMessage(status.linked ? 'アカウント連携済みです。' : status.needsPassword ? '確認メールを受け付けました。パスワードを設定して完了してください。' : '現在のゲームデータをアカウントに連携します。');
  }
  useEffect(() => { void refresh().catch(() => setMessage('認証状態を確認できません。再確認してください。')).finally(() => setBusy(false)); }, []);
  async function run(action: () => Promise<void>) {
    if (lock.current) return; lock.current = true; setBusy(true);
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : '認証に失敗しました。'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function connectGoogle() {
    if (!user?.is_anonymous || !binding) throw new Error('現在の未連携ゲームデータを確認してください。');
    localStorage.setItem(GAME04_AUTH_INTENT, JSON.stringify({ userId: user.id, method: 'GOOGLE', startedAt: Date.now() }));
    const { error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: `${location.origin}/auth/game04/callback`, queryParams: { prompt: 'select_account' } } });
    if (error) { localStorage.removeItem(GAME04_AUTH_INTENT); throw new Error('Google連携を開始できません。登録済みの場合は元のアカウントでログインしてください。'); }
  }
  async function connectEmail() {
    if (!user || !binding) throw new Error('現在のゲームデータを確認してください。');
    if (password.length < 6) throw new Error('6文字以上のパスワードを入力してください。');
    if (binding.needsPassword) {
      const intent = readGame04Intent();
      if (intent && (intent.userId !== user.id || intent.method !== 'EMAIL')) throw new Error('連携開始時のゲームデータと一致しません。');
      const { error } = await supabase.auth.updateUser({ password }); if (error) throw error;
      await game04Binding(true); localStorage.removeItem(GAME04_AUTH_INTENT); setPassword(''); await refresh(); return;
    }
    if (!user.is_anonymous || !email.trim()) throw new Error('未連携のゲームデータとメールアドレスを確認してください。');
    localStorage.setItem(GAME04_AUTH_INTENT, JSON.stringify({ userId: user.id, method: 'EMAIL', startedAt: Date.now() }));
    const { error } = await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${location.origin}/auth/game04/callback` });
    if (error) { localStorage.removeItem(GAME04_AUTH_INTENT); throw new Error('メール連携を開始できません。登録済みの場合は元のアカウントでログインしてください。'); }
    setPassword(''); setMessage('確認メール内のリンクを開き、この画面でパスワードを再入力してください。');
  }
  return <main style={{ minHeight: '100dvh', overflowY: 'auto', background: '#16130f', color: '#f5eddf', padding: '24px 20px', boxSizing: 'border-box' }}>
    <section style={{ maxWidth: 440, margin: '0 auto', display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: 24 }}>アカウント連携</h1><p role="status" aria-live="polite">{message}</p>
      {!binding?.linked && <>
        <label>メールアドレス<input style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, color: '#111', background: '#fff' }} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>パスワード<input style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, color: '#111', background: '#fff' }} type="password" autoComplete={user ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {user ? <><button disabled={busy || !binding} onClick={() => void run(connectEmail)}>{binding?.needsPassword ? 'パスワードを設定して連携完了' : 'メールアドレスを連携'}</button><button disabled={busy || !user.is_anonymous || !binding} onClick={() => void run(connectGoogle)}>Googleを連携</button></> : <>
          <button disabled={busy} onClick={() => void run(async () => { localStorage.removeItem(GAME04_AUTH_INTENT); const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw new Error('メールアドレスまたはパスワードを確認してください。'); setPassword(''); await game04Binding(true); await refresh(); })}>メールでログイン</button>
          <button disabled={busy} onClick={() => void run(async () => { localStorage.removeItem(GAME04_AUTH_INTENT); const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/game04/callback`, queryParams: { prompt: 'select_account' } } }); if (error) throw error; })}>Googleでログイン</button>
        </>}
      </>}
      <button disabled={busy} onClick={() => void run(refresh)}>状態を再確認</button>
      {binding?.linked && <button disabled={busy} onClick={() => void run(async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; localStorage.removeItem(GAME04_AUTH_INTENT); await refresh(); })}>ログアウト</button>}
      <p style={{ fontSize: 14 }}>別端末では、連携した同じGoogleアカウントまたはメールアドレスとパスワードでログインしてください。未連携のデータはブラウザを変えると引き継げません。</p>
      <a href="/" style={{ color: '#e7c979' }}>戦国姫艶武へ戻る</a>
    </section>
  </main>;
}
