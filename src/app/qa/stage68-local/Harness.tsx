'use client';
import {useEffect,useRef,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import type {BattleResult} from '@/domain/redesign/battle';
import '@/app/components/redesign/redesign.css';
type Fixture={case:string;recipe:string;seed:number;inputHash?:string;enemyHash?:string;result:BattleResult};
export default function Harness(){
 const [fixture,setFixture]=useState<Fixture|null>(null),[measurement,setMeasurement]=useState<object|null>(null),started=useRef<number|null>(null);
 useEffect(()=>{const id=new URL(location.href).searchParams.get('case')??'9-6-primary';fetch('/qa/stage68-local/fixture?case='+encodeURIComponent(id)).then(r=>r.json()).then(setFixture);},[]);
 useEffect(()=>{if(!fixture)return;let hidden=0;let initialSpeed:string|null=null;const onVisibility=()=>{if(document.hidden)hidden++;};document.addEventListener('visibilitychange',onVisibility);
  const observer=new MutationObserver(()=>{const battle=document.querySelector<HTMLElement>('[data-playback-frame]');if(!battle)return;const frame=Number(battle.dataset.playbackFrame);if(started.current===null&&battle.dataset.introPaused==='false'&&battle.dataset.playbackPaused==='false'){started.current=performance.now();initialSpeed=document.querySelector('[aria-label^="再生速度"]')?.getAttribute('aria-label')??null;}if(started.current!==null&&frame===fixture.result.frames.length-1){setMeasurement({case:fixture.case,seed:fixture.seed,recipe:fixture.recipe,inputHash:fixture.inputHash,enemyHash:fixture.enemyHash,wallMilliseconds:performance.now()-started.current,frames:fixture.result.frames.length,actions:fixture.result.playerActions,reason:fixture.result.reason,hiddenTransitions:hidden,initialSpeed,measuredAt:new Date().toISOString()});observer.disconnect();}});
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-playback-frame','data-intro-paused','data-playback-paused']});return()=>{observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);};
 },[fixture]);
 return <GameContext.Provider value={{playCyberSe:()=>{}}}><AudioProvider><div><h1>Stage68 ローカル実再生計測</h1><p>{fixture?.case??'読込中'}</p><output id="measurement">{JSON.stringify(measurement)}</output></div>{fixture&&<BattleView result={fixture.result} initialPaused vipActive onComplete={()=>{}} backgroundSrc="/bg/approved-20260925/quest-mikawa.webp"/>}</AudioProvider></GameContext.Provider>;
}
