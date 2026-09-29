'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { flushSync } from 'react-dom';
import { eventPromotionPhase, EVENT_PROMOTION_IMAGE, type EventPromotionPhase } from '@/domain/redesign/eventPromotion';
import { ccuEventClockNow, ccuEventSnapshot } from '@/utils/ccuEventClock';
import { preloadAsset } from '@/app/lib/screenAssets';
import { hasPresentedDialog } from '../ui/dialogPresence';
import CanonicalDialog from '../ui/CanonicalDialog';
import './event-promotion.css';

export function EventPromotionDialog({ phase, imageReady, onClose, onShown }: {
  phase: Exclude<EventPromotionPhase, 'hidden'>; imageReady: boolean; onClose: () => void; onShown?: () => void;
}) {
  useEffect(() => { onShown?.(); }, [onShown]);
  return <CanonicalDialog title={phase === 'preview' ? '本日21時から、3時間限定！' : '24時まで、限定イベント開催中！'}
    className="g4-event-promotion" density="compact" onClose={onClose} actions={[{ label: '閉じる', onClick: onClose }]}>
    {phase === 'preview' && imageReady && <Image unoptimized loading="eager" src={EVENT_PROMOTION_IMAGE} width={1080} height={565}
      alt="今夜21時、3時間限定。共闘レイド発生率100％、消費行動力1/2、ガチャ券プレゼント" />}
    <p className="g4-event-promotion-time">9/29 21:00〜24:00</p>
    <ul><li>共闘レイド発生率100％</li><li>消費行動力1/2</li><li>姫武将ガチャ券3枚プレゼント</li></ul>
    <p className="g4-event-promotion-note">共闘レイド100％はエリア1クリア後から。<br />ガチャ券は全ユーザーに1回限り。開催時刻は日本時間です。</p>
  </CanonicalDialog>;
}

/** Same owner/session receipt lifetime as the login-bonus dialog, with its own event key. */
export function useEventPromotion({ owner, active, blocked, eligible }: {owner: string; active: boolean; blocked: boolean; eligible: boolean}) {
  const [phase, setPhase] = useState<EventPromotionPhase>('hidden');
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const state = useRef({ active, blocked, eligible });
  useLayoutEffect(() => { state.current = { active, blocked, eligible }; }, [active, blocked, eligible]);
  const key = `game04:event-promotion:${owner}:2026-09-29`;
  const recorded = useRef(false);
  const currentPhase = () => eventPromotionPhase(ccuEventSnapshot(), ccuEventClockNow());
  useEffect(() => {
    let cancelled = false, loading = false, loaded = false, settled = false;
    const check = () => {
      if (cancelled) return;
      const next = currentPhase();
      setPhase(next);
      if (next === 'hidden') { setOpen(false); return; }
      if (recorded.current) return;
      try { if (sessionStorage.getItem(key)) { recorded.current = true; setSeen(true); return; } } catch { /* same in-memory fallback as login bonus */ }
      if (!state.current.active || !state.current.eligible) return;
      if (next === 'preview' && !settled) {
        if (!loading) {
          loading = true;
          // Deferred, decoded and cached; never block the game boot or display a half-loaded image.
          void preloadAsset({src: EVENT_PROMOTION_IMAGE}, 8000).then(result => {
            if (cancelled) return;
            loaded = result.status === 'loaded'; settled = true;
            setImageReady(loaded); check();
          });
        }
        return;
      }
      if (state.current.blocked || hasPresentedDialog() || document.querySelector('[role="dialog"], [aria-modal="true"]') || document.visibilityState !== 'visible') return;
      flushSync(() => { setImageReady(loaded); setOpen(true); });
    };
    // Let login bonus/guide effects commit first. Also refresh at start/end and on resume.
    const timer = setInterval(check, 500);
    window.addEventListener('focus', check);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', check); };
  }, [key]);
  const markShown = useCallback(() => {
    recorded.current = true;
    setSeen(true);
    try { sessionStorage.setItem(key, 'shown'); } catch { /* memory fallback */ }
  }, [key]);
  return {
    pending: eligible && phase !== 'hidden' && (!seen || open),
    dialog: open && active && !blocked && phase !== 'hidden'
      ? <EventPromotionDialog phase={phase} imageReady={imageReady} onShown={markShown} onClose={() => setOpen(false)} /> : null,
  };
}
