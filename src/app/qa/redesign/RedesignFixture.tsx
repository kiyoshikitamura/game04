'use client';
import { useEffect, useMemo, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import HomeView from '@/app/components/redesign/HomeView';
import QuestView, { type QuestSettlement } from '@/app/components/redesign/QuestView';
import GrowthView from '@/app/components/redesign/GrowthView';
import RaidView from '@/app/components/redesign/RaidView';
import BattleView from '@/app/components/redesign/BattleView';
import { BATTLE_RULES, CHARACTER_MASTERS, EQUIPMENT_MASTERS, buildBattleParty, createInitialState, grantReward } from '@/domain/redesign/masters';
import { QUEST_STAGES, getQuestStage, isQuestStageUnlocked } from '@/domain/redesign/quests';
import { applyGrowthAction } from '@/domain/redesign/growth';
import { applyRaidAction, createRaidRoom, getRaidMaster, raidEnemy } from '@/domain/redesign/raid';
import { simulateBattle, type BattleResult } from '@/domain/redesign/battle';
import type { RaidRoom, RedesignState } from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';

const noop = () => undefined;
const LOCAL_ID = 'qa-local-only';
function fixtureState(): RedesignState {
  const state = createInitialState(LOCAL_ID);
  state.cash = 30000; state.diamonds = 1000; state.energy = 50;
  state.souls = Object.fromEntries(CHARACTER_MASTERS.map(c => [c.id, 100]));
  state.equipment = EQUIPMENT_MASTERS.slice(0, 14).map((master, index) => ({ instanceId: `qa-equipment-${index}`, masterId: master.id, level: 1, lb: 0 }));
  return state;
}
export default function RedesignFixture() {
  const [state, setState] = useState(fixtureState);
  const [tab, setTab] = useState('home');
  const [rooms, setRooms] = useState<RaidRoom[]>([]);
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const [roomId, setRoomId] = useState<string>();
  const [message, setMessage] = useState('');
  const [vip, setVip] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [dmRecipientId, setDmRecipientId] = useState<string | null>(null);
  const [guildChats, setGuildChats] = useState<{ id: string; author_name: string; content: string; user_id: string; created_at: string }[]>([]);
  useEffect(() => {
    setRooms([createRaidRoom('encounter_flame', LOCAL_ID, 'qa-encounter', Date.now()), createRaidRoom('unlock_shadow', LOCAL_ID, 'qa-unlock', Date.now())]);
    const selected = new URLSearchParams(window.location.search).get('view');
    if (selected && ['home','quest','character','raid','battle'].includes(selected)) setTab(selected);
    document.body.classList.add('rd-active');
    return () => document.body.classList.remove('rd-active');
  }, []);
  const party = useMemo(() => buildBattleParty(state), [state]);
  const sampleBattle = useMemo(() => simulateBattle({ seed: 917, party, waves: QUEST_STAGES[2].waves, rules: BATTLE_RULES }), [party]);
  const navigate = (next: string) => { setMessage(''); setBattle(null); setTab(next.startsWith('quest') ? 'quest' : next); };
  async function action(type: string, payload: Record<string, unknown> = {}) {
    if (type === 'set_home') { setState(previous => ({ ...previous, ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}), ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}) })); return; }
    const next = applyGrowthAction(state, type, payload); setState(next); return next;
  }
  async function startQuest(stageId: string): Promise<QuestSettlement> {
    const stage = getQuestStage(stageId);
    if (!stage || !isQuestStageUnlocked(stageId, state.clearedStages)) throw new Error('未解放です。');
    if (state.energy < stage.energyCost) throw new Error('行動力不足です。QA初期化で戻せます。');
    const result = simulateBattle({ seed: 917, party, waves: stage.waves, rules: BATTLE_RULES });
    let next = { ...state, energy: state.energy - stage.energyCost };
    const firstClear = result.outcome === 'win' && !state.clearedStages.includes(stageId);
    const rewards = result.outcome === 'win' ? [...stage.rewards, ...(firstClear ? stage.firstRewards : [])] : [];
    rewards.forEach((reward, index) => { next = grantReward(next, reward, `qa-${stageId}-${index}`); });
    if (result.outcome === 'win') next.clearedStages = [...new Set([...next.clearedStages, stageId])];
    setState(next);
    return { battle: result, rewards, firstClear };
  }
  async function raidAction(payload: Record<string, unknown>) {
    if (payload.action === 'raid_unlock') {
      if (state.materials.unlock < 1) throw new Error('解禁札が不足しています。');
      setRooms(previous => [...previous, createRaidRoom(String(payload.masterId), LOCAL_ID, `qa-${Date.now()}`, Date.now())]);
      setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: previous.materials.unlock - 1 } })); return;
    }
    const room = rooms.find(entry => entry.id === payload.roomId);
    if (!room) throw new Error('QAレイドが見つかりません。');
    const isBattle = payload.action === 'raid_battle';
    const result = isBattle ? simulateBattle({ seed: 917, party, waves: [[raidEnemy(getRaidMaster(room.masterId), room.level)]], rules: BATTLE_RULES }) : null;
    const update = applyRaidAction(room, state, String(payload.action), result ? { battleId: `qa-${Date.now()}`, battleLevel: room.level, result } : {});
    setState(update.state); setRooms(previous => previous.map(entry => entry.id === room.id ? update.room : entry));
    if (result) setBattle(result);
  }
  const game = {
    session: null, username: '確認用の城主', userLevel: 1, playCyberSe: noop,
    directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0, dmRecipientId, setDmRecipientId,
    guildChats, chatInput, setChatInput, chatCooldown: 0, chatSending: false,
    setChatChannel: noop, setShowTribeChatPanel: noop,
    handleSendChat: async () => { if (chatInput.trim()) setGuildChats(previous => [...previous, { id: `qa-${Date.now()}`, author_name: '確認用の城主', content: chatInput, user_id: LOCAL_ID, created_at: new Date().toISOString() }]); setChatInput(''); },
    handleSendDirectMessage: async () => { setMessage('DMは確認用画面では送信されません。'); },
  };
  return <GameContext.Provider value={game}><div className="rd-shell">
    <aside style={{ padding: 12, background: '#46361e', fontSize: 12 }}><strong>表示確認専用・ローカル操作</strong><p>保存・API接続・認証・決済は行いません。再読込で初期化されます。</p><div className="rd-tabs">{[['home','Home'],['quest','Quest'],['character','Growth'],['raid','Raid'],['battle','Battle']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => navigate(id)}>{label}</button>)}</div><label><input type="checkbox" checked={vip} onChange={event => setVip(event.target.checked)} /> VIP表示確認</label><button className="rd-button" onClick={() => { setState(fixtureState()); setBattle(null); setMessage('QA状態を初期化しました。'); }}>QA初期化</button><p>銭 {state.cash} ／ 行動力 {state.energy}/{state.energyMax}</p>{message && <p role="status">{message}</p>}</aside>
    <main className="rd-main">
      {battle ? <BattleView result={battle} vipActive={vip} title="レイド・ローカル確認" onComplete={() => setBattle(null)} /> : <>
        {tab === 'home' && <HomeView state={state} onAction={action} onNavigate={navigate} previewOnly encounterRaid={rooms[0] ? { id: rooms[0].id, name: '炎影の守将', expiresAt: rooms[0].expiresAt } : null} />}
        {tab === 'quest' && <QuestView state={state} party={party} vipActive={vip} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={id => { setRoomId(id); navigate('raid'); }} />}
        {tab === 'character' && <GrowthView state={state} onAction={action} />}
        {tab === 'raid' && <RaidView state={state} rooms={rooms} party={party} onAction={raidAction} onOpenDeck={() => navigate('character')} initialRoomId={roomId} />}
        {tab === 'battle' && <BattleView key={`${vip}`} result={sampleBattle} vipActive={vip} onComplete={() => navigate('quest')} title="Wave・ローカル確認" />}
        {!['home','quest','character','raid','battle'].includes(tab) && <div className="rd-panel"><p>この共通機能は確認用画面では接続しません。</p><button className="rd-button" onClick={() => navigate('home')}>Homeへ</button></div>}
      </>}
    </main>
  </div></GameContext.Provider>;
}
