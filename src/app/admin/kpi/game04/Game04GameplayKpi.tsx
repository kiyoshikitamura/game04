'use client';
import { useEffect, useState } from 'react';
type Cell = string | number | null;
type Row = Record<string, Cell>;
type Data = { environment: string; series: Row[]; supply: Row[]; detail: { raid_rewards: Row[]; restore_acknowledgements: Row[]; acquisition_subject_activity: Row[] } };
function Table({ title, rows }: { title: string; rows: Row[] }) {
  const columns = Object.keys(rows[0] ?? {});
  return <section><h2>{title}</h2>{!rows.length ? <p>対象期間の計測記録なし</p> : <div style={{ overflowX: 'auto' }}><table><thead><tr>{columns.map(c => <th key={c} style={{ padding: 8, textAlign: 'left' }}>{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{columns.map(c => <td key={c} style={{ padding: 8 }}>{r[c] ?? '—'}</td>)}</tr>)}</tbody></table></div>}</section>;
}
export default function Game04GameplayKpi() {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const [from, setFrom] = useState(today), [to, setTo] = useState(today);
  const [data, setData] = useState<Data | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setData(null); setError('');
    void fetch(`/api/admin/kpi/v2/gameplay?${new URLSearchParams({ from, to })}`, { cache: 'no-store', signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(`取得できませんでした (HTTP ${r.status})`); return r.json(); })
      .then(body => { if (!controller.signal.aborted) setData(body); })
      .catch(e => { if (!controller.signal.aborted) setError(String(e.message)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [from, to, refresh]);
  return <main style={{ padding: 24, color: '#eee', background: '#171717', minHeight: '100vh' }}>
    <h1>GAME04 開発KPI</h1><p>開発環境のみ・JST。included / excluded（QA等）/ unmapped を分離しています。未計測期間を0実績とは扱いません。</p>
    <label>開始日 <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>{' '}
    <label>終了日 <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>{' '}
    <button disabled={loading} onClick={() => setRefresh(v => v + 1)}>更新</button>
    {loading && <p role="status">取得中…</p>}{error && <p role="alert">{error}</p>}
    {data && <><Table title="保存操作・戦闘（開始／確定を分離）" rows={data.series} /><Table title="ログボ・BOX・VIP供給" rows={data.supply} />
      <p>ログボ daily_bundle は配布回数です。VIPは配布台帳であり、決済売上ではありません。</p>
      <Table title="共闘・侵攻：新規受取grantと数量" rows={data.detail.raid_rewards} /><p>複数報酬種に同じgrantが現れるため、行をまたいだgrant_countの合算は不可。</p>
      <Table title="保存状態の受信確認" rows={data.detail.restore_acknowledgements} /><p>本体が同じバージョンの状態を受信した観測です。外部認証・別端末復帰の受入とは区別します。</p>
      <Table title="流入subjectとゲーム行動" rows={data.detail.acquisition_subject_activity} /><p>最初の結合済み流入元で集計。unboundは流入未結合です。行動件数・人数であり、転換率ではありません。</p></>}
  </main>;
}
