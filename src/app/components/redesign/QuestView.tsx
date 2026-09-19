'use client';
import { useEffect, useRef, useState } from 'react';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS } from '@/domain/redesign/masters';
import { QUEST_AREAS, QUEST_STAGES, getQuestStage, isQuestStageUnlocked, nextQuestStage } from '@/domain/redesign/quests';
import type { BattleUnit, QuestStage, RedesignState, Reward } from '@/domain/redesign/types';
import type { BattleResult } from '@/domain/redesign/battle';
import CanonicalDialog from '../ui/CanonicalDialog';
import PreparationModal, { ELEMENT_LABELS } from './PreparationModal';
import BattleView from './BattleView';
import './QuestView.css';

export interface QuestSettlement { battle: BattleResult; rewards: Reward[]; firstClear: boolean; encounterRaidId?: string | null; }
const REWARD_LABELS: Record<Reward['kind'], string> = { character: '武将', skill: 'スキル', cash: '銭', character_material: '武将育成素材', skill_material: 'スキルLB素材', equipment_material: '装備育成素材', equipment_lb: '装備LB素材', soul: '武将の魂', equipment: '装備', unlock_item: '領土侵攻札' };
function rewardLabel(reward: Reward) {
  if (reward.kind === 'soul') return `${CHARACTER_MASTERS.find(c => c.id === reward.id)?.name ?? ''}の魂`;
  if (reward.kind === 'equipment') return EQUIPMENT_MASTERS.find(e => e.id === reward.id)?.name ?? '装備';
  return REWARD_LABELS[reward.kind];
}
function Rewards({ rewards }: { rewards: Reward[] }) {
  return rewards.length ? <ul className="rq-rewards">{rewards.map((reward, index) => <li key={`${reward.kind}-${reward.id ?? ''}-${index}`}>{rewardLabel(reward)} ×{reward.amount.toLocaleString()}</li>)}</ul> : <p className="rq-muted">なし</p>;
}
export default function QuestView({ state, party, vipActive, onStart, onOpenDeck, onOpenRaid, onIgnoreEncounter, initialStageId, onBattlePlayingChange }: {
  state: RedesignState; party: BattleUnit[]; vipActive: boolean; onStart: (stageId: string) => Promise<QuestSettlement>;
  onOpenDeck: () => void; onOpenRaid: (raidId: string) => void; onIgnoreEncounter?: (raidId: string) => Promise<void>; initialStageId?: string; onBattlePlayingChange?: (playing: boolean) => void;
}) {
  const firstStage = initialStageId ? getQuestStage(initialStageId) : undefined;
  const [areaId, setAreaId] = useState<string | null>(firstStage?.areaId ?? null);
  const [selected, setSelected] = useState<QuestStage | null>(firstStage ?? null);
  const [modal, setModal] = useState<'info' | 'prepare' | null>(firstStage ? 'info' : null);
  const [settlement, setSettlement] = useState<QuestSettlement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { onBattlePlayingChange?.(playing); return () => onBattlePlayingChange?.(false); }, [playing, onBattlePlayingChange]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const actionRef = useRef(false);
  const current = nextQuestStage(state.clearedStages);
  const area = QUEST_AREAS.find(entry => entry.id === areaId);
  const followingStage = selected ? QUEST_STAGES[QUEST_STAGES.findIndex(stage => stage.id === selected.id) + 1] : undefined;
  async function start() {
    if (!selected || actionRef.current) return;
    actionRef.current = true; setBusy(true); setError('');
    try {
      const result = await onStart(selected.id);
      setSettlement(result); setPlaying(true); setModal(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : '出撃できませんでした。もう一度お試しください。'); }
    finally { actionRef.current = false; setBusy(false); }
  }
  async function dismissEncounter() {
    if (!settlement?.encounterRaidId || actionRef.current) return;
    if (!onIgnoreEncounter) { setError('参加権の放棄を処理できませんでした。'); return; }
    actionRef.current = true; setBusy(true); setError('');
    try { await onIgnoreEncounter(settlement.encounterRaidId); setSettlement({ ...settlement, encounterRaidId: null }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '処理に失敗しました。'); }
    finally { actionRef.current = false; setBusy(false); }
  }
  function openStage(stage: QuestStage) { setSelected(stage); setModal('info'); setError(''); }
  if (playing && settlement) return <BattleView result={settlement.battle} vipActive={vipActive} onComplete={() => setPlaying(false)} title={selected?.name} />;
  return <section className="redesign-quest">
    {settlement ? <div className="rq-summary">
      <h2>{settlement.battle.outcome === 'win' ? 'ステージクリア' : '再び、戦場へ'}</h2>
      <p>{selected?.name}</p>
      {settlement.firstClear && <p>初回クリア報酬を獲得しました。</p>}
      <h3>獲得報酬</h3><Rewards rewards={settlement.rewards} />
      {settlement.encounterRaidId ? <><h3>強敵の気配</h3><p>エンカウントレイドが発生しました。</p><p className="rq-muted">無視すると、このレイドへの参加権を失います。</p><button disabled={busy} onClick={() => onOpenRaid(settlement.encounterRaidId!)}>挑む</button><button disabled={busy} onClick={() => void dismissEncounter()}>無視する</button></> : <>
        <button onClick={() => { setSettlement(null); setSelected(null); }}>ステージ一覧へ</button>
        {selected && <button onClick={() => { setSettlement(null); setModal('prepare'); }}>再挑戦</button>}
        {settlement.battle.outcome === 'win' && followingStage && <button onClick={() => { setSettlement(null); setAreaId(followingStage.areaId); openStage(followingStage); }}>次のステージへ</button>}
        <button onClick={onOpenDeck}>編成を見直す</button>
      </>}
      {error && <p role="alert">{error}</p>}
    </div> : <>
      {area ? <><button className="rq-back" onClick={() => setAreaId(null)}>‹ エリア一覧</button><header className="rq-area-head" style={{ backgroundImage: `linear-gradient(90deg,#100a08d9,#100a0859),url("${area.image}")` }}><h2>{area.name}</h2></header>
        <div className="rq-scroll" aria-label={`${area.name}のステージ一覧`}>{area.stages.map(stage => {
          const cleared = state.clearedStages.includes(stage.id), unlocked = isQuestStageUnlocked(stage.id, state.clearedStages);
          return <button className={`rq-stage ${current.id === stage.id ? 'is-current' : ''}`} key={stage.id} disabled={!unlocked} onClick={() => openStage(stage)}><b>{area.index}-{stage.index}</b><span><strong>{stage.name}</strong><small>消費行動力 {stage.energyCost}</small></span><small>{cleared ? 'クリア済' : unlocked ? '未クリア' : '未解放'}</small></button>;
        })}</div></> : <><h2>クエスト</h2><div className="rq-scroll" aria-label="エリア一覧">{QUEST_AREAS.map(entry => {
          const cleared = entry.stages.every(stage => state.clearedStages.includes(stage.id));
          const unlocked = isQuestStageUnlocked(entry.stages[0].id, state.clearedStages);
          return <button key={entry.id} disabled={!unlocked} className={`rq-area ${entry.id === current.areaId ? 'is-current' : ''}`} style={{ backgroundImage: `linear-gradient(0deg,#0c0806ed,#0c080650),url("${entry.image}")` }} onClick={() => setAreaId(entry.id)}><span>第{entry.index}章</span><strong>{entry.name}</strong><span>{cleared ? 'クリア済' : unlocked ? '攻略中' : '未解放'}</span></button>;
        })}</div></>}
    </>}
    {selected && modal === 'info' && <div className="redesign-quest-dialog"><CanonicalDialog title={`${QUEST_AREAS.find(entry => entry.id === selected.areaId)?.index}-${selected.index} ${selected.name}`} onClose={() => setModal(null)} actions={[{ label: '閉じる', onClick: () => setModal(null) }, { label: '挑戦', semantic: 'primary', onClick: () => setModal('prepare'), disabled: !isQuestStageUnlocked(selected.id, state.clearedStages) }]}>
      <p>{selected.waves.length} Wave ／ 消費行動力 {selected.energyCost}</p><p className="rq-muted">{selected.description}</p>
      {selected.waves.map((enemies, index) => <section key={index}><h3>Wave {index + 1}</h3><div className="rq-enemies">{enemies.map(enemy => <article key={enemy.id} className="rq-enemy"><img src={enemy.image} alt="" /><strong>{enemy.name}</strong><span>Lv.{enemy.level}</span><span className={`rq-element rq-element-${enemy.element}`}>{ELEMENT_LABELS[enemy.element]}</span></article>)}</div></section>)}
      <h3>初回報酬{state.clearedStages.includes(selected.id) ? '（獲得済）' : ''}</h3><Rewards rewards={selected.firstRewards} /><h3>通常ドロップ</h3><Rewards rewards={selected.rewards} /><h3>レアドロップ</h3><Rewards rewards={selected.rareRewards} />
    </CanonicalDialog></div>}
    {selected && modal === 'prepare' && <PreparationModal party={party} title={selected.name} energyCost={selected.energyCost} energy={state.energy} busy={busy} error={error} onConfirm={start} onBack={() => setModal('info')} onOpenDeck={onOpenDeck} />}
  </section>;
}
