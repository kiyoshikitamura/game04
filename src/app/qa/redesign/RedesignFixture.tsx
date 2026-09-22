'use client';
import { useEffect, useMemo, useState } from 'react';
import QaOperations from './QaOperations';
import { GameContext } from '@/app/context/GameContext';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import QuestView, { type QuestSettlement } from '@/app/components/redesign/QuestView';
import GrowthView from '@/app/components/redesign/GrowthView';
import TerritoryView from '@/app/components/redesign/TerritoryView';
import { TERRITORY_MASTER, projectTerritory, territoryItems, activeTerritoryCount, createTerritorySnapshot } from '@/domain/redesign/territory';
import RaidView from '@/app/components/redesign/RaidView';
import BattleView from '@/app/components/redesign/BattleView';
import { BATTLE_RULES, CHARACTER_MASTERS, EQUIPMENT_MASTERS, buildBattleParty, createInitialState, grantReward } from '@/domain/redesign/masters';
import { QUEST_STAGES, getQuestStage, isQuestStageUnlocked } from '@/domain/redesign/quests';
import { applyGrowthAction } from '@/domain/redesign/growth';
import { applyRaidAction, createRaidRoom, getRoomRaidMaster, raidEnemy } from '@/domain/redesign/raid';
import { simulateBattle, type BattleResult } from '@/domain/redesign/battle';
import type { RaidRoom, RedesignState } from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';

