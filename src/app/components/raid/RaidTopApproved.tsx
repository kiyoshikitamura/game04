'use client';

import { useMemo, useState } from 'react';
import type { RaidTopData, RaidTopEntry } from '@/domain/raidTop';
import { getRaidDifficultyLabel } from '@/domain/raidRoomPresentation';
import { getRaidRoomLifecyclePresentation } from '@/domain/raidRoomLifecyclePresentation';
import type { RaidPlayerSummary } from '@/domain/raidRoom';
import OutlawButton from '../ui/OutlawButton';
import './RaidTopApproved.css';

type Props = Pick<RaidTopData, 'participating' | 'rescues'> & {
  now: number | null;
  resolve: (url: string) => string;
  onOpenRoom: (roomId: string, rescueId?: string) => void;
  onOpenRewards: () => void;
  onRefresh: () => void;
  disabled?: boolean;
};

const icon = (name: 'clock' | 'people' | 'chest' | 'medal') => <img className="raid-approved-ui__icon" src={`/ui/raid/${name}.svg`} alt="" />;
const attributeLabel: Record<string, string> = { EVIL: '悪', ORDER: '秩序', JUSTICE: '正義', CHAOS: '混沌', UNKNOWN: '属性未確認' };
const attributeIcon = (value: string) => value === 'UNKNOWN' ? null : <img className="raid-approved-ui__icon" src={`/ui/rarity/attribute-badge-${value.toLowerCase()}.png`} alt="" />;
const ownerOf = (entry: RaidTopEntry): RaidPlayerSummary | null => entry.room.owner.status === 'available' ? entry.room.owner.value : null;
const enemyOf = (entry: RaidTopEntry) => entry.enemy.status === 'available' ? entry.enemy.value : null;

function Owner({ entry, resolve }: { entry: RaidTopEntry; resolve: Props['resolve'] }) {
  const owner = ownerOf(entry);
  const image = owner?.leaderIconUrl.status === 'available' && owner.leaderIconUrl.value ? resolve(owner.leaderIconUrl.value) : undefined;
  return <div className="raid-approved-ui__owner">{image ? <img src={image} alt="" /> : <span className="raid-approved-ui__owner-fallback" />}<strong>開催者　{owner?.name ?? '未確認'}</strong></div>;
}

function Hp({ entry, now, compact = false }: { entry: RaidTopEntry; now: number | null; compact?: boolean }) {
  const hp = entry.room.hp.status === 'available' && entry.room.hp.value.max > 0 ? entry.room.hp.value : null;
  const percent = hp ? Math.max(0, Math.min(100, hp.current / hp.max * 100)) : null;
  const lifecycle = getRaidRoomLifecyclePresentation(entry.room, now);
  return <div className="raid-approved-ui__battle"><div className="raid-approved-ui__hpbar"><span style={{ width: `${percent ?? 0}%` }} /></div><div className="raid-approved-ui__hptext">{compact ? `HP ${percent === null ? '未確認' : `${percent.toFixed(0)}%`}` : hp ? `HP ${hp.current.toLocaleString()} / ${hp.max.toLocaleString()}　(${percent?.toFixed(0)}%)` : 'HP 未確認'}</div><div className="raid-approved-ui__facts"><span>{icon('clock')}{lifecycle.remainingLabel}</span><span>{icon('people')}{entry.room.participantCount.status === 'available' ? `${entry.room.participantCount.value}/20人` : '未確認'}</span></div></div>;
}

function Card({ entry, now, resolve, onOpenRoom, disabled, rescue }: { entry: RaidTopEntry; now: number | null; resolve: Props['resolve']; onOpenRoom: Props['onOpenRoom']; disabled?: boolean; rescue?: boolean }) {
  const enemy = enemyOf(entry);
  const attribute = enemy?.attribute ?? 'UNKNOWN';
  return <article className="raid-approved-ui__card"><div className="raid-approved-ui__card-art">{enemy && <><img src={resolve(enemy.backgroundUrl)} alt="" /><img src={resolve(enemy.leaderImageUrl)} alt="" /></>}</div><div className="raid-approved-ui__card-copy"><div className="raid-approved-ui__badges"><span>{rescue ? '救援' : getRaidDifficultyLabel(entry.room.difficultyId)}</span><span>{rescue ? '参加可能' : '参加中'}</span></div><h3>{enemy?.bossName ?? '敵情報未確認'} <small>Lv.1</small></h3><p className="raid-approved-ui__attribute">{attributeIcon(attribute)}{attributeLabel[attribute]}属性</p><Owner entry={entry} resolve={resolve}/><Hp entry={entry} now={now} compact={rescue}/><OutlawButton loadingLabel="" variant="primary" disabled={disabled} onClick={() => onOpenRoom(entry.room.roomId, entry.rescue.status === 'available' ? entry.rescue.value.rescueId : undefined)}>{rescue ? '救援に向かう' : '続きへ'} ›</OutlawButton></div></article>;
}

function remaining(entry: RaidTopEntry): number {
  return entry.room.expiresAt.status === 'available' ? Date.parse(entry.room.expiresAt.value) : Number.POSITIVE_INFINITY;
}
function byRemaining(entries: readonly RaidTopEntry[]) { return [...entries].sort((a, b) => remaining(a) - remaining(b)); }

export default function RaidTopApproved({ participating, rescues, now, resolve, onOpenRoom, onOpenRewards, onRefresh, disabled }: Props) {
  const [tab, setTab] = useState<'all' | 'encounter' | 'territory'>('all');
  const joined = participating.status === 'ready' ? byRemaining(participating.data) : [];
  const help = rescues.status === 'ready' ? byRemaining(rescues.data) : [];
  const origin = (entry: RaidTopEntry) => entry.origin?.status === 'available' ? entry.origin.value : null;
  const visibleJoined = tab === 'territory' ? joined.filter(entry => origin(entry) === 'territory') : tab === 'encounter' ? joined.filter(entry => origin(entry) === 'encounter') : joined;
  const visibleHelp = tab === 'all' ? help.slice(0, 1) : [];
  const empty = visibleJoined.length === 0 && visibleHelp.length === 0;
  const tabs = useMemo(() => [['all', 'すべて'], ['encounter', 'エンカウント'], ['territory', '領土侵攻']] as const, []);
  return <div className="raid-approved-ui" data-testid="raid-top-approved"><div className="raid-approved-ui__heading"><h1>レイド</h1><button type="button" onClick={onRefresh}>更新</button></div><div className="raid-approved-ui__tabs">{tabs.map(([value, label]) => <button key={value} type="button" className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>{label}</button>)}</div><p className="raid-approved-ui__sort">残り時間が短い順</p>{empty ? <div className="raid-approved-ui__empty">現在開催中のレイドはありません</div> : <div className="raid-approved-ui__cards">{visibleJoined.map(entry => <Card key={entry.room.roomId} entry={entry} now={now} resolve={resolve} onOpenRoom={onOpenRoom} disabled={disabled}/>) }{visibleHelp.map(entry => <Card key={`${entry.room.roomId}-rescue`} entry={entry} now={now} resolve={resolve} onOpenRoom={onOpenRoom} disabled={disabled} rescue/>)}</div>}<button className="raid-approved-ui__ended" type="button" onClick={onOpenRewards}>{icon('chest')}<span>終了したレイド・未受取報酬</span><b>›</b></button></div>;
}
