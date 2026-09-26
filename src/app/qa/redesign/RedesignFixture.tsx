'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GameContext } from '@/app/context/GameContext';
import ShopUiHarness from '@/app/qa/shop-ui/ShopUiHarness';
import HomeView from '@/app/components/redesign/HomeView';
import QuestView, { type QuestSettlement } from '@/app/components/redesign/QuestView';
import GrowthView from '@/app/components/redesign/GrowthView';
import TerritoryView from '@/app/components/redesign/TerritoryView';
import { TERRITORY_MASTER, projectTerritory, territoryItems, activeTerritoryCount, createTerritorySnapshot } from '@/domain/redesign/territory';
import RaidView from '@/app/components/redesign/RaidView';
import BattleView from '@/app/components/redesign/BattleView';
import { BATTLE_RULES, CHARACTER_MASTERS, EQUIPMENT_MASTERS, buildBattleParty, createInitialState, grantReward } from '@/domain/redesign/masters';
import {createQuestBattleInput, questEnergyCost, questVictoryRewards} from '@/domain/redesign/questMaster';
import { QUEST_STAGES, getQuestStage, isQuestStageUnlocked } from '@/domain/redesign/quests';
import { applyGrowthAction } from '@/domain/redesign/growth';
import { applyShopExchange } from '@/domain/redesign/shop';
import { applyRaidAction, createRaidRoom, getRoomRaidMaster, raidEnemy } from '@/domain/redesign/raid';
import { simulateBattle, type BattleResult } from '@/domain/redesign/battle';
import type { RaidRoom, RedesignState } from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';
import { characterArt } from '@/theme/creativeAssets';

