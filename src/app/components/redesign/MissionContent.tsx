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

/** Shared by the existing Home dialog and the offline QA page. */
export default function MissionContent({ state, missions, missionBusy, missionError, previewOnly, onClaim }: Props) {
  return <>

    {missions.length ? <div className="rd-stack">{missions.map(mission => <section className="rd-panel" key={mission.id}>
      <strong>{mission.name}</strong><p>{mission.current} / {mission.target}</p>
      <ul>{mission.rewards.map((reward, index) => <li key={index}>{raidRewardLabel(reward)}</li>)}</ul>
      <button className="rd-button rd-primary" disabled={missionBusy || previewOnly || mission.status !== 'claimable'} onClick={() => onClaim(mission.id)}>
        {mission.status === 'claimed' ? '受取済み' : mission.status === 'claimable' ? '報酬を受け取る' : '攻略中'}
      </button>
    </section>)}</div> : <p className="rd-muted">達成報酬は準備中です。</p>}
    {missionError && <p role="alert">{missionError}</p>}
  </>;
}
