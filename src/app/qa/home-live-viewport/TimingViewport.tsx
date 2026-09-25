'use client';
import { useEffect, useRef, useState } from 'react';
import InteractionProbe from './InteractionProbe';
import { acceptsQaTimingEvent, appendQaTiming, qaTimingEnabled, type QaTimingMessage } from '@/utils/redesignQaTelemetry';

export default function TimingViewport({ width, height }: { width: number; height: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [list, setList] = useState<QaTimingMessage[]>([]);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!qaTimingEnabled()) return;
    const receive = (event: MessageEvent) => {
      if (!acceptsQaTimingEvent(event, window.location.origin, frame.current?.contentWindow)) return;
      setList(current => appendQaTiming(current, event.data));
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  const latest = list.at(-1);
  return <>
    <iframe key={reload} ref={frame} title={`実API本体 ${width}px`} src="/" width={width} height={height} style={{ display: 'block', border: 0, width, height, maxWidth: 'none' }} />
    {qaTimingEnabled() && <section aria-label="QA読み込み計測" style={{ background:'#151515', color:'#fff', padding:12, fontSize:12, overflowWrap:'anywhere' }}>
      <h2>QA読み込み計測</h2>
      <p>本体は上の実寸iframeです。APIは認証・通信・応答確認を含む総待機時間。画像は必須画像グループの待機時間（キャッシュを含む）です。対象CTAの操作可能時刻は下段で別計測。FCPをTTIとは扱いません。action-feedbackは操作ハンドラ開始からbusy状態のDOM反映、action-resultは応答後にbusy解除と状態反映をReactがcommitした時刻です。描画済み・対象CTA操作可能の確認は下段で別計測します。</p>
      <button onClick={() => { setList([]); setReload(value => value + 1); }}>本体を再読込して計測を消去</button>
      <p>件数：{list.length} / 200</p>
      {latest && <div aria-label="ブラウザ初回表示指標">
        <p>Navigation：{latest.navigation?.type ?? '未取得'} ／ responseStart {latest.navigation?.responseStart.toFixed(1) ?? '—'} ms ／ responseEnd {latest.navigation?.responseEnd.toFixed(1) ?? '—'} ms ／ DCL {latest.navigation?.domContentLoaded.toFixed(1) ?? '—'} ms</p>
        {latest.paints.map(paint => <p key={paint.name}>{paint.name}：{paint.startTime.toFixed(1)} ms</p>)}
        {!latest.paints.length && <p>Paint未取得</p>}
      </div>}
      <div style={{overflowX:'auto'}}><table><thead><tr><th>種別 / 対象</th><th>枚数</th><th>開始ms</th><th>完了ms</th><th>待機ms</th><th>結果</th></tr></thead><tbody>{list.map((row,index) => <tr key={index}><td>{row.metric.kind} / {row.metric.scope}</td><td>{row.metric.count ?? '—'}</td><td>{row.metric.startedAt.toFixed(1)}</td><td>{row.metric.settledAt.toFixed(1)}</td><td>{row.metric.durationMs.toFixed(1)}</td><td>{row.metric.outcome}</td></tr>)}</tbody></table></div>
    </section>}
    <InteractionProbe frame={frame} />
  </>;
}
