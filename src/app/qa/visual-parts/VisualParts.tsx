'use client';
import { useState } from 'react';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import art from '@/theme/local-characters.json';
import { CharacterCard, BossDisplay } from '@/app/components/redesign/visual-bench/CharacterDisplays';
export default function VisualParts(){
 const [id,setId]=useState(CHARACTER_MASTERS.find(c=>c.name==='くノ一')?.id??CHARACTER_MASTERS[0].id);
 const selected=CHARACTER_MASTERS.find(c=>c.id===id)!;
 const boss=art.find(c=>c.id===selected.id)?.battle;
 return <main style={{maxWidth:390,minHeight:'100dvh',margin:'0 auto',padding:'24px 16px 40px',background:'#151216',color:'#f4efe6',fontFamily:'"Noto Sans JP",sans-serif'}}>
   <a href="/qa/redesign?view=quest" style={{color:'#d8b56d',display:'inline-block',padding:'12px 0'}}>QAへ戻る</a>
   <h1 style={{fontSize:22}}>カード・ボス表示の確認</h1>
   <p style={{fontSize:16,lineHeight:1.7}}>部品確認用。所持・編成・進行は変更しません。</p>
   <label style={{display:'grid',gap:8,fontSize:16}}>表示する武将
     <select value={id} onChange={event=>setId(event.target.value)} style={{width:'100%',minHeight:48,fontSize:16,padding:8,background:'#262127',color:'#f4efe6'}}>
       {CHARACTER_MASTERS.map(c=><option key={c.id} value={c.id}>{c.rarity} {c.name}</option>)}
     </select>
   </label>
   <section style={{marginTop:24}}><h2 style={{fontSize:20}}>共通カード</h2><div style={{display:'flex',justifyContent:'center'}}><CharacterCard key={id} subject={selected}/></div></section>
   <section style={{marginTop:32}}><h2 style={{fontSize:20}}>ボス展示</h2>{boss?<BossDisplay key={id} subject={selected}/>:<p>この武将のバトル素材は未割り当てです。</p>}</section>
 </main>;
}
