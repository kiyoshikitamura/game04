"use client";
import { useLayoutEffect, type RefObject } from 'react';
import { beginPresentation } from './presentationTasks';
import { PRESENTATION } from './presentationSettings';
const decoded = new Set<string>();
const elements = new WeakMap<HTMLImageElement, {id:number; ready?:string}>();
let elementId=0;
const imageSource=(img:HTMLImageElement)=>img.getAttribute('srcset') ? img.currentSrc||img.src : img.src;
function decodeElement(img:HTMLImageElement):Promise<void>{
 const source=imageSource(img);
 if(elements.get(img)?.ready===source)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  let settled=false;
  const timer=setTimeout(()=>{settled=true;reject(new Error('timeout'));},PRESENTATION.assetTimeoutMs);
  if(img.complete&&!img.naturalWidth)img.src=img.src;
  void img.decode().then(()=>{if(settled)return;settled=true;clearTimeout(timer);const record=elements.get(img);if(record)record.ready=source;resolve();},error=>{if(settled)return;settled=true;clearTimeout(timer);reject(error);});
 });
}
const pending = new Map<string, Promise<void>>();
function prepare(url: string): Promise<void> {
  if (decoded.has(url)) return Promise.resolve();
  const existing = pending.get(url); if(existing) return existing;
  const promise = new Promise<void>((resolve,reject) => {
    const image = new Image();
    let settled = false;
    const timer = setTimeout(()=>finish(new Error('timeout')),PRESENTATION.assetTimeoutMs);
    const finish = (error?: Error) => { if(settled)return;settled=true;clearTimeout(timer); image.onload=null;image.onerror=null; if(error)reject(error);else{decoded.add(url);resolve();} };
    image.onload = () => { void image.decode().then(()=>finish(),()=>finish(new Error('decode'))); };
    image.onerror = () => finish(new Error('image'));
    image.src = url;
  }).finally(()=>pending.delete(url));
  pending.set(url,promise);return promise;
}
// Visibility from the preparation gate itself must not exclude its children.
function isRequired(node: HTMLElement) {
  return !node.closest('[hidden], [data-image-gate-ignore]') &&
    node.getClientRects().length > 0 && getComputedStyle(node).display !== 'none';
}
function sources(root: HTMLElement) {
  const urls = new Set<string>();
  for(const node of [root,...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
    if(!isRequired(node))continue;
    if(node instanceof HTMLImageElement && node.getAttribute('src')) urls.add(imageSource(node));
    const background=getComputedStyle(node).backgroundImage;
    for(const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(new URL(match[1],location.href).href);
  }
  return [...urls];
}
/** Only currently mounted, displayed screen/dialog images; no future detail preloads. */
export function usePreparedImages(ref: RefObject<HTMLElement | null>, screenKey?: unknown) {
  useLayoutEffect(()=>{
    const root=ref.current;if(!root)return;
    const transition=beginPresentation();
    const paint=requestAnimationFrame(()=>transition.end());
    let disposed=false, generation=0, signature:string|undefined, release:(()=>void)|undefined;
    const check=(force=false)=>{
      const urls=sources(root);
      const images=Array.from(root.querySelectorAll('img')).filter(img=>isRequired(img)&&!!img.getAttribute('src'));
      for(const img of images)if(!elements.has(img))elements.set(img,{id:++elementId});
      const next=urls.join('|')+'#'+images.map(img=>`${elements.get(img)!.id}:${imageSource(img)}`).join('|');
      if(!force&&signature===next)return;signature=next;
      const waiting=urls.filter(url=>!decoded.has(url));
      generation++;const current=generation;release?.();release=undefined;
      if(!waiting.length&&images.every(img=>elements.get(img)?.ready===imageSource(img))){root.classList.remove('g4-preparing');root.setAttribute('data-images-ready','true');root.removeAttribute('aria-busy');return;}
      root.classList.add('g4-preparing');root.setAttribute('aria-busy','true');
      const task=beginPresentation();release=task.end;
      void Promise.all(waiting.map(prepare)).then(async()=>{
        if(disposed||generation!==current)return;
        await Promise.all(images.map(decodeElement));
      }).then(()=>{
        if(disposed||generation!==current)return;
        root.classList.remove('g4-preparing');root.setAttribute('data-images-ready','true');root.removeAttribute('aria-busy');task.end();
        root.dispatchEvent(new CustomEvent('g4:images-ready',{bubbles:true}));
      },()=>{if(!disposed&&generation===current)task.fail(()=>check(true));});
    };
    check();
    const refresh=()=>check();
    const observer=new MutationObserver(refresh);
    observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset','sizes','class','style','hidden','open','data-image-gate-ignore']});
    window.addEventListener('resize',refresh);
    root.addEventListener('load',refresh,true);
    return()=>{window.removeEventListener('resize',refresh);root.removeEventListener('load',refresh,true);disposed=true;generation++;cancelAnimationFrame(paint);transition.end();observer.disconnect();release?.();root.classList.remove('g4-preparing');root.setAttribute('data-images-ready','true');root.removeAttribute('aria-busy');};
  },[ref,screenKey]);
}
