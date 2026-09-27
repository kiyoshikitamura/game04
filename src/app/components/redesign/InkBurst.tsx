import type { BattleLeadPhase } from '@/domain/presentation/battleLeadIn';
import { INK_ROOT } from '@/domain/presentation/battleLeadIn';
import './InkBurst.css';
export default function InkBurst({phase,active,count,wave,paused}:{phase?:BattleLeadPhase;active:boolean;count:number;wave:number;paused:boolean}){
 return <div className={`g4-ink-burst ${phase?'phase-'+phase:''} ${active?'active':''}`} data-paused={paused} data-phase={phase??'none'} aria-hidden={!phase&&!active}>
  <div className="ink-dim"/><img className="ink-sweep" src={INK_ROOT+'01_ink_sweep.png'} alt=""/><img className="ink-impact" src={INK_ROOT+'04_ink_impact.png'} alt=""/><img className="ink-release" src={INK_ROOT+'05_ink_release.png'} alt=""/>
  <img className="ink-title" src={INK_ROOT+'02_burst_title.png'} alt=""/><div className="ink-edge"/><img className="ink-aura" src={INK_ROOT+'03_red_black_aura.png'} alt=""/><img className="ink-pulse" src={INK_ROOT+'03_red_black_aura.png'} alt=""/>
  {(phase==='start'||phase==='wave'||phase==='combo')&&<div className="ink-words" role="status"><img src={INK_ROOT+(phase==='start'?'battle-start':phase==='wave'?`wave-${wave}`:`combo-${count}`)+'.png'} alt={phase==='start'?'戦開始！！':phase==='wave'?`第${wave}派`:`${count}連撃`}/></div>}
 </div>;
}
