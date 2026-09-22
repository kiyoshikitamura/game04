'use client';
import { game04UiError } from '@/app/lib/game04UiError';
import { characterArt } from '@/theme/creativeAssets';
import { useEffect, useRef, useState } from 'react';
import type { RaidRoom } from '@/domain/redesign/types';
import type { TerritoryProjection } from '@/domain/redesign/territory';
import { getRoomRaidMaster } from '@/domain/redesign/raid';
import { raidElementLabels, raidRewardLabel, raidTimeRemaining } from '@/domain/redesign/raidPresentation';
import Modal from './Modal';
import TerritoryItemIcon from './TerritoryItemIcon';

export default function TerritoryView({ territory, rooms, userId, onHost, onOpenRoom }: {
  territory?: TerritoryProjection; rooms: RaidRoom[]; userId: string;
  onHost: (destinationId: string) => Promise<void>; onOpenRoom: (roomId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now);
  const lock = useRef(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const hosted = rooms.filter(room => room.ownerId === userId && getRoomRaidMaster(room).type === 'unlock' && room.status === 'active' && Date.parse(room.expiresAt) > now);
  const destination = territory?.destinations.find(entry => entry.id === selected);
  async function host() {
    if (!destination || !destination.canHost || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await onHost(destination.id); setSelected(null); }
    catch (reason) { setError(game04UiError(reason)); }
    finally { lock.current = false; setBusy(false); }
  }
  const duration = (minutes: number) => minutes % 1440 === 0 ? `${minutes / 1440}日` : minutes % 60 === 0 ? `${minutes / 60}時間` : `${minutes}分`;
  if (error) return <Modal kind="notice" onClose={() => setError('')}><p>{error}</p></Modal>;
  return <section className="rd-stack rd-territory">
    <h1>領土侵攻</h1>{territory?.status === 'PREVIEW_PROVISIONAL' && <p className="rd-muted">開発用の仮設定です。経験値・開催条件・報酬は調整予定です。</p>}<p>他領地の城に挑み、仲間とともに制圧を目指しましょう。</p>
    {territory ? <section className="rd-panel"><h2>領土侵攻レベル {territory.level}</h2><p>領土侵攻経験値 {territory.experience.toLocaleString()}{territory.nextLevelExp != null ? ` ／ 次のLvまで ${Math.max(0, territory.nextLevelExp - territory.experience).toLocaleString()}` : ' ／ 上限到達'}</p><p>同時開催枠 {territory.activeHostingCount} / {territory.hostingSlots}</p><p className="rd-muted">主催した侵攻を最終ボスまでクリアし、その時点で個別バトルに3勝していると経験値を獲得します。</p></section> : <p className="rd-panel" role="status">開催条件を読み込めませんでした。画面を開き直してください。</p>}
    {hosted.length > 0 && <section className="rd-stack"><h2>自分の開催中の侵攻</h2>{hosted.map(room => <button key={room.id} className="rd-panel rd-territory-resume" onClick={() => onOpenRoom(room.id)}><strong>{room.territorySnapshot?.destination.castle || getRoomRaidMaster(room).name}</strong><span>侵攻中のボスLv.{room.level} · {raidTimeRemaining(room.expiresAt, now)}</span><small>侵攻 #{room.id.slice(-8)} · 開催 {new Date(room.createdAt).toLocaleString('ja-JP')} · 参加 {room.participants.filter(participant => !participant.leftAt).length}人</small><b>攻略を再開 ›</b></button>)}</section>}
    <h2>侵攻先</h2>
    {territory?.destinations.length === 0 && <p className="rd-panel">侵攻先は準備中です。</p>}
    {territory?.destinations.map(entry => <section key={entry.id} className="rd-panel rd-territory-destination">
      {characterArt(entry.raidMaster.enemy, 'battle') && <img className="rd-territory-enemy" src={characterArt(entry.raidMaster.enemy, 'battle')} alt={entry.raidMaster.enemy.name} />}
      <div><h3>{entry.castle}</h3><strong>{entry.name}</strong><p>{entry.difficulty} · {raidElementLabels[entry.raidMaster.enemy.element]}属性</p><p>守将：{entry.raidMaster.enemy.name}</p><p>{entry.raidMaster.enemy.skills.map(skill => skill.description || skill.name).join(' ／ ')}</p></div>
      <div className="rd-territory-conditions"><p>開催期間 {duration(entry.durationMinutes)} · 最終ボスLv.{entry.raidMaster.maxLevel}</p><p>必要領土侵攻レベル {entry.requiredLevel}</p><p><TerritoryItemIcon itemId={entry.itemId} />開催アイテム {entry.itemName} ×{entry.itemCount}（所持 {entry.ownedItemCount}）</p><p>入手方法：{entry.itemSource}</p><h4>参加報酬</h4><ul>{entry.raidMaster.participationRewards.map((reward, index) => <li key={index}>{raidRewardLabel(reward)}</li>)}</ul><h4>各ボスLvの討伐報酬</h4><ul>{entry.raidMaster.defeatRewards.map((reward, index) => <li key={index}>{raidRewardLabel(reward)}</li>)}</ul><p>侵攻クリア時の主催者経験値 {entry.clearExp.toLocaleString()}（クリア時3勝が必要）</p>
      {!entry.canHost && <ul className="rd-territory-reasons">{entry.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
      <button className="rd-button rd-primary" disabled={busy || !entry.canHost} onClick={() => { setError(''); setSelected(entry.id); }}>開催内容を確認</button></div>
    </section>)}
    {destination && <Modal kind="confirm" busy={busy} title="領土侵攻の開催確認" onClose={() => { if (!busy) setSelected(null); }} footer={<div className="rd-row"><button className="rd-button" disabled={busy} onClick={() => setSelected(null)}>キャンセル</button><button className="rd-button rd-primary" disabled={busy || !destination.canHost} onClick={() => void host()}>{busy ? '開催中…' : '開催する'}</button></div>}><h3>{destination.castle} · {destination.name}</h3><p>開催期間 {duration(destination.durationMinutes)}</p><p><TerritoryItemIcon itemId={destination.itemId} />{destination.itemName} ×{destination.itemCount}を消費します。（所持 {destination.ownedItemCount}）</p><p>同時開催枠 {territory!.activeHostingCount} / {territory!.hostingSlots}</p><p>開催後はレイド詳細から出撃できます。</p>{!destination.canHost && <ul>{destination.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}{error && <p role="alert">{error}</p>}</Modal>}
  </section>;
}
