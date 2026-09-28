'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BattleResult } from '../../domain/redesign/battle';
import { recordedBattleFrameDuration } from '../../domain/presentation/recordedBattlePresentation';
import { battleLeadIn, burstPresentation } from '../../domain/presentation/battleLeadIn';
interface Options {result:BattleResult;initialFrame?:number;initialPaused?:boolean;vipActive:boolean;blocked?:boolean;minimumFrameDuration?:(result:BattleResult,index:number)=>number;waveIntroDuration?:number;omitWaveIntro?:boolean;comboAfterAction?:boolean;}
const clampFrame=(i:number,r:BattleResult)=>Math.max(0,Math.min(Number.isFinite(i)?Math.floor(i):0,r.frames.length-1));
/** Presentation clocks never modify recorded combat. Every timer is cancelled on pause, skip and unmount. */
export function useRecordedBattlePlayback({result,initialFrame=0,initialPaused=false,vipActive,blocked=false,minimumFrameDuration,waveIntroDuration=0,omitWaveIntro=false,comboAfterAction=false}:Options){
 const [index,setIndex]=useState(()=>clampFrame(initialFrame,result)),[speed,setSpeed]=useState(1),[paused,setPaused]=useState(initialPaused);
 const generation=useRef(0),clock=useRef<{result:BattleResult;index:number;remaining:number}|null>(null);
 const [tail,setTail]=useState<{result:BattleResult;index:number}|null>(null);
 const [lead,setLead]=useState({result,index:-1,step:0});
 const leadClock=useRef<{result:BattleResult;index:number;step:number;remaining:number}|null>(null);
 const frame=result.frames[clampFrame(index,result)],finished=!frame||index>=result.frames.length-1;
 const burst=burstPresentation(result,index),effectiveSpeed=speed*(burst.active&&!finished?1.5:1);
 const fullPlan=waveIntroDuration>0?battleLeadIn(result,index,initialFrame).filter(part=>!omitWaveIntro||part.phase!=='wave'):[];
 // Opening preview: finish the action/cutin clock, then show combo before advancing to damage.
 const deferredCombo=comboAfterAction?fullPlan.find(part=>part.phase==='combo'):undefined;
 const plan=fullPlan.filter(part=>!comboAfterAction||part.phase!=='combo');
 const postActionCombo=!!deferredCombo&&tail?.result===result&&tail.index===index;
 const step=lead.result===result&&lead.index===index?lead.step:0;
 const phase=!finished?(postActionCombo?'combo':plan[step]?.phase):undefined,phaseMs=postActionCombo?deferredCombo!.ms:plan[step]?.ms??0;
 const waveIntroActive=phase==='dark'||phase==='start'||phase==='wave';
 const playbackPaused=paused||blocked||finished||!!phase;
 useEffect(()=>{generation.current++;clock.current=null;leadClock.current=null;setTail(null);setLead({result,index:-1,step:0});setIndex(clampFrame(initialFrame,result));setPaused(initialPaused);},[result,initialFrame,initialPaused]);
 useEffect(()=>{if(!vipActive&&speed>2)setSpeed(1)},[vipActive,speed]);
 useEffect(()=>{
  if(!phase)return;
  if(!leadClock.current||leadClock.current.result!==result||leadClock.current.index!==index||leadClock.current.step!==step)leadClock.current={result,index,step,remaining:phaseMs};
  if(paused||blocked)return;
  const c=leadClock.current,start=performance.now(),g=generation.current;
  const t=setTimeout(()=>{if(g!==generation.current)return;if(postActionCombo)setIndex(i=>Math.min(i+1,result.frames.length-1));else setLead({result,index,step:step+1})},c.remaining);
  return()=>{clearTimeout(t);c.remaining=Math.max(0,c.remaining-(performance.now()-start))};
 },[result,index,step,phase,phaseMs,paused,blocked,postActionCombo]);
 useEffect(()=>{
  if(!clock.current||clock.current.result!==result||clock.current.index!==index)clock.current={result,index,remaining:Math.max(frame?.event==='burst_start'?0:recordedBattleFrameDuration(frame),minimumFrameDuration?.(result,index)??0,frame?.event==='action_start'&&burst.active?450*effectiveSpeed:0)};
  if(playbackPaused)return;
  const c=clock.current,g=generation.current,start=performance.now();
  const t=setTimeout(()=>{if(g!==generation.current)return;c.remaining=0;if(deferredCombo)setTail({result,index});else setIndex(i=>Math.min(i+1,result.frames.length-1))},Math.max(0,c.remaining/effectiveSpeed));
  return()=>{clearTimeout(t);c.remaining=Math.max(0,c.remaining-(performance.now()-start)*effectiveSpeed)};
 },[result,index,frame,effectiveSpeed,playbackPaused,minimumFrameDuration,burst.active,!!deferredCombo]);
 const cancel=useCallback(()=>{generation.current++;clock.current=null;leadClock.current=null;setPaused(true)},[]);
 const cycleSpeed=useCallback(()=>setSpeed(s=>s>=(vipActive?3:2)?1:s+1),[vipActive]);
 const skip=useCallback(()=>{if(!vipActive)return;generation.current++;clock.current=null;leadClock.current=null;setIndex(Math.max(0,result.frames.length-1))},[vipActive,result]);
 return {index,frame,finished,speed,effectiveSpeed,paused,playbackPaused,waveIntroActive,presentationPhase:phase,comboNumber:burst.count,burstActive:burst.active&&!finished,cancel,setPaused,cycleSpeed,skip};
}
