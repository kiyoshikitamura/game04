'use client';
import {useState} from 'react';
import cutins from '@/app/components/redesign/battle-effects/sr-cutins.json';
export default function Preview(){
 const [id,setId]=useState('char_taiga_01'),[run,setRun]=useState(0);
 return <main style={{background:'#18131e',color:'#fff',minHeight:'100dvh',maxWidth:480,margin:'0 auto'}}>
 <div style={{padding:'10px 12px',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
 <label>SR武将 <select aria-label="SR武将" value={id} onChange={e=>setId(e.target.value)} style={{color:'#111',padding:6}}>{Object.entries(cutins).map(([key,c])=><option key={key} value={key}>{c.name}</option>)}</select></label>
 <button onClick={()=>setRun(n=>n+1)} style={{padding:6,color:'#111',background:'#eee',borderRadius:4}}>もう一度再生</button>
 <small style={{width:'100%'}}>演出確認用：スキルは「土割り」。所持品・戦績には反映されません。</small>
 </div>
 <iframe key={`${id}:${run}`} title="SRカットイン確認用バトル" src={`/qa/battle-device-five?mode=burst&count=1&skillCharacter=${id}&skill=SKD003`} style={{width:'100%',height:'calc(100dvh - 100px)',minHeight:560,border:0,display:'block'}}/>
 </main>;
}