const noop = () => undefined;
const qaMissionRewardKind = (itemId: string) => itemId === 'CASH' ? 'cash' : itemId.startsWith('CHAR_EXP') ? 'character_exp_item' : itemId.startsWith('EQUIP_EXP') ? 'equipment_exp_item' : itemId === 'EQUIP_LB_PART' ? 'equipment_lb' : itemId === 'SKILL_MANUAL' ? 'skill_material' : 'generic_soul';
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
    if (selected && ['home','quest','character','raid','territory','battle','shop'].includes(selected)) setTab(selected);
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
  const rejectedOnce = useRef(false);
  async function action(type: string, payload: Record<string, unknown> = {}) {
    const rejectOnce = new URLSearchParams(window.location.search).get('rejectOnce');
    if (!rejectedOnce.current && ['character_level','character_awaken','save_deck'].includes(type) && rejectOnce === type) { rejectedOnce.current = true; throw new Error('保存できませんでした。もう一度お試しください。'); }
    if (type === 'set_home') { setState(previous => ({ ...previous, ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}), ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}) })); return; }
    const next = applyGrowthAction(state, type, payload); setState(next); return { state: next };
  }
  async function startQuest(stageId: string): Promise<QuestSettlement> {
    const stage = getQuestStage(stageId);
    if (!stage || !isQuestStageUnlocked(stageId, state.clearedStages)) throw new Error('未解放です。');
    const cost=questEnergyCost(stage,state);
    if (state.energy < cost) throw new Error('行動力不足です。QA初期化で戻せます。');
    const result = simulateBattle(createQuestBattleInput(917, party, stage, BATTLE_RULES));
    let next: RedesignState = { ...state, energy: state.energy - cost,questAttempts:{...state.questAttempts,[stageId]:(state.questAttempts?.[stageId]??0)+1} };
    const firstClear = result.outcome === 'win' && !state.clearedStages.includes(stageId);
    const settled=questVictoryRewards(stage,state,party,917);
    const rewards = result.outcome === 'win' ? settled.rewards : [];
    if(result.outcome==='win')next.questClearCounts={...next.questClearCounts,[stageId]:settled.count};
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
    session: null, username: '確認用の城主', userLevel: 1, playCyberSe: noop,
    showMissionPanel: false, setShowMissionPanel: (open: boolean) => { if (open) setTab('missions'); },
    directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0, dmRecipientId, setDmRecipientId,
    guildChats, chatInput, setChatInput, chatCooldown: 0, chatSending: false,
    setChatChannel: noop, setShowTribeChatPanel: noop,
    handleSendChat: async () => { if (chatInput.trim()) setGuildChats(previous => [...previous, { id: `qa-${Date.now()}`, author_name: '確認用の城主', content: chatInput, user_id: LOCAL_ID, created_at: new Date().toISOString() }]); setChatInput(''); },
    handleSendDirectMessage: async () => { setMessage('DMは確認用画面では送信されません。'); },
  };
  return <GameContext.Provider value={game}><div className="rd-shell">
    <header className="rd-header"><div className="rd-identity"><span className="rd-avatar"><img src={characterArt(party[0], 'portrait') ?? party[0]?.image} alt={party[0]?.name || '先頭武将'} /><b>Lv.1</b></span><div><strong>確認用の城主 <span className="rd-auth-link">未認証</span></strong><span className="rd-guild-slot">◇ 同盟 —</span></div></div><button className="rd-menu-button" onClick={() => setQaOpen(true)} aria-label="メニュー">MENU ☰</button><div className="rd-resources"><span><img src="/ui/sengoku/13-coin.png" alt="銭" /> {state.cash.toLocaleString()}</span><span><img src="/ui/sengoku/16-diamond.png" alt="輝石" /> {state.diamonds.toLocaleString()}</span><span><img src="/ui/sengoku/14-energy.png" alt="行動力" /> {state.energy}/{state.energyMax}</span></div></header>
    {qaOpen && <div className="rd-qa-backdrop" role="dialog" aria-modal="true" aria-label="QAメニュー"><aside className="rd-qa-panel"><div className="rd-qa-title"><strong>QAメニュー</strong><button onClick={() => setQaOpen(false)} aria-label="閉じる">×</button></div><p className="rd-qa-muted">表示確認専用。保存・API接続・認証・決済は行いません。</p><div className="rd-qa-links">{[['home','Home'],['quest','Quest'],['character','Growth'],['raid','Raid'],['territory','領土侵攻'],['battle','Battle']].map(([id,label]) => <button key={id} onClick={() => { navigate(id); setQaOpen(false); }}>{label}</button>)}</div><label className="rd-qa-check"><input type="checkbox" checked={vip} onChange={event => setVip(event.target.checked)} /> VIP表示確認</label><button className="rd-button" onClick={() => { setState(fixtureState()); setBattle(null); setMessage('QA状態を初期化しました。'); }}>QA初期化</button><button className="rd-button" onClick={() => setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 0 } }))}>QA 開催アイテム0</button><button className="rd-button" onClick={() => { setTerritoryExp(300); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 5 } })); }}>QA 開催枠とアイテム補充</button></aside></div>}
    <main className="rd-main">
      {battle ? <BattleView result={battle} vipActive={vip} title="レイド・ローカル確認" onComplete={() => setBattle(null)} /> : <>
        {tab === 'shop' && <ShopUiHarness embedded exchange={{ state, onExchange: async payload => { setState(value => applyShopExchange(value, payload)); } }} />}
        {tab === 'home' && <HomeView state={state} onAction={action} onNavigate={navigate} previewOnly encounterRaid={rooms[0] ? { id: rooms[0].id, name: '炎影の守将', expiresAt: rooms[0].expiresAt } : null} />}
        {tab === 'quest' && <QuestView state={state} party={party} vipActive={vip} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={id => { setRoomId(id); navigate('raid'); }} />}
        {tab === 'character' && <GrowthView state={state} onAction={action} />}
        {tab === 'territory' && <TerritoryView territory={territory} rooms={rooms} userId={LOCAL_ID} onOpenRoom={id => { setRoomId(id); navigate('raid'); }} onHost={async destinationId => { const destination = territory.destinations.find(entry => entry.id === destinationId); if (!destination?.canHost) throw new Error(destination?.reasons.join(' ') || '未設定です。'); const snapshot = createTerritorySnapshot(TERRITORY_MASTER, destinationId); const room = createRaidRoom(destination.raidMasterId, LOCAL_ID, `qa-territory-${Date.now()}`, Date.now(), snapshot); setRooms(previous => [...previous, room]); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: previous.materials.unlock - destination.itemCount } })); setRoomId(room.id); navigate('raid'); }} />}
        {tab === 'raid' && <RaidView key={roomId || 'list'} state={state} rooms={rooms} party={party} onAction={raidAction} onOpenDeck={() => navigate('character')} initialRoomId={roomId} />}
        {tab === 'battle' && <BattleView key={`${vip}`} result={sampleBattle} vipActive={vip} onComplete={() => navigate('quest')} title="Wave・ローカル確認" />}
        {!['home','quest','character','raid','territory','battle','shop'].includes(tab) && <div className="rd-panel"><p>この共通機能は確認用画面では接続しません。</p><button className="rd-button" onClick={() => navigate('home')}>Homeへ</button></div>}
      </>}
    </main>
    <nav className="rd-footer" aria-label="メインナビゲーション">{[['home','ホーム','08-castle'],['quest','クエスト','04-fan-sakura'],['character','キャラ','10-helmet'],['raid','レイド','06-oni-mask'],['battle','ガチャ','11-ticket']].map(([id,label,icon]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => navigate(id)}><img src={`/ui/sengoku/${icon}.png`} alt="" />{label}</button>)}</nav>
  </div></GameContext.Provider>;
}

