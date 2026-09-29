'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { supabase } from '@/utils/supabase';
import { HOME_PROMOTIONS, type HomePromotionKind } from '@/domain/redesign/homePromotions';
import { jstLoginDate } from '@/domain/redesign/loginBonus';
import { hasPresentedDialog } from '../ui/dialogPresence';
import CanonicalDialog from '../ui/CanonicalDialog';
import './home-promotion.css';
import { displayImage } from '@/theme/displayImages';
import { preloadAsset } from '@/app/lib/screenAssets';
import ScreenState from '../ui/ScreenState';

export function HomePromotionDialog({ kind, purchased = false, onClose, onNavigate, onPrepared, onPresented }: { onPrepared?: () => Promise<boolean>; onPresented?: () => void; kind: HomePromotionKind; purchased?: boolean; onClose: () => void; onNavigate: (destination: string) => void }) {
  const offer = HOME_PROMOTIONS[kind];
  const image = displayImage(offer.image);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    void (async () => {
      const result = await preloadAsset({ src: image });
      if (cancelled) return;
      if (result.status !== 'loaded') { setStatus('failed'); return; }
      try {
        const allowed = onPrepared ? await onPrepared() : true;
        if (!cancelled) setStatus(allowed ? 'ready' : 'failed');
      } catch { if (!cancelled) setStatus('failed'); }
    })();
    return () => { cancelled = true; };
  }, [image, attempt, onPrepared]);
  useLayoutEffect(() => { if (status === 'ready') onPresented?.(); }, [status, onPresented]);
  return <CanonicalDialog loading={status === 'loading'} title={offer.title} onClose={onClose} density="compact" className={`g4-home-promotion${kind === 'starter' ? ' g4-home-promotion--artwork' : ''}`}
    actions={status === 'ready' ? [{ label: '閉じる', onClick: onClose }, { label: kind === 'starter' && purchased ? 'ショップを見る' : offer.action, semantic: 'primary', onClick: () => { onClose(); onNavigate(offer.destination); } }] : []}>
    {status === 'failed' ? <ScreenState kind="error" message="画像を読み込めませんでした。通信状況をご確認ください。" actionLabel="再試行" onAction={() => setAttempt(n => n + 1)} /> : status === 'ready' ? (kind === 'starter' ? <>
      <img className="g4-starter-artwork" src={image} width={1024} height={1536} alt="初回限定・特選 姫武将召喚札10枚＋輝石500、100円（税込）" decoding="async" fetchPriority="high" />
      {purchased && <p className="g4-starter-note">購入済みです。再購入はできません。</p>}
    </> : <><img src={image} width={1280} height={640} alt={offer.title} decoding="async" /><p>{offer.message}</p></>) : null}
  </CanonicalDialog>;
}

/** One instance per authenticated owner. Count real home entries, never data refreshes. */
export default function HomePromotion({ owner, active, blocked, onNavigate }: { owner: string; active: boolean; blocked: boolean; onNavigate: (destination: string) => void }) {
  const [offer, setOffer] = useState<{kind: HomePromotionKind; visitId: string; purchased: boolean} | null>(null);
  const [presentedVisit, setPresentedVisit] = useState<string | null>(null);
  const presentedRef = useRef<string | null>(null);
  const dismissedVisit = useRef<string | null>(null);
  const [day, setDay] = useState(() => jstLoginDate(Date.now()));
  const latest = useRef({ active, blocked });
  useLayoutEffect(() => { latest.current = {active, blocked}; }, [active, blocked]);
  const visit = useRef<{id: string; day: string} | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setDay(jstLoginDate(Date.now())), 1500);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!offer || presentedVisit !== offer.visitId) return;
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
  }, [offer, presentedVisit]);
  useEffect(() => {
    // Campaign activation is environment-owned. RPC never trusts client dates.
    void supabase.rpc('game04_ensure_release_present').then(() => {});
  }, [owner]);
  useEffect(() => {
    if (!active) { visit.current = null; setOffer(null); return; }
    if (offer) return;
    if (!visit.current || visit.current.day !== day) visit.current = {id: crypto.randomUUID(), day};
    const id = visit.current.id;
    let cancelled = false, entered = false, pending = false, nextAttempt = 0;
    const obscured = () => latest.current.blocked || hasPresentedDialog() || !!document.querySelector('[role="dialog"], [aria-modal="true"]') || document.visibilityState !== 'visible';
    const check = async () => {
      if (dismissedVisit.current === id || cancelled || pending || !latest.current.active || obscured() || Date.now() < nextAttempt) return;
      pending = true;
      try {
        if (!entered) {
          const response = await supabase.rpc('game04_home_promotion', { p_visit_id: id, p_action: 'enter' });
          if (response.error) { nextAttempt = Date.now() + 15000; return; }
          if (!response.data?.kind) { nextAttempt = Date.now() + 30000; return; }
          entered = true;
          const kind = response.data.kind as HomePromotionKind;
          if (kind in HOME_PROMOTIONS) void preloadAsset({ src: displayImage(HOME_PROMOTIONS[kind].image) });
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
  }, [active, owner, day, offer, blocked]);
  const prepare = useCallback(async () => {
    if (!offer || !latest.current.active || latest.current.blocked) return false;
    if (presentedRef.current === offer.visitId) return true;
    // Refresh the 90-second lease after loading/retry, before exposing the offer.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const response = supabase.rpc('game04_home_promotion', { p_visit_id: offer.visitId, p_action: 'reserve' });
    const { data, error } = await Promise.race([
      response,
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Promotion preparation timed out')), 12000); }),
    ]).finally(() => clearTimeout(timer));
    if (error) throw error;
    if (data?.kind !== offer.kind || (data?.purchased === true) !== offer.purchased) return false;
    return true;
  }, [offer]);
  const presented = useCallback(() => { if (offer) { presentedRef.current = offer.visitId; setPresentedVisit(offer.visitId); } }, [offer]);
  const close = () => {
    if (offer) {
      dismissedVisit.current = offer.visitId;
      if (presentedVisit !== offer.visitId) void supabase.rpc('game04_home_promotion', { p_visit_id: offer.visitId, p_action: 'release' });
    }
    setOffer(null);
  };
  return offer && active && !blocked ? <HomePromotionDialog key={offer.visitId} onPrepared={prepare} onPresented={presented} kind={offer.kind} purchased={offer.purchased} onClose={close} onNavigate={onNavigate} /> : null;
}
