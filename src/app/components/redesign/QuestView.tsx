'use client';
import { questDisplayName, enemyDisplayName, enemyRoleLabel } from '@/domain/redesign/contextNames';
import { growthRewardImage } from '@/domain/redesign/growthAssetPresentation';
import { useEffect, useRef, useState } from 'react';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS, SKILL_MASTERS } from '@/domain/redesign/masters';
import { QUEST_AREAS, QUEST_STAGES, getQuestStage, isQuestStageUnlocked, nextQuestStage, questEnergyCost } from '@/domain/redesign/quests';
import type { BattleUnit, QuestStage, RedesignState, Reward } from '@/domain/redesign/types';
import type { BattleResult } from '@/domain/redesign/battle';
import CanonicalDialog from '../ui/CanonicalDialog';
import PreparationModal from './PreparationModal';
import BattleView from './BattleView';
import './QuestView.css';
import { useQuestAssets } from './questAssets';
import { growthRewardLabel } from '@/domain/redesign/growthReward';
import ElementBadge from './ElementBadge';
import roster from '@/theme/sengoku-characters.json';
import { characterArt } from '@/theme/creativeAssets';
import { BossDisplay, useArtworkPreload, type DisplaySubject } from './visual-bench/CharacterDisplays';

export interface QuestSettlement { playerGrowth?: import('@/utils/redesignApi').RedesignResponse['playerGrowth']; battle: BattleResult; rewards: Reward[]; firstClear: boolean; encounterRaidId?: string | null; }
const REWARD_LABELS: Record<Reward['kind'], string> = {ticket:'スペシャル券', character_exp_item: '武将EXP', equipment_exp_item: '装備EXP', generic_soul: '汎用魂', soul_selector: '魂選択', character: '武将', skill: 'スキル', cash: '銭', character_material: '武将育成素材', skill_material: 'スキルLB素材', equipment_material: '装備育成素材', equipment_lb: '装備LB素材', soul: '武将の魂', equipment: '装備', unlock_item: '侵攻令' };
function rewardLabel(reward: Reward) {
  const growthLabel = growthRewardLabel(reward); if(growthLabel) return growthLabel;
  if (reward.kind === 'ticket') return ({SPECIAL_TICKET_CHARACTER:'武将召喚券',SPECIAL_TICKET_SKILL:'スキル召喚券',SPECIAL_TICKET_EQUIPMENT:'装備召喚券'} as Record<string,string>)[reward.id??''] ?? 'スペシャル券';
  if (reward.kind === 'character') return CHARACTER_MASTERS.find(c => c.id === reward.id)?.name ?? '武将';
  if (reward.kind === 'skill') return SKILL_MASTERS.find(skill => skill.id === reward.id)?.name ?? 'スキル';
  if (reward.kind === 'soul') return `${CHARACTER_MASTERS.find(c => c.id === reward.id)?.name ?? ''}の魂`;
  if (reward.kind === 'equipment') return EQUIPMENT_MASTERS.find(e => e.id === reward.id)?.name ?? '装備';
  return REWARD_LABELS[reward.kind];
}
function rewardIcon(reward: Reward) {
  const growthImage = growthRewardImage(reward); if (growthImage) return growthImage;
  if (reward.kind === 'cash') return '/ui/sengoku/13-coin.png';
  if (reward.kind === 'character_exp_item' || reward.kind === 'equipment_exp_item') {
    const size = ({ small: 's', medium: 'm', large: 'l' } as Record<string, string>)[reward.id ?? ''];
    return size ? `/items/${reward.kind === 'character_exp_item' ? 'char' : 'equip'}_exp_${size}.png` : null;
  }
  if (reward.kind === 'skill_material') return '/items/skill_manual.png';
  if (reward.kind === 'ticket') return `/items/${String(reward.id).toLowerCase()}.png`;
  if ((reward.kind === 'character' || reward.kind === 'soul') && reward.id) { const match = roster.find(c => c.characterId === reward.id); return match ? characterArt({ id: match.characterId, name: match.name, image: match.imagePath }, 'portrait') ?? match.imagePath : '/ui/sengoku/10-helmet.png'; }
  return reward.kind === 'unlock_item' ? '/creative/items/territory-invasion-ticket.png' : null;
}
function Rewards({ rewards }: { rewards: Reward[] }) {
  return rewards.length ? <ul className="rq-rewards">{rewards.map((reward, index) => <li key={`${reward.kind}-${reward.id ?? ''}-${index}`}><span className="rq-reward-icon">{rewardIcon(reward) && <img src={rewardIcon(reward)!} alt="" />}</span><span>{rewardLabel(reward)}</span><strong>×{reward.amount.toLocaleString()}</strong></li>)}</ul> : <p className="rq-muted">なし</p>;
}
function bossSubject(enemy: QuestStage['waves'][number][number]): DisplaySubject | null {
  const match = roster.find(candidate => candidate.name === enemy.name);
  return match ? { id: match.characterId, name: match.name, rarity: match.runtimeRarity as DisplaySubject['rarity'], element: enemy.element as DisplaySubject['element'] } : null;
}
function formalStageName(stage: QuestStage) {
  return questDisplayName(stage).trim() || null;
}
function formalStageHint(stage: QuestStage) {
  return stage.description.trim() || null;
}
function selectRepresentativeBoss(wave: QuestStage['waves'][number]) {
  return wave.find(enemy => enemy.boss) ?? wave.reduce((best, enemy) => enemy.level > best.level || (enemy.level === best.level && enemy.stats.hp > best.stats.hp) ? enemy : best, wave[0]);
}
export default function QuestView({ state, party, vipActive, onStart, onOpenDeck, onOpenRaid, onIgnoreEncounter, initialStageId, initialPreparation = false, onBattlePlayingChange }: {
  state: RedesignState; party: BattleUnit[]; vipActive: boolean; onStart: (stageId: string) => Promise<QuestSettlement>;
  onOpenDeck: (stageId?: string) => void; onOpenRaid: (raidId: string) => void; onIgnoreEncounter?: (raidId: string) => Promise<void>; initialStageId?: string; initialPreparation?: boolean; onBattlePlayingChange?: (playing: boolean) => void;
}) {
  const firstStage = initialStageId ? getQuestStage(initialStageId) : undefined;
  const [areaId, setAreaId] = useState<string | null>(firstStage?.areaId ?? null);
  const [selected, setSelected] = useState<QuestStage | null>(firstStage ?? null);
  const [modal, setModal] = useState<'info' | 'prepare' | null>(firstStage ? (initialPreparation ? 'prepare' : 'info') : null);
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
  const viewAssets = useQuestAssets(area ? [area.image] : visibleAreas.map(entry => entry.image));
  const selectedBoss = selected && modal === 'info' ? selectRepresentativeBoss(selected.waves[selected.waves.length - 1]) : null;
  const selectedSubject = selectedBoss ? bossSubject(selectedBoss) : null;
  const bossAssets = useArtworkPreload(selectedSubject ? [selectedSubject] : [], 'battle');
  const encounterBackgrounds = useQuestAssets(selectedBoss ? [selectedSubject ? '' : selectedBoss.image, QUEST_AREAS.find(entry => entry.id === selected?.areaId)?.image ?? ''].filter(Boolean) : []);
  const encounterAssets = { ready: bossAssets.ready && encounterBackgrounds.ready, failed: bossAssets.failed || encounterBackgrounds.failed, retry: () => { bossAssets.retry(); encounterBackgrounds.retry(); } };
  if (playing && settlement) return <BattleView result={settlement.battle} vipActive={vipActive} onComplete={() => setPlaying(false)} title={selected ? `${selectedLabel} ${questDisplayName(selected)}` : selectedLabel} backgroundSrc={QUEST_AREAS.find(entry => entry.id === selected?.areaId)?.image} />;
  return <section className="redesign-quest">
    {!viewAssets.ready && !settlement && !modal && <p role={viewAssets.failed ? "alert" : "status"}>{viewAssets.failed ? <>画像を読み込めませんでした。<button onClick={viewAssets.retry}>再読み込み</button></> : '読み込み中…'}</p>}
    {settlement ? <div className="rq-summary">
      <h2>{settlement.battle.outcome === 'win' ? 'ステージクリア' : '再び、戦場へ'}</h2>
      <p>{selectedLabel} {selected && questDisplayName(selected)}</p>
      {settlement.firstClear && <p>初回クリア報酬を獲得しました。</p>}
      <h3>獲得報酬</h3><Rewards rewards={settlement.rewards} />
      {settlement.encounterRaidId ? <><h3>強敵の気配</h3><p>遭遇戦が発生しました。</p><p className="rq-muted">無視すると、この共闘への参加権を失います。</p><button disabled={busy} onClick={() => onOpenRaid(settlement.encounterRaidId!)}>挑む</button><button disabled={busy} onClick={() => void dismissEncounter()}>無視する</button></> : <>
        {settlement.playerGrowth && <p>プレイヤーEXP +{settlement.playerGrowth.gainedExp ?? 0} {settlement.playerGrowth.level ? `Lv.${settlement.playerGrowth.beforeLevel} → ${settlement.playerGrowth.level}` : '（移行確認待ち）'}{settlement.playerGrowth.energyRecovered !== undefined && `・行動力回復 +${settlement.playerGrowth.energyRecovered}（${settlement.playerGrowth.energy}/${settlement.playerGrowth.energyMax}）`}</p>}
        <button onClick={() => { setSettlement(null); setSelected(null); }}>ステージ一覧へ</button>
        {selected && <button onClick={() => { setSettlement(null); setModal('prepare'); }}>再挑戦</button>}
        {settlement.battle.outcome === 'win' && followingStage && <button onClick={() => { setSettlement(null); setAreaId(followingStage.areaId); openStage(followingStage); }}>次のステージへ</button>}
        <button onClick={() => onOpenDeck()}>編成を見直す</button>
      </>}
      {error && <p role="alert">{error}</p>}
    </div> : <>
      {area ? <><button className="rq-back" onClick={() => setAreaId(null)}>‹ エリア一覧</button><header className="rq-area-head" style={{ backgroundImage: `linear-gradient(90deg,#100a0888,transparent 76%),url("${area.image}")` }}><h2>{area.name}</h2></header>
        <div className="rq-scroll" aria-label={`${area.name}のステージ一覧`}>{area.stages.map(stage => {
          const cleared = state.clearedStages.includes(stage.id), unlocked = isQuestStageUnlocked(stage.id, state.clearedStages);
          return <button className={`rq-stage ${current.id === stage.id ? 'is-current' : ''}`} key={stage.id} disabled={!unlocked || !viewAssets.ready} onClick={() => openStage(stage)} style={{ backgroundImage: `linear-gradient(90deg,#302015aa,#14100e88),url("${area.image}")` }}><b className="rq-stage-number">{area.index}-{stage.index}</b><span><strong>{formalStageName(stage) ?? stage.name}</strong><small><img src="/ui/sengoku/14-energy.png" alt="" />消費行動力 {questEnergyCost(stage,state)}</small></span><small className={`rq-state-label ${cleared ? 'is-cleared' : unlocked ? 'is-current' : 'is-locked'}`}>{cleared ? 'クリア済' : unlocked ? '挑戦可能' : '未解放'}</small></button>;
        })}</div></> : <><h2>出陣</h2><div className="rq-scroll rq-area-list" aria-label="エリア一覧">{visibleAreas.map(entry => {
          const cleared = entry.stages.every(stage => state.clearedStages.includes(stage.id));
          const unlocked = isQuestStageUnlocked(entry.stages[0].id, state.clearedStages);
          return <button key={entry.id} disabled={!unlocked || !viewAssets.ready} className={`rq-area ${entry.id === current.areaId ? 'is-current' : ''}`} style={{ backgroundImage: `linear-gradient(0deg,#0c080690,transparent 72%),url("${entry.image}")` }} onClick={() => setAreaId(entry.id)}><strong>{entry.name}</strong><span className="rq-area-description">{entry.description}</span><span className={`rq-area-status ${cleared ? 'is-cleared' : unlocked ? 'is-current' : 'is-locked'}`}>{unlocked && <img src="/ui/sengoku/07-flower-crest.png" alt="" />}<span className="rq-area-status-text">{cleared ? '攻略済' : unlocked ? '攻略中' : '未解放'}</span></span></button>;
        })}</div></>}
    </>}
    {selected && modal === 'info' && <div className="redesign-quest-dialog"><CanonicalDialog title={`${selectedLabel} ${formalStageName(selected) ?? selected.name}`} onClose={() => setModal(null)} actions={[{ label: '挑戦', semantic: 'primary', onClick: () => setModal('prepare'), disabled: !encounterAssets.ready || !isQuestStageUnlocked(selected.id, state.clearedStages) }]}>
      {!encounterAssets.ready && <p role={encounterAssets.failed ? "alert" : "status"}>{encounterAssets.failed ? <>画像を読み込めませんでした。<button onClick={encounterAssets.retry}>再読み込み</button></> : '読み込み中…'}</p>}
      {encounterAssets.ready && <div className="rq-encounter-hero" style={{ backgroundImage: `linear-gradient(180deg,#2b1c2433,#110c0e77),url("${QUEST_AREAS.find(entry => entry.id === selected.areaId)?.image ?? ''}")` }}><span className="rq-kicker">ステージボス</span>{(() => { const enemy = selectRepresentativeBoss(selected.waves[selected.waves.length - 1]); const subject = bossSubject(enemy); return <article className="rq-boss"><div className="rq-boss-stage">{subject ? <BossDisplay subject={subject} presentation="quest" compact hideCaption className="rq-boss-display" /> : <img className="rq-formal-boss" src={enemy.image} alt={enemyDisplayName(enemy)} />}</div><div className="rq-boss-title"><strong>{enemyRoleLabel(enemy)} {enemyDisplayName(enemy)}</strong><span className="rq-boss-level">Lv.{enemy.level}</span><ElementBadge element={enemy.element} /></div><dl className="rq-boss-stats" aria-label="ステージボスの能力値"><div><dt>HP</dt><dd>{enemy.stats.hp.toLocaleString('ja-JP')}</dd></div><div><dt>ATK</dt><dd>{enemy.stats.atk.toLocaleString('ja-JP')}</dd></div><div><dt>DEF</dt><dd>{enemy.stats.def.toLocaleString('ja-JP')}</dd></div></dl></article>; })()}</div>}
      <div className="rq-stage-facts"><span><img src="/ui/sengoku/05-crossed-swords.png" alt="" />Wave数：{selected.waves.length}</span><span><img src="/ui/sengoku/14-energy.png" alt="" />消費行動力：{questEnergyCost(selected,state)}</span></div>
      <div className="rq-info-actions"><button type="button" onClick={() => setDetailPanel('hint')}><img src="/ui/sengoku/02-scroll-top.png" alt="" />攻略のヒント</button><button type="button" onClick={() => setDetailPanel('rewards')}><img src="/ui/sengoku/01-gift.png" alt="" />報酬を確認</button></div>
    </CanonicalDialog></div>}
    {selected && detailPanel && <div className="redesign-quest-dialog"><CanonicalDialog title={detailPanel === 'hint' ? '攻略のヒント' : '報酬を確認'} onClose={() => setDetailPanel(null)} actions={[{ label: '戻る', onClick: () => setDetailPanel(null) }]}>
      {detailPanel === 'hint' ? <>{formalStageHint(selected) ? <p className="rq-detail-lead">{formalStageHint(selected)}</p> : <p className="rq-detail-lead">このステージの攻略ヒントはありません。</p>}</> : <><h3>初回報酬{state.clearedStages.includes(selected.id) ? '（獲得済）' : ''}</h3><Rewards rewards={selected.firstRewards} /><h3>通常ドロップ</h3><Rewards rewards={selected.rewards} /><h3>レアドロップ</h3><Rewards rewards={selected.rareRewards} /></>}
    </CanonicalDialog></div>}
    {selected && modal === 'prepare' && <PreparationModal ownedCharacters={state.characters} party={party} title={`${selectedLabel} ${formalStageName(selected) ?? ''}`.trim()} energyCost={questEnergyCost(selected,state)} energy={state.energy} busy={busy} error={error} onConfirm={start} onBack={() => setModal('info')} onOpenDeck={() => onOpenDeck(selected.id)} />}
  </section>;
}
