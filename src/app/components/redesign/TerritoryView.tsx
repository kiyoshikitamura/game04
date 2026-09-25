'use client';
import { invasionSceneName, enemyRoleLabel } from '@/domain/redesign/contextNames';
import { growthRewardImage } from '@/domain/redesign/growthAssetPresentation';
import { invasionBackground } from '@/domain/redesign/approvedBackgrounds';
import { displaySkillDescription } from './battleLabels';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { RaidRoom, Reward } from '@/domain/redesign/types';
import type { TerritoryProjection } from '@/domain/redesign/territory';
import { getRoomRaidMaster } from '@/domain/redesign/raid';
import { raidRewardLabel, raidTimeRemaining } from '@/domain/redesign/raidPresentation';
import { getTerritoryPreviewStages, territoryDuration, territoryEnemyArt } from '@/domain/redesign/territoryPresentation';
import { raidElementLabels } from '@/domain/redesign/raidPresentation';
import roster from '@/theme/sengoku-characters.json';
import { characterArt } from '@/theme/creativeAssets';
import Modal from './Modal';
import { isBattleImageReady, preloadBattleImage } from '../battle/battleAssetPreload';
import './territory.css';

function ElementBadge({ element }: { element: keyof typeof raidElementLabels }) { return <img className="g4-element-badge" src={`/ui/raid/v2/element-${element}.png`} alt={`${raidElementLabels[element]}属性`} />; }
const INVASION_TICKET = '/creative/items/territory-invasion-ticket.png';
const CASTLE_ART = '/bg/raid/raid-castle-moonlight-v1.webp';
function Art({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [ready, setReady] = useState(() => isBattleImageReady(src)), [failed, setFailed] = useState(false);
  useEffect(() => { setReady(isBattleImageReady(src)); setFailed(false); }, [src]);
  return <span className={`inv-art ${className} ${ready ? 'is-ready' : ''}`}>
    {!ready && <span className="inv-art-status" role="status">{failed ? '画像を読み込めません' : '読込中…'}</span>}
    <img src={src} alt={alt} onLoad={() => setReady(true)} onError={() => setFailed(true)} />
  </span>;
}
function rewardIcon(reward: Reward): string | undefined {
  const growthImage = growthRewardImage(reward); if (growthImage) return growthImage;
  if (reward.kind === 'cash') return '/ui/sengoku/13-coin.png';
  if (reward.kind === 'skill_material') return '/items/skill_manual.png';
  if (reward.kind === 'equipment_lb') return '/items/equip_lb_part.png';
  if (reward.kind === 'ticket') return `/items/${reward.id?.toLowerCase()}.png`;
  if (reward.kind === 'character_exp_item' || reward.kind === 'equipment_exp_item') {
    const size = ({small:'s',medium:'m',large:'l'} as Record<string,string>)[reward.id ?? ''];
    return size ? `/items/${reward.kind === 'character_exp_item' ? 'char' : 'equip'}_exp_${size}.png` : undefined;
  }
  if (reward.kind === 'soul') {
    const subject = roster.find(entry => entry.characterId === reward.id);
    return subject ? characterArt({id:subject.characterId,name:subject.name,image:subject.imagePath},'portrait') : undefined;
  }
  return undefined;
}
function Rewards({ rewards, compact = false }: { rewards: Reward[]; compact?: boolean }) {
  return <ul className={`inv-rewards ${compact ? 'inv-rewards-compact' : ''}`}>{rewards.map((reward, i) => <li key={`${reward.kind}-${reward.id}-${i}`} title={raidRewardLabel(reward)}>{rewardIcon(reward) && <img src={rewardIcon(reward)} alt="" />}<span>{raidRewardLabel(reward)}</span></li>)}</ul>;
}
function Castle({ name, castleId, level = 1, className = '' }: { name: string; castleId: string; level?: number; className?: string }) {
  return <div className={`inv-castle ${className}`}><Art src={invasionBackground(castleId, level) ?? CASTLE_ART} alt="" /><h2>{name}</h2></div>;
}
export default function TerritoryView({ territory, rooms, userId, onHost, onOpenRoom }: {
  territory?: TerritoryProjection; rooms: RaidRoom[]; userId: string;
  onHost: (destinationId: string) => Promise<void>; onOpenRoom: (roomId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null), [stageIndex, setStageIndex] = useState(0);
  const [confirm, setConfirm] = useState(false), [source, setSource] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [now, setNow] = useState(Date.now);
  const lock = useRef(false), root = useRef<HTMLElement>(null);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const hosted = rooms.filter(room => room.ownerId === userId && getRoomRaidMaster(room).type === 'unlock' && room.status === 'active' && Date.parse(room.expiresAt) > now);
  const ended = rooms.filter(room => room.ownerId === userId && getRoomRaidMaster(room).type === 'unlock' && (room.status !== 'active' || Date.parse(room.expiresAt) <= now));
  const destination = territory?.destinations.find(entry => entry.id === selected);
  const previews = useMemo(() => new Map((territory?.destinations ?? []).map(entry => [entry.id, getTerritoryPreviewStages(entry.raidMaster)])), [territory?.destinations]);
  const stages = useMemo(() => destination ? getTerritoryPreviewStages(destination.raidMaster) : [], [destination]);
  const active = stages[stageIndex] ?? stages[0];
  const initial = stages[0];
  const imageKey = useMemo(() => {
    const visibleStages = destination ? stages : [...previews.values()].map(entries => entries[0]);
    const rewards = destination ? [...stages.flatMap(stage => stage.defeatRewards), ...destination.raidMaster.participationRewards] : [...previews.values()].flatMap(entries => entries.at(-1)!.defeatRewards.slice(0, 3));
    return [...new Set([...(destination ? stages.map(stage => invasionBackground(destination.raidMaster.id, stage.level) ?? CASTLE_ART) : (territory?.destinations ?? []).map(entry => invasionBackground(entry.raidMaster.id) ?? CASTLE_ART)), INVASION_TICKET, '/ui/sengoku/08-castle.png', ...visibleStages.flatMap(stage => [territoryEnemyArt(stage.enemy, 'portrait'), ...(destination ? [territoryEnemyArt(stage.enemy, 'card')] : []), `/ui/raid/v2/element-${stage.enemy.element}.png`]), ...rewards.map(rewardIcon).filter((value): value is string => Boolean(value))])].join('|');
  }, [destination, stages, previews, territory?.destinations]);
  const [readyImages, setReadyImages] = useState('');
  const [imageError, setImageError] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const imagesReady = readyImages === imageKey || imageKey.split('|').every(isBattleImageReady);
  useEffect(() => {
    let cancelled = false; setImageError(false);
    Promise.all(imageKey.split('|').map(preloadBattleImage)).then(() => { if (!cancelled) setReadyImages(imageKey); }).catch(() => { if (!cancelled) setImageError(true); });
    return () => { cancelled = true; };
  }, [imageKey, imageAttempt]);
  useEffect(() => {
    if (!confirm && !source) return;
    const shell = root.current?.closest<HTMLElement>('.rd-shell');
    if (!shell) return;
    const previous = shell.style.overflowY, previousInert = shell.inert;
    shell.inert = true;
    shell.style.overflowY = 'hidden';
    return () => { shell.style.overflowY = previous; shell.inert = previousInert; };
  }, [confirm, source]);
  function navigate(id: string | null) { setSelected(id); setStageIndex(0); setError(''); requestAnimationFrame(() => { root.current?.closest('.rd-shell')?.scrollTo({ top: 0 }); }); }
  async function host() {
    if (!destination || !destination.canHost || !imagesReady || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await onHost(destination.id); setConfirm(false); setSelected(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '侵攻を開始できませんでした。'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section ref={root} className="inv-view rd-territory" aria-label="領土侵攻" aria-busy={!imagesReady}>{!imagesReady && <p className="inv-notice" role="status">{imageError ? <>画像を読み込めませんでした。<button className="inv-source" onClick={() => setImageAttempt(value => value + 1)}>再読込</button></> : '画像を読み込んでいます…'}</p>}
    {!destination ? <>
      <div className="inv-title"><img src="/ui/sengoku/08-castle.png" alt="" /><h1>領土侵攻</h1></div>
      {territory ? <section className="inv-progress inv-frame" aria-label="侵攻主催者の成長"><div><strong>侵攻Lv. <b>{territory.level}</b></strong><div className="inv-exp"><progress aria-label="主催者EXP" value={territory.experience} max={territory.nextLevelExp ?? Math.max(territory.experience, 1)} /><span>{territory.experience.toLocaleString()} / {territory.nextLevelExp?.toLocaleString() ?? 'MAX'}</span></div></div><p>開催枠 <b>{territory.activeHostingCount} / {territory.hostingSlots}</b></p></section> : <p className="inv-notice" role="status">開催条件を読み込めませんでした。画面を開き直してください。</p>}
      {hosted.length > 0 && <section className="inv-hosted" aria-label="自分の開催中の侵攻">{hosted.map(room => <button key={room.id} className="inv-resume inv-frame" onClick={() => onOpenRoom(room.id)}><span className="inv-resume-art"><Art src={invasionBackground(getRoomRaidMaster(room).id, room.level) ?? CASTLE_ART} alt="" /><b>開催中</b></span><span><strong>{room.territorySnapshot?.destination.castle || getRoomRaidMaster(room).name}</strong><small>ボスLv.{room.level} · 残り {raidTimeRemaining(room.expiresAt, now)}</small><small>侵攻 #{room.id.slice(-6)} · 参加 {room.participants.filter(p => !p.leftAt).length}人</small></span><b className="inv-resume-cta">攻略を再開 ›</b></button>)}</section>}
      <h2 className="inv-section-title">◇ 侵攻先</h2>
      {territory?.destinations.length === 0 && <p className="inv-notice">侵攻先は準備中です。</p>}
      <div className="inv-destinations">{territory?.destinations.map(entry => {
        const preview = previews.get(entry.id)!, first = preview[0], last = preview.at(-1)!;
        return <article key={entry.id} className="inv-destination inv-frame">
          <Castle name={entry.castle} castleId={entry.raidMaster.id} /><span className={`inv-status ${entry.canHost ? 'is-available' : ''}`}>{entry.canHost ? '侵攻可能' : territory.level < entry.requiredLevel ? `侵攻Lv.${entry.requiredLevel}で解放` : '条件未達'}</span>
          <div className="inv-card-preview"><div className="inv-card-enemy"><Art key={first.enemy.id} src={territoryEnemyArt(first.enemy, 'portrait')} alt={first.enemy.name} /><div><ElementBadge element={first.enemy.element} /><strong>{first.enemy.name}</strong><small>開始 · 敵Lv.{first.enemy.level}</small></div></div><Rewards compact rewards={last.defeatRewards.slice(0, 3)} /></div>
          <p className="inv-card-conditions">必要侵攻Lv. <b>{entry.requiredLevel}</b><span>期間 {territoryDuration(entry.durationMinutes)}</span><span><img className="inv-ticket" src={INVASION_TICKET} alt="" />{entry.itemName} {entry.ownedItemCount} / 必要 {entry.itemCount}</span></p>
          <button className="inv-button inv-primary" disabled={!imagesReady} onClick={() => navigate(entry.id)}>詳細を見る <span aria-hidden="true">›</span></button>
        </article>;
      })}</div>
      {ended.length > 0 && <details className="inv-ended"><summary>終了した侵攻（{ended.length}件）</summary>{ended.map(room => <button key={room.id} className="inv-ended-row" onClick={() => onOpenRoom(room.id)}><strong>{room.territorySnapshot?.destination.castle || getRoomRaidMaster(room).name}</strong><small>侵攻 #{room.id.slice(-6)} · {new Date(room.createdAt).toLocaleString('ja-JP')}</small><span>結果・報酬を確認 ›</span></button>)}</details>}
    </> : <>
      <button className="inv-back" onClick={() => navigate(null)}>〈 侵攻先一覧</button>
      <Castle name={destination.castle} castleId={destination.raidMaster.id} level={active?.level} className="inv-detail-castle" />
      <div className="inv-detail-content">
        <h2 className="inv-section-title">◇ 出現する敵</h2><p>{invasionSceneName(destination.raidMaster.id,active.level)}</p>
        <div className="inv-stages" role="group" aria-label="敵の進行段階">{stages.map((stage, index) => <div key={stage.key} className="inv-stage-wrap"><button className={`inv-stage ${index === stageIndex ? 'is-selected' : ''}`} aria-label={`${stage.label} ボスLv.${stage.level}`} aria-pressed={index === stageIndex} disabled={!imagesReady} onClick={() => setStageIndex(index)}><strong>{stage.label}</strong><Art key={`${stage.key}-${stage.enemy.id}`} src={territoryEnemyArt(stage.enemy, 'card')} alt={stage.enemy.name} /><span><ElementBadge element={stage.enemy.element} />ボスLv.{stage.level}</span></button>{index < stages.length - 1 && <span className="inv-stage-arrow" aria-hidden="true">›</span>}</div>)}</div>
        <section className="inv-enemy-info" aria-live="polite"><Art key={active.enemy.id} src={territoryEnemyArt(active.enemy, 'portrait')} alt="" /><div><h3>{active.enemy.name} <ElementBadge element={active.enemy.element} /><span>敵Lv.{active.enemy.level}</span></h3><dl className="inv-stats"><div><dt>HP</dt><dd>{active.enemy.stats.hp.toLocaleString()}</dd></div><div><dt>ATK</dt><dd>{active.enemy.stats.atk.toLocaleString()}</dd></div><div><dt>DEF</dt><dd>{active.enemy.stats.def.toLocaleString()}</dd></div></dl></div></section>
        {active.isRepresentative && <p className="inv-note">通常戦の敵は侵攻時に決定します。表示は候補の一例です。</p>}
        <details className="inv-enemy-skills"><summary>敵編成・所持スキルを見る（{active.enemies.length}体）</summary>{active.enemies.map(enemy => <div key={enemy.id}><h4>{enemyRoleLabel(enemy)} {enemy.name} · 敵Lv.{enemy.level}</h4><p>HP {enemy.stats.hp.toLocaleString()} / ATK {enemy.stats.atk.toLocaleString()} / DEF {enemy.stats.def.toLocaleString()}</p><ul>{enemy.skills.map((skill, i) => <li key={i}><strong>{skill.name}</strong>：{displaySkillDescription(skill.description)}</li>)}</ul></div>)}</details>
        <dl className="inv-conditions"><div><dt>開催期間</dt><dd>{territoryDuration(destination.durationMinutes)}</dd></div><div><dt>必要侵攻Lv.</dt><dd>{destination.requiredLevel}</dd></div><div><dt>開催枠</dt><dd>{territory!.activeHostingCount} / {territory!.hostingSlots}</dd></div><div><dt>{destination.itemName}</dt><dd><img className="inv-ticket" src={INVASION_TICKET} alt="" />所持 {destination.ownedItemCount} / 必要 {destination.itemCount}<button className="inv-source" onClick={() => setSource(true)}>入手方法 ›</button></dd></div></dl>
        <section className="inv-prizes"><h2 className="inv-section-title">◇ {active.label}段階の討伐報酬</h2><Rewards rewards={active.defeatRewards} /><p className="inv-note">個別バトル3勝で討伐報酬の対象になります。資格獲得前の報酬は受け取れません。</p>{destination.raidMaster.participationRewards.length > 0 && <details className="inv-enemy-skills"><summary>参加報酬</summary><Rewards rewards={destination.raidMaster.participationRewards} /></details>}<p className="inv-exp-reward">侵攻クリア時：主催者EXP <b>{destination.clearExp.toLocaleString()}</b></p><p className="inv-note">主催者のみ、クリア時点で個別バトル3勝が必要です。</p></section>
        {!destination.canHost && <ul className="inv-reasons">{destination.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
        <button className="inv-button inv-primary" disabled={!destination.canHost || busy || !imagesReady} onClick={() => { setError(''); setConfirm(true); }}>侵攻する <span aria-hidden="true">›</span></button>
      </div>
    </>}
    {source && destination && <Modal title={`${destination.itemName}の入手方法`} className="inv-dialog" onClose={() => setSource(false)} footer={<button className="inv-button" onClick={() => setSource(false)}>閉じる</button>}><p>{destination.itemSource}</p><p>所持 {destination.ownedItemCount} / 必要 {destination.itemCount}</p></Modal>}
    {confirm && destination && initial && <Modal title="侵攻確認" className="inv-dialog" onClose={() => { if (!busy) setConfirm(false); }} footer={<div className="inv-dialog-actions"><button className="inv-button" disabled={busy} onClick={() => setConfirm(false)}>キャンセル</button><button className="inv-button inv-primary" disabled={busy || !destination.canHost || !imagesReady} onClick={() => void host()}>{busy ? '侵攻準備中…' : '侵攻する'}</button></div>}>
      <Castle name={destination.castle} castleId={destination.raidMaster.id} />
      <div className="inv-confirm-enemy"><Art key={initial.enemy.id} src={territoryEnemyArt(initial.enemy, 'portrait')} alt={initial.enemy.name} /><div><h3><ElementBadge element={initial.enemy.element} />{enemyRoleLabel(initial.enemy)} {initial.enemy.name}</h3><p><span className="inv-tag">開始</span> ボスLv.{initial.level} · 敵Lv.{initial.enemy.level}</p></div></div>
      {initial.isRepresentative && <p className="inv-note">通常戦の敵は侵攻時に決定します。</p>}
      <dl className="inv-conditions"><div><dt>開催期間</dt><dd>{territoryDuration(destination.durationMinutes)}</dd></div><div><dt>消費アイテム</dt><dd><img className="inv-ticket" src={INVASION_TICKET} alt="" />{destination.itemName} ×{destination.itemCount}</dd></div><div><dt>所持数</dt><dd>{destination.ownedItemCount} → {Math.max(0, destination.ownedItemCount - destination.itemCount)}</dd></div><div><dt>開催枠</dt><dd>{territory!.activeHostingCount} / {territory!.hostingSlots} → <b>{territory!.activeHostingCount + 1} / {territory!.hostingSlots}</b></dd></div></dl>
      {!destination.canHost && <ul className="inv-reasons">{destination.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}{error && <p className="inv-reasons" role="alert">{error}</p>}
    </Modal>}
  </section>;
}
