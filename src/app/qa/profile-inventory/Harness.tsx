'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/utils/supabase';
import {redesignRequest} from '@/utils/redesignApi';
import {GameContext} from '@/app/context/GameContext';
import {useUserProfile} from '@/app/context/hooks/useUserProfile';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState} from '@/domain/redesign/masters';
import type {RedesignState} from '@/domain/redesign/types';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import InventoryView from '@/app/components/redesign/InventoryView';
import type {StoredItem} from '@/domain/redesign/inventory';
import CanonicalDialog from '@/app/components/ui/CanonicalDialog';
import type {ConfirmDialogConfig} from '@/app/components/ui/ConfirmDialog';
import '@/app/components/redesign/redesign.css';
const stored:StoredItem[]=[{item_id:'SPECIAL_TICKET_CHARACTER',quantity:3},{item_id:'CHAR_EXP_M',quantity:12}];
function fixture(){const s=createInitialState('inventory-synthetic');s.energyDrinks=2;s.growthInventory={expItems:{character:{small:100,medium:20,large:3,xlarge:1},equipment:{small:30,medium:2,large:0,xlarge:0}},carryExp:{character:123,equipment:45},genericSouls:{N:4,R:2,SR:1,SSR:0},soulSelectors:{N:0,R:1,SR:0,SSR:1}};s.souls[s.characters[0].id]=24;return s;}
function Content(){
 const live=new URLSearchParams(location.search).has('live');
 const [state,setState]=useState<RedesignState>(fixture),[session,setSession]=useState<any>(null),[tab,setTab]=useState('bag'),[settings,setSettings]=useState(false),[error,setError]=useState<string|null>(null),[confirm,setConfirm]=useState<ConfirmDialogConfig|null>(null);
 const profile=useUserProfile(session,1,0,0,null,()=>{},false,()=>{},false,()=>{},async()=>{},setSettings,setError,setConfirm,false);
 useEffect(()=>{if(!live)return;let active=true;void(async()=>{try{const {data}=await supabase.auth.getSession();if(!data.session)throw Error('専用QAセッションを設定してください。');const result=await redesignRequest('get_state');const own=await supabase.from('users').select('id,username,bio,title_equipped').eq('id',data.session.user.id).single();if(own.error)throw own.error;if(active){setSession(data.session);setState(result.state);profile.setUsername(own.data.username);profile.setBio(own.data.bio??'');profile.setTitleEquipped(own.data.title_equipped);}}catch(e){if(active)setError(e instanceof Error?e.message:'読込失敗');}})();return()=>{active=false;};},[live]);
 const action=async(name:string,payload:Record<string,unknown>={})=>{if(!live)throw Error('表示見本では使用しません。');const result=await redesignRequest(name,payload);setState(result.state);return result;};
 return <GameContext.Provider value={{...profile,session,username:profile.username||'所持品検証',showSettingsPanel:settings,setShowSettingsPanel:setSettings,errorMessage:error,setErrorMessage:setError,playCyberSe:()=>{},unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[],showMissionPanel:false,bgmVolume:0,seVolume:0,setBgmVolume:()=>{},setSeVolume:()=>{},handleLogout:()=>{}}}><AudioProvider><RedesignShell state={state} activeTab={tab} onNavigate={setTab} onAction={action} previewOnly>{tab==='bag'?<InventoryView state={state} onAction={action} onNavigate={setTab} fixtureItems={live?undefined:stored}/>:<p>遷移先：{tab}</p>}</RedesignShell>{!settings&&error&&<p role="alert">{error}</p>}{confirm&&<CanonicalDialog title={confirm.title} actions={[{label:'OK',onClick:()=>setConfirm(null)}]}>{confirm.message}</CanonicalDialog>}</AudioProvider></GameContext.Provider>;
}
export default function Harness(){const[mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>;}
