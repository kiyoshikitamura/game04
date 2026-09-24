'use client';
import { useState } from 'react';
import Modal from './Modal';
import { loginBonusForDay } from '@/domain/redesign/loginBonus';
import { raidRewardLabel } from '@/domain/redesign/raidPresentation';
import './formalLoginBonus.css';
export default function FormalLoginBonusModal({ currentStep, onClose }: { currentStep: number; onClose: () => void }) {
 const day=Number.isSafeInteger(currentStep)&&currentStep>=1&&currentStep<=30?currentStep:1;
 const [selected,setSelected]=useState(day);
 const grant=loginBonusForDay(selected);
 return <Modal title="ログインボーナス" onClose={onClose}>
  <p>累計 {day} 日目の報酬を獲得しました。</p>
  <div className="g4-login-days" aria-label="累計30日ログイン報酬">{Array.from({length:30},(_,i)=>i+1).map(n=><button key={n} type="button" className="rd-button" aria-pressed={n===selected} onClick={()=>setSelected(n)}>{n}日目{n===day?' ✓':''}</button>)}</div>
  <section aria-live="polite"><h3>{selected}日目</h3><ul>{grant.rewards.map((r,i)=><li key={i}>{raidRewardLabel(r)}</li>)}{grant.freeDiamonds>0&&<li>無償輝石 ×{grant.freeDiamonds}</li>}</ul></section>
  <p className="rd-muted">30日で一巡します。ログインしなかった日は進みません。</p>
  <button type="button" className="rd-button rd-primary" onClick={onClose}>閉じる</button>
 </Modal>;
}
