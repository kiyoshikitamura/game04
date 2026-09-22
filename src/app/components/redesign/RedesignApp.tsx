'use client';
import { usePresentationBusy, withPresentation } from '../ui/presentationTasks';
import { game04UiError } from '@/app/lib/game04UiError';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { REDESIGN_REWARD_SYNC_EVENT } from '@/utils/redesignRewardSync';
import { redesignRequest, type RedesignResponse } from '@/utils/redesignApi';
import { buildBattleParty } from '@/domain/redesign/masters';
import { nextQuestStage } from '@/domain/redesign/quests';
import { getRoomRaidMaster } from '@/domain/redesign/raid';
import { isVipActive, VIP_PRODUCT } from '@/domain/redesign/vip';
import type { AcquisitionState } from '@/domain/redesign/acquisitions';
import type { BattleResult } from '@/domain/redesign/battle';
import RedesignShell from './RedesignShell';
import GrowthView from './GrowthView';
import QuestView, { type QuestSettlement } from './QuestView';
import RaidView from './RaidView';
import TerritoryView from './TerritoryView';
import BattleView from './BattleView';
import GachaTab from '../GachaTab';
import NormalGachaView from './NormalGachaView';
import ShopTab from '../ShopTab';
import { CANONICAL_ACTION_RESOURCES, canUseEnergyDrink } from '@/domain/gameplay/canonical/action_resources';
import type { EnergyRecovery } from './EnergyRecoveryDialog';
import BrandedLoading from '../ui/BrandedLoading';

