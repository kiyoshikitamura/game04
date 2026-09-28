'use client';
import {useEffect,useState} from 'react';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState} from '@/domain/redesign/masters';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import {TUTORIAL_VERSION,SCENES} from '@/domain/redesign/tutorial/content';
function Content(){const [state,setState]=useState(()=>({...createInitialState('b14-local'),tutorial:{version:TUTORIAL_VERSION,step:0,name:'検証',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false}}));return <AudioProvider>{state.tutorial.step>=SCENES.length?<p>チュートリアル完了（検証用）</p>:<IntegratedTutorial state={state} busy={false} onNext={async(step,name)=>setState(s=>({...s,tutorial:{...s.tutorial,step:step+1,name}}))}/>}</AudioProvider>}
export default function Harness(){const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>}
