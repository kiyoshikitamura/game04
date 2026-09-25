'use client';
import { raidBattleBackground } from '@/domain/redesign/approvedBackgrounds';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { observeRedesignRestore } from '@/utils/redesignRestoreObservation';
import { REDESIGN_REWARD_SYNC_EVENT } from '@/utils/redesignRewardSync';
import { emitQaTiming } from '@/utils/redesignQaTelemetry';
import { redesignRequest, type RedesignResponse } from '@/utils/redesignApi';
import { buildBattleParty } from '@/domain/redesign/masters';
import { getQuestStage, QUEST_AREAS, nextQuestStage } from '@/domain/redesign/quests';
import { getRoomRaidMaster } from '@/domain/redesign/raid';
import { jstLoginDate, LOGIN_BONUS_VERSION } from '@/domain/redesign/loginBonus';
import { isVipActive, VIP_PRODUCT } from '@/domain/redesign/vip';
import type { AcquisitionState } from '@/domain/redesign/acquisitions';
import type { BattleResult } from '@/domain/redesign/battle';
import RedesignShell from './RedesignShell';
import GrowthView from './GrowthView';
import QuestView, { type QuestSettlement } from './QuestView';
import RaidView from './RaidView';
import TerritoryView from './TerritoryView';
import BattleView from './BattleView';
import FormalGachaView from './FormalGachaView';
import ShopTab from '../ShopTab';
import BrandedLoading from '../ui/BrandedLoading';
import IntegratedTutorial from './IntegratedTutorial';
import Modal from './Modal';
import { SCENES,FIRST_SORTIE_TEXT,FIRST_DEFEAT_TEXT } from '@/domain/redesign/tutorial/content';

