'use client';
import {useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {supabase} from '@/utils/supabase';
import {isTerritoryUnlocked} from '@/domain/redesign/territory';
import type {RedesignState} from '@/domain/redesign/types';
import {hasPresentedDialog} from '../ui/dialogPresence';
import CanonicalDialog from '../ui/CanonicalDialog';
export default function TerritoryUnlockGuide({state,blocked}:{state:RedesignState;blocked:boolean}){
 const [open,setOpen]=useState(false),[saved,setSaved]=useState(false);const visit=useRef(crypto.randomUUID()),latest=useRef(blocked);latest.current=blocked;
 const unlocked=isTerritoryUnlocked(state);
 useEffect(()=>{
  if(!unlocked)return;let cancelled=false,pending=false,done=false;
  const obscured=()=>latest.current||hasPresentedDialog()||!!document.querySelector('[role="dialog"], [aria-modal="true"]')||document.visibilityState!=='visible';
  const check=async()=>{if(cancelled||pending||done||obscured())return;pending=true;try{const {data,error}=await supabase.rpc('game04_territory_guide',{p_visit:visit.current,p_action:'reserve'});if(error)return;if(cancelled||obscured()){void supabase.rpc('game04_territory_guide',{p_visit:visit.current,p_action:'release'});return;}if(data?.show){done=true;flushSync(()=>setOpen(true));}else done=true;}finally{pending=false}};
  const timer=setInterval(()=>void check(),500);return()=>{cancelled=true;clearInterval(timer)};
 },[unlocked,state.userId]);
 useEffect(()=>{if(!open)return;let cancelled=false;const record=async()=>{const {data,error}=await supabase.rpc('game04_territory_guide',{p_visit:visit.current,p_action:'shown'});if(!cancelled&&!error&&data?.recorded)setSaved(true)};void record();const timer=setInterval(()=>void record(),3000);return()=>{cancelled=true;clearInterval(timer)}},[open]);
 return open?<CanonicalDialog title="領土侵攻戦が解放されました" actions={[{label:saved?'閉じる':'保存中',disabled:!saved,onClick:()=>setOpen(false)}]}><span/></CanonicalDialog>:null;
}
