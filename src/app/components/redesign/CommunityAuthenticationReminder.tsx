'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import CanonicalDialog from '../ui/CanonicalDialog';
import { authenticationReminderKey } from '@/domain/redesign/community';
import { usePresentedDialog } from '../ui/dialogPresence';
import { jstLoginDate } from '@/domain/redesign/loginBonus';
import { openGame04Account } from '@/utils/game04AccountReturn';

/** Mounted only after the real GAME04 state has loaded. No legacy ranking gate. */
export default function CommunityAuthenticationReminder({ owner, eligible }: { owner: string; eligible: boolean }) {
  const game = useGame();
  const [shown, setShown] = useState('');
  const presented = useRef(new Set<string>());
  const [day, setDay] = useState(() => jstLoginDate(Date.now()));
  const dialogPresented = usePresentedDialog();
  const anonymous = game.session?.user?.id === owner && game.session.user.is_anonymous === true;
  const blocked = (dialogPresented && shown !== `${owner}:${day}`) || game.showLoginBonusModal || game.showSettingsPanel || game.showInboxPanel || game.showMissionPanel || !!game.confirmDialogConfig?.isOpen || !!game.errorMessage;
  useEffect(() => {
    const tick = () => setDay(jstLoginDate(Date.now()));
    const timer = window.setInterval(tick, 1000);
    window.addEventListener('focus', tick);
    return () => { clearInterval(timer); window.removeEventListener('focus', tick); };
  }, []);
  useEffect(() => {
    if (!anonymous || !eligible || blocked) return;
    // Let the parent's login-receipt effect settle before presenting this guide.
    const timer = window.setTimeout(() => {
      const key = authenticationReminderKey(owner);
      if (presented.current.has(`${owner}:${day}`)) return;
      try { if (localStorage.getItem(key) === day) return; } catch { /* memory-only fallback */ }
      setShown(`${owner}:${day}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [owner, anonymous, eligible, blocked, day]);
  useLayoutEffect(() => {
    if (!anonymous || !eligible || blocked || shown !== `${owner}:${day}`) return;
    presented.current.add(shown);
    try { localStorage.setItem(authenticationReminderKey(owner), day); } catch { /* memory-only suppression */ }
  }, [shown, anonymous, eligible, blocked, owner, day]);
  if (!anonymous || !eligible || blocked || shown !== `${owner}:${day}`) return null;
  return <CanonicalDialog title="ゲームデータを保護" ariaLabel="アカウント認証のご案内" actions={[
    { label: '閉じる', semantic: 'secondary', onClick: () => setShown('') },
    { label: '今すぐ認証', semantic: 'primary', onClick: () => { setShown(''); openGame04Account('home'); } },
  ]}>アカウント認証をすると、ゲームデータを安全に保護し、別の端末へ引き継げます。</CanonicalDialog>;
}
