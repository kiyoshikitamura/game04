'use client';
import { useEffect, useRef, useState } from 'react';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS } from '@/domain/redesign/masters';
import { QUEST_AREAS, QUEST_STAGES, getQuestStage, isQuestStageUnlocked, nextQuestStage, questEnergyCost } from '@/domain/redesign/quests';
import type { BattleUnit, QuestStage, RedesignState, Reward } from '@/domain/redesign/types';
import type { BattleResult } from '@/domain/redesign/battle';
import CanonicalDialog from '../ui/CanonicalDialog';
import PreparationModal, { ELEMENT_LABELS } from './PreparationModal';
import BattleView from './BattleView';
import './QuestView.css';
import { growthRewardLabel } from '@/domain/redesign/growthReward';
import ElementBadge from './ElementBadge';
import roster from '@/theme/sengoku-characters.json';
import { getRarityBadgeAsset, getRarityFrameAsset } from '@/utils/rarityAssets';
import { characterArt } from '@/theme/creativeAssets';

export interface QuestSettlement { playerGrowth?: import('@/utils/redesignApi').RedesignResponse['playerGrowth']; battle: BattleResult; rewards: Reward[]; firstClear: boolean; encounterRaidId?: string | null; }
const REWARD_LABELS: Record<Reward['kind'], string> = {ticket:'スペシャル券', character_exp_item: '武将EXP', equipment_exp_item: '装備EXP', generic_soul: '汎用魂', soul_selector: '魂選択', character: '武将', skill: 'スキル', cash: '銭', character_material: '武将育成素材', skill_material: 'スキルLB素材', equipment_material: '装備育成素材', equipment_lb: '装備LB素材', soul: '武将の魂', equipment: '装備', unlock_item: '領土侵攻札' };
function rewardLabel(reward: Reward) {
  const growthLabel = growthRewardLabel(reward); if(growthLabel) return growthLabel;
  if (reward.kind === 'ticket') return ({SPECIAL_TICKET_CHARACTER:'キャラ券',SPECIAL_TICKET_SKILL:'スキル券',SPECIAL_TICKET_EQUIPMENT:'装備券'} as Record<string,string>)[reward.id??''] ?? 'スペシャル券';
  if (reward.kind === 'character') return CHARACTER_MASTERS.find(c => c.id === reward.id)?.name ?? '武将';
  if (reward.kind === 'skill') return `スキル：${reward.id ?? '未定義'}`;
  if (reward.kind === 'soul') return `${CHARACTER_MASTERS.find(c => c.id === reward.id)?.name ?? ''}の魂`;
  if (reward.kind === 'equipment') return EQUIPMENT_MASTERS.find(e => e.id === reward.id)?.name ?? '装備';
  return REWARD_LABELS[reward.kind];
}
function rewardIcon(reward: Reward) {
  if (reward.kind === 'cash') return '/ui/sengoku/13-coin.png';
  if (reward.kind === 'character_exp_item') return `/items/char_exp_${reward.id === 'large' ? 'l' : reward.id === 'medium' ? 'm' : 's'}.png`;
  if (reward.kind === 'equipment_exp_item') return `/items/equip_exp_${reward.id === 'large' ? 'l' : reward.id === 'medium' ? 'm' : 's'}.png`;
  if (reward.kind === 'skill_material') return '/items/skill_manual.png';
  if (reward.kind === 'ticket') return `/items/${String(reward.id).toLowerCase()}.png`;
  if ((reward.kind === 'character' || reward.kind === 'soul') && reward.id) { const match = roster.find(c => c.characterId === reward.id); return match ? characterArt({ id: match.characterId, name: match.name, image: match.imagePath }, 'portrait') ?? match.imagePath : '/ui/sengoku/10-helmet.png'; }
  return reward.kind === 'unlock_item' ? '/items/energy_drink.png' : '/ui/sengoku/13-coin.png';
}
function Rewards({ rewards }: { rewards: Reward[] }) {
  return rewards.length ? <ul className="rq-rewards">{rewards.map((reward, index) => <li key={`${reward.kind}-${reward.id ?? ''}-${index}`}><img src={rewardIcon(reward)} alt="" /><span>{rewardLabel(reward)}</span><strong>×{reward.amount.toLocaleString()}</strong></li>)}</ul> : <p className="rq-muted">なし</p>;
}
function enemyRarity(enemy: QuestStage['waves'][number][number]) {
  return roster.find(c => c.imagePath === enemy.image)?.runtimeRarity ?? 'N';
}
function EnemyArt({ enemy, boss = false }: { enemy: QuestStage['waves'][number][number]; boss?: boolean }) {
  const rarity = enemyRarity(enemy);
  return <div className={`rq-enemy-art ${boss ? 'is-boss' : ''}`}><img className="rq-enemy-frame" src={getRarityFrameAsset('character', rarity)} alt="" /><img className="rq-enemy-image" src={enemy.image} alt={enemy.name} /><img className="rq-enemy-rarity" src={getRarityBadgeAsset(rarity)} alt={rarity} /><ElementBadge element={enemy.element} className="rq-enemy-attribute" /><span className="rq-enemy-name">{enemy.name}</span></div>;
}
export default function QuestView({ state, party, vipActive, onStart, onOpenDeck, onOpenRaid, onIgnoreEncounter, initialStageId, onBattlePlayingChange }: {
  state: RedesignState; party: BattleUnit[]; vipActive: boolean; onStart: (stageId: string) => Promise<QuestSettlement>;
  onOpenDeck: () => void; onOpenRaid: (raidId: string) => void; onIgnoreEncounter?: (raidId: string) => Promise<void>; initialStageId?: string; onBattlePlayingChange?: (playing: boolean) => void;
}) {
  const firstStage = initialStageId ? getQuestStage(initialStageId) : undefined;
  const [areaId, setAreaId] = useState<string | null>(firstStage?.areaId ?? null);
  const [selected, setSelected] = useState<QuestStage | null>(firstStage ?? null);
  const [modal, setModal] = useState<'info' | 'prepare' | null>(firstStage ? 'info' : null);
  const [detailPanel, setDetailPanel] = useState<'hint' | 'rewards' | null>(null);
  const [settlement, setSettlement] = useState<QuestSettlement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { onBattlePlayingChange?.(playing); return () => onBattlePlayingChange?.(false); }, [playing, onBattlePlayingChange]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const actionRef = useRef(false);
  const current = nextQuestStage(state.clearedStages);
  const area = QUEST_AREAS.find(entry => entry.id === areaId);
  const selectedLabel = selected ? `${QUEST_AREAS.find(entry => entry.id === selected.areaId)?.index}-${selected.index}` : undefined;
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
  function openStage(stage: QuestStage) { setSelected(stage); setModal('info'); setDetailPanel(null); setError(''); }
  const firstLockedArea = QUEST_AREAS.findIndex(entry => !isQuestStageUnlocked(entry.stages[0].id, state.clearedStages));
  const visibleAreas = QUEST_AREAS.filter((entry, index) => {
    const cleared = entry.stages.every(stage => state.clearedStages.includes(stage.id));
    return cleared || firstLockedArea < 0 || index <= firstLockedArea;
  });
  if (playing && settlement) return <BattleView result={settlement.battle} vipActive={vipActive} onComplete={() => setPlaying(false)} title={selectedLabel} />;
  return <section className="redesign-quest">
    {settlement ? <div className="rq-summary">
      <h2>{settlement.battle.outcome === 'win' ? 'ステージクリア' : '再び、戦場へ'}</h2>
      <p>{selectedLabel}</p>
      {settlement.firstClear && <p>初回クリア報酬を獲得しました。</p>}
      <h3>獲得報酬</h3><Rewards rewards={settlement.rewards} />
      {settlement.encounterRaidId ? <><h3>強敵の気配</h3><p>エンカウントレイドが発生しました。</p><p className="rq-muted">無視すると、このレイドへの参加権を失います。</p><button disabled={busy} onClick={() => onOpenRaid(settlement.encounterRaidId!)}>挑む</button><button disabled={busy} onClick={() => void dismissEncounter()}>無視する</button></> : <>
        {settlement.playerGrowth && <p>プレイヤーEXP +{settlement.playerGrowth.gainedExp ?? 0} {settlement.playerGrowth.level ? `Lv.${settlement.playerGrowth.beforeLevel} → ${settlement.playerGrowth.level}` : '（移行確認待ち）'}{settlement.playerGrowth.energyRecovered !== undefined && `・体力回復 +${settlement.playerGrowth.energyRecovered}（${settlement.playerGrowth.energy}/${settlement.playerGrowth.energyMax}）`}</p>}
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
          return <button className={`rq-stage ${current.id === stage.id ? 'is-current' : ''}`} key={stage.id} disabled={!unlocked} onClick={() => openStage(stage)}><b className="rq-stage-number">{area.index}-{stage.index}</b><span><strong>{(stage as QuestStage & { designId?: string }).designId ?? `${area.index}-${stage.index}`}</strong><small>消費行動力 {questEnergyCost(stage,state)}</small></span><small className="rq-state-label">{cleared ? 'クリア済' : unlocked ? '挑戦可能' : '未解放'}</small></button>;
        })}</div></> : <><h2>クエスト</h2><div className="rq-scroll rq-area-list" aria-label="エリア一覧">{visibleAreas.map(entry => {
          const cleared = entry.stages.every(stage => state.clearedStages.includes(stage.id));
          const unlocked = isQuestStageUnlocked(entry.stages[0].id, state.clearedStages);
          return <button key={entry.id} disabled={!unlocked} className={`rq-area ${entry.id === current.areaId ? 'is-current' : ''}`} style={{ backgroundImage: `linear-gradient(0deg,#0c0806ed,#0c080650),url("${entry.image}")` }} onClick={() => setAreaId(entry.id)}><span>第{entry.index}章</span><strong>{entry.name}</strong><span>{cleared ? 'クリア済' : unlocked ? '攻略中' : '未解放'}</span></button>;
        })}</div></>}
    </>}
    {selected && modal === 'info' && <div className="redesign-quest-dialog"><CanonicalDialog title={`${QUEST_AREAS.find(entry => entry.id === selected.areaId)?.index}-${selected.index}`} onClose={() => setModal(null)} actions={[{ label: '戻る', onClick: () => setModal(null) }, { label: '挑戦', semantic: 'primary', onClick: () => setModal('prepare'), disabled: !isQuestStageUnlocked(selected.id, state.clearedStages) }]}>
      <div className="rq-encounter-hero"><span className="rq-kicker">最終Waveのボス</span><div className="rq-bosses">{selected.waves[selected.waves.length - 1].map(enemy => <article key={enemy.id} className="rq-boss"><EnemyArt enemy={enemy} boss /><div><strong>{enemy.name}</strong><span><ElementBadge element={enemy.element} /> {ELEMENT_LABELS[enemy.element]}属性 ／ Lv.{enemy.level}</span><small>HP {enemy.stats.hp.toLocaleString()} ・ ATK {enemy.stats.atk.toLocaleString()} ・ DEF {enemy.stats.def.toLocaleString()}</small>{enemy.skills.length > 0 && <div className="rq-enemy-skills">{enemy.skills.map(skill => <span key={skill.id}><img src={skill.image} alt="" />{skill.name}</span>)}</div>}</div></article>)}</div></div>
      <div className="rq-stage-facts"><span>⚔ Wave数：{selected.waves.length}</span><span>♟ 消費行動力：{questEnergyCost(selected,state)}</span></div>
      <div className="rq-info-actions"><button type="button" onClick={() => setDetailPanel(detailPanel === 'hint' ? null : 'hint')}>📜 攻略のヒント</button><button type="button" onClick={() => setDetailPanel(detailPanel === 'rewards' ? null : 'rewards')}>🎁 報酬を確認</button></div>
    </CanonicalDialog></div>}
    {selected && detailPanel && <div className="redesign-quest-dialog"><CanonicalDialog title={detailPanel === 'hint' ? '攻略のヒント' : '報酬を確認'} onClose={() => setDetailPanel(null)} actions={[{ label: '戻る', onClick: () => setDetailPanel(null) }]}>
      {detailPanel === 'hint' ? <><p className="rq-detail-lead">{selected.description}</p><p className="rq-muted">Wave 1〜{selected.waves.length}を順番に突破します。</p></> : <><h3>初回報酬{state.clearedStages.includes(selected.id) ? '（獲得済）' : ''}</h3><Rewards rewards={selected.firstRewards} /><h3>通常ドロップ</h3><Rewards rewards={selected.rewards} /><h3>レアドロップ</h3><Rewards rewards={selected.rareRewards} /></>}
    </CanonicalDialog></div>}
    {selected && modal === 'prepare' && <PreparationModal party={party} title={selectedLabel ?? ''} energyCost={questEnergyCost(selected,state)} energy={state.energy} busy={busy} error={error} onConfirm={start} onBack={() => setModal('info')} onOpenDeck={onOpenDeck} />}
  </section>;
}
