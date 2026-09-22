'use client';
import { useEffect, useMemo, useState } from 'react';
import { useViewedEntries, presentViewEntry } from '@/app/context/hooks/useViewedEntries';
import { CANONICAL_ACTION_RESOURCES, canUseEnergyDrink } from '@/domain/gameplay/canonical/action_resources';
import type { EnergyRecovery } from '@/app/components/redesign/EnergyRecoveryDialog';
import { withPresentation } from '@/app/components/ui/presentationTasks';
import QaOperations from './QaOperations';
import NormalGachaView from '@/app/components/redesign/NormalGachaView';
import MissionContent from '@/app/components/redesign/MissionContent';
import ShopUiHarness from '@/app/qa/shop-ui/ShopUiHarness';
import type { RedesignResponse } from '@/utils/redesignApi';
import { applyNormalGacha, type NormalPoolRow, normalGachaDay } from '@/domain/redesign/normalGacha';
import { PREVIEW_ACQUISITION_MASTER } from '@/domain/redesign/acquisitions';
import { GameContext } from '@/app/context/GameContext';
import RedesignShell from '@/app/components/redesign/RedesignShell';
import QuestView, { type QuestSettlement } from '@/app/components/redesign/QuestView';
import GrowthView from '@/app/components/redesign/GrowthView';
import TerritoryView from '@/app/components/redesign/TerritoryView';
import { TERRITORY_MASTER, projectTerritory, territoryItems, activeTerritoryCount, createTerritorySnapshot } from '@/domain/redesign/territory';
import RaidView from '@/app/components/redesign/RaidView';
import BattleView from '@/app/components/redesign/BattleView';
import { BATTLE_RULES, CHARACTER_MASTERS, SKILL_MASTERS, EQUIPMENT_MASTERS, buildBattleParty, createInitialState, grantReward } from '@/domain/redesign/masters';
import { CANONICAL_MISSIONS } from '@/domain/gameplay/canonical/masters';
import { QUEST_STAGES, getQuestStage, isQuestStageUnlocked } from '@/domain/redesign/quests';
import { applyGrowthAction } from '@/domain/redesign/growth';
import { applyRaidAction, createRaidRoom, getRoomRaidMaster, raidEnemy } from '@/domain/redesign/raid';
import { simulateBattle, type BattleResult } from '@/domain/redesign/battle';
import type { RaidRoom, RedesignState } from '@/domain/redesign/types';
import '@/app/components/redesign/redesign.css';

