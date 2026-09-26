'use client';
import {useEffect,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,CHARACTER_MASTERS,OWNABLE_SKILL_MASTERS,EQUIPMENT_MASTERS,buildBattleParty} from '@/domain/redesign/masters';
import {applyGrowthAction} from '@/domain/redesign/growth';
import {applyHomeSelection} from '@/domain/redesign/home';
import type {RedesignState} from '@/domain/redesign/types';
import GrowthView from '@/app/components/redesign/GrowthView';
import IntegratedTutorial from '@/app/components/redesign/IntegratedTutorial';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import RaidView from '@/app/components/redesign/RaidView';
import PreparationModal from '@/app/components/redesign/PreparationModal';
import {SCENES} from '@/domain/redesign/tutorial/content';
import '@/app/components/redesign/redesign.css';

function fixture(count=4,locked=false){
 const state=createInitialState('b13-synthetic');
 state.characters=CHARACTER_MASTERS.slice(0,12).map(c=>({id:c.id,level:20,awakening:3}));
 state.skills=OWNABLE_SKILL_MASTERS.filter(s=>s.id.startsWith('SKD')).slice(0,20).map(s=>({id:s.id,level:0}));
 state.equipment=EQUIPMENT_MASTERS.filter(e=>e.slot==='weapon').slice(0,12).map((e,i)=>({instanceId:'b13-equipment-'+i,masterId:e.id,level:1,lb:0}));
 state.deck=state.characters.slice(0,count).map(c=>({characterId:c.id,skillIds:state.skills.slice(0,3).map(s=>s.id),equipment:{}}));
 state.clearedStages=locked?[]:['mikawa-1','mikawa-2','mikawa-3'];
 state.earlyProgress=undefined;state.homeCharacterId=state.characters[0].id;
 return state;
}
function Content(){
 const [state,setState]=useState<RedesignState>(()=>fixture()),[tab,setTab]=useState('character'),[mode,setMode]=useState('game'),[version,setVersion]=useState(0),[saves,setSaves]=useState(0),[failed,setFailed]=useState(false);
 const reset=(next:RedesignState)=>{setState(next);setVersion(v=>v+1);setTab('character');setMode('game');setSaves(0);};
 const action=async(name:string,payload:Record<string,unknown>={})=>{if(failed){setFailed(false);throw Error('検証用：保存に失敗しました。再試行できます。');}const next=name==='save_home_selection'?applyHomeSelection(state,payload):applyGrowthAction(state,name,payload);setState(next);setSaves(n=>n+1);return {state:next};};
 return <GameContext.Provider value={{playCyberSe:()=>{},username:'B13検証',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[]}}><AudioProvider>
   <nav aria-label="B13検証操作" style={{position:'fixed',top:0,left:0,zIndex:99999,background:'#fff',color:'#000',maxWidth:180}} data-saves={saves} data-deck={state.deck.length}>
    <select aria-label="検証状態" value={mode} onChange={e=>setMode(e.target.value)}><option value="game">通常</option><option value="characters">加入</option><option value="skills">スキル獲得</option><option value="prepare">出撃準備</option></select>
    <button onClick={()=>reset(fixture())}>4人初期化</button><button onClick={()=>reset(fixture(5))}>5人初期化</button><button onClick={()=>reset(fixture(3,true))}>未解放</button>
    <button onClick={()=>{const next=fixture();next.characters=next.characters.slice(0,4);reset(next);}}>未編成なし</button><button onClick={()=>{const next=fixture();next.equipment=[];reset(next);}}>装備なし</button><button onClick={()=>setFailed(true)}>次回保存失敗</button>
   </nav>
   {mode==='game'?<RedesignShell state={state} activeTab={tab} onNavigate={setTab} onAction={action} previewOnly>
    {tab==='character'?<GrowthView key={version} state={state} onAction={action}/>:tab==='raid'?<RaidView state={state} rooms={[]} party={buildBattleParty(state)} onAction={async()=>({})} onOpenDeck={()=>setTab('character')}/>:<p>共通ナビ検証</p>}
   </RedesignShell>:mode==='prepare'?<PreparationModal party={buildBattleParty(state)} ownedCharacters={state.characters} title="B13 出撃準備" energy={100} energyCost={1} onConfirm={()=>setMode('game')} onBack={()=>setMode('game')} onOpenDeck={()=>setMode('game')}/>:<IntegratedTutorial state={{...state,tutorial:{version:'tutorial-fixed-20260925',step:SCENES.findIndex(s=>s.id===mode),name:'検証',homeVisits:0,departed:false,loginEligible:false,defeatSeen:false,defeatPending:false}}} busy={false} onNext={async()=>setMode('game')}/>}
 </AudioProvider></GameContext.Provider>;
}
export default function Harness(){const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>検証状態を準備中</p>;}
