'use client';
import {useEffect, useState} from 'react';
import {useEventPromotion} from '@/app/components/redesign/EventPromotion';
import {synchronizeCcuEvent} from '@/utils/ccuEventClock';
import {GameContext} from '@/app/context/GameContext';
import CanonicalDialog from '@/app/components/ui/CanonicalDialog';
import '@/app/components/redesign/redesign.css';

function clock(serverNow: string) {
  synchronizeCcuEvent({id:'ccu-20260929',enabled:true,startsAt:'2026-09-29T21:00:00+09:00',endsAt:'2026-09-30T00:00:00+09:00',serverNow});
}
function Fixture() {
  const [blocked,setBlocked]=useState(true),[active,setActive]=useState(true),[eligible,setEligible]=useState(true);
  const [owner] = useState(() => 'qa-event-promotion-' + (typeof window === 'undefined' ? '' : location.search));
  const event=useEventPromotion({owner,active,blocked,eligible});
  useEffect(()=>{clock('2026-09-29T12:00:00+09:00');},[]);
  return <main className="rd-shell" style={{width:'100%',maxWidth:390,margin:'auto'}}>
    <h1>イベント告知の表示確認</h1><p>本番DB・ユーザー資産への操作なし</p>
    <button onClick={()=>clock('2026-09-29T20:59:55+09:00')}>21時直前</button>
    <button onClick={()=>clock('2026-09-29T23:59:55+09:00')}>24時直前</button>
    <button onClick={()=>setActive(v=>!v)}>本陣切替</button>
    <button onClick={()=>setEligible(v=>!v)}>対象者切替</button>
    <button onClick={()=>{sessionStorage.removeItem(`game04:event-promotion:${owner}:2026-09-29`);location.reload();}}>再確認</button>
    <p>対象: {String(eligible)} / 本陣: {String(active)} / 告知待ち: {String(event.pending)}</p>
    {blocked&&<CanonicalDialog title="ログインボーナス（検証用）" actions={[{label:'ボーナスを閉じる',onClick:()=>setBlocked(false)}]}><p>閉じた後に告知を表示します。</p></CanonicalDialog>}
    {event.dialog}
  </main>;
}
export default function Harness(){return <GameContext.Provider value={{playCyberSe:()=>{}}}><Fixture /></GameContext.Provider>;}
