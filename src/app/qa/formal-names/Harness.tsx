'use client';
import {useState,useEffect} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,CHARACTER_MASTERS} from '@/domain/redesign/masters';
import {getCharacterPassive} from '@/domain/redesign/balanceV2Masters';
import PassiveDisplay from '@/app/components/redesign/PassiveDisplay';
import GrowthView from '@/app/components/redesign/GrowthView';
import InventoryView from '@/app/components/redesign/InventoryView';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import {RewardList} from '@/app/components/ui/Game04DataDisplay';
import {canonicalItemName,CANONICAL_ITEM_BY_ID} from '@/domain/gameplay/canonical/items';
import {raidRewardLabel} from '@/domain/redesign/raidPresentation';
import '@/app/components/redesign/redesign.css';
import '@/app/components/redesign/growth.css';
function Content(){const [state]=useState(()=>{const s=createInitialState('formal-names-qa');s.materials.skill=12345;s.materials.equipmentLb=67890;return s;});const mode=new URLSearchParams(location.search).get('mode')??'passives';const action=async()=>{throw Error('表示検証専用');};const seen=new Set<string>();return <GameContext.Provider value={{playCyberSe:()=>{},username:'名称検証',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[]}}><AudioProvider><RedesignShell state={state} activeTab={mode==='inventory'?'bag':'character'} onNavigate={()=>{}} onAction={action} previewOnly>{mode==='inventory'?<InventoryView state={state} onAction={action} onNavigate={()=>{}} fixtureItems={[]}/>:mode==='growth'?<GrowthView state={state} onAction={action}/>:mode==='rewards'?<><h2>報酬・商店・プレゼント共通名称</h2><RewardList items={['SKILL_MANUAL','SKILL_LB_PART','EQUIP_LB_PART'].map(id=>({key:id,name:canonicalItemName(id),amount:12345,image:CANONICAL_ITEM_BY_ID.get(id==='SKILL_LB_PART'?'SKILL_MANUAL':id)?.assetPath}))}/><h2>領土侵攻</h2><p>{raidRewardLabel({kind:'skill_material',amount:25})}</p><p>{raidRewardLabel({kind:'equipment_lb',amount:30})}</p></>:CHARACTER_MASTERS.map(c=>{const p=getCharacterPassive(c,0);if(!p?.type||seen.has(p.type))return null;seen.add(p.type);return <PassiveDisplay key={p.type} passive={p} rarity={c.rarity}/>;})}</RedesignShell></AudioProvider></GameContext.Provider>}
export default function Harness(){const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>}
