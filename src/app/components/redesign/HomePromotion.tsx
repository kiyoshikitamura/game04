'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '@/utils/supabase';
import { HOME_PROMOTIONS, type HomePromotionKind } from '@/domain/redesign/homePromotions';
import { jstLoginDate } from '@/domain/redesign/loginBonus';
import { hasPresentedDialog } from '../ui/dialogPresence';
import CanonicalDialog from '../ui/CanonicalDialog';
import './home-promotion.css';
import { useEventPromotion } from './EventPromotion';

export function HomePromotionDialog({ kind, purchased = false, onClose, onNavigate }: { kind: HomePromotionKind; purchased?: boolean; onClose: () => void; onNavigate: (destination: string) => void }) {
  const offer = HOME_PROMOTIONS[kind];
  return <CanonicalDialog title={offer.title} onClose={onClose} density="compact" className={`g4-home-promotion${kind === 'starter' ? ' g4-home-promotion--artwork' : ''}`}
    actions={[{ label: '閉じる', onClick: onClose }, { label: kind === 'starter' && purchased ? 'ショップを見る' : offer.action, semantic: 'primary', onClick: () => { onClose(); onNavigate(offer.destination); } }]}>
    {kind === 'starter' ? <>
      <img className="g4-starter-artwork" src={offer.image} width={1024} height={1536} alt="初回限定・特選 姫武将召喚札10枚＋輝石500、100円（税込）" decoding="async" fetchPriority="high" />
      {purchased && <p className="g4-starter-note">購入済みです。再購入はできません。</p>}
    </> : <><img src={offer.image} width={1280} height={640} alt={offer.title} decoding="async" /><p>{offer.message}</p></>}
  </CanonicalDialog>;
}

/** One instance per authenticated owner. Count real home entries, never data refreshes. */
export default function HomePromotion({ owner, active, blocked, eventEligible = false, onNavigate }: { owner: string; active: boolean; blocked: boolean; eventEligible?: boolean; onNavigate: (destination: string) => void }) {
  const [offer, setOffer] = useState<{kind: HomePromotionKind; visitId: string; purchased: boolean} | null>(null);
  const eventPromotion = useEventPromotion({ owner, active, blocked: blocked || !!offer, eligible: eventEligible });
  const [day, setDay] = useState(() => jstLoginDate(Date.now()));
  const latest = useRef({ active, blocked });
  useLayoutEffect(() => { latest.current = {active, blocked}; }, [active, blocked]);
  const visit = useRef<{id: string; day: string} | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setDay(jstLoginDate(Date.now())), 1500);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!offer) return;
    const id = offer.visitId;
    let saved = false;
    // Keep the original visit when the date changes or the home screen is left.
    const record = async () => {
      if (saved) return;
      try {
        const { data, error } = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'shown' });
        saved = !error && data?.recorded === true;
      } catch { /* Retry a failed acknowledgement using this same visit. */ }
    };
    void record();
    const retry = setInterval(() => void record(), 3000);
    return () => { clearInterval(retry); if (!saved) void record(); };
  }, [offer]);
  useEffect(() => {
    // Campaign activation is environment-owned. RPC never trusts client dates.
    void supabase.rpc('game04_ensure_release_present').then(() => {});
  }, [owner]);
  useEffect(() => {
    if (!active) { visit.current = null; setOffer(null); return; }
    if (offer || eventPromotion.pending) return;
    if (!visit.current || visit.current.day !== day) visit.current = {id: crypto.randomUUID(), day};
    const id = visit.current.id;
    let cancelled = false, entered = false, pending = false, nextAttempt = 0;
    const obscured = () => latest.current.blocked || hasPresentedDialog() || !!document.querySelector('[role="dialog"], [aria-modal="true"]') || document.visibilityState !== 'visible';
    const check = async () => {
      if (cancelled || pending || !latest.current.active || obscured() || Date.now() < nextAttempt) return;
      pending = true;
      try {
        if (!entered) {
          const response = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'enter' });
          if (response.error) { nextAttempt = Date.now() + 15000; return; }
          if (!response.data?.kind) { nextAttempt = Date.now() + 30000; return; }
          entered = true;
        }
        if (cancelled || obscured()) return;
        // Reserve across devices; record only after the dialog has actually committed.
        const { data, error } = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'reserve' });
        if (error) { nextAttempt = Date.now() + 15000; return; }
        if (cancelled || obscured()) {
          void supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'release' });
          return;
        }
        if (data?.kind === 'starter' || data?.kind === 'daily-free') {
          flushSync(() => setOffer({kind: data.kind, visitId: id, purchased: data.purchased === true}));
        } else { entered = false; nextAttempt = Date.now() + 30000; }
      } catch { nextAttempt = Date.now() + 15000; }
      finally { pending = false; }
    };
    // Let login/receipt/retention dialogs commit first. Re-evaluate after they close.
    const timer = setInterval(() => void check(), 1500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [active, owner, day, offer, blocked, eventPromotion.pending]);
  return <>{eventPromotion.dialog}{offer && active && !blocked ? <HomePromotionDialog kind={offer.kind} purchased={offer.purchased} onClose={() => setOffer(null)} onNavigate={onNavigate} /> : null}</>;
}
