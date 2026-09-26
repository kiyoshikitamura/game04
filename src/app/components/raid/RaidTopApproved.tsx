'use client';

import { useMemo, useState } from 'react';
import type { RaidTopData, RaidTopEntry } from '@/domain/raidTop';
import { getRaidDifficultyLabel } from '@/domain/raidRoomPresentation';
import type { RaidPlayerSummary } from '@/domain/raidRoom';
import OutlawButton from '../ui/OutlawButton';
import './RaidTopApproved.css';
import { RaidApprovedCard, RaidApprovedIcon } from './RaidApprovedVisual';

type Props = Pick<RaidTopData, 'participating' | 'rescues'> & {
  now: number | null;
  resolve: (url: string) => string;
  onOpenRoom: (roomId: string, rescueId?: string) => void;
  onOpenRewards: () => void;
  onRefresh: () => void;
  disabled?: boolean;
};

const icon = (name: 'chest') => <RaidApprovedIcon name={name} />;
const attributeLabel: Record<string, string> = { EVIL: '悪', ORDER: '秩序', JUSTICE: '正義', CHAOS: '混沌', UNKNOWN: '属性未確認' };
const ownerOf = (entry: RaidTopEntry): RaidPlayerSummary | null => entry.room.owner.status === 'available' ? entry.room.owner.value : null;
const enemyOf = (entry: RaidTopEntry) => entry.enemy.status === 'available' ? entry.enemy.value : null;

function cardData(entry: RaidTopEntry, now: number | null, compact = false) {
  const owner = ownerOf(entry);
  const hp = entry.room.hp.status === 'available' && entry.room.hp.value.max > 0 ? entry.room.hp.value : null;
  const percent = hp ? Math.max(0, Math.min(100, hp.current / hp.max * 100)) : null;
  const remaining = now !== null && entry.room.expiresAt.status === 'available' ? Math.max(0, Date.parse(entry.room.expiresAt.value) - now) : null;
  const minutes = remaining === null ? null : Math.ceil(remaining / 60000);
  const timeLabel = minutes === null ? '未確認' : minutes >= 60 ? `${Math.floor(minutes / 60)}時間${minutes % 60}分` : `${minutes}分`;
  const enemyValue = enemyOf(entry);
  return { bossName: enemyValue?.bossName ?? '敵情報未確認', attributeLabel: attributeLabel[enemyValue?.attribute ?? 'UNKNOWN'], attributeIconUrl: enemyValue?.attribute === 'UNKNOWN' ? undefined : `/creative/ui/element-${({ EVIL: 'fire', CHAOS: 'dark', ORDER: 'water', JUSTICE: 'wind' } as Record<string, string>)[enemyValue?.attribute ?? ''] ?? 'light'}.png`, ownerName: owner?.name ?? '未確認', ownerImageUrl: owner?.leaderIconUrl.status === 'available' ? owner.leaderIconUrl.value ?? undefined : undefined, hpPercent: percent, hpText: compact ? `HP ${percent === null ? '未確認' : `${percent.toFixed(0)}%`}` : hp ? `HP ${hp.current.toLocaleString()} / ${hp.max.toLocaleString()}　(${percent?.toFixed(0)}%)` : 'HP 未確認', remainingLabel: timeLabel, participantLabel: enemyValue && entry.room.participantCount.status === 'available' ? `${entry.room.participantCount.value}/${enemyValue.maxParticipants}人` : '未確認', levelLabel: enemyValue ? `Lv.${enemyValue.level}` : 'Lv.未取得' };
}

function Card({ entry, now, resolve, onOpenRoom, disabled, rescue }: { entry: RaidTopEntry; now: number | null; resolve: Props['resolve']; onOpenRoom: Props['onOpenRoom']; disabled?: boolean; rescue?: boolean }) {
  const enemy = enemyOf(entry);
  return <RaidApprovedCard data={{ ...cardData(entry, now, rescue), backgroundUrl: enemy?.backgroundUrl, characterUrl: enemy?.leaderImageUrl, badgeLabel: rescue ? '救援' : getRaidDifficultyLabel(entry.room.difficultyId), statusLabel: rescue ? '参加可能' : '参加中' }} resolve={resolve} action={<OutlawButton loadingLabel="" variant="primary" disabled={disabled} onClick={() => onOpenRoom(entry.room.roomId, entry.rescue.status === 'available' ? entry.rescue.value.rescueId : undefined)}>{rescue ? '救援に向かう' : '続きへ'} ›</OutlawButton>} />;
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
  return <div className="raid-approved-ui" data-testid="raid-top-approved"><div className="raid-approved-ui__heading"><h1>レイド</h1><button type="button" onClick={onRefresh}>更新</button></div><div className="raid-approved-ui__tabs">{tabs.map(([value, label]) => <button key={value} type="button" className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>{label}</button>)}</div>{empty ? <div className="raid-approved-ui__empty">現在開催中のレイドはありません</div> : <div className="raid-approved-ui__cards">{visibleJoined.map(entry => <Card key={entry.room.roomId} entry={entry} now={now} resolve={resolve} onOpenRoom={onOpenRoom} disabled={disabled}/>) }{visibleHelp.map(entry => <Card key={`${entry.room.roomId}-rescue`} entry={entry} now={now} resolve={resolve} onOpenRoom={onOpenRoom} disabled={disabled} rescue/>)}</div>}<button className="raid-approved-ui__ended" type="button" onClick={onOpenRewards}>{icon('chest')}<span>終了したレイド・未受取報酬</span><b>›</b></button></div>;
}
