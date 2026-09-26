'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { qaTimingEnabled } from '@/utils/redesignQaTelemetry';

type Sample = { target: string; activatedAt: number; origin: number; start: number; end: number; outcome: 'ready' | 'timeout'; trigger: 'navigation' | 'interaction' };
/** QA only: a named CTA becoming hit-testable, not Lighthouse TTI or all-screen readiness. */
export default function InteractionProbe({ frame }: { frame: RefObject<HTMLIFrameElement | null> }) {
  const [target, setTarget] = useState('武将');
  const targetRef = useRef(target);
  const [armed, setArmed] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const armedRef = useRef(false);
  useEffect(() => {
    if (!qaTimingEnabled()) return;
    let raf = 0, observed: Document | null = null;
    let pending: { start: number; trigger: Sample['trigger']; stable: number; activated: boolean; activatedAt: number; target: string } | null = null;
    const begin = (event: Event) => {
      if (event.type === 'keydown' && !['Enter', ' '].includes((event as KeyboardEvent).key)) return;
      if (!armedRef.current || !frame.current?.contentWindow) return;
      armedRef.current = false; setArmed(false);
      pending = { start: frame.current.contentWindow.performance.now(), trigger: 'interaction', stable: 0, activated: false, activatedAt: 0, target: targetRef.current };
    };
    const activate = () => { if (pending?.trigger === 'interaction' && !pending.activated) { pending.activated = true; pending.activatedAt = frame.current?.contentWindow?.performance.now() ?? pending.start; } };
    const tick = () => {
      const win = frame.current?.contentWindow, doc = frame.current?.contentDocument;
      if (win && doc) {
        if (observed !== doc) {
          observed?.removeEventListener('pointerdown', begin, true);
          observed?.removeEventListener('keydown', begin, true);
          observed?.removeEventListener('click', activate);
          observed = doc;
          doc.addEventListener('pointerdown', begin, true);
          doc.addEventListener('keydown', begin, true);
          doc.addEventListener('click', activate);
          pending = { start: 0, trigger: 'navigation', stable: 0, activated: true, activatedAt: 0, target: targetRef.current };
        }
        if (pending) {
          const now = win.performance.now();
          const candidates = Array.from(doc.querySelectorAll<HTMLElement>('button, a, [role="button"]'));
          const battle = doc.querySelector<HTMLElement>('section[data-playback-paused="false"][data-playback-frame]');
          const battleRect = battle?.getBoundingClientRect();
          const battleHit = battleRect && doc.elementFromPoint(battleRect.left + Math.min(battleRect.width, win.innerWidth) / 2, battleRect.top + Math.min(battleRect.height, win.innerHeight) / 2);
          const battleReady = !!battle && Number(battle.dataset.playbackFrame) >= 0 && !doc.querySelector('dialog[open]')
            && !!battleRect && battleRect.width > 0 && win.getComputedStyle(battle).visibility === 'visible'
            && !!battleHit && battle.contains(battleHit);
          const ready = pending.activated && (pending.target.trim() === '戦闘再生開始' ? battleReady : candidates.some(el => {
            if ((el.getAttribute('aria-label') || el.textContent || '').trim() !== pending!.target.trim() || !pending!.target.trim()) return false;
            if (el.matches(':disabled, [aria-disabled="true"]') || el.closest('[inert], [aria-busy="true"]')) return false;
            const rect = el.getBoundingClientRect(), style = win.getComputedStyle(el);
            if (rect.width <= 0 || rect.height <= 0 || style.visibility !== 'visible' || style.display === 'none' || style.pointerEvents === 'none') return false;
            const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
            if (x < 0 || y < 0 || x >= win.innerWidth || y >= win.innerHeight) return false;
            const hit = doc.elementFromPoint(x, y);
            return hit === el || !!hit && el.contains(hit);
          }));
          pending.stable = ready ? pending.stable + 1 : 0;
          // Wait for click dispatch (not merely pointerdown), then two rendered frames.
          if (pending.stable >= 2 || now - pending.start >= 60000) {
            const sample: Sample = { target: pending.target, activatedAt: pending.activatedAt, origin: win.performance.timeOrigin, start: pending.start, end: now, trigger: pending.trigger, outcome: pending.stable >= 2 ? 'ready' : 'timeout' };
            setSamples(current => [...current.slice(-119), sample]); pending = null;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); observed?.removeEventListener('pointerdown', begin, true); observed?.removeEventListener('keydown', begin, true);
          observed?.removeEventListener('click', activate); };
  }, [frame]);
  if (!qaTimingEnabled()) return null;
  return <section aria-label="QA対象CTA操作可能計測" style={{ background: '#151515', color: '#fff', padding: 12, fontSize: 12 }}>
    <h2>対象CTAの操作可能時刻</h2>
    <p>対象の完全一致名・可視・非disabled/inert・中央点の遮蔽物なしを2描画frameで観測。画面全体のTTIや保存完了ではありません。遷移先固有CTAを指定し、準備後に次の本体操作を計測してください。「戦闘再生開始」は保存済み戦闘のフレーム表示・非停止・画像ダイアログ無しを2frameで観測します。</p>
    <label>対象CTA <input value={target} onChange={event => { targetRef.current = event.target.value; setTarget(event.target.value); }} /></label>
    <button onClick={() => { armedRef.current = true; setArmed(true); }}>次の本体操作を計測</button><span>{armed ? ' 操作待ち' : ''}</span>
    <button onClick={() => setSamples([])}>操作計測履歴を消去</button>
    <p>navigation開始0はiframe navigation origin。TAP待ち・ログボを閉じる時間も含みます。interactionは本体pointerdown/keydown起点、click発火後に操作可能判定。スクロール等でclickしなかった場合も60秒未成立はtimeoutです。</p>
    <div style={{ overflowX: 'auto' }}><table><thead><tr><th>対象CTA</th><th>起点</th><th>timeOrigin</th><th>開始ms</th><th>観測ms</th><th>経過ms</th><th>入力→click ms</th><th>click→操作可能 ms</th><th>結果</th></tr></thead><tbody>{samples.map((sample, index) => <tr key={index}><td>{sample.target}</td><td>{sample.trigger}</td><td>{sample.origin}</td><td>{sample.start.toFixed(1)}</td><td>{sample.end.toFixed(1)}</td><td>{(sample.end - sample.start).toFixed(1)}</td><td>{sample.trigger==='interaction'&&sample.activatedAt>0?(sample.activatedAt-sample.start).toFixed(1):'—'}</td><td>{sample.trigger==='interaction'&&sample.activatedAt>0?(sample.end-sample.activatedAt).toFixed(1):'—'}</td><td>{sample.outcome}</td></tr>)}</tbody></table></div>
  </section>;
}
