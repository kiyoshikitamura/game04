'use client';
import { useEffect, useRef, useState } from 'react';
import type { RedesignState } from '@/domain/redesign/types';
import type { MissionProjection } from '@/domain/redesign/missions';
import { raidRewardLabel } from '@/domain/redesign/raidPresentation';

type Props = {
  state: RedesignState;
  missions: MissionProjection[];
  missionBusy: boolean;
  missionError: string;
  previewOnly: boolean;
  onClaim: (id: string) => void;
};

const STATUS_FILTERS = [
  ['claimable', '受取可'], ['progress', '進行中'], ['claimed', '受取済み'],
] as const;
const PAGE_SIZE = 20;
// Presentation only: keep accepted master names, IDs and conditions unchanged.
const missionLabel = (value: string) => value.replace(/キャラクター|キャラ/g, '武将');

/** Formal projections only; legacy daily missions are not substituted for undecided rules. */
export default function MissionContent({ missions, missionBusy, missionError, previewOnly, onClaim }: Props) {
  const [filter, setFilter] = useState<MissionProjection['status']>(() => missions.some(m => m.status === 'claimable') ? 'claimable' : 'progress');
  const [requestedPage, setPage] = useState(0);
  const filterRef = useRef<HTMLDivElement>(null);
  const filtered = missions.filter(mission => mission.status === filter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount - 1);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  useEffect(() => { filterRef.current?.closest('.rd-modal-body')?.scrollTo({ top: 0 }); }, [page, filter]);
  return <>
    <div ref={filterRef} className="rd-tabs" role="group" aria-label="任務の状態">
      {STATUS_FILTERS.map(([status, label]) => <button type="button" key={status} aria-pressed={filter === status} className={filter === status ? 'active' : ''}
        disabled={missionBusy} onClick={() => { setFilter(status); setPage(0); }}>{label} ({missions.filter(mission => mission.status === status).length})</button>)}
    </div>
    {visible.length ? <div className="rd-stack" aria-busy={missionBusy}>{visible.map(mission => <section className="rd-panel" key={mission.id}>
      <strong>{missionLabel(mission.name)}</strong>
      {mission.description && mission.description !== mission.name && <p className="rd-muted">{missionLabel(mission.description)}</p>}
      <p>{mission.current.toLocaleString()} / {mission.target.toLocaleString()}</p>
      <ul>{mission.rewards.map((reward, index) => <li key={index}>{raidRewardLabel(reward)}</li>)}</ul>
      <button type="button" className="rd-button rd-primary" disabled={missionBusy || previewOnly || mission.status !== 'claimable'} onClick={() => onClaim(mission.id)}>
        {mission.status === 'claimed' ? '受取済み' : mission.status === 'claimable' ? '報酬を受け取る' : '進行中'}
      </button>
    </section>)}</div> : <p className="rd-muted">{filter === 'claimable' ? '受け取れる任務報酬はありません。' : filter === 'claimed' ? '受取済みの任務はありません。' : '進行中の任務はありません。'}</p>}
    {pageCount > 1 && <nav className="rd-row" aria-label="任務一覧のページ">
      <button type="button" className="rd-button" disabled={missionBusy || page === 0} onClick={() => setPage(page - 1)}>前へ</button>
      <span aria-live="polite">{page + 1} / {pageCount}</span>
      <button type="button" className="rd-button" disabled={missionBusy || page + 1 >= pageCount} onClick={() => setPage(page + 1)}>次へ</button>
    </nav>}
    {missionBusy && <p role="status">報酬を受け取っています…</p>}
    {missionError && <p role="alert">{missionError}</p>}
  </>;
}
