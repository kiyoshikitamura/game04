import { notFound } from 'next/navigation';
import { isQaHarnessAvailable } from '@/domain/presentation/qaHarness';
import { simulateBattle } from '@/domain/redesign/battle';
import { BALANCE_V2_SKILL_CANDIDATES } from '@/domain/redesign/masters';
import BattleReplayFixture from '../battle-common/BattleReplayFixture';
import { additionsBattleFixture, SCENARIOS } from './fixture';
import styles from './page.module.css';
export const dynamic = 'force-dynamic';
export default async function AdditionsBattleQaPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if(process.env.VERCEL_ENV==='production'||!isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV,process.env.NODE_ENV)) notFound();
  const params=await searchParams;
  const requested=typeof params.skill==='string'?params.skill:'';
  const candidate=BALANCE_V2_SKILL_CANDIDATES.find(s=>s.id===requested||s.description.startsWith(`${requested} /`))??BALANCE_V2_SKILL_CANDIDATES[0];
  const firstTargetMode=params.targetMode==='default'?'default':'fixed';
  const lb=Math.max(0,Math.min(10,Number(params.lb)||0));
  const scenario=typeof params.scenario==='string'&&params.scenario in SCENARIOS?params.scenario as keyof typeof SCENARIOS:'mixed';
  if(params.viewport==='360'||params.viewport==='390') return <main className={styles.page}><p>スマートフォン幅 {params.viewport}px・検証用仮データ</p><iframe title="追加戦闘ルールのスマートフォン表示" src={`/qa/battle-additions?skill=${encodeURIComponent(candidate.id)}&lb=${lb}&scenario=${scenario}&targetMode=${firstTargetMode}`} style={{display:'block',width:Number(params.viewport),height:780,border:'1px solid #ad8150',margin:'auto'}} /></main>;
  const input=additionsBattleFixture(candidate.id,Math.floor(lb),scenario,firstTargetMode);
  const result=simulateBattle(input);
  return <main className={styles.page}><div className={styles.content}><h1>追加戦闘ルール・表示確認</h1><p>検証用仮マスター／保存・報酬なし。72候補の名称・画像対応は未確定。正式バランス・排出プールの承認ではありません。</p><p>ルール：{result.rulesVersion}／LB {Math.floor(lb)}／敵の被弾SP 5（検証用）</p>
    <form><label>先頭狙いの未決境界（比較用）<select name="targetMode" defaultValue={firstTargetMode}><option value="fixed">固有指定：被弾誘導を無視</option><option value="default">汎用対象：被弾誘導に従う</option></select></label><label>代表編成<select name="scenario" defaultValue={scenario}>{Object.entries(SCENARIOS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>先頭キャラの優先1スキル<select name="skill" defaultValue={candidate.id}>{BALANCE_V2_SKILL_CANDIDATES.map(s=><option key={s.id} value={s.id}>{s.name}（{s.id}）</option>)}</select></label><label>検証LB<select name="lb" defaultValue={Math.floor(lb)}>{Array.from({length:11},(_,i)=><option key={i}>{i}</option>)}</select></label><button>サーバー計算して再生</button></form>
    <details><summary>今回の編成・検証数値</summary>{input.party.map(unit=><article key={unit.id}><strong>{unit.name}</strong><p>{unit.skills.map((skill,index)=>`優先${index+1} ${skill.name} SP${skill.spCost}`).join(' ／ ')}</p></article>)}</details><BattleReplayFixture result={result} />
  </div></main>;
}
