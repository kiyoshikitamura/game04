import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import { simulateBattle } from '@/domain/redesign/battle';
import { commonBattleFixture } from './fixture';
import BattleReplayFixture from './BattleReplayFixture';

export const dynamic = 'force-dynamic';
const scenarios = { burst: 'SP・BURST・スキル優先順', interrupt: '割込み・行動不能', waves: 'Wave引継ぎ', limit: '300回上限', legacy: '保存済み旧形式互換' };
export default async function CommonBattleQaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === 'production' || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
  const params = await searchParams;
  const scenario = typeof params.scenario === 'string' && params.scenario in scenarios ? params.scenario as keyof typeof scenarios : 'burst';
  if (params.viewport === '360' || params.viewport === '390') return <main style={{ height: '100dvh', overflow: 'auto', background: '#120d09', color: '#ead3aa', padding: 12 }}><p>スマートフォン幅 {params.viewport}px・仮データ検証</p><iframe title="戦闘ルールのスマートフォン表示" src={`/qa/battle-common?scenario=${scenario}`} style={{ display: 'block', width: Number(params.viewport), height: 780, border: '1px solid #ad8150', margin: 'auto' }} /></main>;
  const result = simulateBattle(commonBattleFixture(scenario));
  return <main style={{ height: '100dvh', overflow: 'auto', background: '#120d09', color: '#ead3aa' }}><div style={{ maxWidth: 500, padding: '12px 10px 40px', margin: 'auto' }}>
    <h1 style={{ fontSize: 20 }}>共通戦闘ルール・表示確認</h1><p style={{ fontSize: 12 }}>検証用仮マスター／保存・報酬なし。サーバーで確定した記録を再生します。正式数値によるバランス受入ではありません。</p>
    <nav aria-label="検証シナリオ" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>{Object.entries(scenarios).map(([id, label]) => <a key={id} style={{ color: '#f7d993' }} href={`?scenario=${id}`} aria-current={scenario === id ? 'page' : undefined}>{label}</a>)}</nav>
    <BattleReplayFixture result={result} />
  </div></main>;
}
