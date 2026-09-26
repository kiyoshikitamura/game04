'use client';
import {useEffect,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,CHARACTER_MASTERS,SKILL_MASTERS,OWNABLE_SKILL_MASTERS,EQUIPMENT_MASTERS} from '@/domain/redesign/masters';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import GrowthView from '@/app/components/redesign/GrowthView';
import ShopExchangePanel from '@/app/components/ShopExchangePanel';
import ActionButton from '@/app/components/ui/ActionButton';
import OutlawButton from '@/app/components/ui/OutlawButton';
import CanonicalDialog from '@/app/components/ui/CanonicalDialog';
import {AssetChoice} from '@/app/components/ui/AssetChoice';
import ScreenState from '@/app/components/ui/ScreenState';
import ElementBadge from '@/app/components/redesign/ElementBadge';
import '@/app/components/redesign/redesign.css';
function fixture(){const s=createInitialState('common-ui-synthetic');s.characters=CHARACTER_MASTERS.map(c=>({id:c.id,level:10,awakening:2}));s.skills=OWNABLE_SKILL_MASTERS.map(c=>({id:c.id,level:2}));s.equipment=EQUIPMENT_MASTERS.map((c,i)=>({instanceId:'fixture-'+i,masterId:c.id,level:10,lb:2}));s.cash=1234567;s.diamonds=10000;return s;}
function Content(){const[state,setState]=useState(fixture),[tab,setTab]=useState(()=>new URLSearchParams(location.search).get('view')||'components'),[dialog,setDialog]=useState(false),[busy,setBusy]=useState(false);
return <GameContext.Provider value={{playCyberSe:()=>{},username:'表示検証',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[],showMissionPanel:false}}><AudioProvider><RedesignShell state={state} activeTab={tab} onNavigate={setTab} onAction={async()=>({})} previewOnly>
{tab==='character'?<GrowthView state={state} onAction={async(action,payload)=>{if(action==='save_deck'&&Array.isArray(payload.deck)){const next={...state,deck:payload.deck};setState(next);return {state:next};}return {state};}}/>:tab==='shop'?<ShopExchangePanel state={state} onExchange={async()=>{throw Error('検証用の失敗');}}/>:<section className="rd-panel"><h1>共通UI代表状態</h1><div className="g4-action-group"><ActionButton variant="primary" busy={busy} busyLabel="保存中" onClick={()=>setBusy(true)}>保存</ActionButton><ActionButton onClick={()=>setBusy(false)}>取消</ActionButton><OutlawButton disabled>条件不足</OutlawButton><ActionButton onClick={()=>setDialog(true)}>詳細</ActionButton></div><p><ElementBadge element="fire"/><ElementBadge element="water" size="small"/></p><AssetChoice image={SKILL_MASTERS[0].image} name="長い名称の選択候補を折り返して確認する戦技" metadata="SSR / SP 50 / LB+10" description="対象：敵全体。攻撃力105%のダメージ。" status="装備中" disabled onSelect={()=>{}}/>{(['empty','error','locked'] as const).map(kind=><ScreenState key={kind} kind={kind} compact message={kind==='error'?'通信を確認して再試行してください。':undefined} actionLabel={kind==='error'?'再試行':undefined} onAction={()=>{}}/>)}</section>}
</RedesignShell>{dialog&&<CanonicalDialog title="長い説明・多数件" onClose={()=>setDialog(false)} actions={[{label:'閉じる',onClick:()=>setDialog(false)}]}>{Array.from({length:30},(_,i)=><p key={i}>報酬 {i+1}：説明の末尾までスクロールできます。</p>)}</CanonicalDialog>}</AudioProvider></GameContext.Provider>}
export default function Harness(){const[mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:null;}
