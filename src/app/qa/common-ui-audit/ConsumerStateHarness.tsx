'use client';
import {useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import Game04EntryState from '@/app/components/ui/Game04EntryState';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import RaidView from '@/app/components/redesign/RaidView';
import {createRaidRoom} from '@/domain/redesign/raid';
import InventoryView from '@/app/components/redesign/InventoryView';
import TitleView from '@/app/components/TitleView';
import {EarlyRetentionGuide,EarlySortiePreparation} from '@/app/components/redesign/EarlyRetentionGuide';
import PreparationModal from '@/app/components/redesign/PreparationModal';
import RedesignCommerceOverlays from '@/app/components/redesign/RedesignCommerceOverlays';
import {createInitialState,buildBattleParty,CHARACTER_MASTERS} from '@/domain/redesign/masters';
import {initializeEarlyProgress,type EarlyGuideId} from '@/domain/redesign/earlyProgress';
import '@/app/components/redesign/redesign.css';

/** Actual consumer components with local state only; never mounts GameProvider or writes an API. */
export default function ConsumerStateHarness(){
 const params=new URLSearchParams(location.search),view=params.get('view'),mode=params.get('state')||'normal';
 const [error,setError]=useState(mode==='error'?'通信を確認して、もう一度お試しください。':''),[pending,setPending]=useState(false),[closed,setClosed]=useState(false);
 const [chatInput,setChatInput]=useState('');
 const [inboxTab,setInboxTab]=useState(mode.startsWith('news')?'news':'presents'),[news,setNews]=useState<any[]>([]);
 const state=initializeEarlyProgress(createInitialState('consumer-states-synthetic'));
 state.energyDrinks=3;state.energy=mode==='upper-bound'?state.energyMax:20;
 state.characters=CHARACTER_MASTERS.map(c=>({id:c.id,level:10,awakening:2}));
 const raid=createRaidRoom('encounter_flame','fixture-owner','fixture-room',Date.now());raid.participants.push({...raid.participants[0],userId:state.userId,name:'確認参加者'});
 const guide:EarlyGuideId=(['join-maeda','equip-iwadan','join-takenaka','equip-fire','missions'].includes(mode)?mode:'join-maeda') as EarlyGuideId;
 state.earlyProgress!.guides[guide]='pending';
 const noop=()=>{};
 const save=async()=>{setPending(true);try{await new Promise(r=>setTimeout(r,700));if(params.has('failure'))throw Error('検証用の保存失敗');}finally{setPending(false);}};
 const config=mode==='confirm'||mode==='reward'?{isOpen:!closed,dialogId:1,title:mode==='reward'?'受け取りました':'操作の確認',message:'長い名称や注意事項を確認してから操作します。'.repeat(5),kind:mode==='reward'?'reward' as const:'confirm' as const,rewards:[{id:"ENERGY_DRINK",name:"活力丸",quantity:999},{id:"SOUL",name:"とても長い名称の報酬を受け取る場合の折り返し確認",quantity:999999}],confirmText:'確認する',cancelText:'戻る',onConfirm:save,onCancel:()=>setClosed(true)}:undefined;
 const context={setChatChannel:noop,setShowMissionPanel:noop,setShowTribeChatPanel:noop,chatInput,setChatInput,handleSendChat:async()=>{throw Error("synthetic send failure");},chatSending:false,chatCooldown:0,guildChats:mode==='profile'?[{id:"fixture-message",user_id:"fixture-peer",author_name:"確認相手",content:"プロフィール確認用の発言",created_at:new Date().toISOString()}]:[],directMessages:[],dmUnreadConversations:[],dmRecipientId:null,setDmRecipientId:noop,ownedHomeCosmeticIds:[],showSettingsPanel:false,showMissionPanel:false,username:"表示検証",unreadNewsCount:0,unreadPresentsCount:0,showInboxPanel:view==='consumer-inbox'&&!closed,setShowInboxPanel:()=>setClosed(true),inboxPanelTab:inboxTab,setInboxPanelTab:setInboxTab,newsList:news,setNewsList:setNews,markNewsRead:noop,presents:mode==='empty'||mode.startsWith('news')?[]:[{id:1,status:"UNCLAIMED",item_id:"ENERGY_DRINK",quantity:1,title:"長い名称と複数行の説明を持つ受取確認用プレゼント",message:"受取条件と期限を確認できます。",sent_at:"2026-09-01",expireText:mode==='expired'?"期限切れ":"期限なし",expire_at:mode==='expired'?"2020-01-01":null}],presentClaimLoading:mode==='pending',handleClaimPresent:save,handleClaimAllPresents:save,showTitleView:true,setShowTitleView:noop,authLoading:mode==='loading',setupLoading:false,resumeLoading:mode==='pending'||pending,resumeCurrentSession:save,session:mode==='new'?null:{user:{id:'consumer-states-synthetic',is_anonymous:mode!=='authenticated'&&mode!=='email'}},onboardingState:{gameplay_authorized:mode!=='email',tutorial_step:'COMPLETE',auth_method:'EMAIL'},errorMessage:error,setErrorMessage:setError,playBgm:noop,playCyberSe:noop,playSe:noop,handleFirstUserInteraction:noop,handleStartNewGame:async()=>false,handleLogout:noop,confirmDialogConfig:config,globalInteractionBlocking:mode==='blocking',showLoginBonusModal:false};
 return <GameContext.Provider value={context}><AudioProvider>
  {view==='consumer-raid'?<RedesignShell state={state} onAction={save} onNavigate={noop} activeTab="raid" previewOnly><RaidView state={state} rooms={[raid]} party={buildBattleParty(state)} initialRoomId={raid.id} onAction={save} onOpenDeck={noop}/></RedesignShell>:view==='consumer-home'?<RedesignShell state={state} onAction={save} onNavigate={noop} activeTab="home"/>:view==='consumer-inbox'||view==='consumer-inventory'?<RedesignShell state={state} onAction={save} onNavigate={noop} activeTab="bag" previewOnly>{view==='consumer-inventory'?<InventoryView state={state} onAction={save} onNavigate={noop}/>:<p>確認用本陣</p>}</RedesignShell>:view==='consumer-entry'?<Game04EntryState error={error} maintenance={mode==='maintenance'} onRetry={noop}/>:view==='consumer-title'?<TitleView/>:view==='consumer-early'?<EarlyRetentionGuide state={state} battlePlaying={false} resultOpen={false} save={save} navigate={noop}/>:view==='consumer-loadout'?<main className="rd-shell"><EarlySortiePreparation state={state} save={save}/></main>:view==='consumer-preparation'?<PreparationModal title="長い出撃先の名称を持つ確認用の共闘" ownedCharacters={state.characters} party={mode==='empty'?[]:buildBattleParty(state)} energy={mode==='insufficient'?0:100} energyCost={20} busy={mode==='pending'} error={error} onBack={noop} onOpenDeck={noop} onConfirm={noop}/>:<RedesignCommerceOverlays/>}
 </AudioProvider></GameContext.Provider>;
}
