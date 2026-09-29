'use client';

import Link from 'next/link';
import ActionButton from '@/app/components/ui/ActionButton';
import Game04Loading from '@/app/components/ui/Game04Loading';
import ScreenState from '@/app/components/ui/ScreenState';
import { useEffect, useState } from 'react';
import type { DashboardData, Period, Retention } from '@/domain/redesign/kpi/dashboard';

const number = (value: number | null) => value == null ? '—' : value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
const percent = (value: number | null) => value == null ? '—' : `${(value * 100).toFixed(1)}%`;
const yen = (value: number | null) => value == null ? '—' : `¥${number(value)}`;
const sourceNames: Record<string, string> = { meta: 'Meta', x: 'X', organic: '自然流入', direct: '直接流入', unknown: '不明' };
type Section = 'overview' | 'stages' | 'raids' | 'sources';
const sections: { id: Section; name: string }[] = [
  { id: 'overview', name: '概況' }, { id: 'stages', name: 'ステージ状況' }, { id: 'raids', name: 'レイド' }, { id: 'sources', name: '流入元' },
];
function RetentionCell({ value }: { value?: Retention }) {
  if (!value?.denominator) return <span>—<small>{value?.status === 'not_reached' ? '未到達' : '対象者なし'}</small></span>;
  const label = value.status === 'final' ? '確定' : '未確定';
  return <span title={`${label}：${number(value.numerator)} / ${number(value.denominator)}人`}>
    {percent((value.numerator ?? 0) / value.denominator)}<small>{number(value.numerator)} / {number(value.denominator)}人</small><small>{label}</small>
  </span>;
}

