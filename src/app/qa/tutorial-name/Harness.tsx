'use client';
import {useEffect,useRef,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import {createInitialState} from '@/domain/redesign/masters';
import {applyTutorialTransition} from '@/domain/redesign/tutorial/integration';
import {DUPLICATE_TUTORIAL_NAME} from '@/domain/redesign/tutorial/errors';
import {redesignRequest} from '@/utils/redesignApi';
import '@/app/components/redesign/redesign.css';
function fixture(){const s=createInitialState('dbg075-synthetic');s.tutorial={version:'tutorial-fixed-20260925',step:15,name:'',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false};return s;}
function Content(){const [state,setState]=useState(fixture),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');const attempts=useRef(0);const params=new URLSearchParams(location.search),live=params.has('live');
 useEffect(()=>{if(live)void redesignRequest('get_state').then(d=>{setState(d.state);setReady(true);}).catch(e=>setError(e.message));else setReady(true);},[live]);
 async function next(step:number,name:string){setBusy(true);try{if(live){const d=await redesignRequest('tutorial_next',{step,name});setState(d.state);return d;}attempts.current++;await new Promise(r=>setTimeout(r,250));if(attempts.current===1){const mode=params.get('failure');throw Error(mode==='network'?'Failed to fetch':mode==='other'?'duplicate key value violates unique constraint "other_key"':mode==='input'?'名前は1〜8文字で入力してください。':DUPLICATE_TUTORIAL_NAME);}setState(s=>applyTutorialTransition(s,'tutorial_next',{step,name}));}finally{setBusy(false);}}
 return <GameContext.Provider value={{playCyberSe:()=>{}}}><AudioProvider>{error?<p role="alert">{error}</p>:ready?<IntegratedTutorial state={state} busy={busy} onNext={next}/>:<p>読込中</p>}</AudioProvider></GameContext.Provider>;
}
export default function Harness(){const[mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>;}
