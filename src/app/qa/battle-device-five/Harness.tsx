'use client';
import {useEffect,useState,useRef} from 'react';
import {AudioProvider} from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import type {BattleResult} from '@/domain/redesign/battle';
import one from '../../../../docs/verification/burst-enemy-pause/layout-1.json';
import two from '../../../../docs/verification/burst-enemy-pause/layout-2.json';
import three from '../../../../docs/verification/burst-enemy-pause/layout-3.json';
import wave from '../../../../docs/verification/battle-device-five/wave.json';
import '@/app/components/redesign/redesign.css';
export default function Harness(){
 const [fixture,setFixture]=useState<{result:BattleResult;index:number;mode:string}|null>(null);
 const retireAttempts=useRef(0), saveAttempts=useRef(0);
 const [left,setLeft]=useState(false),[completed,setCompleted]=useState(0),[next,setNext]=useState(0);
 useEffect(()=>{const q=new URLSearchParams(location.search),mode=q.get('mode')??'layout';const r=structuredClone((mode==='wave'?wave:q.get('count')==='1'?one:q.get('count')==='2'?two:three)) as unknown as BattleResult;r.pendingSettlementId='qa-local-only';
  if(q.get('art')==='shibata'){for(const w of r.waves)for(const e of w){e.name='柴田勝家';e.image='/creative/characters/battle/char_noa_01.png';}for(const f of r.frames)for(const e of f.enemies)e.image='/creative/characters/battle/char_noa_01.png';}
  for(const f of r.frames)for(const e of f.enemies)e.statuses=(['atk_up','def_down','dot','shield','counter'] as const).map(type=>({type,power:10,remaining:3,sourceId:e.id,carry:true}));
  const index=mode==='wave'?r.frames.findIndex(f=>f.event==='wave'):mode==='burst'?r.frames.findIndex(f=>f.event==='action_start'&&f.burst):mode.startsWith('complete')?r.frames.length-2:r.frames.findIndex(f=>f.event==='burst_end');setFixture({result:r,index:Math.max(0,index),mode});
 },[]);
 if(!fixture)return null;
 return <AudioProvider><div data-save-attempts={saveAttempts.current} data-completed={completed} data-next={next} data-retire-attempts={retireAttempts.current}>{left?<p role="status">出撃元へ戻りました</p>:<BattleView result={fixture.result} initialFrame={fixture.index} initialPaused={fixture.mode==='layout'} vipActive onRetire={async()=>{const attempt=++retireAttempts.current;await new Promise(resolve=>setTimeout(resolve,fixture.mode==='retire-loading'||fixture.mode==='retire-error'?2200:80));if(fixture.mode==='retire-error'&&attempt===1)throw new Error('通信に失敗しました。もう一度お試しください。');setLeft(true);}} onPlaybackComplete={async()=>{const attempt=++saveAttempts.current;await new Promise(resolve=>setTimeout(resolve,fixture.mode.startsWith('complete-')?2400:80));if(fixture.mode==='complete-error'&&attempt===1)throw new Error('通信に失敗しました。もう一度お試しください。');setCompleted(n=>n+1);}} onComplete={()=>setNext(n=>n+1)} backgroundSrc="/bg/approved-20260925/quest-mikawa.webp"/>}</div></AudioProvider>;
}
