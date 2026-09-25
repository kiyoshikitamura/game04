'use client';
import { useEffect, useRef, useState } from 'react';
import Home from '@/app/page';
import BattleView from '@/app/components/redesign/BattleView';
import type { BattleResult } from '@/domain/redesign/battle';

type Mode = 'pass' | 'error' | 'timeout';
type Target = 'news' | 'activity' | 'profiles';
const paths: Record<Target, string> = { news: '/rest/v1/news', activity: '/rest/v1/rpc/get_recent_social_activity_feed', profiles: '/rest/v1/rpc/get_public_profiles' };

/** Isolated QA adapter: only the three named read operations can be faulted. */
export default function RecoveryLive({ result }: { result: BattleResult }) {
  const fault = useRef<{ target: Target; mode: Mode }>({ target: 'news', mode: 'pass' });
  const [target, setTarget] = useState<Target>('news');
  const [mode, setMode] = useState<Mode>('pass');
  const [ready, setReady] = useState(false);
  const [app, setApp] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [battle, setBattle] = useState<string | null>(null);
  const [finished, setFinished] = useState(0);
  const report = (message: string) => setEvents(list => [...list.slice(-39), message]);
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const selected = fault.current;
      const allowedMethod = selected.target === 'news' ? method === 'GET' : method === 'POST';
      if (url.pathname !== paths[selected.target] || !allowedMethod || selected.mode === 'pass') return original(input, init);
      report(`${new Date().toISOString()} ${selected.target} ${selected.mode}`);
      if (selected.mode === 'error') return new Response(JSON.stringify({ message: 'QA read unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
      return new Promise<Response>((_resolve, reject) => {
        const abort = () => { report(`${new Date().toISOString()} ${selected.target} aborted`); reject(new DOMException('QA read aborted', 'AbortError')); };
        if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, { once: true });
      });
    };
    setReady(true);
    return () => { window.fetch = original; document.cookie = 'g2-recovery-image=; Max-Age=0; Path=/api/qa/recovery-image; SameSite=Strict'; };
  }, []);
  function change(nextTarget: Target, nextMode: Mode) {
    fault.current = { target: nextTarget, mode: nextMode }; setTarget(nextTarget); setMode(nextMode);
  }
  function imageMode(next: Mode | 'error-once' | 'timeout-once') { document.cookie = `g2-recovery-image=${next}; Path=/api/qa/recovery-image; SameSite=Strict`; report(`image ${next}`); }
  return <main style={{ maxWidth: 512, margin: 'auto', color: '#fff', background: '#17131a', padding: 12 }}>
    <h1>G2 限定復帰検証</h1>
    <p>read障害は実本体＋SDKに対するQA応答注入。認証・保存・戦闘POSTは通常通信。画像戦闘は保存・報酬なしのfixtureで、実戦DB受入とは別です。</p>
    <fieldset><legend>読み取り障害</legend>
      <label>対象<select value={target} onChange={event => change(event.target.value as Target, mode)}><option value="news">お知らせ</option><option value="activity">活動</option><option value="profiles">補助プロフィール</option></select></label>
      <label>障害<select value={mode} onChange={event => change(target, event.target.value as Mode)}><option value="pass">通常</option><option value="error">503</option><option value="timeout">{target === 'profiles' ? '補助取得を無応答化（本体表示は継続）' : '無応答（本体12秒中断）'}</option></select></label>
      <button disabled={!ready || app} onClick={() => setApp(true)}>実本体を表示</button>
    </fieldset>
    <fieldset><legend>画像HTTP障害（非VIP fixture）</legend>
      <button onClick={() => imageMode('error')}>画像503</button><button onClick={() => imageMode('timeout')}>画像15秒無応答</button><button onClick={() => imageMode('pass')}>画像障害を解除</button>
      <button onClick={() => imageMode('error-once')}>画像503を1回だけ</button><button onClick={() => imageMode('timeout-once')}>画像無応答を1回だけ</button>
      <button disabled={!!battle} onClick={() => setBattle(`/api/qa/recovery-image?run=${crypto.randomUUID()}`)}>fixture戦闘を表示</button>
      <output aria-label="画像失敗終了回数">終了回数：{finished}</output>
    </fieldset>
    <pre aria-label="障害注入記録" style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{events.join('\n')}</pre>
    {battle && <BattleView result={result} vipActive={false} initialPaused backgroundSrc={battle} onComplete={() => { setFinished(value => value + 1); setBattle(null); }} />}
    {app && <Home />}
  </main>;
}
