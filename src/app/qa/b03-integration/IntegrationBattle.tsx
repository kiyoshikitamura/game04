'use client';
import {AudioProvider} from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import type {BattleResult} from '@/domain/redesign/battle';
import '@/app/components/redesign/redesign.css';
export default function IntegrationBattle({result,play}:{result:BattleResult;play:boolean}){
  return <AudioProvider><BattleView result={result} initialFrame={play?0:1} initialPaused={!play} vipActive={false} onComplete={()=>{}} backgroundSrc="/bg/approved-20260925/quest-mikawa.webp"/></AudioProvider>;
}
