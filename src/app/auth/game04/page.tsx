'use client';
import { useEffect, useRef, useState } from 'react';
import { returnToGame04 } from '@/utils/game04AccountReturn';
import '@/app/components/ui/game04-ui.css';
import './account.css';
import { supabase } from '@/utils/supabase';
import { GAME04_AUTH_INTENT, game04Binding, readGame04Intent } from '@/utils/authGame04';
import type { User } from '@supabase/supabase-js';

export default function Game04AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [binding, setBinding] = useState<Awaited<ReturnType<typeof game04Binding>> | null>(null);
  const [emailOpen,setEmailOpen]=useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState('認証状態を確認しています。');
  const [busy, setBusy] = useState(true); const [loginMode, setLoginMode] = useState(false); const [canRestoreGuest, setCanRestoreGuest] = useState(false); const lock = useRef(false);
  async function refresh() {
    const { data, error } = await supabase.auth.getUser();
    setUser(data.user); setBinding(null); setCanRestoreGuest(Boolean(sessionStorage.getItem('game04_guest_return')));
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
  async function restoreGuest() {
        const saved = JSON.parse(sessionStorage.getItem('game04_guest_return') || 'null');
        if (!saved?.access_token || !saved?.refresh_token) throw new Error('元のセッションを確認できません。');
        const result = await supabase.auth.setSession({ access_token: saved.access_token, refresh_token: saved.refresh_token });
        if (result.error || result.data.user?.id !== saved.userId) throw new Error('元のセッションを復元できません。このタブを閉じずお問い合わせください。');
        sessionStorage.removeItem('game04_guest_return'); localStorage.removeItem(GAME04_AUTH_INTENT); setLoginMode(false); await refresh();
  }
  return <main className="g4-account"><section>
      <h1>{loginMode||!user?'連携済みアカウントへログイン':'アカウント連携'}</h1><p role="status" aria-live="polite">{message}</p>
      {(!binding?.linked || loginMode) && <>
        {user&&!loginMode&&!binding?.needsPassword?<><button className="g4-account-google" disabled={busy||!user.is_anonymous||!binding} onClick={()=>void run(connectGoogle)}><b aria-hidden="true">G</b>現在のデータをGoogleに連携</button><p className="g4-account-note">進捗・所持品をそのまま引き継ぎます。</p></>:!user||loginMode?<button className="g4-account-google" disabled={busy} onClick={() => void run(async () => { localStorage.removeItem(GAME04_AUTH_INTENT); const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/game04/callback`, queryParams: { prompt: 'select_account' } } }); if (error) throw error; })}><b aria-hidden="true">G</b>Googleでログイン</button>:null}
        <button className="g4-account-email" disabled={busy} aria-expanded={emailOpen||binding?.needsPassword} onClick={()=>setEmailOpen(v=>!v)}>{user&&!loginMode?'メールアドレスで連携':'メールアドレスでログイン'} <span aria-hidden="true">⌄</span></button>
        {(emailOpen||binding?.needsPassword)&&<div className="g4-account-email-fields">
        <label>メールアドレス<input style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, color: '#111', background: '#fff' }} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>パスワード<input style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, color: '#111', background: '#fff' }} type="password" autoComplete={user&&!loginMode ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {user && !loginMode ? <><button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy || !binding} onClick={() => void run(connectEmail)}>{binding?.needsPassword ? 'パスワードを設定して連携完了' : 'メールアドレスを連携'}</button></> : <>
          <button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy} onClick={() => void run(async () => { localStorage.removeItem(GAME04_AUTH_INTENT); const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw new Error('メールアドレスまたはパスワードを確認してください。'); setPassword(''); await game04Binding(true); setLoginMode(false); await refresh(); })}>メールでログイン</button>

        </>}
        </div>}
      </>}
      {user && !user.is_anonymous && !binding?.linked && binding?.method && !binding.needsPassword && <button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy} onClick={() => void run(async () => { await game04Binding(true); localStorage.removeItem(GAME04_AUTH_INTENT); await refresh(); })}>連携の確定を再試行</button>}
      {user?.is_anonymous && !loginMode && <button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy} onClick={() => void run(async () => {
        const current = (await supabase.auth.getSession()).data.session;
        if (!current || current.user.id !== user.id) throw new Error('現在のゲームデータを確認できません。');
        // Same-tab recovery only. Never copied to URLs, logs or another browser.
        sessionStorage.setItem('game04_guest_return', JSON.stringify({ access_token: current.access_token, refresh_token: current.refresh_token, userId: current.user.id }));
        localStorage.removeItem(GAME04_AUTH_INTENT); setCanRestoreGuest(true); setLoginMode(true);setEmailOpen(false);setPassword('');
        setMessage('連携済みのアカウントへログインします。現在の未連携データは統合・削除しません。取消で元のゲームへ戻れます。');
      })}>連携済みアカウントへログイン</button>}
      {canRestoreGuest && <button disabled={busy} onClick={()=>void run(async()=>{await restoreGuest();setPassword('');setEmailOpen(false);if(loginMode)returnToGame04();})}>{loginMode?'取消して元のゲームへ戻る':'元の未連携データへ戻る'}</button>}
      <button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy} onClick={() => void run(refresh)}>状態を再確認</button>
      {binding?.linked && <button style={{ minHeight: 44, padding: '10px 14px' }} disabled={busy} onClick={() => void run(async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; localStorage.removeItem(GAME04_AUTH_INTENT); await refresh(); })}>ログアウト</button>}
      <p style={{ fontSize: 14 }}>別端末では、連携した同じGoogleアカウントまたはメールアドレスとパスワードでログインしてください。未連携のデータはブラウザを変えると引き継げません。</p>
      <button disabled={busy} onClick={()=>void run(async()=>{if(loginMode&&canRestoreGuest)await restoreGuest();returnToGame04();})}>ゲームへ戻る</button>
    </section>
  </main>;
}
