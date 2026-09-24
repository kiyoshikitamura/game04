'use client';
import { displaySkillDescription } from './battleLabels';
import { useEffect, useRef, useState } from 'react';
import type { BattleUnit, RaidRoom, RedesignState, Reward } from '../../../domain/redesign/types';
import { buildBattleParty } from '../../../domain/redesign/masters';
import { getRoomRaidMaster, raidEnemy, raidEnemies } from '../../../domain/redesign/raid';
import { raidElementLabels, raidRescueWindow, raidRewardLabel, raidTimeRemaining } from '../../../domain/redesign/raidPresentation';
import CanonicalDialog from '../ui/CanonicalDialog';
import PreparationModal from './PreparationModal';
import { characterArt } from '../../../theme/creativeAssets';
import { RaidApprovedCard, RaidApprovedDetailVisual, RaidApprovedContribution, RaidApprovedChallenge, RaidApprovedIcon } from '../raid/RaidApprovedVisual';
import './RaidView.css';
export interface RaidViewProps { state:RedesignState;rooms:RaidRoom[];party:BattleUnit[];onAction:(action:Record<string,unknown>)=>Promise<unknown>;onOpenDeck:(roomId:string,level:number)=>void;initialRoomId?:string;initialPreparationLevel?:number; }
function Rewards({rewards}:{rewards:Reward[]}) {return <ul>{rewards.map((r,i)=><li key={`${r.kind}-${i}`}>{raidRewardLabel(r)}{r.chance !== undefined && <span>（基本確率 {Math.round(r.chance * 100)}%）</span>}</li>)}</ul>;}
export default function RaidView({state,rooms,party,onAction,onOpenDeck,initialRoomId,initialPreparationLevel}:RaidViewProps){
 const [selected,setSelected]=useState<string|null>(initialRoomId??null),[filter,setFilter]=useState('all'),[modal,setModal]=useState<string|null>(initialPreparationLevel!==undefined?'prepare':null),[now,setNow]=useState(()=>Date.now()),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const lock=useRef(false);
 const root=useRef<HTMLElement>(null);
 const [summaryHeight,setSummaryHeight]=useState(470);
 const [compactHeight,setCompactHeight]=useState(164);
 const [battleLevel,setBattleLevel]=useState<number|null>(initialPreparationLevel??null);
 const [compact,setCompact]=useState(false);
 useEffect(()=>{const scroller=root.current?.closest('.rd-shell');if(!scroller)return;scroller.scrollTop=0;const update=()=>{setCompactHeight(scroller.clientWidth>=480?205:164);const hero=root.current?.querySelector<HTMLElement>('.raid-approved-detail__hero');if(hero){const owner=hero.nextElementSibling as HTMLElement;const battle=owner?.nextElementSibling as HTMLElement;setSummaryHeight(hero.offsetHeight+(owner?.offsetHeight??0)+(battle?.offsetHeight??0));}setCompact(scroller.scrollTop>200);};update();scroller.addEventListener('scroll',update,{passive:true});return()=>scroller.removeEventListener('scroll',update);},[selected]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const room=rooms.find(r=>r.id===selected),master=room?getRoomRaidMaster(room):null,me=room?.participants.find(p=>p.userId===state.userId),enemy=master&&room?raidEnemy(master,room.level):null;
 const active=(r:RaidRoom)=>r.status==='active'&&Date.parse(r.expiresAt)>now;
 const live=rooms.filter(active).filter(r=>filter==='all'||getRoomRaidMaster(r).type===filter).sort((a,b)=>Date.parse(a.expiresAt)-Date.parse(b.expiresAt));
 async function run(action:string,extra:Record<string,unknown>={}){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await onAction({action,roomId:selected,...extra});setModal(null);}catch(e){setError(e instanceof Error?e.message:'処理に失敗しました。再度お試しください。');}finally{lock.current=false;setBusy(false);}}
 const select=(r:RaidRoom)=>{setSelected(r.id);setModal(null);setError('');};
 function visual(value:RaidRoom){
  const m=getRoomRaidMaster(value),e=raidEnemy(m,value.level),owner=value.participants.find(p=>p.userId===value.ownerId);
  const percent=value.maxHp>0?Math.max(0,Math.min(100,value.hp/value.maxHp*100)):0;
  return {bossName:m.name,characterUrl:characterArt(e,'full'),backgroundUrl:m.backgroundUrl??'/bg/raid/raid-castle-moonlight-v1.webp',ownerName:owner?.name??'開催者情報を取得できません',ownerImageUrl:owner?.portraitUrl,
   attributeLabel:raidElementLabels[e.element],attributeIconUrl:`/ui/raid/v2/element-${e.element}.png`,levelLabel:`Lv.${value.level}`,hpPercent:percent,
   hpText:`HP ${Math.ceil(percent)}%`,hpValueLabel:`HP ${value.hp.toLocaleString()} / ${value.maxHp.toLocaleString()}（${Math.ceil(percent)}%）`,
   remainingLabel:active(value)?raidTimeRemaining(value.expiresAt,now):value.status==='defeated'?'討伐成功':'開催終了',participantLabel:`${value.participants.filter(p=>!p.leftAt).length}/${m.maxParticipants}人`,
   badgeLabel:m.type==='encounter'?'エンカウント':'領土侵攻',statusLabel:value.participants.some(p=>p.userId===state.userId&&!p.leftAt)?'参加中':value.rescueCount?'救援中':'',
   areaLabel:m.type==='encounter'?'エンカウント':'領土侵攻',guildLabel:'',expiryLabel:'',capacityLabel:''};
 }
 function renderCard(value:RaidRoom){const data=visual(value);return <RaidApprovedCard key={value.id} data={data} action={<button disabled={busy} onClick={()=>select(value)} aria-label={`${data.bossName}の詳細`}>{data.statusLabel==='参加中'?'続きへ':'詳細へ'} ›</button>}/>;}
 const window=room&&master?raidRescueWindow(master.type,room.rescueCount,room.rescueWindowStartedAt,now):null;
 const available=room&&active(room)&&!me?.leftAt;
 const history=rooms.filter(r=>!active(r)&&r.participants.some(p=>p.userId===state.userId));
 return <section ref={root} className={`rd-raid ${room?'rd-raid--detail':''}`} aria-busy={busy}>
 {error&&<p role="alert" className="rd-raid-error">{error}</p>}
 {!room||!master||!enemy?<><div className="rd-raid-heading"><h1>共闘</h1><button disabled={busy} onClick={()=>void run('raid_refresh')}>更新</button></div><nav className="rd-raid-tabs" aria-label="共闘種別">{[['all','すべて'],['encounter','エンカウント'],['unlock','領土侵攻']].map(([id,label])=><button key={id} aria-pressed={filter===id} disabled={busy} onClick={()=>setFilter(id)}>{label}</button>)}</nav><div className="rd-raid-cards">{live.length?live.map(renderCard):<p className="rd-panel">開催中の共闘はありません。</p>}</div><button className="rd-raid-history" disabled={busy} onClick={()=>setModal('history')}><RaidApprovedIcon name="chest"/>終了した共闘・未受取報酬<span>›</span></button></>:<>
 <button className="rd-raid-back" disabled={busy} onClick={()=>setSelected(null)}>‹ 共闘一覧</button>
 <div className="rd-raid-detail-stage" style={{paddingTop:compact?Math.max(0,summaryHeight-compactHeight):0}}>
 <RaidApprovedDetailVisual data={visual(room)} compact={compact}
 actions={([['enemy','敵情報','swords'],['participants','参加者','people'],['rewards','報酬','scroll'],['rescue','救援','handshake']] as const).map(([id,label,icon])=><button disabled={busy} key={id} onClick={()=>setModal(id)}><RaidApprovedIcon name={icon}/>{label}</button>)}
 contribution={<RaidApprovedContribution damageLabel={me?.lastResult??'未挑戦'} damageValue={(me?.totalDamage??0).toLocaleString()} battlesLabel={`${me?.attempts??0}戦`} victoryLabel={`${me?.wins??0}勝`} recentLabel={me?.lastResult??'未挑戦'} eligibilityLabel={(me?.wins??0)>=3?'討伐報酬資格 取得済み':`討伐報酬資格まで あと${3-(me?.wins??0)}勝`} progressLabel={me?`参加時の共通進行　Lv.${me.joinedLevel}${me.leftAt?'　退出済み':''}`:'未参加'} completed={me?.wins??0}/>}
 challenge={available?<RaidApprovedChallenge><button disabled={busy||(!me&&room.participants.filter(p=>!p.leftAt).length>=master.maxParticipants)} onClick={()=>{if(!me){void run('raid_join');return;}setBattleLevel(room.level);setModal(master.type==='unlock'&&room.level>(me.joinedLevel??1)?'level':'prepare');}}><RaidApprovedIcon name="swords"/><strong>{me?'挑む':'参加する'}</strong>{me&&<span><img src="/ui/sengoku/14-energy.png" alt=""/>消費行動力 {master.energyCost}</span>}</button></RaidApprovedChallenge>:<button className="rd-raid-history" disabled={busy} onClick={()=>setModal('rewards')}>報酬を確認する</button>}/>
 </div>
 {me&&!me.leftAt&&room.ownerId!==state.userId&&active(room)&&<button className="rd-button" disabled={busy} onClick={()=>setModal('leave')}>この共闘から退出</button>}
 </>}
 {modal==='history'&&<CanonicalDialog title="終了した共闘・未受取報酬" onClose={busy?undefined:()=>setModal(null)}>{history.length?history.map(r=><button className="rd-button" key={r.id} onClick={()=>select(r)}>{getRoomRaidMaster(r).name} · {r.status==='defeated'?'討伐成功':'終了'}{r.rewardGrants.some(g=>g.userId===state.userId&&!g.claimed)?' · 未受取あり':''}</button>):<p>終了した共闘はありません。</p>}</CanonicalDialog>}
 {room&&master&&enemy&&modal==='enemy'&&<CanonicalDialog title="敵情報" onClose={busy?undefined:()=>setModal(null)}>{raidEnemies(master,room.level).map(unit=><section key={unit.id}><h3>{unit.name} Lv.{unit.level} · {raidElementLabels[unit.element]}属性</h3><p>HP {unit.stats.hp.toLocaleString()} / ATK {unit.stats.atk.toLocaleString()} / DEF {unit.stats.def.toLocaleString()}</p><p>開始SP {unit.initialSp??unit.stats.sp} / 上限 {unit.stats.sp} · 行動カウント {unit.actionCount}</p>{unit.skills.length>0&&<><h4>所持スキル</h4>{unit.skills.map(skill=><p key={skill.id}>{skill.name} · 消費SP {skill.spCost}<br/>{displaySkillDescription(skill.description)}</p>)}</>}{!!unit.phases?.length&&<><h4>フェーズチェンジ</h4>{unit.phases.map(phase=><p key={phase.name}>HP {Math.round(phase.hpBelow*100)}%以下：{phase.name} · 行動カウント {phase.actionCount??unit.actionCount}</p>)}</>}</section>)}<p>勝利時、共通HPへの与ダメージは{master.victoryMultiplier}倍になります。</p></CanonicalDialog>}
 {room&&modal==='participants'&&<CanonicalDialog title="参加者" onClose={busy?undefined:()=>setModal(null)}><ul className="rd-raid-participants">{room.participants.map(p=><li key={p.userId}><strong>{p.name}{p.userId===state.userId?'（自分）':''}</strong><span>{p.wins}勝 / {p.totalDamage.toLocaleString()}ダメージ{p.leftAt?' · 退出済み':''}</span></li>)}</ul></CanonicalDialog>}
 {room&&master&&modal==='rewards'&&<CanonicalDialog title="報酬" onClose={busy?undefined:()=>setModal(null)} actions={[{label:'受け取る',semantic:'primary',disabled:busy||!room.rewardGrants.some(g=>g.userId===state.userId&&!g.claimed),onClick:()=>run('raid_claim')}]}>{error&&<p role="alert" className="rd-raid-error">{error}</p>}{master.participationRewards.length>0&&<><h3>参加報酬</h3><Rewards rewards={master.participationRewards}/></>}{!!master.victoryRewards?.length&&<><h3>個別バトル勝利報酬</h3><Rewards rewards={master.victoryRewards}/><p>確率付きの報酬は抽選です。LUKにより獲得率が上がります。</p></>}<h3>{master.type==='unlock'?'各Lv討伐報酬':'討伐報酬'}</h3><Rewards rewards={master.defeatRewards}/><p>{(me?.wins??0)>=3?'資格取得済み':`あと${3-(me?.wins??0)}勝で討伐報酬資格`}</p>{master.participationRewards.length>0&&<p>参加報酬は初回戦闘後に受け取れます。</p>}<p>討伐報酬は資格取得後に討伐された敵が対象です。</p>{master.type==='unlock'&&<p>参加前・資格取得前に討伐済みのLv報酬は配布されません。次の出撃は現在の共有Lv.{room.level}から開始します。</p>}<p>受取待ち {room.rewardGrants.filter(g=>g.userId===state.userId&&!g.claimed).length}件</p></CanonicalDialog>}
 {room&&master&&window&&modal==='rescue'&&<CanonicalDialog title="救援依頼" onClose={busy?undefined:()=>setModal(null)} actions={[{label:'救援を依頼',semantic:'primary',disabled:busy||!available||!me||window.remaining===0,onClick:()=>run('raid_rescue')}]}>{error&&<p role="alert" className="rd-raid-error">{error}</p>}<p>残り {window.remaining} / 3回</p><p>公開先：全体チャット・アクティビティ</p>{window.resetsAt?<p>次回回復：{raidTimeRemaining(window.resetsAt,now)}後（6時間ごと）</p>:<p>この共闘で合計3回まで依頼できます。</p>}</CanonicalDialog>}
 {modal==='leave'&&<CanonicalDialog title="共闘から退出" onClose={busy?undefined:()=>setModal(null)} actions={[{label:'戻る',onClick:()=>setModal(null)},{label:'退出する',semantic:'danger',disabled:busy,onClick:()=>run('raid_leave')}]}>{error&&<p role="alert" className="rd-raid-error">{error}</p>}<p>退出すると、この共闘への参加権を放棄します。再参加はできません。</p></CanonicalDialog>}
 {modal==='level'&&room&&master&&<CanonicalDialog title="挑戦する段階" onClose={busy?undefined:()=>setModal(null)} actions={[{label:'出撃準備へ',semantic:'primary',onClick:()=>setModal('prepare')}]}><label>領土侵攻 Lv.<select aria-label="挑戦するレイド段階" value={battleLevel??room.level} onChange={event=>setBattleLevel(Number(event.target.value))}>{Array.from({length:Math.max(1,room.level-(me?.joinedLevel??1)+1)},(_,index)=>index+(me?.joinedLevel??1)).reverse().map(level=><option key={level} value={level}>{level}{level===room.level?'（現在）':'（再挑戦）'}</option>)}</select></label></CanonicalDialog>}
 {modal==='prepare'&&room&&master&&<PreparationModal title={`${raidEnemy(master,battleLevel??room.level).name} Lv.${raidEnemy(master,battleLevel??room.level).level} · ${raidElementLabels[raidEnemy(master,battleLevel??room.level).element]}属性`} ownedCharacters={state.characters} party={room.territorySnapshot ? buildBattleParty(state, room.territorySnapshot.battleRules) : party} commonSpMax={room.territorySnapshot && room.territorySnapshot.battleRules.version !== 'common-v2-20260920' ? null : 400} energy={state.energy} energyCost={master.energyCost} busy={busy} error={error} onBack={()=>setModal(null)} onOpenDeck={()=>{setModal(null);onOpenDeck(room.id,battleLevel??room.level);}} onConfirm={()=>void run('raid_battle',{level:battleLevel??room.level})}/>}
 </section>;
}
