'use client';
import {useEffect,useState} from 'react';
import './game04-ui.css';
import {UI_MOTION} from './uiMotion';
export const LONG_LOADING_MS=UI_MOTION.longLoadingMs;
/** One mount per preparation: promote once, never cycle between preparation phases. */
export default function Game04Loading({context='dialog',label='戦国の世界を準備中',branded=false}:{context?:'screen'|'dialog';label?:string;branded?:boolean}){
 const [long,setLong]=useState(branded);
 useEffect(()=>{if(branded){setLong(true);return;}const timer=setTimeout(()=>setLong(true),LONG_LOADING_MS);return()=>clearTimeout(timer);},[branded]);
 return <span className="g4-loading" data-context={context} role="status" aria-label={label} aria-live="polite">{long&&context==='screen'&&<img src="/branding/tribe-neon-logo.png" alt="戦国姫艶武"/>}<span className="g4-loading-wheel" aria-hidden="true"/>{long&&context==='screen'&&<span className="g4-loading-label">{label}</span>}</span>;
}
