"use client";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { isPresentationBusy, presentationSnapshot, presentationTasks, subscribePresentation } from './presentationTasks';
import { PRESENTATION } from './presentationSettings';
import BrandedLoading from './BrandedLoading';
export default function PresentationRuntime() {
  useSyncExternalStore(subscribePresentation,presentationSnapshot,()=>0);
  const tasks=presentationTasks(), busy=tasks.length>0, failed=tasks.some(t=>t.error);
  const [branded,setBranded]=useState(false);
  const [mounted,setMounted]=useState(false);
  const panel=useRef<HTMLDivElement>(null);
  useEffect(()=>{setMounted(true);},[]);
  useEffect(()=>{if(!busy){setBranded(false);return;}const t=setTimeout(()=>setBranded(true),PRESENTATION.logoAfterMs);return()=>clearTimeout(t);},[busy]);
  useLayoutEffect(()=>{
    const visibility=()=>document.documentElement.classList.toggle('g4-motion-paused',document.hidden);
    visibility();document.addEventListener('visibilitychange',visibility);
    const block=(event:Event)=>{if(!isPresentationBusy() || (event.target instanceof Element&&event.target.closest('[data-ui-loading]')))return;event.preventDefault();event.stopImmediatePropagation();};
    const events=['click','dblclick','pointerdown','pointerup','keydown','submit','touchmove','wheel'];
    events.forEach(name=>document.addEventListener(name,block,{capture:true,passive:false}));
    return()=>{document.removeEventListener('visibilitychange',visibility);events.forEach(name=>document.removeEventListener(name,block,true));};
  },[]);
  useLayoutEffect(()=>{
    document.body.classList.toggle('g4-ui-loading',busy);
    if(!busy)return;
    const prior=document.activeElement as HTMLElement|null;
    panel.current?.focus({preventScroll:true});
    const resize=()=>{const v=window.visualViewport;if(panel.current)Object.assign(panel.current.style,{top:`${v?.offsetTop??0}px`,left:`${v?.offsetLeft??0}px`,width:`${v?.width??innerWidth}px`,height:`${v?.height??innerHeight}px`});};resize();
    window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);
    return()=>{document.body.classList.remove('g4-ui-loading');window.visualViewport?.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('scroll',resize);if(prior?.isConnected&&!prior.closest('[inert]'))prior.focus({preventScroll:true});};
  },[busy,mounted]);
  if(!mounted)return <div data-ui-loading className="g4-loading-cover" role="status" aria-label="読み込み中"><i className="g4-loading-spinner" aria-hidden="true"/><span>読み込み中</span></div>;
  if(!busy)return null;
  return createPortal(<div ref={panel} tabIndex={-1} data-ui-loading className="g4-loading-cover" role={failed?'alertdialog':'status'} aria-modal={failed||undefined} aria-label={failed?'読み込みの再試行':'読み込み中'} onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();panel.current?.querySelector('button')?.focus();}}}>
    {failed?<section className="g4-loading-failure"><p>画像の読み込みを確認できませんでした。通信状態を確認して再試行してください。</p><button className="rd-button rd-primary" onClick={()=>tasks.filter(t=>t.error).forEach(t=>t.retry?.())}>再試行</button></section>:branded?<><BrandedLoading/><i className="g4-loading-spinner" aria-hidden="true"/></>:<><i className="g4-loading-spinner" aria-hidden="true"/><span>読み込み中</span></>}
  </div>,document.body);
}
