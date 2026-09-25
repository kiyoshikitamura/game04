'use client';
import { useLayoutEffect, useRef } from 'react';
import type { BattleEffectFamily, RecordedBattleEffect } from '../battleEffectPresentation';
import { mountEffect, type EffectTarget } from './renderer';
import type { TargetSide } from './settings';
import './mock-layers.css';

interface Props { effects: readonly RecordedBattleEffect[]; partyIds: readonly string[]; paused: boolean; speed: number }
/** The caller keys this layer by result/frame and removes it on SKIP/end. */
export function BattleEffectLayer({effects,partyIds,paused,speed}:Props) {
  const groups=new Map<string,{family:BattleEffectFamily;side:TargetSide;targets:EffectTarget[]}>();
  for(const effect of effects){const side=partyIds.includes(effect.targetId)?'ally':'enemy';const key=effect.family+side;const group=groups.get(key)??{family:effect.family,side,targets:[]};if(!group.targets.some(t=>t.id===effect.targetId))group.targets.push({id:effect.targetId,side});groups.set(key,group);}
  return <>{Array.from(groups,([key,group])=><Effect key={key} {...group} paused={paused} speed={speed}/>)}</>;
}
function Effect({family,side,targets,paused,speed}:{family:BattleEffectFamily;side:TargetSide;targets:EffectTarget[];paused:boolean;speed:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const controller=useRef<ReturnType<typeof mountEffect>|null>(null);
  const elapsed=useRef(0);
  const targetKey=JSON.stringify(targets);
  useLayoutEffect(()=>{
    elapsed.current=0;
    const instance=mountEffect(ref.current!,family,side,JSON.parse(targetKey));controller.current=instance;
    return ()=>{instance.dispose();controller.current=null;};
  },[family,side,targetKey]);
  useLayoutEffect(()=>{
    if(paused)return;
    let request=0, previous=performance.now();
    const tick=(now:number)=>{const instance=controller.current;if(!instance)return;elapsed.current+=(now-previous)*speed;previous=now;instance.seek(elapsed.current);if(elapsed.current<instance.duration)request=requestAnimationFrame(tick);};
    request=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(request);};
  },[paused,speed,family,side,targetKey]);
  return <div ref={ref} className="battleFx16" data-family={family} data-target-side={side} data-paused={paused} aria-hidden="true"/>;
}
