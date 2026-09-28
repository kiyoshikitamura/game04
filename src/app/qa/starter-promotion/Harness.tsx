'use client';
import {useEffect,useRef,useState} from 'react';
import HomePromotion from '@/app/components/redesign/HomePromotion';
import {GameContext} from '@/app/context/GameContext';
import {supabase} from '@/utils/supabase';
import {jstLoginDate} from '@/domain/redesign/loginBonus';
import '@/app/components/redesign/redesign.css';

/** Presentation/lifecycle fixture. RPC is in memory; never creates an account or payment. */
export default function Harness() {
 const [ready,setReady]=useState(false),[blocked,setBlocked]=useState(true),[active,setActive]=useState(true);
 const [destination,setDestination]=useState(''),[recorded,setRecorded]=useState(0);
 const fixture=useRef({time:Date.parse('2026-09-28T14:59:50Z'),shownDay:'',visit:'',purchased:false,failOnce:false});
 useEffect(()=>{
  const originalRpc=supabase.rpc,originalNow=Date.now;
  Date.now=()=>fixture.current.time;
  supabase.rpc=(async(name:string,args?:{p_action?:string;p_visit_id?:string})=>{
   if(name!=='game04_home_promotion')return {data:{},error:null};
   const f=fixture.current,day=jstLoginDate(f.time);
   if(args?.p_action==='shown'){
    if(f.failOnce){f.failOnce=false;return {data:null,error:{message:'Synthetic acknowledgement failure'}};}
    if(f.shownDay!==day){f.shownDay=day;setRecorded(n=>n+1);}
    return {data:{recorded:true},error:null};
   }
   if(args?.p_action==='release'){f.visit='';return {data:{},error:null};}
   if(f.shownDay===day)return {data:{},error:null};
   f.visit=args?.p_visit_id??'';
   return {data:{kind:'starter',day,purchased:f.purchased},error:null};
  }) as unknown as typeof supabase.rpc;
  setReady(true);
  return()=>{supabase.rpc=originalRpc;Date.now=originalNow;};
 },[]);
 return ready?<GameContext.Provider value={{playCyberSe:()=>{}}}>
  <main className="rd-shell">
   <h1>プロモーション表示検証</h1><p>実決済・DB接続なし</p>
   <button onClick={()=>setBlocked(v=>!v)}>{blocked?'ガイド終了':'ガイド開始'}</button>
   <button onClick={()=>setActive(v=>!v)}>{active?'ホームを離れる':'ホームへ戻る'}</button>
   <button onClick={()=>{fixture.current.time+=86400000;}}>翌日へ</button>
   <button onClick={()=>{fixture.current.purchased=true;}}>購入済みにする</button>
   <button onClick={()=>{fixture.current.failOnce=true;}}>表示記録を1回失敗</button>
   <p role="status">表示記録 {recorded}回 / {destination}</p>
  </main>
  <HomePromotion owner="synthetic-starter" active={active} blocked={blocked} onNavigate={setDestination}/>
 </GameContext.Provider>:null;
}
