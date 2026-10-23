'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GACHA_CATEGORIES, gachaRates, gachaExchangeTargets } from '@/domain/redesign/gacha';
import type { GachaReceipt, RedesignResponse } from '@/utils/redesignApi';
import Modal from './Modal';
import './GachaView.css';

type Category = 'normal' | 'character' | 'skill' | 'equipment';
type Selection = { action: 'gacha_draw' | 'gacha_exchange'; payload: Record<string, unknown>; description: string; cost: number; unit: string; category: Category };
type Pending = Selection & { version: 1; id: string; owner: string };
const LABELS: Record<Category, string> = { normal: '通常', character: '姫武将', skill: '戦技', equipment: '武具' };
const CATEGORIES: Category[] = ['normal', 'character', 'skill', 'equipment'];
const SPECIAL = ['character', 'skill', 'equipment'] as const;
const storageKey = (owner: string) => `game04:gacha:v1:${owner}`;
function readPending(owner: string): Pending | null {
  const saved = localStorage.getItem(storageKey(owner));
  if (!saved) return null;
  const value = JSON.parse(saved) as Pending;
  if (value.version !== 1 || value.owner !== owner || !value.id || !['gacha_draw', 'gacha_exchange'].includes(value.action)) throw new Error('前回の登用情報を確認できません。ページを再読み込みしてください。');
  return value;
}

