'use client';
import { useRef, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import { createInitialState } from '@/domain/redesign/masters';
import { applyHomeSelection } from '@/domain/redesign/home';

const noop = () => undefined;
type SaveMode = 'fail-next' | 'success' | 'failure';
export default function HomeStateFixture() {
  const [state, setState] = useState(() => {
    const initial = createInitialState('qa-home-state-local');
    return { ...initial, homeCharacterId: initial.characters[0].id, homeBackgroundId: 'castle-approach', energy: 50 };
  });
  const [mode, setMode] = useState<SaveMode>('fail-next');
  const modeRef = useRef<SaveMode>('fail-next');
  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [pending, setPending] = useState(0);
  const [navigation, setNavigation] = useState('');
  const setSaveMode = (value: SaveMode) => { modeRef.current = value; setMode(value); };
  async function action(name: string, payload: Record<string, unknown> = {}) {
    if (name !== 'set_home') throw new Error('この確認画面では切替保存のみ実行できます。');
    const selectedMode = modeRef.current;
    if (selectedMode === 'fail-next') setSaveMode('success');
    setAttempts(value => value + 1); setPending(value => value + 1);
    try {
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      if (selectedMode !== 'success') throw new Error('変更を保存できませんでした。もう一度お試しください。');
      const next = applyHomeSelection(state, payload);
      setState({ ...next, homeCharacterId: next.homeCharacterId!, homeBackgroundId: next.homeBackgroundId! });
      setSuccesses(value => value + 1);
      return { state: next };
    } finally { setPending(value => value - 1); }
  }
  // Offline context: every operation remains local; full GameProvider/auth bootstrap is intentionally absent.
  const game = {
    session: null, username: '保存状態確認', userLevel: 1, playCyberSe: noop,
    directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0, dmRecipientId: null, setDmRecipientId: noop,
    guildChats: [], chatInput: '', setChatInput: noop, chatCooldown: 0, chatSending: false,
    setChatChannel: noop, setShowTribeChatPanel: noop, handleSendChat: async () => undefined,
    handleSendDirectMessage: async () => false,
    showInboxPanel: false, showSettingsPanel: false, showAccountAuthenticationModal: false,
    ownedHomeCosmeticIds: [], setInboxPanelTab: noop, setShowInboxPanel: noop, setShowSettingsPanel: noop,
    setShowAccountAuthenticationModal: noop, setOnboardingState: noop, setShowTitleView: noop,
    setShowAuthenticationReminder: noop, navigateTab: noop, unreadNewsCount: 0, unclaimedPresentsCount: 0,
  };
  return <GameContext.Provider value={game}><RedesignShell state={state} activeTab="home" onAction={action} onNavigate={setNavigation} previewOnly notifications={<aside className="rd-panel" aria-label="QA保存制御">
    <p>QA専用：実API未接続／保存は1秒遅延。初回失敗後、再試行で成功します。</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{([['fail-next', '次の1回失敗'], ['success', '成功'], ['failure', '失敗']] as const).map(([value, label]) => <button key={value} className="rd-button" aria-pressed={mode === value} disabled={pending > 0} onClick={() => setSaveMode(value)}>{label}</button>)}</div>
    <output data-testid="home-save-probe" style={{ display: 'block', fontSize: 11, overflowWrap: 'anywhere' }}>{JSON.stringify({ mode, attempts, successes, pending, characterId: state.homeCharacterId, backgroundId: state.homeBackgroundId, navigation })}</output>
  </aside>} /></GameContext.Provider>;
}
