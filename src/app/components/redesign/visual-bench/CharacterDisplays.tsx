'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import art from '@/theme/local-characters.json';
import backgrounds from '@/theme/character-backgrounds.json';
import styles from './CharacterDisplays.module.css';

type Element = 'fire'|'water'|'earth'|'wind'|'light'|'dark';
export type DisplaySubject = { id:string; name:string; rarity:'N'|'R'|'SR'|'SSR'; element:Element };
export const CARD_OPENINGS = {
  N: { top: 7.2, right: 6.7, bottom: 7.1, left: 6.9 },
  R: { top: 7.2, right: 6.7, bottom: 7.1, left: 6.9 },
  SR: { top: 7.3, right: 6.6, bottom: 7.1, left: 6.9 },
  SSR: { top: 8.0, right: 7.2, bottom: 8.1, left: 7.4 },
} as const;
// The existing public/ui/rarity files are not accepted as GAME04 formal assets until their provenance is confirmed.
export const FORMAL_RARITY_BADGES: Record<DisplaySubject['rarity'], string | null> = { N: null, R: null, SR: null, SSR: null };
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
    // Retain measured bounds, not decoded full-resolution Image objects for the session.
    task.then(()=>pending.delete(src),()=>pending.delete(src));
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
const artworkBoxes = new Map<string, Box>();
const preparingArtwork = new Map<string, Promise<Box>>();
function artworkDefinition(subject: DisplaySubject, variant: 'card'|'battle') {
  const source = art.find(row => row.id === subject.id)?.[variant];
  const background = variant === 'card' ? '/creative/card-backgrounds/' + subject.rarity + '.png' : backgrounds.find(row => row.characterId === subject.id)?.background;
  const frame = '/creative/ui/frame-' + subject.rarity + '.png';
  const element = '/creative/ui/element-' + subject.element + '.png';
  return { source, background, frame, element, key: [source, background, frame, element, variant].join('|'), variant };
}
function prepareArtwork(asset: ReturnType<typeof artworkDefinition>): Promise<Box> {
  const cached = artworkBoxes.get(asset.key);
  if (cached) return Promise.resolve(cached);
  const pendingTask = preparingArtwork.get(asset.key);
  if (pendingTask) return pendingTask;
  if (!asset.source || !asset.background) return Promise.reject(new Error('画像を読み込めませんでした'));
  const required = asset.variant === 'card' ? [asset.source, asset.background, asset.frame, asset.element] : [asset.source, asset.background, asset.element];
  const task = Promise.all(required.map(readImage)).then(([person]) => {
    const box = visibleBox(person); artworkBoxes.set(asset.key, box); return box;
  });
  preparingArtwork.set(asset.key, task);
  task.finally(() => preparingArtwork.delete(asset.key)).catch(() => {});
  return task;
}
/** Parent dialog owns one loading state; cards reuse its decoded artwork and measured crop. */
export function useArtworkPreload(subjects: DisplaySubject[], variant: 'card'|'battle') {
  const definitions = subjects.map(subject => artworkDefinition(subject, variant));
  const key = definitions.map(asset => asset.key).sort().join('\n');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: '', attempt: -1, failed: false });
  useEffect(() => {
    let active = true;
    Promise.all(definitions.map(prepareArtwork)).then(() => {
      if (active) setResult({ key, attempt, failed: false });
    }, () => { if (active) setResult({ key, attempt, failed: true }); });
    return () => { active = false; };
  }, [key, attempt]);
  return { ready: definitions.every(asset => artworkBoxes.has(asset.key)),
    failed: result.key === key && result.attempt === attempt && result.failed,
    retry: () => setAttempt(value => value + 1) };
}
function useArtwork(subject:DisplaySubject,variant:'card'|'battle') {
  const asset = artworkDefinition(subject, variant);
  const [attempt,setAttempt]=useState(0);
  const [result,setResult]=useState<{key:string;box?:Box;error?:string}>({key:''});
  useEffect(()=>{
    let active=true;
    prepareArtwork(asset).then(box => { if(active)setResult({key:asset.key,box}); })
      .catch(()=>{if(active)setResult({key:asset.key,error:'画像を読み込めませんでした'});});
    return ()=>{active=false;};
  },[asset.key,attempt]);
  return {...asset,box:artworkBoxes.get(asset.key) ?? (result.key===asset.key?result.box:undefined),
    error:result.key===asset.key?result.error:undefined,retry:()=>setAttempt(value=>value+1)};
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
    <img className={styles.element} src={src} alt={`${labels[element]}属性`}/>
  </span>;
}
export function RarityBadge({rarity}:{rarity:DisplaySubject['rarity']}){
  const src=FORMAL_RARITY_BADGES[rarity];
  return src ? <img className={styles.rarityBadge} src={src} alt={`${rarity}レアリティ`}/> : null;
}
export function CharacterCard({subject,compact=false,className,hideMarks=false}:{subject:DisplaySubject;compact?:boolean;className?:string;hideMarks?:boolean}){
  const asset=useArtwork(subject,'card');
  const visible=usePageVisible();
  const phase=Array.from(subject.id).reduce((sum,c)=>sum+c.charCodeAt(0),0)%5000;
  const opening=CARD_OPENINGS[subject.rarity];
  const openingStyle={ '--open-top': `${opening.top}%`, '--open-right': `${opening.right}%`, '--open-bottom': `${opening.bottom}%`, '--open-left': `${opening.left}%`, '--phase': `${-phase}ms` } as CSSProperties;
  return <figure className={[styles.card,compact?styles.compact:'',className??''].filter(Boolean).join(' ')} data-rarity={subject.rarity} data-paused={!visible} aria-label={subject.name+' '+subject.rarity+' '+labels[subject.element]} style={openingStyle}>
    {!asset.box||!asset.source||!asset.background?<Pending error={asset.error} retry={asset.retry}/>:<>
      <div className={styles.cardArt}>
        <img className={styles.backdrop} src={asset.background} alt=""/>
        <div className={styles.cardOpening}>
          <div className={styles.cardPerson}><Person src={asset.source} box={asset.box}/></div>
        </div>
        <img className={styles.frame} src={asset.frame} alt=""/>
        <span className={styles.sheen} aria-hidden="true"/>
        <span className={styles.aura} aria-hidden="true"/>
        {!hideMarks && <ElementMark src={asset.element} element={subject.element}/>}
        {!hideMarks && <RarityBadge rarity={subject.rarity}/>}
      </div>
      <figcaption className={styles.caption}>{subject.name}</figcaption>
    </>}
  </figure>;
}
export function BossDisplay({subject,compact=false,className,hideCaption=false,presentation='card'}:{subject:DisplaySubject;compact?:boolean;className?:string;hideCaption?:boolean;presentation?:'card'|'quest'}){
  const asset=useArtwork(subject,'battle');
  return <figure className={[styles.boss,compact?styles.compact:'',presentation==='quest'?styles.questBoss:'',className??''].filter(Boolean).join(' ')} aria-label={'ボス '+subject.name}>
    {!asset.box||!asset.source||!asset.background?<Pending error={asset.error} retry={asset.retry}/>:<>
      <div className={styles.bossArt}>
        <img className={styles.backdrop} src={asset.background} alt=""/>
        <div className={styles.shade}/>
        <div className={styles.bossPerson}><Person src={asset.source} box={asset.box}/></div>
      </div>
      {!hideCaption && <figcaption className={styles.bossCaption}><ElementMark src={asset.element} element={subject.element} className={styles.bossElement}/><strong>{subject.name}</strong></figcaption>}
    </>}
  </figure>;
}
