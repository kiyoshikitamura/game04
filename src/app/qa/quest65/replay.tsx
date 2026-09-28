'use client';
import {useState} from 'react';
import BattleView from '@/app/components/redesign/BattleView';
import type {BattleResult} from '@/domain/redesign/battle';
export default function Replay({result,stage,seed,frame,paused}:{result:BattleResult;stage:string;seed:number;frame:number;paused:boolean}) {
  const [started,setStarted]=useState(false);
  return <main style={{maxWidth:430,margin:'0 auto',background:'#120d09',color:'#ead3aa',minHeight:'100vh'}}>
    <p>表示確認専用・保存なし：{stage} / seed {seed}</p>
    {!started?<button onClick={()=>setStarted(true)}>測定再生を開始</button>:<BattleView result={result} title={`${stage} 承認入力`} vipActive onComplete={()=>setStarted(false)} initialFrame={frame} initialPaused={paused}/>}
  </main>;
}
