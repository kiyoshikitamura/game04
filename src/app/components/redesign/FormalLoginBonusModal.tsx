'use client';
import CanonicalDialog from '../ui/CanonicalDialog';
import {RewardList,NumberUnit} from '../ui/Game04DataDisplay';
import {loginBoardRewards,loginBoardStatus} from '@/domain/presentation/formalLoginBoard';
import {useCharacterImageReadiness} from './CharacterImageReadiness';
import './formalLoginBonus.css';

const board=Array.from({length:30},(_,i)=>({day:i+1,rewards:loginBoardRewards(i+1)}));
const images=board.flatMap(row=>row.rewards.flatMap(reward=>reward.image?[reward.image]:[]));
export default function FormalLoginBonusModal({currentStep,totalLogins,onClose}:{currentStep:number;totalLogins?:number;onClose:()=>void}) {
  const day=Number.isSafeInteger(currentStep)&&currentStep>=1&&currentStep<=30?currentStep:1;
  const next=day%30+1;
  const assets=useCharacterImageReadiness(images,'home');
  return <CanonicalDialog title="ログインボーナス" density="compact" loading={!assets.ready&&!assets.failed} actions={[{label:'閉じる',onClick:onClose,semantic:'primary'}]}>
    {assets.failed?<div role="alert"><p>報酬画像を読み込めませんでした。</p><button type="button" className="rd-button" onClick={assets.retry}>再試行</button></div>:<div className="g4-login-board">
      <section className="g4-login-today" aria-label="本日の報酬">
        <div className="g4-login-heading"><h3>本日の報酬</h3><span>{day}日目</span></div>
        <RewardList items={board[day-1].rewards}/>
        <p className="g4-login-received">受取済み{Number.isSafeInteger(totalLogins)&&totalLogins!>0?` · 累計ログイン ${totalLogins!.toLocaleString()}日`:''}</p>
      </section>
      <section className="g4-login-next" aria-label="次回の報酬">
        <div className="g4-login-heading"><h3>次回の報酬</h3><span>{day===30?'次の一巡 · ':''}{next}日目</span></div>
        <RewardList items={board[next-1].rewards}/>
      </section>
      <h3 className="g4-login-board-title">30日ログインボード</h3>
      <ol className="g4-login-days" aria-label="30日ログイン報酬">
        {board.map(row=>{
          const status=loginBoardStatus(row.day,day);
          return <li key={row.day} data-status={status} aria-current={row.day===day?'date':undefined}>
            <div className="g4-login-day-heading"><b>{row.day}日目</b><span>{status}</span></div>
            <ul>{row.rewards.map(reward=><li key={reward.key} aria-label={`${reward.name} ×${reward.amount.toLocaleString()}`} title={reward.name}>
              <img src={reward.image} alt={reward.name}/><NumberUnit value={`×${reward.amount.toLocaleString()}`}/>
            </li>)}</ul>
          </li>;
        })}
      </ol>
      <p className="g4-login-note" data-login-end>30日で一巡します。ログインしなかった日は進みません。</p>
    </div>}
  </CanonicalDialog>;
}
