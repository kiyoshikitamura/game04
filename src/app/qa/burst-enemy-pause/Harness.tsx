'use client';
import {useEffect,useState} from 'react';
import {AudioProvider} from '@/audio/AudioProvider';
import BattleView from '@/app/components/redesign/BattleView';
import type {BattleResult} from '@/domain/redesign/battle';
import one from '../../../../docs/verification/burst-enemy-pause/layout-1.json';
import two from '../../../../docs/verification/burst-enemy-pause/layout-2.json';
import three from '../../../../docs/verification/burst-enemy-pause/layout-3.json';
import centerNormal from '../../../../docs/verification/burst-enemy-pause/layout-center-normal.json';
import fallen from '../../../../docs/verification/burst-enemy-pause/layout-fallen.json';
import early from '../../../../docs/verification/burst-enemy-pause/early.json';
import '@/app/components/redesign/redesign.css';
export default function Harness(){const [query,setQuery]=useState<URLSearchParams|null>(null);useEffect(()=>setQuery(new URLSearchParams(location.search)),[]);if(!query)return null;const result=(query.get('early')?early:query.get('mode')==='fallen'?fallen:query.get('mode')==='center-normal'?centerNormal:query.get('count')==='1'?one:query.get('count')==='2'?two:three) as unknown as BattleResult;const playing=query.has('play');return <AudioProvider><BattleView result={result} initialPaused={!playing} initialFrame={playing?0:Number(query.get('frame')??result.frames.findIndex(f=>f.event==='burst_end'))} vipActive onComplete={()=>{}} backgroundSrc="/bg/approved-20260925/quest-mikawa.webp"/></AudioProvider>}
