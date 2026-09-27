'use client';
import {useEffect,useState} from 'react';
import {HomePromotionDialog} from '@/app/components/redesign/HomePromotion';
import RewardReceipt from '@/app/components/ui/RewardReceipt';
import ActionButton from '@/app/components/ui/ActionButton';
import {GameContext} from '@/app/context/GameContext';
import '@/app/components/redesign/redesign.css';
export default function Harness(){const[mounted,setMounted]=useState(false),[kind,setKind]=useState<'starter'|'daily-free'|null>(null),[destination,setDestination]=useState('');useEffect(()=>{setMounted(true);const k=new URLSearchParams(location.search).get('kind');if(k==='starter'||k==='daily-free')setKind(k);},[]);return mounted?<GameContext.Provider value={{playCyberSe:()=>{}}}><main className="rd-shell"><h1>追加29項目・表示検証</h1><ActionButton onClick={()=>setKind('starter')}>初陣応援パック</ActionButton><ActionButton onClick={()=>setKind('daily-free')}>無料10連</ActionButton><p role="status">{destination}</p><h2>直接付与</h2><RewardReceipt items={[{id:'DIAMOND',name:'輝石',quantity:100}]}/><h2>BOXへ送付</h2><RewardReceipt delivery="PRESENT" items={[{id:'DIAMOND',name:'輝石',quantity:300}]}/><h2>混在</h2><RewardReceipt items={[{id:'DIAMOND',name:'輝石',quantity:100,delivery:'PRESENT'},{id:'CASH',name:'銭',quantity:1000,delivery:'INVENTORY'}]}/></main>{kind&&<HomePromotionDialog kind={kind} onClose={()=>setKind(null)} onNavigate={setDestination}/>}</GameContext.Provider>:null;}
