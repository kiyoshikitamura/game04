'use client';
import { useEffect, useRef, useState } from 'react';
import TutorialOpening, { type OpeningScene } from '@/app/qa/tutorial-opening/TutorialOpeningPreview';
import type { RedesignState } from '@/domain/redesign/types';
import { SCENES } from '@/domain/redesign/tutorial/content';

/** Presentation checkpoints use the existing atomic, idempotent server transitions. */
export default function IntegratedTutorial({state,onNext}:{state:RedesignState;busy:boolean;onNext:(step:number,name:string)=>Promise<unknown>}) {
 const step=useRef(state.tutorial!.step);
 step.current=Math.max(step.current,state.tutorial!.step);
 const storageKey=`game04:opening:v1:${state.userId}`;
 const [initial,setInitial]=useState<{scene:OpeningScene;name:string}|null>(null);
 useEffect(()=>{
  let saved:{scene?:OpeningScene;name?:string}|null=null;
  try{saved=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{/* Server progress remains authoritative. */}
  const name=state.tutorial!.name||saved?.name||'';
  const n=state.tutorial!.step;
  const allowed:OpeningScene[]=n>=14?['name','farewell']:n>=13?['practice']:n>=10?['ready','practice']:['world','challenge','oda','trailer','need','blackout','osaka','name','recruit','test','formation'];
  const fallback:OpeningScene=n>=14?(name?'farewell':'name'):n>=13?'practice':n>=10?'ready':'world';
  setInitial({scene:saved?.scene&&allowed.includes(saved.scene)?saved.scene:fallback,name});
 },[storageKey]);
 if(!initial)return null;
 const advance=async(scene:OpeningScene,name:string)=>{
  const target=scene==='formation'?10:scene==='ready'?13:scene==='practice'?14:scene==='farewell'?SCENES.length:step.current;
  while(step.current<target){
   const submitted=step.current;
   const value=await onNext(submitted,name) as {state:RedesignState};
   const next=value.state.tutorial?.step;
   if(next===undefined||next<=submitted)throw Error('進行が更新されています。再読み込みしてください。');
   step.current=Math.max(step.current,next);
  }
  if(target===SCENES.length)try{localStorage.removeItem(storageKey);}catch{/* No reliance on browser storage for grants. */}
 };
 return <TutorialOpening live={{state,initialScene:initial.scene,initialName:initial.name,advance,onSceneChange:(scene,name)=>{try{localStorage.setItem(storageKey,JSON.stringify({scene,name}));}catch{/* Replay from the saved server checkpoint if storage is unavailable. */}}}}/>;
}
