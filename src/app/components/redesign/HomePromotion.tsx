'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '@/utils/supabase';
import { HOME_PROMOTIONS, type HomePromotionKind } from '@/domain/redesign/homePromotions';
import { hasPresentedDialog } from '../ui/dialogPresence';
import CanonicalDialog from '../ui/CanonicalDialog';
import './home-promotion.css';

export function HomePromotionDialog({ kind, onClose, onNavigate }: { kind: HomePromotionKind; onClose: () => void; onNavigate: (destination: string) => void }) {
  const offer = HOME_PROMOTIONS[kind];
  return <CanonicalDialog title={offer.title} onClose={onClose} density="compact" className="g4-home-promotion"
    actions={[{ label: 'あとで', onClick: onClose }, { label: offer.action, semantic: 'primary', onClick: () => { onClose(); onNavigate(offer.destination); } }]}>
    <img src={offer.image} width={1280} height={640} alt={offer.title} decoding="async" />
    <p>{offer.message}</p>{offer.value && <strong>{offer.value}</strong>}
  </CanonicalDialog>;
}

/** One instance per authenticated owner. Count real home entries, never data refreshes. */
export default function HomePromotion({ owner, active, blocked, onNavigate }: { owner: string; active: boolean; blocked: boolean; onNavigate: (destination: string) => void }) {
  const [kind, setKind] = useState<HomePromotionKind | null>(null);
  const latest = useRef({ active, blocked }); latest.current = { active, blocked };
  const visit = useRef<string | null>(null);
  useEffect(() => {
    if (!kind || !visit.current) return;
    const id = visit.current;
    let saved = false;
    // Only a committed, actually visible dialog records the daily/one-time mark.
    const record = async () => {
      if (saved) return;
      const { data, error } = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'shown' });
      saved = !error && data?.recorded === true;
    };
    void record();
    const retry = setInterval(() => void record(), 3000);
    return () => { clearInterval(retry); if (!saved) void record(); };
  }, [kind]);
  useEffect(() => {
    // Campaign is intentionally disabled until release setup. RPC never trusts client dates.
    void supabase.rpc('game04_ensure_release_present').then(() => {});
  }, [owner]);
  useEffect(() => {
    if (!active) { visit.current = null; setKind(null); return; }
    const id = visit.current ??= crypto.randomUUID();
    let cancelled = false, entered = false, pending = false, finished = false, nextAttempt = 0;
    const obscured = () => latest.current.blocked || hasPresentedDialog() || !!document.querySelector('[role="dialog"], [aria-modal="true"]') || document.visibilityState !== 'visible';
    const check = async () => {
      if (cancelled || pending || finished || !latest.current.active || Date.now() < nextAttempt) return;
      pending = true;
      try {
        if (!entered) {
          const response = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'enter' });
          if (response.error) { nextAttempt = Date.now() + 15000; return; }
          entered = true;
          if (!response.data?.kind) { finished = true; return; }
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
          finished = true;
          flushSync(() => setKind(data.kind));
        } else finished = true;
      } finally { pending = false; }
    };
    // Let login/receipt/retention dialogs commit first. Re-evaluate after they close.
    const timer = setInterval(() => void check(), 1500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [active, owner]);
  return kind && active ? <HomePromotionDialog kind={kind} onClose={() => setKind(null)} onNavigate={onNavigate} /> : null;
}