const noop = () => undefined;
import { emptyGrowthInventory } from '@/domain/redesign/growthMaster';
const LOCAL_ID = 'qa-local-only';
function fixtureState(): RedesignState {
  const state = createInitialState(LOCAL_ID);
  state.growthInventory = emptyGrowthInventory();
  state.growthInventory.expItems.character = {small:100,medium:30,large:20,xlarge:10};
  state.growthInventory.expItems.equipment = {small:100,medium:30,large:20,xlarge:10};
  state.growthInventory.genericSouls = {N:100,R:100,SR:100,SSR:100};
  state.growthInventory.soulSelectors = {N:2,R:2,SR:2,SSR:2};
  state.cash = 30000; state.diamonds = 1000; state.energy = 50;
  state.souls = Object.fromEntries(CHARACTER_MASTERS.map(c => [c.id, 100]));
  state.equipment = EQUIPMENT_MASTERS.slice(0, 14).map((master, index) => ({ instanceId: `qa-equipment-${index}`, masterId: master.id, level: 1, lb: 0 }));
  return state;
}
export default function RedesignFixture() {
  const [state, setState] = useState(fixtureState);
  const [tab, setTab] = useState('home');
  const [qaOpen, setQaOpen] = useState(false);
  const [waveSpProbe, setWaveSpProbe] = useState(false);
  const [rooms, setRooms] = useState<RaidRoom[]>([]);
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const [roomId, setRoomId] = useState<string>();
  const [message, setMessage] = useState('');
  const [vip, setVip] = useState(false);
  const [territoryExp, setTerritoryExp] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [dmRecipientId, setDmRecipientId] = useState<string | null>(null);
  const [guildChats, setGuildChats] = useState<{ id: string; author_name: string; content: string; user_id: string; created_at: string }[]>([]);
  useEffect(() => {
    const now = Date.now();
    // Offline-only receipt fixture. Expired rooms must not occupy a hosting slot.
    const snapshot = createTerritorySnapshot(TERRITORY_MASTER, TERRITORY_MASTER.destinations[0].id);
    const expired = createRaidRoom(snapshot.raidMaster.id, LOCAL_ID, 'qa-territory-expired', now - (snapshot.destination.durationMinutes + 1) * 60000, snapshot);
    expired.status = 'expired';
    expired.participants[0].attempts = 1;
    expired.rewardGrants = [{ id: `participation:${LOCAL_ID}`, userId: LOCAL_ID, level: 1,
      rewards: structuredClone(snapshot.raidMaster.participationRewards), claimed: false }];
    setRooms([createRaidRoom('encounter_flame', LOCAL_ID, 'qa-encounter', now), createRaidRoom('unlock_shadow', LOCAL_ID, 'qa-unlock', now), expired]);
    const params = new URLSearchParams(window.location.search);
    setWaveSpProbe(params.get('probe') === 'wave-sp');
    const selected = params.get('view');
    if (selected && ['home','quest','character','raid','territory','battle'].includes(selected)) setTab(selected);
    document.body.classList.add('rd-active');
    return () => document.body.classList.remove('rd-active');
  }, []);
  const party = useMemo(() => buildBattleParty(state), [state]);
  const sampleBattle = useMemo(() => {
    // TEST_ONLY: six-wave replay/initial-SP probe, never an economy or formal balance master.
    if (waveSpProbe) return simulateBattle({ seed: 917, rules: BATTLE_RULES,
      party: party.map(u => ({...u, stats:{...u.stats,hp:100000,atk:1000},skills:[],passives:[]})),
      waves: [0,35,50,0,35,175].map((initialSp,i) => [{...QUEST_STAGES[0].waves[0][0],
        id:`wave-sp-probe-${i}`, initialSp, stats:{hp:1,sp:i===5?180:100,atk:1,def:0,luk:0}, skills:[],passives:[],phases:[],hitSpGain:10}]),
    });
    return simulateBattle({ seed: 917, party, waves: QUEST_STAGES[2].waves, rules: BATTLE_RULES });
  }, [party,waveSpProbe]);
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
    if (payload.action === 'raid_refresh') return;
    const room = rooms.find(entry => entry.id === payload.roomId);
    if (!room) throw new Error('QAレイドが見つかりません。');
    const isBattle = payload.action === 'raid_battle';
    const result = isBattle ? simulateBattle({ seed: 917, party, waves: [[raidEnemy(getRoomRaidMaster(room), room.level)]], rules: BATTLE_RULES }) : null;
    const update = applyRaidAction(room, state, String(payload.action), result ? { battleId: `qa-${Date.now()}`, battleLevel: room.level, result } : {});
    setState(update.state); setRooms(previous => previous.map(entry => entry.id === room.id ? update.room : entry));
    if (result) setBattle(result);
  }
  const territory = projectTerritory(TERRITORY_MASTER, { experience: territoryExp }, territoryItems(state), activeTerritoryCount(LOCAL_ID, rooms));
  const game = {
    ownedHomeCosmeticIds: [], setShowAccountAuthenticationModal: noop, setInboxPanelTab: noop, setShowInboxPanel: noop, setShowSettingsPanel: noop,
    session: null, username: '確認用の城主', userLevel: 1, playCyberSe: noop,
    directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0, dmRecipientId, setDmRecipientId,
    guildChats, chatInput, setChatInput, chatCooldown: 0, chatSending: false,
    setChatChannel: noop, setShowTribeChatPanel: noop,
    handleSendChat: async () => { if (chatInput.trim()) setGuildChats(previous => [...previous, { id: `qa-${Date.now()}`, author_name: '確認用の城主', content: chatInput, user_id: LOCAL_ID, created_at: new Date().toISOString() }]); setChatInput(''); },
    handleSendDirectMessage: async () => { setMessage('DMは確認用画面では送信されません。'); },
  };
  return <GameContext.Provider value={game}><RedesignShell state={state} onAction={action} activeTab={tab} onNavigate={navigate} previewOnly hideChrome={Boolean(battle) || tab === 'battle'} encounterRaid={rooms[0] ? { id: rooms[0].id, name: '炎影の守将', expiresAt: rooms[0].expiresAt } : null} onOpenQa={() => setQaOpen(true)}>
      {battle ? <BattleView result={battle} vipActive={vip} title="レイド・ローカル確認" onComplete={() => setBattle(null)} /> : <>
        {tab === 'quest' && <QuestView state={state} party={party} vipActive={vip} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={id => { setRoomId(id); navigate('raid'); }} />}
        {tab === 'character' && <GrowthView state={state} onAction={action} />}
        {tab === 'territory' && <TerritoryView territory={territory} rooms={rooms} userId={LOCAL_ID} onOpenRoom={id => { setRoomId(id); navigate('raid'); }} onHost={async destinationId => { const destination = territory.destinations.find(entry => entry.id === destinationId); if (!destination?.canHost) throw new Error(destination?.reasons.join(' ') || '未設定です。'); const snapshot = createTerritorySnapshot(TERRITORY_MASTER, destinationId); const room = createRaidRoom(destination.raidMasterId, LOCAL_ID, `qa-territory-${Date.now()}`, Date.now(), snapshot); setRooms(previous => [...previous, room]); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: previous.materials.unlock - destination.itemCount } })); setRoomId(room.id); navigate('raid'); }} />}
        {tab === 'raid' && <RaidView key={roomId || 'list'} state={state} rooms={rooms} party={party} onAction={raidAction} onOpenDeck={() => navigate('character')} initialRoomId={roomId} />}
        {tab === 'battle' && <BattleView result={sampleBattle} vipActive={vip} onComplete={() => navigate('quest')} title="Wave・ローカル確認" />}
        {!['home','quest','character','raid','territory','battle'].includes(tab) && <div className="rd-panel"><p>この共通機能は確認用画面では接続しません。</p><button className="rd-button" onClick={() => navigate('home')}>Homeへ</button></div>}
      </>}
  </RedesignShell>
    <QaOperations open={qaOpen} onClose={() => setQaOpen(false)} activeView={battle ? 'battle' : tab}
      onSelectView={next => { if (next !== (battle ? 'battle' : tab)) navigate(next); setQaOpen(false); }}
      vip={vip} onVipChange={setVip} cash={state.cash} energy={state.energy} energyMax={state.energyMax} message={message}
      onReset={() => { setState(fixtureState()); setBattle(null); setMessage('QA状態を初期化しました。'); }}
      onEmptyItems={() => setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 0 } }))}
      onReplenish={() => { setTerritoryExp(300); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 5 } })); }} />
  </GameContext.Provider>;
}