export default function RedesignApp({ initialTab = 'home' }: { initialTab?: string } = {}) {
  const game = useGame();
  const owner = game.session?.user.id;
  const [data, setData] = useState<RedesignResponse | null>(null);
  const [tab, setTab] = useState(initialTab);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [raidId, setRaidId] = useState<string>();
  const [questStart, setQuestStart] = useState<string>();
  const [questNavigation, setQuestNavigation] = useState(0);
  const [questPlaying, setQuestPlaying] = useState(false);
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const ownerRef = useRef(owner);
  const lock = useRef(false);
  const requestGeneration = useRef(0);
  const rewardRefreshPending = useRef(false);
  ownerRef.current = owner;
  const refresh = useCallback(async () => {
    const requestOwner = owner;
    const generation = ++requestGeneration.current;
    try {
      const value = await redesignRequest('get_state');
      if (ownerRef.current === requestOwner && generation === requestGeneration.current) { setData(current => current && current.state.userId === value.state.userId && current.state.version > value.state.version ? current : value); setError(''); }
    } catch (reason) { if (ownerRef.current === requestOwner && generation === requestGeneration.current) setError(game04UiError(reason)); }
  }, [owner]);
  useEffect(() => { setData(null); void refresh(); }, [refresh]);
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
  async function action(name: string, payload: Record<string, unknown> = {}, explicitId?: string) {
    if (lock.current) throw new Error('処理中です。');
    lock.current = true; requestGeneration.current++; setBusy(true); setError('');
    const requestOwner = owner;
    const isBattle = name === 'quest_battle' || name === 'raid_battle';
    const persistentRequest = isBattle || name === 'territory_host';
    const storageKey = `game04:request:${owner}:${name}:${String(payload.stageId || payload.roomId || payload.destinationId || '')}`;
    let requestId = explicitId || crypto.randomUUID();
    if (persistentRequest && !explicitId) {
      try { requestId = sessionStorage.getItem(storageKey) || requestId; sessionStorage.setItem(storageKey, requestId); } catch { /* API also exposes pending battles for resume. */ }
    }
    try {
      const value = await redesignRequest(name, payload, requestId);
      if (requestOwner !== ownerRef.current) throw new Error('ログイン状態が変更されました。');
      setData(value);
      if (persistentRequest) try { sessionStorage.removeItem(storageKey); } catch { /* no persistent reliance */ }
      return value;
    } catch (reason) {
      const message = game04UiError(reason);
      setError(message); void refresh(); throw reason;
    } finally { lock.current = false; setBusy(false); if (rewardRefreshPending.current) { rewardRefreshPending.current = false; void refresh(); } }
  }
  function navigate(next: string) {
    if (busy) return;
    if (next.startsWith('raid:')) { setRaidId(next.slice(5)); next = 'raid'; }
    if (next === 'quest:resume' || next === 'quest') {
      setQuestStart(next === 'quest:resume' && data ? nextQuestStage(data.state.clearedStages).id : undefined);
      setQuestNavigation(value => value + 1);
      next = 'quest';
    }
    setTab(next); setError('');
    if (next === 'gacha' || next === 'shop') {
      game.navigateTab(next);
      if (owner) void withPresentation(()=>game.syncBootstrapData(owner)).catch(reason=>setError(game04UiError(reason)));
    } else void refresh();
  }
  async function startQuest(stageId: string): Promise<QuestSettlement> {
    const value = await action('quest_battle', { stageId });
    if (!value.battle) throw new Error('戦闘結果を確認できませんでした。');
    return { battle: value.battle, rewards: value.rewards || [], firstClear: !!value.firstClear, encounterRaidId: value.encounterRaidId, playerGrowth: value.playerGrowth };
  }
  async function raidAction(input: Record<string, unknown>) {
    const { action: name, ...payload } = input;
    const value = await action(String(name), payload);
    if (value.battle) setBattle(value.battle);
    return value;
  }
  usePresentationBusy(!data && !error);
  if (!data) return <div className="rd-shell" data-images-ready="true"><div className="rd-panel">{error ? <><p role="alert">{error}</p><button className="rd-button" onClick={() => void refresh()}>再読み込み</button></> : <BrandedLoading label="戦国の世界を準備中" />}</div></div>;
  const state = data.state, party = buildBattleParty(state), vipActive = isVipActive(state.vipExpiresAt);
  const recovery: EnergyRecovery = {
    owned: Number(state.energyDrinks || 0), amount: CANONICAL_ACTION_RESOURCES.recoveryItems.ENERGY_DRINK.amount,
    canUse: !busy && Number(state.energyDrinks || 0) > 0 && canUseEnergyDrink(state.energy),
    onUse: async () => {
      await action('use_energy_drink');
    },
  };
  const encounter = data.rooms.find(r => getRoomRaidMaster(r).type === 'encounter' && r.status === 'active' && r.participants.some(p => p.userId === state.userId && !p.leftAt));
  return <RedesignShell state={state} activeTab={tab} onNavigate={navigate} onAction={action} hideChrome={!!battle || questPlaying} socialEvents={data.socialEvents} missions={data.missions}
    encounterRaid={encounter ? { id: encounter.id, name: getRoomRaidMaster(encounter).name, expiresAt: encounter.expiresAt } : null}
    notifications={<>
    {!!(state as AcquisitionState).pendingAcquisitions?.length && <p className="rd-panel" role="status">マスター設定待ちの獲得物が{(state as AcquisitionState).pendingAcquisitions!.length}件あります。確定後に反映します。</p>}
    {error && <p className="rd-panel" role="alert">{error}</p>}
    {data.pendingBattle && !battle && <div className="rd-panel"><p>未完了の戦闘があります。</p><button className="rd-button" disabled={busy} onClick={async () => {
      const p = data.pendingBattle!;
      try { const value = await action(p.kind === 'quest' ? 'quest_battle' : 'raid_battle', p.kind === 'quest' ? { stageId: p.target_id } : { roomId: p.target_id }, p.id); if (value.battle) setBattle(value.battle); } catch { /* message shown above */ }
    }}>戦闘を再開</button></div>}
    </>}>
    {battle ? <BattleView result={battle} vipActive={vipActive} onComplete={() => { setBattle(null); void refresh(); }} /> : <>
      {tab === 'quest' && <QuestView recovery={recovery} key={questNavigation} onBattlePlayingChange={setQuestPlaying} state={state} party={party} vipActive={vipActive} initialStageId={questStart} onStart={startQuest} onOpenDeck={() => navigate('character')} onOpenRaid={id => { setRaidId(id); setTab('raid'); }} onIgnoreEncounter={async id => { await action('encounter_ignore', { roomId: id }); }} />}
      {tab === 'character' && <GrowthView state={state} onAction={action} />}
      {tab === 'territory' && <TerritoryView territory={data.territory} rooms={data.rooms} userId={state.userId} onOpenRoom={id => { setRaidId(id); setTab('raid'); }} onHost={async destinationId => { const value = await action('territory_host', { destinationId }); if (!value.territoryRoomId) throw new Error('開催結果を確認できませんでした。'); setRaidId(value.territoryRoomId); setTab('raid'); }} />}
      {tab === 'raid' && <RaidView recovery={recovery} key={raidId || 'list'} state={state} rooms={data.rooms} party={party} initialRoomId={raidId} onAction={raidAction} onOpenDeck={() => navigate('character')} />}
      {tab === 'gacha' && <><NormalGachaView data={data} onAction={action}/><GachaTab specialOnly /></>}
      {tab === 'shop' && <><section className="rd-panel"><h2>{VIP_PRODUCT.name}</h2><p>30日間：バトル速度×3・100無償輝石を30回付与</p><p>{vipActive ? `有効期限 ${new Date(state.vipExpiresAt!).toLocaleString('ja-JP')}` : '販売準備中'}</p></section><ShopTab exchange={{ state, onExchange: (payload) => action('shop_exchange', payload) }} /></>}
    </>}
  </RedesignShell>;
}
