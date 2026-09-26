'use client';
import {useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,CHARACTER_MASTERS} from '@/domain/redesign/masters';
import type {RedesignState} from '@/domain/redesign/types';
import {applyHomeSelection} from '@/domain/redesign/home';
import FormalLoginBonusModal from '@/app/components/redesign/FormalLoginBonusModal';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import '@/app/components/redesign/redesign.css';
export default function Samples(){
 const [mode,setMode]=useState('home'),[day,setDay]=useState(3);
 const [state,setState]=useState<RedesignState>(()=>({...createInitialState('b07-local'),homeCharacterId:'char_ageha_01',tutorial:{version:'tutorial-fixed-20260925',step:3,name:'検証武将',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false}}));
 return <GameContext.Provider value={{playCyberSe:()=>{},username:'検証武将',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[]}}>
  <AudioProvider>
   <nav style={{padding:8,background:'#19141c',color:'#fff'}} aria-label="B07検証操作">
    {['home','tutorial','login'].map(m=><button key={m} onClick={()=>setMode(m)} style={{minHeight:44,margin:4}}>{m}</button>)}
    <label>日数<input aria-label="日数" type="number" min="1" max="30" value={day} onChange={e=>setDay(Number(e.target.value))}/></label>
    <label>武将<select aria-label="武将" value={state.homeCharacterId} onChange={e=>setState({...state,homeCharacterId:e.target.value})}>{CHARACTER_MASTERS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>背景<select aria-label="背景" onChange={e=>setState({...state,homeBackgroundId:e.target.value})}>
     <option value="castle-town">初期</option><option value="ssr:char_reiji_01">SSR</option><option value="area:mikawa">三河</option><option value="castle-approach">旧城門</option>
    </select></label>
   </nav>
   {mode==='home'&&<RedesignShell state={state} activeTab="home" onNavigate={()=>{}} onAction={async(_,payload)=>{setState(applyHomeSelection(state,payload??{}));return {};}} previewOnly/>}
   {mode==='tutorial'&&<IntegratedTutorial state={state} busy={false} onNext={async()=>{setState({...state,tutorial:{...state.tutorial!,step:state.tutorial!.step+1}});}}/>}
   {mode==='login'&&<FormalLoginBonusModal currentStep={day} totalLogins={day+30} onClose={()=>setMode('home')}/>}
  </AudioProvider>
 </GameContext.Provider>;
}
