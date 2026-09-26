'use client';
import {useState} from 'react';
import {GameContext} from '@/app/context/GameContext';
import CanonicalDialog from '@/app/components/ui/CanonicalDialog';
import GuideDialog from '@/app/components/ui/GuideDialog';
import {RewardList,GrowthDisplay,StatGrid} from '@/app/components/ui/Game04DataDisplay';
import Game04Loading from '@/app/components/ui/Game04Loading';
import TypewriterText from '@/app/components/redesign/TypewriterText';
export default function Samples(){const [mode,setMode]=useState(''),[done,setDone]=useState(false);return <GameContext.Provider value={{playCyberSe:()=>{}}}><main style={{padding:16}}><h1>共通UI確認用</h1><p>検証用の長文・数量。製品マスターではありません。</p><nav>{['短文','長文・報酬多数','読み込み','無効','ガイド','文字送り','時間別読み込み'].map(m=><button key={m} style={{minHeight:48,margin:4}} onClick={()=>{setDone(false);setMode(m)}}>{m}</button>)}</nav>
{mode==='文字送り'&&<section className="tutorial-copy"><TypewriterText text={'武将の力を合わせ、次の戦へ進もう。'.repeat(30)} revealed={done} onFinished={()=>setDone(true)}/><button onClick={()=>setDone(true)}>全文表示</button></section>}
{mode==='時間別読み込み'&&<Game04Loading context="screen"/>}
{mode==='ガイド'&&<GuideDialog title="次の戦へ" message="部隊を整えて出陣しましょう。" actions={[{label:'出陣',semantic:'primary',onClick:()=>setMode('')}]}/>}
{['短文','長文・報酬多数','読み込み','無効'].includes(mode)&&<CanonicalDialog title="出陣の準備" onClose={()=>setMode('')} loading={mode==='読み込み'} actions={[{label:'戻る',onClick:()=>setMode('')},{label:'出陣',semantic:'primary',disabled:mode==='無効',onClick:()=>setMode('')}]}>{mode==='短文'?<p>部隊を整えました。</p>:mode==='無効'?<p>行動力が足りません。</p>:<><p>{'味方の編成と報酬を確認してください。'.repeat(8)}</p><StatGrid items={[{label:'与ダメージ',value:123456},{label:'撃破',value:12,unit:'体'},{label:'回復',value:1234}]}/><RewardList items={Array.from({length:18},(_,i)=>({key:String(i),name:i%2?'武将EXP小（100 EXP）':'長い報酬名称の表示を確認する検証用アイテム',image:'/ui/sengoku/13-coin.png',amount:10000+i,first:i%3===0}))}/><GrowthDisplay gain={1200} before={3} after={4} progress={{value:20,max:100}}/><p data-end>確認内容の末尾</p></>}</CanonicalDialog>}</main></GameContext.Provider>;}