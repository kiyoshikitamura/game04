'use client';
import { useState } from 'react';
import { BATTLE_EFFECT_FAMILIES, type BattleEffectFamily } from '@/app/components/redesign/battleEffectPresentation';
import { BattleEffectLayer } from '@/app/components/redesign/battle-effects/BattleEffectLayer';
import type { TargetSide } from '@/app/components/redesign/battle-effects/settings';

/** Drawing-only fixture: SPD/blind/silence never enter the battle simulator. */
export default function EffectHarness() {
  const [family,setFamily]=useState<BattleEffectFamily>('slash');
  const [side,setSide]=useState<TargetSide>('enemy');
  const [speed,setSpeed]=useState(1),[paused,setPaused]=useState(false),[generation,setGeneration]=useState(0),[visible,setVisible]=useState(true);
  const [count,setCount]=useState(5);
  const party=Array.from({length:count},(_,i)=>({id:'ally-'+i,x:10+i*80/Math.max(1,count-1),y:76}));
  const enemies=[{id:'enemy-0',x:50,y:37},{id:'enemy-1',x:18,y:44},{id:'enemy-2',x:82,y:44}];
  const targets=side==='ally'?party:enemies;
  const restart=()=>{setVisible(true);setGeneration(n=>n+1);};
  return <main style={{height:'100dvh',overflow:'auto',background:'#141019',color:'#fff',padding:12}}>
    <h1>バトルエフェクト16系統・描画確認</h1><p>保存・報酬なし。SPD上昇・暗闇・沈黙は描画のみ。</p>
    <div className="fxHarnessControls" style={{display:'flex',flexWrap:'wrap',gap:12}}>
      <style>{'.fxHarnessControls button,.fxHarnessControls select{color:#fff;background:#342b3a;border:1px solid #bda477;padding:5px;border-radius:3px}'}</style>
      <label>系統<select aria-label="系統" value={family} onChange={e=>{setFamily(e.target.value as BattleEffectFamily);restart();}}>{BATTLE_EFFECT_FAMILIES.map(f=><option key={f}>{f}</option>)}</select></label>
      <label>対象側<select aria-label="対象側" value={side} onChange={e=>{setSide(e.target.value as TargetSide);restart();}}><option value="enemy">敵</option><option value="ally">味方</option></select></label>
      <label>味方人数<select aria-label="味方人数" value={count} onChange={e=>{setCount(Number(e.target.value));restart();}}>{[1,3,5,6].map(n=><option key={n}>{n}</option>)}</select></label>
      <button onClick={restart}>再生</button><button onClick={()=>setPaused(p=>!p)}>{paused?'再開':'一時停止'}</button><button onClick={()=>setSpeed(s=>s===3?1:s+1)}>速度 {speed}</button><button onClick={()=>setVisible(false)}>SKIP / 離脱</button>
    </div>
    <section data-testid="effect-stage" style={{position:'relative',width:'min(100%,403px)',aspectRatio:'403/798',background:'linear-gradient(#302a38,#17141b)',margin:'20px auto'}}>
      {[...enemies,...party].map((p,i)=><div key={p.id} data-unit-id={p.id} data-order={i<3?i:i-3} style={{position:'absolute',left:p.x+'%',top:p.y+'%',transform:'translate(-50%,-50%)'}}><span data-effect-anchor style={{display:'block',border:'1px solid #d8ba74',padding:'20px 3px',fontSize:10}}>{p.id}</span></div>)}
      {visible&&<BattleEffectLayer key={generation} effects={(family.endsWith('_all')?targets:[targets[0]]).map(t=>({targetId:t.id,family}))} partyIds={party.map(p=>p.id)} paused={paused} speed={speed}/>}
    </section>
  </main>;
}
