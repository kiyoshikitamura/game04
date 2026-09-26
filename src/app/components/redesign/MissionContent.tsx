'use client';
import {useEffect,useRef,useState} from 'react';
import type {RedesignState} from '@/domain/redesign/types';
import type {MissionProjection} from '@/domain/redesign/missions';
import {missionPresentation,missionRewardImage} from '@/domain/presentation/missionPresentation';
import {raidRewardLabel} from '@/domain/redesign/raidPresentation';
import {RewardList} from '../ui/Game04DataDisplay';
import Modal from './Modal';
import './MissionContent.css';
type Props={state:RedesignState;missions:MissionProjection[];missionBusy:boolean;missionError:string;previewOnly:boolean;onClaim:(id:string)=>void;onClaimMany?:(ids:string[])=>void;onClose?:()=>void;onNavigate?:(tab:string)=>void;onRetryOpen?:()=>void;missionStatus?:string};
export default function MissionContent({missions,missionBusy,missionError,previewOnly,onClaim,onClaimMany,onClose,onNavigate,onRetryOpen,missionStatus}:Props){
 const [daily,setDaily]=useState(true),[expanded,setExpanded]=useState(false);
 const [detail,setDetail]=useState<{mission:MissionProjection;rewardIndex?:number;rewards?:boolean}|null>(null);
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0});setExpanded(false)},[daily]);
 const visible=missions.filter(m=>missionPresentation(m).daily===daily),claimable=visible.filter(m=>m.status==='claimable');
 const active=visible.filter(m=>m.status!=='claimed').sort((a,b)=>Number(b.status==='claimable')-Number(a.status==='claimable')),claimed=visible.filter(m=>m.status==='claimed');
 const disabled=missionBusy||previewOnly;
 const challenge=(m:MissionProjection)=>{const p=missionPresentation(m);if(!onNavigate||!p.destination){setDetail({mission:m});return}if(p.destination==='missions'){setDaily(true);scroll.current?.scrollTo({top:0});return}onClose?.();onNavigate(p.destination)};
 const row=(m:MissionProjection)=>{const p=missionPresentation(m),complete=m.status!=='progress';return <section className="g4-mission-row" key={m.id} data-mission-id={m.id}>
 <h3>{p.title}</h3>
 <div className="g4-mission-progress"><div className="g4-mission-track" role="progressbar" aria-label={p.title} aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={m.current}><span style={{width:`${Math.min(100,m.current/Math.max(1,m.target)*100)}%`}}/></div><span>{m.current.toLocaleString()} / {m.target.toLocaleString()}{p.unit}</span>{complete?(m.status==='claimable'&&<span>達成</span>):<span>あと{Math.max(0,m.target-m.current).toLocaleString()}{p.unit}</span>}</div>
 <div className="g4-mission-bottom"><div className="g4-mission-rewards">{m.rewards.slice(0,2).map((r,i)=><button type="button" className="g4-mission-reward" key={i} disabled={missionBusy} aria-label={`${raidRewardLabel(r)}の詳細`} onClick={()=>setDetail({mission:m,rewards:true,rewardIndex:i})}>{missionRewardImage(r)?<img src={missionRewardImage(r)} alt=""/>:<span>{raidRewardLabel(r).replace(/ ×[\d,]+$/,'')}</span>}<span>×{r.amount.toLocaleString()}</span></button>)}{m.rewards.length>2&&<button type="button" className="g4-mission-more" disabled={missionBusy} aria-label={`全${m.rewards.length}件の報酬を確認`} onClick={()=>setDetail({mission:m,rewards:true})}>＋{m.rewards.length-2}件</button>}</div>
 {m.status==='claimed'?<span className="g4-mission-check" role="img" aria-label="受取済み">✓</span>:<button type="button" className={`g4-mission-action ${m.status==='claimable'?'is-claim':''}`} disabled={disabled} onClick={()=>m.status==='claimable'?onClaim(m.id):challenge(m)}>{m.status==='claimable'?'受取':p.destination?'挑戦':'詳細'}</button>}</div>
 {p.detail!==p.title&&<button type="button" className="g4-mission-condition" disabled={missionBusy} onClick={()=>setDetail({mission:m})}>条件の詳細</button>}
 </section>};
 const footer=<><button type="button" className="g4-mission-bulk" disabled={disabled||!claimable.length||!onClaimMany} onClick={()=>{setExpanded(false);onClaimMany?.(claimable.map(m=>m.id))}}>{missionBusy?'受取中…':`一括受取（${claimable.length}件）`}</button>{onClose&&<button type="button" className="g4-mission-close" disabled={missionBusy} onClick={onClose}>閉じる</button>}</>;
 const content=<><div className="g4-mission-tabs" role="group" aria-label="任務分類">{[true,false].map(d=><button key={String(d)} type="button" aria-pressed={daily===d} disabled={missionBusy} onClick={()=>setDaily(d)}>{d?'デイリー':'ノーマル'} <small>({missions.filter(m=>missionPresentation(m).daily===d&&m.status==='claimable').length})</small></button>)}</div><div ref={scroll} className="g4-mission-scroll" aria-busy={missionBusy}>
 {previewOnly&&<p className="g4-mission-notice">表示見本です。報酬の受取・挑戦はできません。</p>}{missionStatus&&<p role="status" className="g4-mission-notice">{missionStatus}</p>}{missionError&&<p role="alert" className="g4-mission-notice">{missionError}</p>}{missionError&&onRetryOpen&&<button disabled={missionBusy} onClick={onRetryOpen}>任務の表示を再確認</button>}
 {active.map(row)}{!active.length&&<p className="g4-mission-notice">未受取の任務はありません。</p>}{claimed.length>0&&<div className="g4-mission-claimed"><button type="button" disabled={missionBusy} aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'▾':'▸'} 受取済み（{claimed.length}件）</button>{expanded&&claimed.map(row)}</div>}
 </div></>;
 return <>{onClose?<Modal title="任務" className="g4-mission-modal" hideCloseButton closeDisabled={missionBusy} onClose={onClose} footer={footer}>{content}</Modal>:<div className="g4-mission-inline">{content}<div className="g4-mission-footer">{footer}</div></div>}
 {detail&&<Modal title={detail.rewards?'任務の報酬':'任務の条件'} onClose={()=>setDetail(null)} footer={<button type="button" className="rd-button" onClick={()=>setDetail(null)}>戻る</button>}><h3>{missionPresentation(detail.mission).title}</h3>{detail.rewards?<RewardList items={detail.mission.rewards.flatMap((r,i)=>detail.rewardIndex===undefined||detail.rewardIndex===i?[{key:String(i),name:raidRewardLabel(r).replace(/ ×[\d,]+$/,''),amount:r.amount,image:missionRewardImage(r)}]:[])}/>:<p>{missionPresentation(detail.mission).detail}</p>}</Modal>}</>;
}
