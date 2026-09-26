'use client';
import {useState} from 'react';
import CanonicalDialog from '../ui/CanonicalDialog';
import {RewardList} from '../ui/Game04DataDisplay';
import CompactRewards from '../ui/CompactRewards';
import {loginBoardRewards,loginBoardStatus} from '@/domain/presentation/formalLoginBoard';
import './formalLoginBonus.css';

const board=Array.from({length:30},(_,i)=>({day:i+1,rewards:loginBoardRewards(i+1)}));
export default function FormalLoginBonusModal({currentStep,totalLogins,onClose}:{currentStep:number;totalLogins?:number;onClose:()=>void}) {
  const day=Number.isSafeInteger(currentStep)&&currentStep>=1&&currentStep<=30?currentStep:1;
  const next=day%30+1;
  const [detail,setDetail]=useState<number|null>(null);
  // Replace the dialog body rather than nesting modal focus traps.
  if(detail!==null)return <CanonicalDialog key="reward-details" title={`${detail}日目の報酬`} density="compact" actions={[{label:'ボードへ戻る',onClick:()=>setDetail(null)}]}><p>{loginBoardStatus(detail,day)}</p><RewardList items={board[detail-1].rewards}/></CanonicalDialog>;
  return <CanonicalDialog key="board" title="ログインボーナス" density="compact" actions={[{label:'閉じる',onClick:onClose,semantic:'primary'}]}>
    <div className="g4-login-board">
      {[[day,'本日'],[next,'次回']] .map(([value,label])=><button key={label} className="g4-login-summary" aria-label={`${label}の全報酬を確認`} onClick={()=>setDetail(Number(value))}>
        <span><strong>{label} · {value}日目</strong><small>{label==='本日'?'受取済み':day===30?'次の一巡':''}</small></span><CompactRewards items={board[Number(value)-1].rewards}/><b aria-hidden="true">›</b>
      </button>)}
      {Number.isSafeInteger(totalLogins)&&totalLogins!>0&&<p className="g4-login-received">累計ログイン {totalLogins!.toLocaleString()}日</p>}
      <h3 className="g4-login-board-title">30日ログインボード <small>タップで全報酬</small></h3>
      <ol className="g4-login-days" aria-label="30日ログイン報酬">
        {board.map(row=>{const status=loginBoardStatus(row.day,day);return <li key={row.day} data-status={status} aria-current={row.day===day?'date':undefined}>
          <button onClick={()=>setDetail(row.day)} aria-label={`${row.day}日目・${status}・全${row.rewards.length}件の報酬を確認`}>
            <span className="g4-login-day-heading"><b>{row.day}日目</b><span>{status==='受取済み'?'✓':status}</span></span>
            <CompactRewards items={row.rewards} limit={1}/>
          </button>
        </li>})}
      </ol>
      <p className="g4-login-note" data-login-end>30日で一巡します。ログインしなかった日は進みません。</p>
    </div>
  </CanonicalDialog>;
}
