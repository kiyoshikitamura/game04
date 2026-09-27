"use client";
import {useState} from 'react';
import CanonicalDialog from './ui/CanonicalDialog';
import OutlawButton from './ui/OutlawButton';
import {canonicalItemName} from '@/domain/gameplay/canonical/items';
import {usePaidAssetSnapshot} from './redesign/usePaidAssetSnapshot';
import {isExpired} from '@/domain/redesign/paidExpiry';
const format=(value:string)=>new Date(value).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
export default function PaidAssetExpiry(){
  const [open,setOpen]=useState(false);
  const {data,now,busy,error,reload}=usePaidAssetSnapshot(open);
  const lots=data?.lots.filter(l=>!isExpired(l.expires_at,now));
  const expiredDia=data?.lots.filter(l=>l.item_id==='DIAMOND'&&l.claimed&&isExpired(l.expires_at,now)).reduce((n,l)=>n+l.quantity,0)??0;
  return <>
    <OutlawButton size="compact" variant="secondary" className="shop-account-button" onClick={()=>setOpen(true)}>購入分の有効期限</OutlawButton>
    {open&&<CanonicalDialog title="購入分の有効期限" onClose={()=>setOpen(false)} actions={[{label:'閉じる',onClick:()=>setOpen(false)}]}>
      <OutlawButton variant="secondary" className="shop-account-button" disabled={busy} onClick={()=>void reload()}>更新</OutlawButton>
      {busy&&<span className="shop-btn-spinner" aria-label="確認中"/>}
      {error&&<p className="shop-expiry-notice" role="alert">{error}</p>}
      {data&&<p className="shop-expiry-notice">輝石 有償{Math.max(0,data.dia_paid-expiredDia).toLocaleString()} / 無償{Math.max(0,data.dia_total-data.dia_paid).toLocaleString()}</p>}
      {lots?.length===0&&<p className="shop-expiry-notice">期限のある未使用の購入分はありません。</p>}
      {!!lots?.length&&<><p className="shop-expiry-notice">日時は日本時間です。表示日時に到達すると失効します。受取による延長はありません。</p>
        <ul className="shop-paid-expiry-list">{[...lots].sort((a,b)=>Date.parse(a.expires_at)-Date.parse(b.expires_at)).map((lot,index)=><li key={lot.id??index}>
          <div className="shop-card-heading"><span>{canonicalItemName(lot.item_id)} ×{lot.quantity.toLocaleString()}</span><span className="shop-limit-badge">{lot.claimed?'受取済み':'未受取'}</span></div>
          <time dateTime={lot.expires_at}>{format(lot.expires_at)} 失効</time>
        </li>)}</ul></>}
      {!!data?.history?.some(l=>l.expired_quantity>0)&&<details><summary>失効履歴</summary><ul className="shop-paid-expiry-list">{data.history.filter(l=>l.expired_quantity>0).map(l=><li key={l.id}>{canonicalItemName(l.item_id)} ×{l.expired_quantity} · {format(l.expires_at)} 失効</li>)}</ul></details>}
    </CanonicalDialog>}
  </>;
}
