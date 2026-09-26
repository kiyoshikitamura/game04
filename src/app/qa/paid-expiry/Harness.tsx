'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/utils/supabase';
import {GameContext} from '@/app/context/GameContext';
import {redesignRequest} from '@/utils/redesignApi';
import {REDESIGN_REWARD_SYNC_EVENT} from '@/utils/redesignRewardSync';
import InventoryView from '@/app/components/redesign/InventoryView';
import PaidAssetExpiry from '@/app/components/PaidAssetExpiry';
import InboxPanel from '@/app/components/InboxPanel';
import type {RedesignState} from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';
import '@/app/components/ShopTab.css';
export default function Harness(){
 const [state,setState]=useState<RedesignState|null>(null),[presents,setPresents]=useState<any[]>([]),[open,setOpen]=useState(false),[tab,setTab]=useState('presents'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){const r=await supabase.rpc('billing_refresh_paid_assets');if(r.error)throw r.error;setState(r.data.state);const p=await supabase.from('presents').select('*').eq('user_id',r.data.user_id);if(p.error)throw p.error;setPresents(p.data);}
 useEffect(()=>{const run=()=>{void refresh().catch(()=>setError('専用QAセッションを設定してください。'));};run();window.addEventListener(REDESIGN_REWARD_SYNC_EVENT,run);return()=>window.removeEventListener(REDESIGN_REWARD_SYNC_EVENT,run);},[]);
 async function claim(id?:string){setBusy(true);try{const r=id?await supabase.rpc('claim_present',{p_present_id:id}):await supabase.rpc('claim_all_presents');if(r.error)throw r.error;await refresh();}catch(e){setError(e instanceof Error?e.message:'受取失敗');}finally{setBusy(false);}}
 return <main className="rd-shell"><div className="rd-stack"><h1>期限処理・専用QA</h1>{error&&<p role="alert">{error}</p>}{state&&<><PaidAssetExpiry/><button onClick={()=>setOpen(true)}>プレゼントBOX</button><GameContext.Provider value={{showInboxPanel:open,setShowInboxPanel:setOpen,inboxPanelTab:tab,setInboxPanelTab:setTab,newsList:[],setNewsList:()=>{},markNewsRead:()=>{},presents,handleClaimPresent:claim,handleClaimAllPresents:()=>claim(),presentClaimLoading:busy,playCyberSe:()=>{}}}><InboxPanel/></GameContext.Provider><InventoryView state={state} onNavigate={()=>{}} onAction={async(name,payload)=>{const r=await redesignRequest(name,payload);setState(r.state);return r;}}/></>}</div></main>;
}
