import type {CSSProperties} from 'react';
import type {BattleFrame} from '@/domain/redesign/battle';
import './BattleResourceDisplay.css';
export const BATTLE_RESOURCE_ASSETS=['shared-sp-gauge','burst-plate','burst-plate-glow','burst-gold-radial','burst-gold-flare','burst-gold-sparkles'].map(name=>'/assets/versioned/sengoku-battle-'+name+'-display-v1.webp');
/** Display only: never runs eligibility, lottery, SP spending or battle actions. */
export default function BattleResourceDisplay({frame,startIndex,paused,speed,animate=true}:{animate?:boolean;frame:BattleFrame;startIndex:number;paused:boolean;speed:number}) {
 const active=frame.burst;const charged=(frame.burstGauge??0)>=(frame.maxBurstGauge??200);const starting=frame.event==='burst_start';
 const state=active?'active':charged?'charged':'inactive';
 return <div className="g4-battle-resources" data-state={state} data-paused={paused} style={{'--resource-speed':speed} as CSSProperties}>
  <div className={'g4-sp-art'+(frame.maxSp>0&&frame.partySp>=frame.maxSp?' is-full':'')} role="meter" aria-label="共通SP" aria-valuemin={0} aria-valuemax={frame.maxSp} aria-valuenow={frame.partySp}>
   <div className="g4-sp-track"><div style={{width:Math.min(100,100*frame.partySp/Math.max(1,frame.maxSp))+'%'}}/></div><img src={BATTLE_RESOURCE_ASSETS[0]} alt=""/><strong>{frame.partySp} / {frame.maxSp}</strong>
  </div>
  <div key={active?'burst-'+startIndex:'gauge'} className={'g4-burst-art'+(active?(animate?' awakening':' settled'):'')+(starting?' starting':'')} role="img" aria-label={active?'BURST継続中':charged?'BURSTゲージ充填済み・発動は条件と抽選に従う':'BURSTゲージ充填中'}>
   <i className="beam"/><img className="normal" src={BATTLE_RESOURCE_ASSETS[1]} alt=""/><img className="crest" src={BATTLE_RESOURCE_ASSETS[2]} alt=""/><img className="ornate" src={BATTLE_RESOURCE_ASSETS[2]} alt=""/><img className="radial" src={BATTLE_RESOURCE_ASSETS[3]} alt=""/><img className="flash" src={BATTLE_RESOURCE_ASSETS[4]} alt=""/><img className="sparks" src={BATTLE_RESOURCE_ASSETS[5]} alt=""/><i className="sheen"/>
   <small>{frame.burstGauge??0}/{frame.maxBurstGauge??200}</small>
  </div>
 </div>;
}