export default function RedesignApp({ initialTab = 'home' }: { initialTab?: string } = {}) {
  const game = useGame();
  const owner = game.session?.user.id;
  const [data, setData] = useState<RedesignResponse | null>(null);
  const [tab, setTab] = useState(initialTab);
  const [encounterNow, setEncounterNow] = useState(Date.now);
  useEffect(() => { if (tab !== 'home') return; const timer = setInterval(() => setEncounterNow(Date.now()), 1000); return () => clearInterval(timer); }, [tab]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [raidId, setRaidId] = useState<string>();
  const [battleKind, setBattleKind] = useState<'quest' | 'raid' | null>(null);
  const [questStart, setQuestStart] = useState<string>();
  const [questPreparation, setQuestPreparation] = useState(false);
  const [questDeckReturn, setQuestDeckReturn] = useState<string>();
  const [raidDeckReturn, setRaidDeckReturn] = useState<{ roomId: string; level: number }>();
  const [raidPreparationLevel, setRaidPreparationLevel] = useState<number>();
  const [raidNavigation, setRaidNavigation] = useState(0);
  const [questNavigation, setQuestNavigation] = useState(0);
  const [questPlaying, setQuestPlaying] = useState(false);
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const [battleBackground, setBattleBackground] = useState<string>();
  const ownerRef = useRef(owner);
  const restoredOwner = useRef<string | null>(null);
  const lock = useRef(false);
  const actionTiming = useRef<{owner:string|undefined;name:string;start:number;feedback:boolean;outcome?:'success'|'error'} | null>(null);
  // Countdown and local tab changes do not change the authoritative party input.
  const party = useMemo(() => data ? buildBattleParty(data.state) : [], [data?.state]);
  useLayoutEffect(() => {
    const timing = actionTiming.current;
    if (!timing || timing.owner !== owner) return;
    const settledAt = performance.now();
    if (busy && !timing.feedback) {
      timing.feedback = true;
      emitQaTiming({kind:'action-feedback',scope:timing.name,startedAt:timing.start,settledAt,durationMs:settledAt-timing.start,outcome:'success'});
    } else if (!busy && timing.outcome) {
      emitQaTiming({kind:'action-result',scope:timing.name,startedAt:timing.start,settledAt,durationMs:settledAt-timing.start,outcome:timing.outcome});
      actionTiming.current = null;
    }
  }, [busy, data, owner]);
  const requestGeneration = useRef(0);
  const rewardRefreshPending = useRef(false);
  const refreshing = useRef<{ owner: string; generation: number; promise: Promise<void> } | null>(null);
  ownerRef.current = owner;
  const refresh = useCallback((): Promise<void> => {
    if (!owner || lock.current) return Promise.resolve();
    const existing = refreshing.current;
    if (existing && existing.owner === owner && existing.generation === requestGeneration.current) return existing.promise;
    const requestOwner = owner;
    const generation = ++requestGeneration.current;
    const promise = (async () => {
      try {
        const value = await redesignRequest('get_state');
        if (ownerRef.current === requestOwner && generation === requestGeneration.current) {
          setData(current => current && current.state.userId === value.state.userId && current.state.version > value.state.version ? current : value);
          setError('');
        }
      } catch (reason) {
        if (ownerRef.current === requestOwner && generation === requestGeneration.current) setError(reason instanceof Error ? reason.message : '読み込めませんでした。');
      } finally {
        if (refreshing.current?.generation === generation) refreshing.current = null;
      }
    })();
    refreshing.current = { owner, generation, promise };
    return promise;
  }, [owner]);
  useEffect(() => { setData(null); void refresh(); }, [refresh]);
  useEffect(() => {
    if (!data || data.state.userId !== owner || restoredOwner.current === owner) return;
    restoredOwner.current = owner;
    // Acknowledge committed React state once per mounted owner, never each polling refresh.
    // Failure leaves gameplay intact and the observation absent; no automatic retry loop.
    void observeRedesignRestore(data.state.version).catch(() => {});
  }, [data, owner]);
  useEffect(() => {
    const update = () => { if (document.visibilityState === 'visible' && !lock.current) void refresh(); };
    document.addEventListener('visibilitychange', update);
    const timer = setInterval(update, 60000);
    return () => { document.removeEventListener('visibilitychange', update); clearInterval(timer); };
  }, [refresh]);
  useEffect(() => {
    const update = (event: Event) => {
      if ((event as CustomEvent<{ userId: string }>).detail?.userId !== owner) return;
      if (lock.current) rewardRefreshPending.current = true;
      else void refresh();
    };
    window.addEventListener(REDESIGN_REWARD_SYNC_EVENT, update);
    return () => window.removeEventListener(REDESIGN_REWARD_SYNC_EVENT, update);
  }, [owner, refresh]);
  async function action(name: string, payload: Record<string, unknown> = {}, explicitId?: string, reportError = true) {
    if (lock.current) throw new Error('処理中です。');
    actionTiming.current = {owner,name,start:performance.now(),feedback:false};
    lock.current = true; requestGeneration.current++; setBusy(true); setError('');
    const requestOwner = owner;
    const isBattle = name === 'quest_battle' || name === 'raid_battle';
    const isGrowth = ['save_deck','character_level','character_awaken','character_unlock','soul_exchange','soul_select','skill_level','equipment_level','equipment_lb','equipment_lock','equipment_dismantle'].includes(name);
    const persistentRequest = name.startsWith('tutorial_') || isBattle || name === 'territory_host' || isGrowth || ['shop_exchange', 'use_energy_drink', 'claim_mission', 'raid_claim'].includes(name);
    const storageKey = `game04:request:${owner}:${name}:${!isBattle ? JSON.stringify(payload) : String(payload.stageId || payload.roomId || payload.destinationId || '')}`;
    let requestId = explicitId || crypto.randomUUID();
    if (persistentRequest && !explicitId) {
      try { requestId = sessionStorage.getItem(storageKey) || requestId; sessionStorage.setItem(storageKey, requestId); } catch { /* API also exposes pending battles for resume. */ }
    }
    try {
      const value = await redesignRequest(name, payload, requestId);
      if (requestOwner !== ownerRef.current) throw new Error('ログイン状態が変更されました。');
      setData(current => current && current.state.userId === value.state.userId && current.state.version > value.state.version ? current : value);
      if (persistentRequest) try { sessionStorage.removeItem(storageKey); } catch { /* no persistent reliance */ }
      if (actionTiming.current?.owner === requestOwner) actionTiming.current.outcome = 'success';
      return value;
    } catch (reason) {
      if (actionTiming.current?.owner === requestOwner) actionTiming.current.outcome = 'error';
      const message = reason instanceof Error ? reason.message : '処理に失敗しました。';
      if (reportError) setError(message); rewardRefreshPending.current = true; throw reason;
    } finally { lock.current = false; setBusy(false); if (rewardRefreshPending.current) { rewardRefreshPending.current = false; void refresh(); } }
  }
  function navigate(next: string) {
    if (busy || lock.current) return;
    if(data?.state.tutorial && !data.state.tutorial.departed) {
      if(!next.startsWith('quest'))return;
      void action('tutorial_depart').then(()=>{setTab('quest');setQuestNavigation(v=>v+1);});return;
    }
    if(next==='home'&&tab!=='home'&&data?.state.tutorial&&!data.state.tutorial.loginEligible){void action('tutorial_home').then(()=>setTab('home'));return;}
    if (next === 'raid' && raidDeckReturn) { returnToRaidPreparation(); return; }
    setRaidDeckReturn(undefined); setRaidPreparationLevel(undefined);
    if (next === 'quest' && questDeckReturn) { returnToQuestPreparation(); return; }
    setQuestDeckReturn(undefined);
    setQuestPreparation(false);
    if (next.startsWith('raid:')) { setRaidId(next.slice(5)); next = 'raid'; }
    if (next === 'quest:resume' || next === 'quest') {
      setQuestStart(next === 'quest:resume' && data ? nextQuestStage(data.state.clearedStages).id : undefined);
      setQuestNavigation(value => value + 1);
      next = 'quest';
    }
    setTab(next); setError('');
    if (next === 'gacha' || next === 'shop') {
      game.navigateTab(next);
      if (owner) void game.syncBootstrapData(owner);
    } else void refresh();
  }
  function openQuestDeck(stageId?: string) {
    if (busy || lock.current) return;
    setQuestDeckReturn(stageId);
    setTab('character');
    setError('');
  }
  function returnToQuestPreparation() {
    if (!questDeckReturn || busy || lock.current) return;
    setQuestStart(questDeckReturn);
    setQuestPreparation(true);
    setQuestDeckReturn(undefined);
    setQuestNavigation(value => value + 1);
    setTab('quest');
    setError('');
    void refresh();
  }
  function openRaidDeck(roomId: string, level: number) {
    if (busy || lock.current) return;
    setRaidDeckReturn({ roomId, level }); setRaidPreparationLevel(undefined);
    setTab('character'); setError('');
  }
  function returnToRaidPreparation() {
    if (!raidDeckReturn || busy || lock.current) return;
    setRaidId(raidDeckReturn.roomId); setRaidPreparationLevel(raidDeckReturn.level);
    setRaidDeckReturn(undefined); setRaidNavigation(value => value + 1);
    setTab('raid'); setError(''); void refresh();
  }
  async function startQuest(stageId: string): Promise<QuestSettlement> {
    const value = await action('quest_battle', { stageId });
    if (!value.battle) throw new Error('戦闘結果を確認できませんでした。');
    return { battle: value.battle, rewards: value.rewards || [], firstClear: !!value.firstClear, encounterRaidId: value.encounterRaidId, playerGrowth: value.playerGrowth };
  }
  async function raidAction(input: Record<string, unknown>) {
    const { action: name, ...payload } = input;
    const value = await action(String(name), payload);
    if (value.battle) {
      setBattleKind(name === 'raid_battle' ? 'raid' : 'quest');
      if (name === 'raid_battle' && typeof payload.roomId === 'string') setRaidId(payload.roomId);
      const room = value.rooms.find(entry => entry.id === payload.roomId) ?? data?.rooms.find(entry => entry.id === payload.roomId);
      setBattleBackground(room ? raidBattleBackground(room, getRoomRaidMaster(room), value.battle.raidStartSnapshot) : undefined);
      setBattle(value.battle);
    }
    return value;
  }
  const tutorialEntry = useRef(false);
  useEffect(()=>{if(!data||tutorialEntry.current)return;tutorialEntry.current=true;
   if(data.state.tutorial&&data.state.tutorial.step>=SCENES.length&&!data.state.tutorial.loginEligible&&tab==='home')void action('tutorial_home');
  },[data?.state.userId]);
  const loginReceipt = data?.state.loginBonusReceipt;
  const shownLoginReceipt = useRef('');
  useEffect(() => {
    if (data?.state.tutorial && (!data.state.tutorial.loginEligible || tab!=='home')) return;
    if (!owner || !loginReceipt || loginReceipt.masterVersion !== LOGIN_BONUS_VERSION || loginReceipt.last_claimed_date !== jstLoginDate(Date.now()) || busy || battle || questPlaying) return;
    const key = `game04:login-receipt:${owner}:${loginReceipt.last_claimed_date}`;
    if (shownLoginReceipt.current === key) return;
    try { if (sessionStorage.getItem(key)) { shownLoginReceipt.current = key; return; } } catch { /* in-memory fallback */ }
    shownLoginReceipt.current = key;
    try { sessionStorage.setItem(key, 'shown'); } catch { /* no storage required to claim */ }
    game.setLoginBonusClaimResult(loginReceipt);
    game.setUserLoginBonus({ user_id: owner, current_step: loginReceipt.current_step, total_logins: loginReceipt.total_logins, last_claimed_date: loginReceipt.last_claimed_date });
    game.setShowLoginBonusModal(true);
  }, [owner, loginReceipt, busy, battle, questPlaying, game.setLoginBonusClaimResult, game.setUserLoginBonus, game.setShowLoginBonusModal, data?.state.tutorial?.loginEligible, tab]);
  if (!data) return <div className="rd-shell"><div className="rd-panel">{error ? <><p role="alert">{error}</p><button className="rd-button" onClick={() => void refresh()}>再読み込み</button></> : <BrandedLoading label="戦国の世界を準備中" />}</div></div>;
  if(data.state.tutorial && data.state.tutorial.step<SCENES.length) return <IntegratedTutorial state={data.state} busy={busy} onNext={async(step,name)=>{const result=await action('tutorial_next',{step,name});if(result.state.tutorial?.name)game.setUsername(result.state.tutorial.name);return result;}}/>;
  const state = data.state, vipActive = isVipActive(state.vipExpiresAt);
  const battleRoom = battle && battleKind === 'raid' && raidId ? data.rooms.find(room => room.id === raidId) : undefined;
  const encounter = data.rooms.find(r => getRoomRaidMaster(r).type === 'encounter' && r.status === 'active' && Date.parse(r.expiresAt) > encounterNow && r.participants.some(p => p.userId === state.userId && !p.leftAt));
  return <RedesignShell state={state} activeTab={tab} navigationBusy={busy} onNavigate={navigate} onAction={action} hideChrome={!!battle || questPlaying} socialEvents={data.socialEvents} missions={data.missions}
    encounterRaid={encounter ? { id: encounter.id, name: getRoomRaidMaster(encounter).name, expiresAt: encounter.expiresAt } : null}
    notifications={<>
    {state.tutorial&&!state.tutorial.departed&&tab==='home'&&<Modal title="ご案内" hideCloseButton closeDisabled onClose={()=>{}} footer={<button className="rd-button" disabled={busy} onClick={()=>navigate('quest')}>出陣へ</button>}><p>{FIRST_SORTIE_TEXT}</p></Modal>}
    {state.tutorial?.defeatPending&&!battle&&!questPlaying&&<Modal title="ご案内" hideCloseButton closeDisabled onClose={()=>{}} footer={<button className="rd-button" disabled={busy} onClick={()=>void action('tutorial_dismiss_defeat').then(()=>game.setShowMissionPanel(true))}>任務へ</button>}><p>{FIRST_DEFEAT_TEXT}</p></Modal>}
    {!!(state as AcquisitionState).pendingAcquisitions?.length && <p className="rd-panel" role="status">受け取り保留中の獲得物が{(state as AcquisitionState).pendingAcquisitions!.length}件あります。</p>}
    {error && <p className="rd-panel" role="alert">{error}</p>}
    {data.pendingBattle && !battle && <div className="rd-panel"><p>未完了の戦闘があります。</p><button className="rd-button" disabled={busy} onClick={async () => {
      const p = data.pendingBattle!;
      try { const value = await action(p.kind === 'quest' ? 'quest_battle' : 'raid_battle', p.kind === 'quest' ? { stageId: p.target_id } : { roomId: p.target_id }, p.id); if (value.battle) { setBattleKind(p.kind === 'raid' ? 'raid' : 'quest'); if (p.kind === 'raid') { setRaidId(p.target_id); setTab('raid'); const room = value.rooms.find(entry => entry.id === p.target_id) ?? data.rooms.find(entry => entry.id === p.target_id); setBattleBackground(room ? raidBattleBackground(room, getRoomRaidMaster(room), value.battle.raidStartSnapshot) : undefined); } else { const stage = getQuestStage(p.target_id); setBattleBackground(QUEST_AREAS.find(entry => entry.id === stage?.areaId)?.image); } setBattle(value.battle); } } catch { /* message shown above */ }
    }}>戦闘を再開</button></div>}
    </>}>
    {battle ? <BattleView result={battle} vipActive={vipActive} backgroundSrc={battleBackground} raidHp={battleRoom ? { current: battleRoom.hp, max: battleRoom.maxHp, level: battleRoom.level } : undefined} onComplete={() => { setBattle(null); setBattleKind(null); setBattleBackground(undefined); void refresh(); }} /> : <>
      {tab === 'quest' && <QuestView key={questNavigation} onBattlePlayingChange={setQuestPlaying} state={state} party={party} vipActive={vipActive} initialStageId={questStart} initialPreparation={questPreparation} onStart={startQuest} onOpenDeck={openQuestDeck} onOpenRaid={id => { setRaidId(id); setTab('raid'); }} onIgnoreEncounter={async id => { await action('encounter_ignore', { roomId: id }); }} />}
      {tab === 'character' && <>{raidDeckReturn && <button type="button" className="rd-button" disabled={busy} onClick={returnToRaidPreparation}>共闘の出撃準備に戻る</button>}{questDeckReturn && <button type="button" className="rd-button" disabled={busy} onClick={returnToQuestPreparation}>出撃準備に戻る</button>}<GrowthView state={state} onAction={action} /></>}
      {tab === 'territory' && <TerritoryView territory={data.territory} rooms={data.rooms} userId={state.userId} onOpenRoom={id => { setRaidId(id); setTab('raid'); }} onHost={async destinationId => { const value = await action('territory_host', { destinationId }); if (!value.territoryRoomId) throw new Error('侵攻結果を確認できませんでした。'); setRaidId(value.territoryRoomId); setTab('raid'); }} />}
      {tab === 'raid' && <RaidView key={`${raidId || 'list'}:${raidNavigation}`} initialPreparationLevel={raidPreparationLevel} state={state} rooms={data.rooms} party={party} initialRoomId={raidId} onAction={raidAction} onOpenDeck={openRaidDeck} />}
      {tab === 'gacha' && <FormalGachaView key={state.userId} data={data} onAction={action} />}
      {tab === 'shop' && <><section className="rd-panel"><h2>{VIP_PRODUCT.name}</h2><p>30日間：バトル速度×3・100無償輝石を30回付与</p><p>{vipActive ? `有効期限 ${new Date(state.vipExpiresAt!).toLocaleString('ja-JP')}` : '未購入'}</p></section><ShopTab exchange={{ state, onExchange: (payload) => action('shop_exchange', payload, undefined, false), onUseEnergyDrink: () => action('use_energy_drink', {}, undefined, false) }} /></>}
    </>}
  </RedesignShell>;
}
