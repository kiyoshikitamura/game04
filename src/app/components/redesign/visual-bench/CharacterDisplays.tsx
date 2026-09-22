'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import art from '@/theme/local-characters.json';
import backgrounds from '@/theme/character-backgrounds.json';
import styles from './CharacterDisplays.module.css';

type Element = 'fire'|'water'|'earth'|'wind'|'light'|'dark';
export type DisplaySubject = { id:string; name:string; rarity:'N'|'R'|'SR'|'SSR'; element:Element };
type Box = { x:number; y:number; width:number; height:number; naturalWidth:number; naturalHeight:number };
const labels:Record<Element,string>={fire:'火',water:'水',earth:'土',wind:'風',light:'光',dark:'闇'};
const pending = new Map<string,Promise<HTMLImageElement>>();
function readImage(src:string) {
  let task=pending.get(src);
  if(!task) {
    task=new Promise<HTMLImageElement>((resolve,reject)=>{
      const image=new window.Image();
      image.onload=()=>image.decode().then(()=>resolve(image),reject);
      image.onerror=()=>reject(new Error(src));
      image.src=src;
    });
    pending.set(src,task);
    task.catch(()=>pending.delete(src));
  }
  return task;
}
// Measure transparent margins for display only. The original asset is never rewritten.
function visibleBox(image:HTMLImageElement):Box {
  const width=image.naturalWidth, height=image.naturalHeight;
  const ratio=Math.min(1,384/Math.max(width,height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(width*ratio));
  canvas.height=Math.max(1,Math.round(height*ratio));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx) throw new Error('画像の表示領域を取得できません');
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    if(pixels[(y*canvas.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  }
  if(right<left)throw new Error('人物画像が透明です');
  left=Math.max(0,left-2);top=Math.max(0,top-2);
  right=Math.min(canvas.width-1,right+2);bottom=Math.min(canvas.height-1,bottom+2);
  return {x:left/ratio,y:top/ratio,width:(right-left+1)/ratio,height:(bottom-top+1)/ratio,naturalWidth:width,naturalHeight:height};
}
function useArtwork(subject:DisplaySubject,variant:'card'|'battle') {
  const entry=art.find(row=>row.id===subject.id);
  const source=entry?.[variant];
  const background=backgrounds.find(row=>row.characterId===subject.id)?.background;
  const frame='/creative/ui/frame-'+subject.rarity+'.png';
  const element='/creative/ui/element-'+subject.element+'.png';
  const [attempt,setAttempt]=useState(0);
  const key=[source,background,frame,element,variant,attempt].join('|');
  const [result,setResult]=useState<{key:string;box?:Box;error?:string}>({key:''});
  useEffect(()=>{
    let active=true;
    if(!source||!background){setResult({key,error:'必要な素材の割り当てがありません'});return;}
    const required=variant==='card'?[source,background,frame,element]:[source,background,element];
    Promise.all(required.map(readImage)).then(([person])=>{
      const box=visibleBox(person);
      if(active)setResult({key,box});
    }).catch(()=>{if(active)setResult({key,error:'画像を読み込めませんでした'});});
    return ()=>{active=false;};
  },[key,source,background,frame,element,variant]);
  return {source,background,frame,element,box:result.key===key?result.box:undefined,
    error:result.key===key?result.error:undefined,retry:()=>setAttempt(value=>value+1)};
}
function usePageVisible(){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
  return visible;
}
function Person({src,box}:{src:string;box:Box}){
  return <svg className={styles.person} viewBox={[box.x,box.y,box.width,box.height].join(' ')} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <image href={src} width={box.naturalWidth} height={box.naturalHeight}/>
  </svg>;
}
function Pending({error,retry}:{error?:string;retry:()=>void}){
  return <div className={styles.pending} role={error?'alert':'status'}>
    {error?<><p>{error}</p><button type="button" onClick={retry}>再読み込み</button></>:<><span className={styles.spinner}/><span>読み込み中</span></>}
  </div>;
}
function ElementMark({src,element,className}:{src:string;element:Element;className?:string}){
  return <span className={className ? `${styles.elementMark} ${className}` : styles.elementMark}>
    <img className={styles.element} src={src} alt=""/>
    <span className={styles.elementLabel}>{labels[element]}</span>
  </span>;
}
export function CharacterCard({subject,compact=false,className}:{subject:DisplaySubject;compact?:boolean;className?:string}){
  const asset=useArtwork(subject,'card');
  const visible=usePageVisible();
  const phase=Array.from(subject.id).reduce((sum,c)=>sum+c.charCodeAt(0),0)%5000;
  return <figure className={[styles.card,compact?styles.compact:'',className??''].filter(Boolean).join(' ')} data-rarity={subject.rarity} data-paused={!visible} aria-label={subject.name+' '+subject.rarity+' '+labels[subject.element]+'属性'} style={{'--phase':(-phase)+'ms'} as CSSProperties}>
    {!asset.box||!asset.source||!asset.background?<Pending error={asset.error} retry={asset.retry}/>:<>
      <div className={styles.cardArt}>
        <img className={styles.backdrop} src={asset.background} alt=""/>
        <div className={styles.cardPerson}><Person src={asset.source} box={asset.box}/></div>
        <img className={styles.frame} src={asset.frame} alt=""/>
        <span className={styles.sheen} aria-hidden="true"/>
        <span className={styles.aura} aria-hidden="true"/>
        <ElementMark src={asset.element} element={subject.element}/>
        <span className={styles.rarity}>{subject.rarity}</span>
      </div>
      <figcaption className={styles.caption}>{subject.name}</figcaption>
    </>}
  </figure>;
}
export function BossDisplay({subject,compact=false,className}:{subject:DisplaySubject;compact?:boolean;className?:string}){
  const asset=useArtwork(subject,'battle');
  return <figure className={[styles.boss,compact?styles.compact:'',className??''].filter(Boolean).join(' ')} aria-label={'ボス '+subject.name}>
    {!asset.box||!asset.source||!asset.background?<Pending error={asset.error} retry={asset.retry}/>:<>
      <div className={styles.bossArt}>
        <img className={styles.backdrop} src={asset.background} alt=""/>
        <div className={styles.shade}/>
        <div className={styles.bossPerson}><Person src={asset.source} box={asset.box}/></div>
      </div>
      <figcaption className={styles.bossCaption}><ElementMark src={asset.element} element={subject.element} className={styles.bossElement}/><strong>{subject.name}</strong></figcaption>
    </>}
  </figure>;
}
