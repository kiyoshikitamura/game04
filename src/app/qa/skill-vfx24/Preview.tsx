'use client';
import { useMemo, useRef, useState } from 'react';
import { AudioProvider } from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import ActionButton from '@/app/components/ui/ActionButton';
import { SKILL_VFX24 } from '@/app/components/redesign/battle-effects/skillVfx24';
import { createSkillVfxFixture, type FixtureOptions } from './fixture';
import '@/app/components/redesign/redesign.css';
import './preview.css';

export default function Preview() {
  const [effectId,setEffectId]=useState(SKILL_VFX24[0].id);
  const [options,setOptions]=useState<FixtureOptions>({skillId:'SKD007',side:'ally',burst:false,success:true,enemies:3,cutin:'SSR'});
  const [run,setRun]=useState(0),[playing,setPlaying]=useState(false),[left,setLeft]=useState(false);
  const stage=useRef<HTMLElement>(null);
  const definition=SKILL_VFX24.find(effect=>effect.id===effectId)!;
  const result=useMemo(()=>createSkillVfxFixture(options),[options]);
  function restart(){setLeft(false);setPlaying(true);setRun(n=>n+1);if(window.innerWidth<900)stage.current?.scrollIntoView({block:'start'});}
  function update(patch:Partial<FixtureOptions>){setOptions(current=>({...current,...patch}));setLeft(false);setPlaying(false);setRun(n=>n+1);}
  return <AudioProvider><main className="vfx24-preview">
    <header className="vfx24-controls">
      <h1>戦技演出 24種</h1>
      <p>演出確認用の合戦です。所持品・報酬・進行は変わりません。</p>
      <div className="vfx24-fields">
        <label className="vfx24-wide">演出<select aria-label="演出" value={effectId} onChange={e=>{const d=SKILL_VFX24.find(d=>d.id===e.target.value)!;setEffectId(d.id);update({skillId:d.skillIds[0]});}}>{SKILL_VFX24.map((d,i)=><option key={d.id} value={d.id}>{String(i+1).padStart(2,'0')} {d.name}</option>)}</select></label>
        <label>使用スキル<select aria-label="使用スキル" value={options.skillId} onChange={e=>update({skillId:e.target.value})}>{definition.skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>発動側<select aria-label="発動側" value={options.side} onChange={e=>update({side:e.target.value as FixtureOptions['side']})}><option value="ally">味方</option><option value="enemy">敵</option></select></label>
        <label>敵の配置<select aria-label="敵の配置" value={options.enemies} onChange={e=>update({enemies:Number(e.target.value)})}><option value={1}>1体</option><option value={3}>3体</option></select></label>
        <label>カットイン<select aria-label="カットイン" value={options.cutin} onChange={e=>update({cutin:e.target.value as FixtureOptions['cutin']})}><option>SSR</option><option>SR</option></select></label>
      </div>
      <div className="vfx24-options">
        <label><input type="checkbox" checked={options.burst} disabled={options.side==='enemy'} onChange={e=>update({burst:e.target.checked})}/>連撃も確認</label>
        <label><input type="checkbox" checked={options.success} onChange={e=>update({success:e.target.checked})}/>付与・解除が成立</label>
      </div>
      <div className="vfx24-actions"><ActionButton variant="primary" onClick={restart}>{playing?'もう一度再生':'再生する'}</ActionButton><span>{definition.motion}</span></div>
      <p className="vfx24-help">一時停止・速度・SKIP・リタイアは合戦画面から操作できます。</p>
    </header>
    <section ref={stage} className="vfx24-stage" aria-label="演出確認エリア" data-selected-vfx={effectId} data-run={run}>
      {left?<p role="status">再生を終了しました。「もう一度再生」で確認できます。</p>:<BattleView key={run} result={result} initialFrame={1} initialPaused={!playing} hideWaveDisplay vipActive onRetire={()=>setLeft(true)} onComplete={()=>setLeft(true)} title="戦技演出の確認" backgroundSrc="/bg/approved-20260925/quest-mikawa.webp"/>}
    </section>
  </main></AudioProvider>;
}
