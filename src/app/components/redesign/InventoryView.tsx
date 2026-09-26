'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { REDESIGN_REWARD_SYNC_EVENT } from '@/utils/redesignRewardSync';
import type { RedesignState } from '@/domain/redesign/types';
import { inventoryEntries, INVENTORY_CATEGORIES, type InventoryCategory, type StoredItem } from '@/domain/redesign/inventory';
import CanonicalDialog from '../ui/CanonicalDialog';
import { RewardList } from '../ui/Game04DataDisplay';

export default function InventoryView({state,onAction,onNavigate,fixtureItems}:{state:RedesignState;onAction:(name:string,payload:Record<string,unknown>)=>Promise<unknown>;onNavigate:(tab:string)=>void;fixtureItems?:StoredItem[]}) {
  const [category,setCategory]=useState<InventoryCategory>('回復・侵攻');
  const [stored,setStored]=useState<{owner:string;items:StoredItem[]}|null>(null);
  const [attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [selected,setSelected]=useState<string|null>(null),[busy,setBusy]=useState(false),[useError,setUseError]=useState('');
  const lock=useRef(false);
  useEffect(()=>{
    const update=(event:Event)=>{if((event as CustomEvent<{userId:string}>).detail?.userId===state.userId)setAttempt(n=>n+1);};
    window.addEventListener(REDESIGN_REWARD_SYNC_EVENT,update);
    return()=>window.removeEventListener(REDESIGN_REWARD_SYNC_EVENT,update);
  },[state.userId]);
  useEffect(()=>{
    let active=true;setLoading(true);setError('');
    if(fixtureItems){setStored({owner:state.userId,items:fixtureItems});setLoading(false);return;}
    void (async()=>{try{const {data,error:failure}=await supabase.from('user_items').select('item_id,quantity').eq('user_id',state.userId);if(failure)throw failure;if(active)setStored({owner:state.userId,items:data??[]});}catch{if(active)setError('召喚券・保管品を取得できませんでした。再読み込みしてください。');}finally{if(active)setLoading(false);}})();
    return()=>{active=false;};
  },[state.userId,state.version,attempt,fixtureItems]);
  const rows=inventoryEntries(state,stored?.owner===state.userId?stored.items:[]);
  const item=rows.find(r=>r.key===selected);
  const visible=rows.filter(r=>r.category===category);
  const remote=category==='召喚券'||category==='保管品';
  async function useItem(){if(lock.current||!item?.use)return;lock.current=true;setBusy(true);setUseError('');try{await onAction(item.use,{});setSelected(null);}catch(e){setUseError(e instanceof Error?e.message:'使用できませんでした。');}finally{lock.current=false;setBusy(false);}}
  return <section aria-label="所持品" className="rd-stack">
    <h2>所持品</h2><p>受取済みのアイテムです。未受取分はプレゼントBOXで確認できます。</p>
    <nav className="g4-compact-tabs" aria-label="所持品の分類">{INVENTORY_CATEGORIES.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
    {remote&&loading?<p role="status">所持数を確認中…</p>:remote&&error?<div role="alert"><p>{error}</p><button className="rd-button" onClick={()=>setAttempt(n=>n+1)}>再読み込み</button></div>:visible.length?<div>{visible.map(r=><button type="button" key={r.key} className="g4-inventory-entry" onClick={()=>{setSelected(r.key);setUseError('');}}>{r.image?<img src={r.image} alt=""/>:<span aria-hidden="true">◇</span>}<span>{r.name}<span>所持 ×{r.amount.toLocaleString()}</span></span><b aria-hidden="true">›</b></button>)}</div>:<p>この分類の所持品はありません。</p>}
    {category==='育成'&&<p>繰越EXP：武将 {(state.growthInventory?.carryExp.character??0).toLocaleString()} ／ 装備 {(state.growthInventory?.carryExp.equipment??0).toLocaleString()}</p>}
    {category==='保管品'&&<p>従来の所持分を保持しています。現在の素材とは合算していません。</p>}
    <button className="rd-button" onClick={()=>onNavigate('character')}>武将・スキル・装備を確認 ›</button>
    {item&&<CanonicalDialog title={item.name} density="compact" loading={busy} actions={[{label:'閉じる',onClick:()=>setSelected(null),disabled:busy},...(item.use?[{label:'1個使う',onClick:()=>void useItem(),disabled:busy||state.energy>=state.energyMax}]:item.destination?[{label:item.destination==='gacha'?'召喚へ':item.destination==='territory'?'領土侵攻へ':'育成へ',onClick:()=>onNavigate(item.destination!)}]:[])]}>
      <RewardList items={[item]}/><p>{item.detail}</p>{item.use&&<p>行動力 {state.energy} / {state.energyMax}{state.energy>=state.energyMax?'（上限のため使用できません）':''}</p>}{useError&&<p role="alert">{useError}</p>}
    </CanonicalDialog>}
  </section>;
}