const noop = () => undefined;
const qaMissionRewardKind = (itemId: string) => itemId === 'CASH' ? 'cash' : itemId.startsWith('CHAR_EXP') ? 'character_exp_item' : itemId.startsWith('EQUIP_EXP') ? 'equipment_exp_item' : itemId === 'EQUIP_LB_PART' ? 'equipment_lb' : itemId === 'SKILL_MANUAL' ? 'skill_material' : 'generic_soul';
import { emptyGrowthInventory } from '@/domain/redesign/growthMaster';
const LOCAL_ID = 'qa-local-only';
const QA_NORMAL_POOL: NormalPoolRow[] = (['CHARACTER', 'SKILL', 'EQUIPMENT'] as const).flatMap(kind =>
  ({ CHARACTER: CHARACTER_MASTERS, SKILL: SKILL_MASTERS, EQUIPMENT: EQUIPMENT_MASTERS }[kind]).map(master => ({
    gacha_id: { CHARACTER: 'CHAR_NORMAL', SKILL: 'SKILL_NORMAL', EQUIPMENT: 'EQUIP_NORMAL' }[kind],
    item_id: master.id, item_type: kind, rarity: master.rarity,
  }))
);
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
  const [presentationDelay,setPresentationDelay]=useState(false);
  const [potions, setPotions] = useState(2);
  const [showInboxPanel, setShowInboxPanel] = useState(false);
  const [inboxPanelTab, setInboxPanelTab] = useState('news');
  const [newsList, setNewsList] = useState([{id:'qa-ui-v11-news-1',title:'共通UI確認のお知らせ',content:'確認用のお知らせです。実際のユーザーデータには接続していません。',date:'2026/9/22'}]);
  const [presents, setPresents] = useState(Array.from({length:12},(_,index)=>({id:`qa-ui-v11-present-${index}`,title:`表示確認の贈り物 ${index+1}`,itemId:'CASH',qty:100,status:'UNCLAIMED'})));
  const newsViews=useViewedEntries(LOCAL_ID,'news',newsList.map(n=>({id:n.id,revision:JSON.stringify([n.title,n.content])})));
  const presentViews=useViewedEntries(LOCAL_ID,'presents',presents.map(presentViewEntry));
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
    if (selected && ['home','quest','character','raid','territory','battle','gacha','shop','missions'].includes(selected)) setTab(selected);
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
    return withPresentation(async()=>{
    if(presentationDelay)await new Promise(resolve=>setTimeout(resolve,3000));
    if (type === 'set_home') { setState(previous => ({ ...previous, ...(typeof payload.characterId === 'string' ? { homeCharacterId: payload.characterId } : {}), ...(typeof payload.backgroundId === 'string' ? { homeBackgroundId: payload.backgroundId } : {}) })); return; }
    const next = applyGrowthAction(state, type, payload); setState(next); return next;
    });
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
  const gachaData: RedesignResponse = {
    state, rooms,
    normalGacha: { pool: QA_NORMAL_POOL, day: normalGachaDay(Date.now()), available: state.dailyNormalGachaDate !== normalGachaDay(Date.now()) },
  };
  async function qaGachaAction(name: string, payload: Record<string, unknown> = {}, requestId = crypto.randomUUID()): Promise<RedesignResponse> {
    if (name === 'normal_gacha_status') return gachaData;
    if (name !== 'normal_gacha') throw new Error('Unsupported local QA action');
    const result = applyNormalGacha(state, { count: Number(payload.count), currency: String(payload.currency) }, QA_NORMAL_POOL, requestId, Date.now(), PREVIEW_ACQUISITION_MASTER, Math.random);
    setState(result.state);
    return { ...gachaData, state: result.state, normalGachaResults: result.results };
  }
  const recovery: EnergyRecovery = { owned: potions, amount: CANONICAL_ACTION_RESOURCES.recoveryItems.ENERGY_DRINK.amount, canUse: canUseEnergyDrink(state.energy), onUse: async () => {
    if (potions < 1) throw new Error('回復薬が足りません。');
    setPotions(value=>value-1);setState(value=>({...value,energy:value.energy+CANONICAL_ACTION_RESOURCES.recoveryItems.ENERGY_DRINK.amount}));
  }};
  const game = {
    ownedHomeCosmeticIds: [], setShowAccountAuthenticationModal: noop, setInboxPanelTab, setShowInboxPanel, setShowSettingsPanel: noop,
    showInboxPanel,inboxPanelTab,newsList,setNewsList,presents,presentClaimLoading:false,
    handleClaimPresent:async(id:string)=>setPresents(items=>items.filter(p=>p.id!==id)),handleClaimAllPresents:async()=>setPresents([]),
    unreadNewsCount:newsViews.unreadCount,unreadPresentsCount:presentViews.unreadCount,
    markNewsRead:(n:typeof newsList[number])=>newsViews.markViewed({id:n.id,revision:JSON.stringify([n.title,n.content])}),
    isNewsUnread:(n:typeof newsList[number])=>newsViews.isUnread({id:n.id,revision:JSON.stringify([n.title,n.content])}),
    markPresentViewed:(p:typeof presents[number])=>presentViews.markViewed(presentViewEntry(p)),isPresentUnread:(p:typeof presents[number])=>presentViews.isUnread(presentViewEntry(p)),
    session: null, username: '確認用の城主', userLevel: 1, playCyberSe: noop,
    showMissionPanel: false, setShowMissionPanel: (open: boolean) => { if (open) setTab('missions'); },
    directMessages: [], dmUnreadConversations: [], dmUnreadTotal: 0, dmRecipientId, setDmRecipientId,
    guildChats, chatInput, setChatInput, chatCooldown: 0, chatSending: false,
    setChatChannel: noop, setShowTribeChatPanel: noop,
    handleSendChat: async () => { if (chatInput.trim()) setGuildChats(previous => [...previous, { id: `qa-${Date.now()}`, author_name: '確認用の城主', content: chatInput, user_id: LOCAL_ID, created_at: new Date().toISOString() }]); setChatInput(''); },
    handleSendDirectMessage: async () => { setMessage('DMは確認用画面では送信されません。'); },
  };
  return <GameContext.Provider value={game}><RedesignShell state={state} onAction={action} activeTab={tab} onNavigate={navigate} previewOnly hideChrome={Boolean(battle) || tab === 'battle'} encounterRaid={rooms[0] ? { id: rooms[0].id, name: '炎影の守将', expiresAt: rooms[0].expiresAt } : null} onOpenQa={() => setQaOpen(true)}>
      {battle ? <BattleView result={battle} vipActive={vip} title="レイド・ローカル確認" onComplete={() => setBattle(null)} /> : <>
        {tab === 'gacha' && <NormalGachaView data={gachaData} onAction={qaGachaAction} />}
        {tab === 'shop' && <ShopUiHarness embedded />}
        {tab === 'missions' && <section className="rd-panel"><h1>ミッション</h1><MissionContent state={state} missions={CANONICAL_MISSIONS.map(mission => ({ id: mission.id, name: mission.title, description: mission.description, rewards: [{ kind: qaMissionRewardKind(mission.rewardItemId) as any, amount: mission.rewardItemId === 'CASH' ? mission.cashReward : mission.rewardQuantity }], status: 'progress' as const, current: 0, target: mission.targetValue }))} missionBusy={false} missionError="" previewOnly onClaim={noop}/></section>}
        {tab === 'quest' && <QuestView recovery={recovery} state={state} party={party} vipActive={vip} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={id => { setRoomId(id); navigate('raid'); }} />}
        {tab === 'character' && <GrowthView state={state} onAction={action} />}
        {tab === 'territory' && <TerritoryView territory={territory} rooms={rooms} userId={LOCAL_ID} onOpenRoom={id => { setRoomId(id); navigate('raid'); }} onHost={async destinationId => { const destination = territory.destinations.find(entry => entry.id === destinationId); if (!destination?.canHost) throw new Error(destination?.reasons.join(' ') || '未設定です。'); const snapshot = createTerritorySnapshot(TERRITORY_MASTER, destinationId); const room = createRaidRoom(destination.raidMasterId, LOCAL_ID, `qa-territory-${Date.now()}`, Date.now(), snapshot); setRooms(previous => [...previous, room]); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: previous.materials.unlock - destination.itemCount } })); setRoomId(room.id); navigate('raid'); }} />}
        {tab === 'raid' && <RaidView recovery={recovery} key={roomId || 'list'} state={state} rooms={rooms} party={party} onAction={raidAction} onOpenDeck={() => navigate('character')} initialRoomId={roomId} />}
        {tab === 'battle' && <BattleView result={sampleBattle} vipActive={vip} onComplete={() => navigate('quest')} title="Wave・ローカル確認" />}
        {!['home','quest','character','raid','territory','battle','gacha','shop','missions'].includes(tab) && <div className="rd-panel"><p>この共通機能は確認用画面では接続しません。</p><button className="rd-button" onClick={() => navigate('home')}>Homeへ</button></div>}
      </>}
  </RedesignShell>
    <QaOperations open={qaOpen} onClose={() => setQaOpen(false)} activeView={battle ? 'battle' : tab}
      onSelectView={next => { if (next !== (battle ? 'battle' : tab)) navigate(next); setQaOpen(false); }}
      vip={vip} onVipChange={setVip} cash={state.cash} energy={state.energy} energyMax={state.energyMax} message={message}
      presentationDelay={presentationDelay} onPresentationDelay={setPresentationDelay}
      onPresentationFixture={()=>{setState(previous=>({...previous,cash:200000,characters:[...previous.characters,...['SR','SSR'].flatMap(rarity=>{const c=CHARACTER_MASTERS.find(c=>c.rarity===rarity)!;return previous.characters.some(o=>o.id===c.id)?[]:[{id:c.id,level:1,awakening:0}];})]}));setTab('character');setQaOpen(false);}}
      onRecoveryProbe={owned=>{setPotions(owned?2:0);setState(value=>({...value,energy:0}));}}
      onNewNotice={()=>setNewsList(items=>[...items,{id:`qa-news-${Date.now()}`,title:'追加のお知らせ',content:'追加した新着の確認用データです。',date:'2026/9/22'}])}
      onReset={() => { setPotions(2);setState(fixtureState()); setBattle(null); setMessage('QA状態を初期化しました。'); }}
      onEmptyItems={() => setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 0 } }))}
      onReplenish={() => { setTerritoryExp(300); setState(previous => ({ ...previous, materials: { ...previous.materials, unlock: 5 } })); }} />
  </GameContext.Provider>;
}

