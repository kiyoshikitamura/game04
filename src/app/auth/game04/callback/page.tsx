'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { acceptOAuthReturn } from '@/utils/oauthReturnSession';
import { GAME04_AUTH_INTENT, game04Binding, readGame04Intent } from '@/utils/authGame04';

export default function Game04AuthCallback() {
  const started = useRef(false); const [message, setMessage] = useState('認証結果を確認しています。');
  useEffect(() => {
    if (started.current) return; started.current = true;
    async function complete() {
      const intent = readGame04Intent();
      const original = (await supabase.auth.getSession()).data.session;
      const result = await acceptOAuthReturn(supabase.auth, location.href);
      // Remove callback credentials from browser history even if later binding fails.
      history.replaceState(null, '', '/auth/game04/callback');
      if (result.error) throw result.error;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('認証を確認できません。再ログインしてください。');
      if (intent && data.user.id !== intent.userId) {
        if (original?.user.id === intent.userId) {
          const restored = await supabase.auth.setSession({ access_token: original.access_token, refresh_token: original.refresh_token });
          if (restored.error) throw new Error('元のゲームデータのセッションを復元できません。この画面を閉じずお問い合わせください。');
        } else await supabase.auth.signOut();
        throw new Error('連携開始時と異なるアカウントです。ゲームデータの統合・削除はしていません。');
      }
      const providers = (data.user.identities || []).map(identity => identity.provider);
      if (providers.length !== 1 || !['email', 'google'].includes(providers[0]) || data.user.is_anonymous) throw new Error('連携可能な認証情報を確認できません。');
      if (intent && providers[0] !== intent.method.toLowerCase()) throw new Error('連携開始時の認証方式と一致しません。');
      const state = await game04Binding();
      if (!state.needsPassword) { await game04Binding(true); localStorage.removeItem(GAME04_AUTH_INTENT); }
      location.replace('/auth/game04');
    }
    void complete().catch(() => {
      history.replaceState(null, '', '/auth/game04/callback');
      setMessage('認証を完了できませんでした。連携済みとは扱っていません。連携画面で状態を再確認してください。ゲームデータの統合・削除は行いません。');
    });
  }, []);
  return <main style={{ height: '100dvh', boxSizing: 'border-box', overflowY: 'auto', padding: 24, background: '#16130f', color: '#f5eddf' }}><h1>アカウント連携</h1><p role="status">{message}</p><a style={{ color: '#e7c979' }} href="/auth/game04">連携画面へ戻る</a></main>;
}
