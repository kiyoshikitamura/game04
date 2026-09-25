 'use client';
import { useEffect,useRef,useState } from 'react';
import { useGame } from '@/app/context/GameContext';
import { supabase } from '@/utils/supabase';
import BrandedLoading from '../ui/BrandedLoading';
export default function IntegratedStart(){
 const game=useGame(),started=useRef(false),[error,setError]=useState('');
 useEffect(()=>{if(started.current||!game.session)return;started.current=true;
  void (async()=>{const {error}=await supabase.rpc('game04_begin_tutorial');if(error)throw error;await game.retryAuthenticatedProjection();})().catch(e=>{setError(e.message);started.current=false;});
 },[game.session?.user.id]);
 return <div className="app-container">{error?<><p role="alert">{error}</p><button onClick={()=>window.location.reload()}>再読み込み</button></>:<BrandedLoading label="戦国の世界を準備中"/>}</div>;
}
