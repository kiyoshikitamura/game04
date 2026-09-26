'use client';
// Offline functional fixture. Uses the production shell/controller; never writes the DB.
import { useEffect, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import RaidView from '@/app/components/redesign/RaidView';
import BattleView from '@/app/components/redesign/BattleView';
import { createInitialState, buildBattleParty, BATTLE_RULES, CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { createRaidRoom, applyRaidAction, getRoomRaidMaster, raidEnemy } from '@/domain/redesign/raid';
import { simulateBattle, type BattleResult } from '@/domain/redesign/battle';
import type { RaidRoom } from '@/domain/redesign/types';
import { characterArt } from '@/theme/creativeAssets';
const userId='raid-integrated-offline';
const noop=()=>{};
export default function RaidIntegratedPreview(){
 const [state,setState]=useState(()=>({...createInitialState(userId),cash:30000,diamonds:1000,energy:100,energyMax:100}));
 const [rooms,setRooms]=useState<RaidRoom[]>([]);
 const [battle,setBattle]=useState<BattleResult|null>(null);
 const [roomId,setRoomId]=useState<string>();
 const [notice,setNotice]=useState('');
 useEffect(()=>{const now=Date.now();const portrait=characterArt(CHARACTER_MASTERS.find(c=>c.id===state.deck[0]?.characterId)??{},'portrait');
  const entries=['encounter_flame','unlock_shadow'].map((id,i)=>{const r=createRaidRoom(id,userId,`offline-${i}`,now-19000);r.participants[0].name='確認用の城主';r.participants[0].portraitUrl=portrait;return r});
  const ended=createRaidRoom('encounter_flame',userId,'offline-ended',now-7200000);ended.status='expired';ended.participants[0].attempts=1;ended.rewardGrants=[{id:'offline-participation',userId,level:1,rewards:getRoomRaidMaster(ended).participationRewards,claimed:false}];entries.push(ended);setRooms(entries);const initial=new URLSearchParams(window.location.search).get('room');if(initial&&entries.some(r=>r.id===initial))setRoomId(initial);
 // The fixture intentionally starts fresh on each load; RPC persistence is tested separately.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const party=buildBattleParty(state);
 async function action(payload:Record<string,unknown>){
  if(payload.action==='raid_refresh')return;
  const room=rooms.find(r=>r.id===payload.roomId);if(!room)throw Error('レイドが見つかりません。');
  const result=payload.action==='raid_battle'?simulateBattle({seed:917,party,waves:[[raidEnemy(getRoomRaidMaster(room),room.level)]],rules:BATTLE_RULES}):null;
  const next=applyRaidAction(room,state,String(payload.action),result?{battleId:crypto.randomUUID(),battleLevel:room.level,result}:{});
  setRooms(previous=>previous.map(r=>r.id===room.id?next.room:r));setState(next.state);if(result){setRoomId(room.id);setBattle(result);}
 }
 const game={session:null,username:'確認用の城主',userLevel:1,ownedHomeCosmeticIds:null,showSettingsPanel:false,showInboxPanel:false,showAccountAuthenticationModal:false,setShowAccountAuthenticationModal:()=>setNotice('確認用画面のため認証操作は行いません。'),setInboxPanelTab:noop,setShowInboxPanel:noop,setShowSettingsPanel:noop,unreadNewsCount:0,unclaimedPresentsCount:0,playCyberSe:noop};
 return <GameContext.Provider value={game}><RedesignShell state={state} activeTab="raid" onNavigate={()=>setNotice('レイド本体の操作確認用です。他ページへの移動は本体で確認してください。')} onAction={async()=>{}} previewOnly hideChrome={!!battle}>{notice&&<p role="status">{notice}<button onClick={()=>setNotice('')}>閉じる</button></p>}{battle?<BattleView result={battle} vipActive={false} onComplete={()=>setBattle(null)} title="レイド"/>:<RaidView key={roomId??'list'} state={state} rooms={rooms} party={party} initialRoomId={roomId} onAction={action} onOpenDeck={()=>setNotice('編成変更は本体で行ってください。')}/>}</RedesignShell></GameContext.Provider>;
}
