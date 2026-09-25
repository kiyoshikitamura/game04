'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import type { MissionProjection } from '@/domain/redesign/missions';
import type { RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import InboxPanel from '../InboxPanel';
import SettingsPanel from '../SettingsPanel';
import MissionContent from './MissionContent';
import AccountAuthenticationModal from '../TutorialAuthentication';
import HomeView, { type HomeAction, type HomeEncounter, type HomeSocialEvent } from './HomeView';
import Modal from './Modal';
import './redesign.css';
import './ShellChrome.css';
import { characterArt } from '@/theme/creativeAssets';

const FOOTER = [['home','本陣','08-castle'],['quest','出陣','04-fan-sakura'],['character','武将','10-helmet'],['raid','共闘','06-oni-mask'],['gacha','召喚','11-ticket']] as const;
export default function RedesignShell({ state, onAction, children, notifications, activeTab, onNavigate, hideChrome = false, encounterRaid, socialEvents, missions, previewOnly = false }: { state: RedesignState; onAction: HomeAction; children?: React.ReactNode; notifications?: React.ReactNode; activeTab: string; onNavigate: (tab: string) => void; hideChrome?: boolean; encounterRaid?: HomeEncounter | null; socialEvents?: HomeSocialEvent[]; missions?: MissionProjection[]; previewOnly?: boolean }) {
  const game = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, left: 0 }); }, [activeTab, hideChrome]);
  const [menu, setMenu] = useState(false);
  const [missionBusy, setMissionBusy] = useState(false);
  const [missionError, setMissionError] = useState('');
  const missionLock = useRef(false);
  async function claimMission(missionId: string) {
    if (missionLock.current || previewOnly) return;
    missionLock.current = true; setMissionBusy(true); setMissionError('');
    try { await onAction('claim_mission', { missionId }); }
    catch (error) { setMissionError(error instanceof Error ? error.message : '報酬を受け取れませんでした。'); }
    finally { missionLock.current = false; setMissionBusy(false); }
  }
  function closeMissions() { if (!missionLock.current) { setMissionError(''); game.setShowMissionPanel(false); } }
  const [accountOpen, setAccountOpen] = useState(false);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  useEffect(() => { document.body.classList.add('rd-active'); return () => document.body.classList.remove('rd-active'); }, []);
  const leader = CHARACTER_MASTERS.find(c => c.id === state.deck[0]?.characterId);
  const authenticated = game.session?.user?.is_anonymous === false;
  const run = (action: () => void) => { setMenu(false); action(); };
  return <div ref={scrollRef} tabIndex={0} role="region" aria-label="ゲーム画面" className={`rd-shell ${hideChrome ? 'rd-shell-battle' : ''}`}>
    {!hideChrome && <header className="rd-header rd-chrome-header"><div className="rd-identity"><span className="g4-header-face"><span className="rd-chrome-face-crop"><img src={leader ? characterArt(leader, 'portrait') : undefined} alt={leader?.name || '先頭武将'} /></span><b className="rd-raid-header-level rd-chrome-level">Lv.{state.playerProgress?.level ?? game.userLevel ?? 1}</b></span><div><strong>{game.username || 'プレイヤー'} {authenticated && <span className="rd-auth-badge" aria-label="認証済み">✓</span>}</strong><span className="rd-guild-slot" aria-label="将来の同盟表示枠">◇ 同盟 —</span></div></div><div className="rd-chrome-actions">{!authenticated && <button className="rd-auth-link" aria-label="アカウント連携" onClick={() => setAccountOpen(true)}>未認証</button>}<button className="rd-menu-button" onClick={() => setMenu(true)} aria-label="メニュー">メニュー{(game.unreadNewsCount > 0 || game.unreadPresentsCount > 0) && <i className="g4-unread" aria-label="未読あり" />}</button></div><div className="rd-resources"><span><img src="/ui/sengoku/13-coin.png" alt="" /> 銭 {state.cash.toLocaleString()}</span><span><img src="/ui/sengoku/16-diamond.png" alt="" /> 輝石 {state.diamonds.toLocaleString()}</span><span><img src="/ui/sengoku/14-energy.png" alt="" /> 行動力 {state.energy}/{state.energyMax}</span></div></header>}
    <main className="rd-main">{notifications}{activeTab === 'home' && !hideChrome ? <HomeView state={state} onAction={onAction} onNavigate={onNavigate} encounterRaid={encounterRaid} socialEvents={socialEvents} missions={missions} previewOnly={previewOnly} /> : children}</main>
    {!hideChrome && <nav className="rd-footer rd-chrome-footer" aria-label="メインナビゲーション">{FOOTER.map(([id,label,icon]) => <button aria-current={activeTab === id ? 'page' : undefined} key={id} onClick={() => onNavigate(id)}><img src={`/ui/sengoku/${icon}.png`} alt="" />{label}</button>)}</nav>}
    {menu && <Modal title="メニュー" onClose={() => setMenu(false)}><div className="rd-stack"><button className="rd-button" onClick={() => run(() => { game.setInboxPanelTab('news'); game.setShowInboxPanel(true); })}>お知らせ{game.unreadNewsCount ? ` (${game.unreadNewsCount})` : ''}</button><button className="rd-button" onClick={() => run(() => { game.setInboxPanelTab('presents'); game.setShowInboxPanel(true); })}>プレゼントBOX{game.unreadPresentsCount > 0 && <i className="g4-unread" aria-label="未読あり" />}</button><button className="rd-button" onClick={() => run(() => game.setShowSettingsPanel(true))}>設定</button><button className="rd-button" onClick={() => run(() => setAccountOpen(true))}>アカウント連携</button></div></Modal>}
    <InboxPanel />
    {game.showMissionPanel && <Modal title="任務" onClose={closeMissions} closeDisabled={missionBusy}>
      <MissionContent state={state} missions={missions ?? []} missionBusy={missionBusy} missionError={missionError} previewOnly={previewOnly} onClaim={id => void claimMission(id)} />
    </Modal>}
    <SettingsPanel redesign /><AccountAuthenticationModal redesign explicitOpen={accountOpen} onExplicitClose={closeAccount} />
  </div>;
}

