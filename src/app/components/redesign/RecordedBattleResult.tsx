'use client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BattleResult } from '@/domain/redesign/battle';
import { recordedBattleMvp } from '@/domain/presentation/recordedBattleMvp';
import { characterArt } from '@/theme/creativeAssets';
import './RecordedBattleResult.css';
export default function RecordedBattleResult({result,title,backgroundSrc,actions,rewards}:{result:BattleResult;title:string;backgroundSrc:string;actions:ReactNode;rewards?:ReactNode}) {
 const analysis=useMemo(()=>recordedBattleMvp(result),[result]);const mvp=analysis.mvp;const unit=result.party.find(u=>u.id===mvp?.participant.id);
 const [score,setScore]=useState(0);
 useEffect(()=>{const target=mvp?.score.total??0;if(matchMedia('(prefers-reduced-motion: reduce)').matches){setScore(target);return;}setScore(0);const begin=performance.now();let id=0;const tick=(t:number)=>{const progress=Math.min(1,(t-begin)/420);setScore(Math.round(target*progress));if(progress<1)id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[result,mvp?.score.total]);
 return <section className="recorded-result" style={{backgroundImage:`radial-gradient(ellipse at 100% 35%,#17121ae8,transparent 65%),linear-gradient(transparent,#17121add),url("${backgroundSrc}")`}} aria-label="戦闘リザルト">
  <header><small>{title}</small><h2>{result.outcome==='win'?'勝利':result.outcome==='lose'?'敗北':'行動上限'}</h2></header>
  <div className="recorded-result-body" tabIndex={0} aria-label="戦績と報酬">
   {mvp&&unit?<><div className="recorded-mvp"><div className="recorded-mvp-art"><img src={characterArt(unit,'full')??unit.image} alt={unit.name}/></div><div className="recorded-mvp-name"><small>MVP</small><h3>{unit.name}</h3><strong><span data-mvp-score={mvp.score.total}>{score}</span> <small>PT</small></strong></div></div><div className="recorded-result-stats"><span>与ダメージ<b>{mvp.raw.damage.toLocaleString()}</b></span><span>撃破<b>{mvp.raw.kills}体</b></span><span>回復<b>{mvp.raw.heal.toLocaleString()}</b></span></div></>:<p className="recorded-result-notice">{analysis.unavailable??'MVP対象の武将がいません。'}</p>}
   <details><summary>戦績・MVP詳細</summary><div className="recorded-result-panel">{mvp&&<><h3>MVPスコア内訳</h3><dl>{([['damage','与ダメージ',40],['kills','撃破',20],['heal','回復',20],['shield','シールド',15],['survival','生存',5]] as const).map(([key,label,max])=><div key={key}><dt>{label}</dt><dd>{mvp.score[key]} / {max}</dd></div>)}</dl></>}<h3>部隊の戦果</h3>{result.analysis.map(a=><p key={a.id}>{a.name}<br/>与ダメージ {a.damage.toLocaleString()} · 回復 {a.healing.toLocaleString()}</p>)}<details><summary>戦闘ログ</summary>{result.frames.map(f=><p key={f.index}>第{f.wave}派 · {f.text.replace(/Wave\s*(\d+)/gi,'第$1派')}</p>)}</details></div></details>
   {rewards&&<details><summary>獲得報酬・プレイヤーEXP</summary><div className="recorded-result-panel">{rewards}</div></details>}
  </div><footer>{actions}</footer>
 </section>;
}
