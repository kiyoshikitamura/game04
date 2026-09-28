'use client';
import {useEffect,useRef,useState} from 'react';
import {AudioProvider} from '@/audio/AudioProvider';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import {newTutorial} from '@/domain/redesign/tutorial/state';
import {applyTutorialTransition} from '@/domain/redesign/tutorial/integration';
import {DUPLICATE_TUTORIAL_NAME} from '@/domain/redesign/tutorial/errors';
import type {RedesignState} from '@/domain/redesign/types';
export default function Harness(){
 const [state,setState]=useState<RedesignState|null>(null);const current=useRef<RedesignState|null>(null);
 useEffect(()=>{let s:RedesignState;const saved=sessionStorage.getItem('opening-test-state');if(saved)s=JSON.parse(saved);else{s=newTutorial('opening-live-fixture').game;s.tutorial={version:'tutorial-fixed-20260925',step:0,name:'',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false};}current.current=s;setState(s);},[]);
 if(!state)return null;
 return <AudioProvider><div data-server-step={state.tutorial!.step} data-granted-characters={state.characters.length} data-granted-skills={state.skills.length} data-deck={state.deck.length}>{state.tutorial!.step>=17?<p data-home-ready>本陣へ移動しました</p>:<IntegratedTutorial state={state} busy={false} onNext={async(step,name)=>{
 await new Promise(r=>setTimeout(r,70));
 if(step===5&&!sessionStorage.getItem('opening-failed')){sessionStorage.setItem('opening-failed','1');throw Error('Failed to fetch');}
 if(step===15&&!sessionStorage.getItem('opening-duplicate')){sessionStorage.setItem('opening-duplicate','1');throw Error(DUPLICATE_TUTORIAL_NAME);}
 const next=applyTutorialTransition(current.current!,'tutorial_next',{step,name});current.current=next;sessionStorage.setItem('opening-test-state',JSON.stringify(next));setState(next);return {state:next};
 }}/>}</div></AudioProvider>;
}
