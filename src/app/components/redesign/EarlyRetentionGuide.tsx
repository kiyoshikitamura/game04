'use client';
import { useEffect, useRef, useState } from 'react';
import type { RedesignState } from '../../../domain/redesign/types';
import { AREA_ONE_COMPLETE_TEXT, nextEarlyGuide } from '../../../domain/redesign/earlyProgress';
import { earlyLoadoutPlan } from '../../../domain/redesign/earlyLoadout';
import { CHARACTER_MASTERS, OWNABLE_SKILL_MASTERS, EQUIPMENT_MASTERS } from '../../../domain/redesign/masters';
import styles from './EarlyRetentionGuide.module.css';
export interface EarlyRetentionProps {
 state: RedesignState;
 battlePlaying: boolean;
 resultOpen: boolean;
 /** Resolves only after the authoritative commit, replacing app state. Reject on save failure. */
 save: (action:string,payload:Record<string,unknown>)=>Promise<unknown>;
 navigate: (destination:'characters'|'missions', options?:{characterId?:string;earlyLoadout?:boolean;tab?:'normal'})=>void;
}
export function EarlyRetentionGuide({state,battlePlaying,resultOpen,save,navigate}: EarlyRetentionProps) {
 const guide=nextEarlyGuide(state,{battlePlaying,resultOpen});
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!guide)return;const previous=document.activeElement as HTMLElement|null;
  dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]);if(!buttons.length){e.preventDefault();return;}const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}};
  document.addEventListener('keydown',trap);return()=>{document.removeEventListener('keydown',trap);previous?.focus();};
 },[guide]);
 if(!guide)return null;
 const content={
  'join-maeda':{title:'前田利家が仲間に加わった',text:'新たな仲間を部隊に加え、四人で次の戦へ進もう。',cta:'部隊に加える',choice:'save'},
  'equip-iwadan':{title:'岩断を獲得',text:'前田利家に岩断を装備しよう。ここで部隊に保存できます。',cta:'前田利家に装備する',choice:'save'},
  'join-takenaka':{title:'竹中半兵衛が仲間に加わった',text:'五人の編成枠が解放されました。武将と役割を整えよう。',cta:'武将・編成へ',choice:'characters'},
  'equip-fire':{title:'火の薙ぎを獲得',text:'井伊直政に全体攻撃を。応急手当をお市の方へ、鬨の声を竹中半兵衛へ整えられます。',cta:'井伊直政に装備する',choice:'characters'},
  missions:{title:'三河を制した',text:AREA_ONE_COMPLETE_TEXT,cta:'任務へ',choice:'missions'},
 }[guide];
 async function act(choice:string){
  if(busy)return;setBusy(true);setError('');
  try{await save('early_guide',{guide,choice});if(choice==='missions')navigate('missions',{tab:'normal'});else if(choice==='characters')navigate('characters',guide==='equip-fire'?{characterId:'char_daimon_01',earlyLoadout:true}:undefined);}
  catch(e){setError(e instanceof Error?e.message:'保存できませんでした。もう一度お試しください。');}
  finally{setBusy(false);}
 }
 return <div className={styles.backdrop}><section ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="early-guide-title">
  <div className={styles.body}><p className={styles.eyebrow}>次の戦へ</p><h2 id="early-guide-title">{content.title}</h2><p className={styles.copy}>{content.text}</p>{error&&<p role="alert">{error}</p>}</div>
  <footer className={styles.actions}><button disabled={busy} onClick={()=>void act(content.choice)}>{busy?'保存中…':content.cta}</button>{(guide==='join-takenaka'||guide==='equip-fire')&&<button className={styles.secondary} disabled={busy} onClick={()=>void act('later')}>あとで</button>}</footer>
 </section></div>;
}
/** Place beside the existing sortie button for mikawa-5. It never intercepts sortie. */
export function EarlySortiePreparation({state,save}:Pick<EarlyRetentionProps,'state'|'save'>){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const plan=earlyLoadoutPlan(state);
 async function apply(){setBusy(true);setError('');setSaved(false);try{await save('early_auto_loadout',{});setSaved(true);}catch(e){setError(e instanceof Error?e.message:'保存できませんでした。');}finally{setBusy(false);}}
 return <section className={styles.preparation} aria-label="おまかせ編成・装備"><h3>五人の力を揃えよう</h3><p>次の内容で部隊を整えます。育成素材は使いません。</p><ul className={styles.plan}>{plan.map(m=><li key={m.characterId}><strong>{CHARACTER_MASTERS.find(c=>c.id===m.characterId)?.name}</strong><span>{m.skillIds.map(id=>OWNABLE_SKILL_MASTERS.find(s=>s.id===id)?.name??id).join('・')||'スキルなし'}</span><small>{Object.values(m.equipment).map(id=>EQUIPMENT_MASTERS.find(e=>e.id===state.equipment.find(e=>e.instanceId===id)?.masterId)?.name).join('・')||'装備なし'}</small></li>)}</ul><button disabled={busy} onClick={()=>void apply()}>{busy?'保存中…':'おまかせ編成・装備'}</button>{error&&<p role="alert">{error}</p>}{saved&&<p role="status">部隊を保存しました。</p>}<p>編成を変えず、そのまま出撃することもできます。</p></section>;
}