export default function NormalGachaView({ data, onAction }: { data: RedesignResponse; onAction: (name: string, payload?: Record<string, unknown>, requestId?: string) => Promise<RedesignResponse> }) {
  const owner = data.state.userId;
  const actionRef = useRef(onAction);
  const ownerRef = useRef(owner);
  useLayoutEffect(() => { actionRef.current = onAction; ownerRef.current = owner; }, [onAction, owner]);
  const [status, setStatus] = useState(data.gacha);
  const [category, setCategory] = useState<Category>('normal');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [receipt, setReceipt] = useState<GachaReceipt | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(true);
  const lock = useRef(false);
  const rates = useMemo(() => gachaRates(category), [category]);
  const targets = useMemo(() => category === 'normal' ? [] : gachaExchangeTargets(category), [category]);
  const config = GACHA_CATEGORIES[category];
  const disabled = busy || !ready || !status || !!pending;

  function acceptResponse(response: RedesignResponse, operation?: Pending, animate = false) {
    if (response.gacha) setStatus(response.gacha);
    if (response.gachaRejected) {
      if (operation) { localStorage.removeItem(storageKey(operation.owner)); setPending(null); }
      setSelection(null);
      setError(response.gachaError || '登用できませんでした。所持数をご確認ください。');
      return;
    }
    const saved = response.gachaReceipt;
    if (!saved || (operation && saved.requestId !== operation.id)) throw new Error('結果を確認できませんでした。「前回の結果を確認」から再確認してください。');
    // Keep the operation journal until the server has returned its saved receipt.
    localStorage.setItem(`${storageKey(owner)}:last`, saved.requestId);
    if (operation) localStorage.removeItem(storageKey(operation.owner));
    setLastId(saved.requestId); setPending(null); setSelection(null); setReceipt(saved);
    setRevealed(!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  useEffect(() => {
    let live = true;
    setReady(false); setError(''); setSelection(null); setReceipt(null);
    const restore = async () => {
      try {
        const saved = readPending(owner);
        if (!live) return;
        setPending(saved); setLastId(localStorage.getItem(`${storageKey(owner)}:last`));
        const current = await actionRef.current('gacha_status');
        if (live && current.gacha) setStatus(current.gacha);
        if (saved && live) {
          const response = await actionRef.current('gacha_receipt', { requestId: saved.id });
          if (!live) return;
          if (response.gachaReceiptStatus === 'committed') acceptResponse(response, saved);
        }
        if (live) setReady(true);
      } catch (reason) { if (live) { setError(reason instanceof Error ? reason.message : '読み込めませんでした。'); setReady(true); } }
    };
    void restore();
    const changed = (event: StorageEvent) => {
      if (event.key !== storageKey(owner)) return;
      try { setPending(readPending(owner)); } catch (reason) { setError(reason instanceof Error ? reason.message : '前回の登用情報を確認できません。'); }
    };
    window.addEventListener('storage', changed);
    return () => { live = false; window.removeEventListener('storage', changed); };
    // The owner is the only restore boundary; onAction is deliberately accessed by ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  useEffect(() => {
    if (!receipt || revealed) return;
    const timer = setTimeout(() => setRevealed(true), 650);
    return () => clearTimeout(timer);
  }, [receipt, revealed]);

  // Refresh the daily offer at its JST boundary and after a suspended tab returns.
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout>;
    const refreshStatus = async () => {
      if (lock.current) return;
      try { const current = await actionRef.current('gacha_status'); if (ownerRef.current === owner && current.gacha) setStatus(current.gacha); } catch { /* Keep the last confirmed state; the draw also checks the server date. */ }
    };
    const schedule = () => {
      const jstNow = Date.now() + 9 * 60 * 60 * 1000;
      timer = setTimeout(() => { void refreshStatus(); schedule(); }, 86400000 - jstNow % 86400000 + 100);
    };
    const visible = () => { if (document.visibilityState === 'visible') void refreshStatus(); };
    schedule(); document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', visible); };
  }, [owner, ready]);

  async function submit(chosen?: Selection) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    const requestOwner = owner;
    const run = async () => {
      const existing = readPending(requestOwner);
      const operation: Pending = existing ?? { ...chosen!, version: 1, id: crypto.randomUUID(), owner: requestOwner };
      if (!existing && !chosen) throw new Error('前回の登用情報を確認できません。');
      localStorage.setItem(storageKey(requestOwner), JSON.stringify(operation));
      setPending(operation);
      const response = await actionRef.current(operation.action, operation.payload, operation.id);
      if (ownerRef.current !== requestOwner) return;
      acceptResponse(response, operation, true);
    };
    try {
      if (navigator.locks) await navigator.locks.request(`game04:gacha:${owner}`, { ifAvailable: true }, async lease => {
        if (!lease) throw new Error('別の画面で登用を確認中です。しばらくしてから再確認してください。');
        await run();
      }); else await run();
    } catch (reason) { if (ownerRef.current === requestOwner) setError(reason instanceof Error ? reason.message : '結果を確認できませんでした。前回の結果を再確認してください。'); }
    finally { lock.current = false; if (ownerRef.current === requestOwner) setBusy(false); }
  }

  async function showLast() {
    if (!lastId || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { const response = await actionRef.current('gacha_receipt', { requestId: lastId }); if (ownerRef.current === owner) acceptResponse(response); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '結果を確認できませんでした。'); }
    finally { lock.current = false; setBusy(false); }
  }
  function chooseDraw(count: 1 | 10, payment: 'cash' | 'free' | 'gems' | 'ticket') {
    const cost = payment === 'free' ? 0 : payment === 'ticket' ? 1 : config.singleCost * count;
    const unit = payment === 'cash' ? '銭' : payment === 'gems' ? '輝石' : payment === 'ticket' ? `${LABELS[category]}券` : '銭';
    setSelection({ action: 'gacha_draw', payload: { category, count, payment }, description: `${category === 'normal' ? '通常登用' : `特選・${LABELS[category]}`} ${count === 10 ? '10連' : '1回'}`, cost, unit, category });
  }
  const normal = category === 'normal';
  const points = normal ? 0 : status?.points[category] ?? 0;
  const tickets = normal ? 0 : status?.tickets[category] ?? 0;
  const exchangeCost = normal ? 0 : GACHA_CATEGORIES[category].exchangePoints!;

  return <section className="rd-panel g4-gacha" aria-busy={busy}>
    <h2>登用</h2>
    <nav className="g4-gacha-tabs" aria-label="登用の種類">{CATEGORIES.map(value => <button key={value} type="button" className="rd-button" aria-pressed={category === value} disabled={busy} onClick={() => { setCategory(value); setError(''); }}>{value === 'normal' ? '通常' : `特選 ${LABELS[value]}`}</button>)}</nav>
    <h3>{normal ? '通常登用' : `特選・${LABELS[category]}`}</h3>
    <p>{normal ? '姫武将・戦技・武具が登場' : 'R・SR・SSRから登場'}</p>
    <div className="g4-gacha-wallet"><span>銭 {data.state.cash.toLocaleString()}</span><span>輝石 {data.state.diamonds.toLocaleString()}</span></div>
    {pending && <div className="g4-gacha-recovery" role="status"><p>前回の登用結果を確認してください。</p><button className="rd-button" disabled={busy} onClick={() => void submit()}>{busy ? '確認中…' : '前回の結果を確認'}</button></div>}
    {error && <p role="alert">{error}</p>}
    {!ready && <p role="status">登用情報を読み込み中…</p>}
    {ready && !status && <button className="rd-button" disabled={busy} onClick={() => { setError(''); void actionRef.current('gacha_status').then(current => { if (current.gacha) setStatus(current.gacha); }).catch(reason => setError(reason instanceof Error ? reason.message : '読み込めませんでした。')); }}>登用情報を再読み込み</button>}
    {normal ? <>
      <p>無料10連：{!status ? '確認中' : status.freeAvailable ? '本日利用できます' : '本日利用済み'}<br/><span className="g4-gacha-note">毎日0時（日本時間）更新</span></p>
      <div className="g4-gacha-ctas"><button className="rd-button" disabled={disabled || !status?.freeAvailable} onClick={() => chooseDraw(10, 'free')}>無料10連</button><button className="rd-button" disabled={disabled || data.state.cash < 1000} onClick={() => chooseDraw(1, 'cash')}>1回 · 1,000銭</button><button className="rd-button" disabled={disabled || data.state.cash < 10000} onClick={() => chooseDraw(10, 'cash')}>10連 · 10,000銭</button></div>
    </> : <>
      <p>{LABELS[category]}券 {tickets.toLocaleString()}枚 · 交換ポイント {points.toLocaleString()}</p>
      <div className="g4-gacha-ctas"><button className="rd-button" disabled={disabled || data.state.diamonds < config.singleCost} onClick={() => chooseDraw(1, 'gems')}>1回 · {config.singleCost.toLocaleString()}輝石</button><button className="rd-button" disabled={disabled || data.state.diamonds < config.singleCost * 10} onClick={() => chooseDraw(10, 'gems')}>10連 · {(config.singleCost * 10).toLocaleString()}輝石</button><button className="rd-button" disabled={disabled || tickets < 1} onClick={() => chooseDraw(1, 'ticket')}>{LABELS[category]}券1枚で1回</button></div>
      <p className="g4-gacha-note">1回につき1ポイント。{exchangeCost}ポイントでSSRを選択交換できます。</p>
    </>}
    <details className="g4-gacha-details"><summary>排出一覧・提供割合</summary>
      <p>{(['N', 'R', 'SR', 'SSR'] as const).filter(rarity => config.rarityWeights[rarity] > 0).map(rarity => `${rarity} ${config.rarityWeights[rarity] / 100}%`).join(' / ')}</p>
      {normal && <p>各レア内：姫武将20% · 戦技30% · 武具50%</p>}
      <p className="g4-gacha-note">同カテゴリ・同レア内は均等です。10連も1回ごとに同じ確率です。個別割合は小数点以下を丸めて表示しています。</p>
      <ul className="g4-gacha-pool">{rates.map(row => <li key={`${row.kind}:${row.id}`}><span>{row.rarity} · {row.name}</span><span>{row.probability.toFixed(5)}%</span></li>)}</ul>
    </details>
    {!normal && <details className="g4-gacha-details"><summary>SSR選択交換 · {exchangeCost}ポイント</summary><p>所持 {points}ポイント</p><div className="g4-gacha-exchange">{targets.map(target => <div key={target.id} className="g4-gacha-item">{target.image && <img src={target.image} alt="" width={48} height={48} loading="lazy"/>}<span>{target.name}</span><button className="rd-button" disabled={disabled || points < exchangeCost} onClick={() => setSelection({ action: 'gacha_exchange', payload: { category, masterId: target.id }, category, description: `${target.name}を交換`, cost: exchangeCost, unit: `${LABELS[category]}ポイント` })}>交換</button></div>)}</div></details>}
    {lastId && !pending && <button className="rd-button" disabled={busy} onClick={() => void showLast()}>前回の結果を見る</button>}
    <div className="g4-gacha-point-summary" aria-label="カテゴリ別交換ポイント">{SPECIAL.map(value => <span key={value}>{LABELS[value]} {status?.points[value] ?? '—'}pt</span>)}</div>
    {selection && !pending && <Modal title={selection.action === 'gacha_exchange' ? 'SSR交換の確認' : '登用の確認'} onClose={() => setSelection(null)} closeDisabled={busy} footer={<button className="rd-button g4-gacha-confirm" disabled={busy} onClick={() => void submit(selection)}>{busy ? '確認中…' : selection.action === 'gacha_exchange' ? 'この内容で交換する' : 'この内容で登用する'}</button>}>
      <p>{selection.description}</p><p>消費：{selection.cost.toLocaleString()}{selection.unit}</p>
      <p>{selection.action === 'gacha_exchange' ? `交換後：${(points - selection.cost).toLocaleString()}ポイント` : selection.payload.payment === 'free' ? '本日分の無料10連を使用します。' : selection.payload.payment === 'ticket' ? `使用後：${tickets - 1}枚` : selection.payload.payment === 'cash' ? `残り：${(data.state.cash - selection.cost).toLocaleString()}銭` : `残り：${(data.state.diamonds - selection.cost).toLocaleString()}輝石`}</p>
    </Modal>}
    {receipt && <Modal title={receipt.payment === 'points' ? 'SSR交換結果' : '登用結果'} onClose={() => { setReceipt(null); setRevealed(true); }} className="g4-gacha-result-dialog" footer={<button className="rd-button" onClick={() => { if (!revealed) setRevealed(true); else setReceipt(null); }}>{revealed ? '登用に戻る' : '演出をスキップ'}</button>}>
      {!revealed ? <div className="g4-gacha-reveal" role="status">新たな出会い</div> : <><div className="g4-gacha-results">{receipt.results.map((result, index) => <div key={`${receipt.requestId}:${index}`} className="g4-gacha-item" data-rarity={result.rarity}>{result.image && <img src={result.image} alt="" width={64} height={64}/>}<div><strong>{result.rarity} · {result.name}</strong><p>{result.isNew && result.kind !== 'equipment' ? '初回取得 · ' : ''}{result.outcome}</p></div></div>)}</div>{receipt.pointGain > 0 && <p>{LABELS[receipt.category]}ポイント +{receipt.pointGain} · 所持 {receipt.pointsAfter}</p>}</>}
    </Modal>}
  </section>;
}