export default function Game04KpiDashboard({ fixedDate }: { fixedDate?: string }) {
  const [section, setSection] = useState<Section>('overview');
  const [period, setPeriod] = useState<Period>('daily');
  const [month, setMonth] = useState('');
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    const params = new URLSearchParams({ period });
    if (fixedDate) params.set('date', fixedDate);
    else if (month) params.set('month', month);
    if (revision) params.set('refresh', '1');
    async function load() {
      setLoading(true); setError(''); setData(null);
      try {
        const response = await fetch(`/api/admin/kpi/game04?${params}`, { signal: abort.signal, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'KPIを取得できませんでした。');
        if (!abort.signal.aborted) setData(result);
      } catch (e) {
        if (!abort.signal.aborted) setError(e instanceof Error ? e.message : 'KPIを取得できませんでした。');
      } finally { if (!abort.signal.aborted) setLoading(false); }
    }
    void load();
    return () => abort.abort();
  }, [period, month, fixedDate, revision]);
  const latest = data?.rows[0];
  const activeLabel = period === 'daily' ? 'DAU' : 'MAU';
  const coverageWarning = data && Object.values(data.coverage).some(value => value > 0);
  function selectPeriod(value: Period) { setPeriod(value); setMonth(''); }
  function dateLabel(date: string) {
    if (period === 'monthly') return <ActionButton size="compact" className="g4-kpi-link" onClick={() => { setMonth(date); setPeriod('daily'); }}>{date}</ActionButton>;
    return fixedDate ? date : <Link href={`/admin/kpi/day/${date}`}>{date}</Link>;
  }
  return <main className="g4-kpi">
    <div className="g4-kpi-shell">
      <header className="g4-kpi-header">
        <div><p className="g4-kpi-eyebrow">GAME04 / 戦国姫艶武</p><h1>KPIダッシュボード</h1><p className="g4-kpi-muted">JST（日本時間）・管理 / QA / テスト / 不正停止 / 確認済みリセマラを集計時点の区分で除外</p></div>
        <div className="g4-kpi-header-actions">{data && <span className="g4-kpi-badge">{data.environment}データ</span>}<ActionButton size="compact" busy={loading} busyLabel="集計中" onClick={() => setRevision(value => value + 1)}>再集計</ActionButton></div>
      </header>
      {fixedDate && <p><Link href="/admin/kpi">← KPI一覧へ</Link><span className="g4-kpi-date">{fixedDate} の集計</span></p>}
      <nav className="g4-kpi-tabs" aria-label="KPIの種類">{sections.map(item => <ActionButton size="compact" key={item.id} aria-pressed={section === item.id} onClick={() => setSection(item.id)}>{item.name}</ActionButton>)}</nav>
      <div className="g4-kpi-toolbar">
        {section === 'stages' ? <strong>累計・全68ステージ</strong> : <div className="g4-kpi-period" aria-label="集計単位">
          <ActionButton size="compact" aria-pressed={period === 'daily'} onClick={() => selectPeriod('daily')}>日別</ActionButton>
          {!fixedDate && <ActionButton size="compact" aria-pressed={period === 'monthly'} onClick={() => selectPeriod('monthly')}>月別</ActionButton>}
          {month && <ActionButton size="compact" onClick={() => setMonth('')}>{month} ×</ActionButton>}
        </div>}
        <p className="g4-kpi-muted">{data ? <>取得 {new Date(data.updated_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false })} JST{section !== 'stages' && <><br />対象 {data.from} 〜 {data.to}（当日・当月は途中集計）</>}</> : '集計結果を取得します'}</p>
      </div>
      {loading && <div className="g4-kpi-status" role="status"><Game04Loading label="集計結果を読み込み中" /><span>集計結果を読み込み中…</span></div>}
      {error && <ScreenState kind="error" message={error} actionLabel="再試行" onAction={() => setRevision(value => value + 1)} />}
      {data && <>
        {coverageWarning && <div className="g4-kpi-warning" role="status">集計対象外の記録があります：撃破日時不明 {number(data.coverage.raid_defeat_without_receipt)}件 / レイド種別不明 {number(data.coverage.raid_unknown_type)}件 / ステージID不明 {number(data.coverage.stage_unknown_id)}件。該当する数値は過少集計の可能性があります。</div>}
        {section === 'overview' && <>
          {latest && <div className="g4-kpi-cards">
            {[['新規登録', number(latest.new_users)], [activeLabel, number(latest.active_users)], ['売上', yen(latest.revenue)], ['チュートリアル完了率', percent(latest.tutorial_rate)]].map(([label, value]) => <div className="g4-kpi-card" key={label}><p>{label}</p><strong>{value}</strong><small>{latest.date}{latest.partial ? ' · 途中集計' : ''}</small></div>)}
          </div>}
          <p className="g4-kpi-muted">タイトルUU：同じブラウザーの重複を除いた到達数。{data.title_measured_from ? `計測開始 ${new Date(data.title_measured_from).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false })} JST（開始日・開始月は開始後のみ）` : '計測記録待ち。開始前の期間は未計測です。'}</p>
          <h2>基本指標・継続率</h2><p className="g4-kpi-muted">{period === 'monthly' ? '月を選ぶと日別の内訳を表示します。' : '日付を選ぶとその日の集計を表示します。'} 継続率は新規登録コホートの D1〜D5。</p>
          <div className="g4-kpi-table" tabIndex={0} aria-label="基本指標の表（横スクロール）"><table><thead><tr>{['期間', 'タイトルUU', '新規登録', '累計登録', activeLabel, 'チュートリアル完了', '完了率', '課金者', '課金率', '売上', 'ARPPU', 'ARPU', 'D1', 'D2', 'D3', 'D4', 'D5'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{data.rows.map(row => <tr key={row.date}><th scope="row">{dateLabel(row.date)}{row.partial && <small>途中集計</small>}</th><td>{row.title_uu == null ? '未計測' : number(row.title_uu)}</td><td>{number(row.new_users)}</td><td>{number(row.total_registered)}</td><td>{number(row.active_users)}</td><td>{number(row.tutorial_completed)}</td><td>{percent(row.tutorial_rate)}</td><td>{number(row.payers)}</td><td>{percent(row.payer_rate)}</td><td>{yen(row.revenue)}</td><td>{yen(row.arppu)}</td><td>{yen(row.arpu)}</td>{[1, 2, 3, 4, 5].map(day => <td key={day}><RetentionCell value={row.retention.find(item => item.day === day)} /></td>)}</tr>)}</tbody></table></div>
        </>}
        {section === 'stages' && <>
          <h2>ステージ状況 <span>累計</span></h2><p className="g4-kpi-muted">全68ステージの戦闘開始数と勝利数。再挑戦・再クリアを含みます。期間切替の影響を受けません。</p>
          <div className="g4-kpi-table" tabIndex={0} aria-label="68ステージの累計実績"><table><thead><tr><th scope="col">ステージ</th><th scope="col">名称</th><th scope="col">実行数</th><th scope="col">クリア数</th><th scope="col">クリア率</th></tr></thead><tbody>{data.stages.map(row => <tr key={row.id}><th scope="row">{row.design_id || row.id}</th><td className="g4-kpi-name">{row.name}</td><td>{number(row.executions)}</td><td>{number(row.clears)}</td><td>{percent(row.clear_rate)}</td></tr>)}</tbody></table></div>
        </>}
        {section === 'raids' && <>
          <h2>レイド <span>{period === 'daily' ? '日別' : '月別'}</span></h2><p className="g4-kpi-muted">開催はルーム作成、撃破は最終撃破の記録日時、参加UUは戦闘開始を基準に集計。月別UUは月内で重複排除しています。</p>
          <div className="g4-kpi-table" tabIndex={0} aria-label="レイド種別ごとの開催数・撃破数・参加UU"><table><thead><tr><th rowSpan={2} scope="col">期間</th><th colSpan={3} scope="colgroup">エンカウント</th><th colSpan={3} scope="colgroup">アンロック</th></tr><tr>{['encounter', 'unlock'].flatMap(kind => ['開催数', '撃破数', '参加UU'].map(label => <th key={`${kind}-${label}`} scope="col">{label}</th>))}</tr></thead><tbody>{data.rows.map(row => <tr key={row.date}><th scope="row">{dateLabel(row.date)}{row.partial && <small>途中集計</small>}</th>{(['encounter', 'unlock'] as const).map(kind => {
            const raid = data.raids.find(item => item.key === row.date && item.kind === kind);
            return [<td key={`${kind}-hosted`}>{number(raid?.hosted ?? 0)}</td>, <td key={`${kind}-defeated`}>{number(raid?.defeated ?? 0)}</td>, <td key={`${kind}-participants`}>{number(raid?.participants ?? 0)}</td>];
          })}</tr>)}</tbody></table></div>
        </>}
        {section === 'sources' && <>
          <h2>流入元別の獲得・継続</h2><p className="g4-kpi-muted">登録は初回流入元に帰属。LP到達と登録は別の発生日で集計します。</p>
          <div className="g4-kpi-table" tabIndex={0} aria-label="流入元別の集計"><table><thead><tr>{['期間', '流入元', 'LP到達', '登録に紐づいたLP到達', '新規登録', 'チュートリアル完了', 'D1', 'D3'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.sources.map(row => <tr key={`${row.key}-${row.source}`}><th scope="row">{dateLabel(row.key)}</th><td className="g4-kpi-name">{sourceNames[row.source] || row.source}</td><td>{number(row.landings)}</td><td>{number(row.landing_starts)}</td><td>{number(row.new_users)}</td><td>{number(row.tutorial_completed)}</td>{[1, 3].map(day => <td key={day}><RetentionCell value={row.retention.find(item => item.day === day)} /></td>)}</tr>)}</tbody></table></div>
        </>}
        <details className="g4-kpi-definitions"><summary>集計の定義・注意点</summary><ul>
          <li>DAU / MAU：操作保存・画面復元の確認・戦闘開始または確定が記録されたユーザーを期間内で重複排除。ページ表示のみで確認記録のないアクセスは含みません。</li>
          <li>チュートリアル：登録期間内のユーザーのうち、取得時点までに全手順を完了した人数。継続率：登録日から N 日後の活動人数 / 観測日が今日以前の登録人数。当日の途中経過も含め、対象者全員の観測日が終了するまでは「未確定」、終了後は「確定」。観測日がまだ来ていない場合は「未到達」。月別は観測日を迎えた対象者が順次分母に加わります。判定・更新時刻はJSTで、再集計時に更新します。</li>
          <li>売上：本番決済（live）の付与完了（GRANTED）を付与日時で集計。ARPPU = 売上 / 課金者、ARPU = 売上 / {activeLabel}。</li>
          <li>ステージ：実行数は戦闘開始、クリア数は確定済み勝利。クリア率 = クリア数 / 実行数。未確定・撤退・敗北はクリアに含みません。</li>
          <li>レイド：同じルームの段階撃破や報酬受取は追加の撃破に数えません。種別間の参加UUは重複するため合算できません。開催日と撃破日が異なる場合があります。</li>
          <li>タイトルUUはブラウザー単位です。別端末・別ブラウザー・保存データ削除では別UUになります。識別できたQA・テスト・管理者のブラウザーを除外し、未ログインで紐付けできない訪問は含みます。</li>
          <li>累計は保存されている記録を取得時点まで集計します。過去日を開いてもステージは現在の累計です。自動取得は最大60秒のキャッシュを利用し、「再集計」で最新を取得します。</li>
        </ul></details>
      </>}
    </div>
  </main>;
}
