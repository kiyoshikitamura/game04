'use client';
import { game04UiError } from '@/app/lib/game04UiError';
import { useEffect, useRef, useState } from 'react';
import { NORMAL_GACHA_MASTER, normalGachaRates } from '@/domain/redesign/normalGacha';
import type { RedesignResponse } from '@/utils/redesignApi';
import Modal from './Modal';

export default function NormalGachaView({ data, onAction }: { data: RedesignResponse; onAction: (name: string, payload?: Record<string, unknown>, requestId?: string) => Promise<RedesignResponse> }) {
  const actionRef = useRef(onAction); actionRef.current = onAction;
  const catalog = useRef(data.normalGacha);
  if(data.normalGacha) catalog.current=data.normalGacha;
  const normalState=data.normalGacha ?? catalog.current;
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState<{count: number; currency: string} | null>(null);
  const [results, setResults] = useState<RedesignResponse['normalGachaResults']>();
  const drawLock = useRef(false);
  const pending = useRef<{id: string; payload: {count: number; currency: string}} | null>(null);
  useEffect(() => { void actionRef.current('normal_gacha_status').catch(e => setError(game04UiError(e))); }, []);
  let displayError = error;
  let rates: ReturnType<typeof normalGachaRates> = [];
  try { if (normalState) rates = normalGachaRates(normalState.pool); } catch (e) { displayError ||= game04UiError(e); }
  const cost = selection?.currency === 'FREE' ? 0 : (selection?.count ?? 0) * NORMAL_GACHA_MASTER.singleCost;
  async function draw() {
    if (!selection || drawLock.current) return;
    drawLock.current = true;
    setBusy(true); setError('');
    pending.current ??= {id: crypto.randomUUID(), payload: selection};
    try { const response = await onAction('normal_gacha', pending.current.payload, pending.current.id); setResults(response.normalGachaResults); pending.current = null; setSelection(null); }
    catch (e) { setError(game04UiError(e)); }
    finally { drawLock.current = false; setBusy(false); }
  }
  if (error) return <Modal kind="notice" onClose={() => setError('')}><p>{error}</p></Modal>;
  return <section className="rd-panel"><h2>通常登用</h2><p>姫武将・戦技・武具の混合ガチャ</p><p>所持銭 {data.state.cash.toLocaleString()}</p>
    <p>無料10連は毎日1回。通常は1回 {NORMAL_GACHA_MASTER.singleCost.toLocaleString()}銭、10連 {(NORMAL_GACHA_MASTER.singleCost*10).toLocaleString()}銭です。</p><div className="g4g-actions">{[{count:10,currency:'FREE',label:'無料10連'},{count:1,currency:'CASH',label:'1回登用'},{count:10,currency:'CASH',label:'10連登用'}].map(o => <button className="rd-button rd-primary" key={o.label} disabled={busy || !rates.length || (o.currency==='FREE'?!normalState?.available:data.state.cash<o.count*1000)} onClick={() => {pending.current=null;setSelection({count:o.count,currency:o.currency});}}>{o.label}</button>)}</div>
    {normalState && !normalState.available && <p>本日の無料10連は利用済みです。</p>}
    {displayError && <p role="alert">{displayError}</p>}
    <details><summary>提供割合</summary><table><thead><tr><th>レア</th><th>姫武将</th><th>戦技</th><th>武具</th></tr></thead><tbody>{(['N','R','SR','SSR'] as const).map(r=><tr key={r}><th>{r}</th>{(['CHARACTER','SKILL','EQUIPMENT'] as const).map(k=><td key={k}>{NORMAL_GACHA_MASTER.buckets.find(b=>b[0]===r&&b[1]===k)![2]/100}%</td>)}</tr>)}</tbody></table>{rates.map(r=><p key={`${r.item_type}:${r.item_id}`}>{r.name}：{r.probability.toFixed(5)}%</p>)}</details>
    {selection && <Modal kind="confirm" busy={busy} title="通常登用の確認" onClose={() => { if(!busy){setSelection(null);pending.current=null;} }} footer={<div className="g4-cta-row"><button className="rd-button" disabled={busy} onClick={() => { setSelection(null); pending.current=null; }}>キャンセル</button><button className="rd-button rd-primary" disabled={busy} onClick={() => void draw()}>{busy?'登用中…':'登用する'}</button></div>}><p>{selection.count}回・消費 {cost.toLocaleString()}銭</p><p>所持銭 {data.state.cash.toLocaleString()} → {(data.state.cash-cost).toLocaleString()}</p>{error&&<p role="alert">{error}</p>}</Modal>}
    {results && <Modal kind="result" title="登用結果" onClose={() => setResults(undefined)}>{results.map((r,i)=><div key={i} className="g4g-row"><img src={r.image} alt="" width={48} height={48}/><span>{r.rarity} {r.name}<br/>{r.outcome}</span></div>)}</Modal>}
  </section>;
}
