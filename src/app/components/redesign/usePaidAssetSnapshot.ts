'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {supabase} from '@/utils/supabase';
import {notifyRedesignRewardChange} from '@/utils/redesignRewardSync';
import type {PaidLot} from '@/domain/redesign/paidExpiry';
import type {RedesignState} from '@/domain/redesign/types';
import type {StoredItem} from '@/domain/redesign/inventory';

export type PaidSnapshot = {user_id?:string;server_now?:string;lots:PaidLot[];dia_paid:number;dia_total:number;state?:RedesignState;items?:StoredItem[];history?:{id:string;item_id:string;expired_quantity:number;expires_at:string}[]};
export function usePaidAssetSnapshot(enabled:boolean, refreshKey:unknown='') {
  const [data,setData]=useState<PaidSnapshot|null>(null),[now,setNow]=useState(Date.now);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const generation=useRef(0),anchor=useRef({server:Date.now(),local:performance.now()});
  const currentTime=useCallback(()=>anchor.current.server+performance.now()-anchor.current.local,[]);
  const load=useCallback(async()=>{
    const request=++generation.current;setBusy(true);setError('');
    try {
      const result=await supabase.rpc('billing_refresh_paid_assets');
      if(result.error||!Array.isArray(result.data?.lots))throw Error('期限情報を取得できませんでした。');
      const value=result.data as PaidSnapshot;
      if(value.lots.some(l=>!Number.isFinite(l.quantity)||l.quantity<=0||!Number.isFinite(Date.parse(l.expires_at))||typeof l.claimed!=='boolean'))throw Error('期限情報が不正です。');
      if(request!==generation.current)return;
      anchor.current={server:value.server_now?Date.parse(value.server_now):Date.now(),local:performance.now()};
      setNow(anchor.current.server);setData(value);
    } catch {
      if(request===generation.current)setError('期限情報を取得できませんでした。再読み込みしてください。');
    } finally {if(request===generation.current)setBusy(false);}
  },[]);
  useEffect(()=>{
    if(!enabled)return;
    void load();
    const visible=()=>{if(document.visibilityState==='visible')void load();};
    document.addEventListener('visibilitychange',visible);
    const {data:auth}=supabase.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'||event==='SIGNED_IN'){++generation.current;setData(null);if(event==='SIGNED_IN')void load();}});
    return()=>{++generation.current;document.removeEventListener('visibilitychange',visible);auth.subscription.unsubscribe();};
  },[enabled,refreshKey,load]);
  useEffect(()=>{
    if(!enabled||!data)return;
    const current=anchor.current.server+performance.now()-anchor.current.local;
    const future=data.lots.map(l=>Date.parse(l.expires_at)).filter(t=>t>now);
    if(!future.length)return;
    const timer=setTimeout(()=>{
      const time=anchor.current.server+performance.now()-anchor.current.local;
      setNow(time);
      if(time>=Math.min(...future)){void load();if(data.user_id)notifyRedesignRewardChange(data.user_id);}
    },Math.min(2147483647,Math.max(1,Math.min(...future)-current)));
    return()=>clearTimeout(timer);
  },[enabled,data,now,load]);
  return {data,now,busy,error,reload:load,currentTime};
}
