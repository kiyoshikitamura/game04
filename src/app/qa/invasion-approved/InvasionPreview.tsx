'use client';
// Explicit offline fixture of production components. No DB or HTTP actions.
import { useEffect, useMemo, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import TerritoryView from '@/app/components/redesign/TerritoryView';
import RaidView from '@/app/components/redesign/RaidView';
import { createInitialState, buildBattleParty } from '@/domain/redesign/masters';
import { createRaidRoom } from '@/domain/redesign/raid';
import { TERRITORY_MASTER, withFormalTerritoryRaids, projectTerritory, createTerritorySnapshot } from '@/domain/redesign/territory';
import type { RaidRoom } from '@/domain/redesign/types';
const uid='invasion-offline'; const noop=()=>{};
export default function InvasionPreview(){
 const [scenario,setScenario]=useState('ready');const [ready,setReady]=useState(false);
 const [state]=useState(()=>({...createInitialState(uid),cash:30000,diamonds:1000,energy:100,energyMax:100}));
 const master=useMemo(()=>withFormalTerritoryRaids(TERRITORY_MASTER),[]);
 const [rooms,setRooms]=useState<RaidRoom[]>([]);const [opened,setOpened]=useState<string>();const [calls,setCalls]=useState(0);const [owned,setOwned]=useState(3);
 useEffect(()=>{const mode=new URLSearchParams(location.search).get('scenario')||'ready';setScenario(mode);setOwned(mode==='insufficient'?0:3);
 if(mode==='multiple'||mode==='ended')setRooms([0,1].map((i)=>{const d=master.destinations[i];const room=createRaidRoom(d.raidMasterId,uid,`fixture-room-${i}`,Date.now()-60000,createTerritorySnapshot(master,d.id));if(mode==='ended')room.status='expired';return room;}));setReady(true);},[master]);
 const territory=projectTerritory(master,{experience:scenario==='low-level'?0:1000,unlocked:true},{raid_unlock:owned},rooms.filter(r=>r.status==='active').length);
 const game={session:null,username:'侵攻確認',userLevel:1,ownedHomeCosmeticIds:null,showSettingsPanel:false,showInboxPanel:false,showAccountAuthenticationModal:false,setShowAccountAuthenticationModal:noop,setInboxPanelTab:noop,setShowInboxPanel:noop,setShowSettingsPanel:noop,unreadNewsCount:0,unclaimedPresentsCount:0,playCyberSe:noop};
 async function host(id:string){setCalls(n=>n+1);await new Promise(r=>setTimeout(r,450));if(scenario==='failure')throw Error('通信に失敗しました。再度お試しください。');const d=master.destinations.find(x=>x.id===id)!;const room=createRaidRoom(d.raidMasterId,uid,'fixture-hosted',Date.now(),createTerritorySnapshot(master,id));setOwned(n=>n-d.itemCount);setRooms(previous=>[...previous,room]);setOpened(room.id);}
 return <GameContext.Provider value={game}><RedesignShell state={state} activeTab={opened?'raid':'territory'} onNavigate={()=>setOpened(undefined)} onAction={async()=>{}} previewOnly><div data-testid="fixture-state" data-scenario={scenario} data-calls={calls} data-owned={owned} data-room={opened??''} hidden />{ready&&(opened?<RaidView key={opened} state={state} rooms={rooms} party={buildBattleParty(state)} initialRoomId={opened} onAction={async()=>{throw Error('戦闘と精算はこのfixtureの対象外です。');}} onOpenDeck={noop}/>:<TerritoryView territory={territory} rooms={rooms} userId={uid} onHost={host} onOpenRoom={setOpened}/>)}</RedesignShell></GameContext.Provider>;
}
