'use client';
import {useEffect,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import {createInitialState} from '@/domain/redesign/masters';
import {applyTutorialTransition} from '@/domain/redesign/tutorial/integration';
import {SCENES} from '@/domain/redesign/tutorial/content';
import type {RedesignState} from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';
const battleStep=SCENES.findIndex(s=>s.id==='battle');
function initial(){let state=createInitialState('b10-offline');state.characters=[];state.skills=[];state.deck=[];state.tutorial={step:0,name:'検証',homeVisits:0} as RedesignState['tutorial'];for(let step=0;step<battleStep;step++)state=applyTutorialTransition(state,'tutorial_next',{step,name:'検証'});return state;}
function Content(){const [state,setState]=useState<RedesignState|null>(null),[busy,setBusy]=useState(false),[requests,setRequests]=useState(0),[fail,setFail]=useState(false);useEffect(()=>{setState(JSON.parse(sessionStorage.getItem('b10-state')||'null')||initial());},[]);if(!state)return null;return <><aside style={{position:'fixed',bottom:0,zIndex:99999,background:'#fff',color:'#000'}} data-requests={requests} data-step={state.tutorial?.step}><button onClick={()=>setState(structuredClone(state))}>状態再取得</button><button onClick={()=>setFail(true)}>次回通信失敗</button><button onClick={()=>{sessionStorage.removeItem('b10-state');setState(initial());setRequests(0);}}>検証初期化</button></aside><IntegratedTutorial state={state} busy={busy} onNext={async(step,name)=>{setRequests(n=>n+1);setBusy(true);await new Promise(r=>setTimeout(r,500));if(fail){setFail(false);setBusy(false);throw Error('検証用通信失敗');}const next=applyTutorialTransition(state,'tutorial_next',{step,name});sessionStorage.setItem('b10-state',JSON.stringify(next));setState(next);setBusy(false);}}/></>;}
export default function Harness(){return <GameContext.Provider value={{playCyberSe:()=>{}}}><AudioProvider><Content/></AudioProvider></GameContext.Provider>;}
