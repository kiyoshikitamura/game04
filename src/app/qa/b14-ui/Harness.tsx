'use client';
import {useEffect,useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import {AudioProvider} from '@/audio/AudioProvider';
import {createInitialState,CHARACTER_MASTERS} from '@/domain/redesign/masters';
import {emptyGrowthInventory,SOUL_UNLOCK} from '@/domain/redesign/growthMaster';
import {TERRITORY_MASTER,withFormalTerritoryRaids,projectTerritory} from '@/domain/redesign/territory';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import TerritoryView from '@/app/components/redesign/TerritoryView';
import GrowthView from '@/app/components/redesign/GrowthView';
import FormalLoginBonusModal from '@/app/components/redesign/FormalLoginBonusModal';
import FormalGachaHub from '@/app/components/gacha/FormalGachaHub';
import PageTitleBanner from '@/app/components/redesign/PageTitleBanner';
import {formalGachaDisplayRates} from '@/domain/redesign/formalGacha';
import '@/app/components/redesign/redesign.css';
const territoryMaster=withFormalTerritoryRaids(TERRITORY_MASTER);
const categories=['CHARACTER','SKILL','EQUIPMENT'] as const;
const rates=(mode:'normal'|'special',category?:'character'|'skill'|'equipment')=>formalGachaDisplayRates(mode,category).map(r=>({...r,category:r.category.toUpperCase() as typeof categories[number],probability:r.probabilityPercent}));
const pool={normal:rates('normal'),special:{CHARACTER:rates('special','character'),SKILL:rates('special','skill'),EQUIPMENT:rates('special','equipment')}};
function fixture(){const s=createInitialState('b14-synthetic');s.cash=123456;s.diamonds=3500;s.energy=100;s.growthInventory=emptyGrowthInventory();s.growthInventory.carryExp.character=123;s.growthInventory.expItems.character={small:100,medium:20,large:3,xlarge:1};s.growthInventory.genericSouls.R=15;s.growthInventory.soulSelectors.SSR=2;CHARACTER_MASTERS.filter(c=>!s.characters.some(o=>o.id===c.id)).slice(0,3).forEach((c,i)=>{s.souls[c.id]=i===0?SOUL_UNLOCK[c.rarity]-1:SOUL_UNLOCK[c.rarity];});return s}
function Content(){const [state]=useState(fixture),[tab,setTab]=useState(()=>new URLSearchParams(location.search).get('view')||'territory'),[login,setLogin]=useState(()=>new URLSearchParams(location.search).get('view')==='login');const level=Number(new URLSearchParams(location.search).get('level')||1);const territory=projectTerritory(territoryMaster,{experience:territoryMaster.levels[level-1]?.requiredExp||0,unlocked:true},{raid_unlock:1},0);return <GameContext.Provider value={{playCyberSe:()=>{},username:'表示検証',unreadNewsCount:0,unreadPresentsCount:0,ownedHomeCosmeticIds:[],showMissionPanel:false}}><AudioProvider><RedesignShell state={state} activeTab={tab} onNavigate={setTab} onAction={async()=>({})} previewOnly>{tab==='territory'?<TerritoryView territory={territory} rooms={[]} userId={state.userId} onHost={async()=>{}} onOpenRoom={()=>{}}/>:tab==='character'?<GrowthView state={state} onAction={async()=>({state})}/>:tab==='gacha'?<><PageTitleBanner page="gacha"/><FormalGachaHub balances={{coin:state.cash,diamond:state.diamonds,tickets:{CHARACTER:1,SKILL:2,EQUIPMENT:3},points:{CHARACTER:0,SKILL:0,EQUIPMENT:0}}} dailyFreeAvailable pool={pool} exchangeItems={{CHARACTER:[],SKILL:[],EQUIPMENT:[]}} onDraw={async()=>{}} onExchange={async()=>{}}/></>:<button className="rd-button" onClick={()=>setLogin(true)}>ログインボード</button>}</RedesignShell>{login&&<FormalLoginBonusModal currentStep={Number(new URLSearchParams(location.search).get('day')||5)} totalLogins={35} onClose={()=>setLogin(false)}/>}</AudioProvider></GameContext.Provider>}
export default function Harness(){const[mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);return mounted?<Content/>:<p>準備中</p>}
