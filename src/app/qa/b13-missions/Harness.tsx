'use client';
import {useEffect,useRef,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,grantReward} from '@/domain/redesign/masters';
import {FORMAL_MISSION_CONFIG} from '@/domain/redesign/formalMissions';
import {evaluateMissions,getClaimableMission} from '@/domain/redesign/missions';
import {captureMissionAssets} from '@/domain/redesign/missionProgress';
import {jstLoginDate} from '@/domain/redesign/loginBonus';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import '@/app/components/redesign/redesign.css';
const ids=['DM002','DM005','DM007','DM008','DM003','DM006','NM001','NM002','NM003','NM159','NM179'];
const config={enabled:true,missions:FORMAL_MISSION_CONFIG.missions.filter(m=>ids.includes(m.id)).sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id))};
function fixture(mode:string){const s=captureMissionAssets(createInitialState('b13-mission-synthetic'));s.earlyProgress=undefined;s.tutorial=undefined;s.cash=0;s.clearedStages=['mikawa-1'];s.missionProgress!.daily[jstLoginDate(Date.now())]={battle:mode==='zero'?0:mode==='progress'?1:3,quest_clear:mode==='zero'?0:mode==='progress'?1:3,normal_gacha:mode==='bulk'||mode==='claimed'?1:0};if(mode==='claimed')s.claimedMissionIds=evaluateMissions(s,config).filter(m=>m.id.startsWith('DM')).map(m=>m.id);return s}
function Content(){
 const [state,setState]=useState(()=>fixture('progress')),[open,setOpen]=useState(true),[tab,setTab]=useState('character'),[mode,setMode]=useState('progress'),[calls,setCalls]=useState(0),[refreshes,setRefreshes]=useState(0),[version,setVersion]=useState(0);
 const current=useRef(state),count=useRef(0),failAt=useRef(0),uncertain=useRef(false),rollover=useRef(false);
 const reset=(m:string)=>{const next=fixture(m);current.current=next;setState(next);setMode(m);count.current=0;setCalls(0);failAt.current=0;uncertain.current=false;rollover.current=false;setRefreshes(0);setOpen(true);setVersion(v=>v+1)};
 async function action(name:string,payload:Record<string,unknown>={}){if(name!=='claim_mission')return {};const index=++count.current;setCalls(index);await new Promise(r=>setTimeout(r,150));if(failAt.current===index){failAt.current=0;throw Error('検証用の通信失敗');}const now=Date.now()+(rollover.current?86400000:0);const m=getClaimableMission(current.current,config,String(payload.missionId),now);let next=current.current;for(const reward of m.rewards)next=grantReward(next,reward);next={...next,claimedMissionIds:[...next.claimedMissionIds??[],m.id],version:next.version+1};current.current=next;if(uncertain.current){uncertain.current=false;throw Error('保存済み・応答切断の検証');}setState(next);return {state:next,missions:evaluateMissions(next,config,now)}}
 async function refresh(){setRefreshes(v=>v+1);setState({...current.current});}
 return <GameContext.Provider value={{playCyberSe:()=>{},username:'任務検証',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[],showMissionPanel:open,setShowMissionPanel:setOpen}}><AudioProvider><nav aria-label="任務検証操作" style={{position:'fixed',top:0,left:0,zIndex:3000,background:'#fff',color:'#000'}} data-calls={calls} data-cash={state.cash} data-refreshes={refreshes} data-tab={tab}>
 <select aria-label="任務検証状態" value={mode} onChange={e=>reset(e.target.value)}>{['zero','progress','achieved','claimed','bulk'].map(v=><option key={v}>{v}</option>)}</select><button onClick={()=>{failAt.current=count.current+2}}>2件目失敗</button><button onClick={()=>{uncertain.current=true}}>応答切断</button><button onClick={()=>{rollover.current=true}}>日付境界</button><button onClick={()=>setOpen(true)}>任務を開く</button></nav>
 <RedesignShell key={version} state={state} missions={evaluateMissions(state,config)} activeTab={tab} onNavigate={setTab} onAction={action} onRefreshMissions={refresh}><p>任務の合成状態・実サーバーへの書込みなし</p></RedesignShell></AudioProvider></GameContext.Provider>
}
export default function Harness(){const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>}
