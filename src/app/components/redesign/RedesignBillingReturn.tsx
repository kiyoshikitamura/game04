'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import BillingStatusDialog from '../BillingStatusDialog';

/** Restore only from the authenticated billing API. URL parameters never grant assets. */
export default function RedesignBillingReturn({ onGranted, onReturn }: { onGranted: () => void; onReturn: () => void }) {
  const { session, syncBootstrapData } = useGame();
  const [orderId, setOrderId] = useState<string | null>(null);
  const owner = session?.user.id;
  const ownerRef = useRef(owner);
  useLayoutEffect(() => { ownerRef.current = owner; }, [owner]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('billing_order')) { setOrderId(params.get('billing_order') || ''); onReturn(); }
  }, [onReturn]);
  const refresh = useCallback(async (requestOwner: string) => {
    if (!owner || requestOwner !== owner || requestOwner !== ownerRef.current) return;
    onGranted();
    await syncBootstrapData(requestOwner);
  }, [owner, onGranted, syncBootstrapData]);
  const close = () => {
    setOrderId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('billing_order');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    onReturn();
  };
  return owner && orderId !== null ? <BillingStatusDialog key={`${owner}:${orderId}`} orderId={orderId} onGranted={refresh} onClose={close} /> : null;
}
