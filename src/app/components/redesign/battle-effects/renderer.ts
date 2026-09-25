import type { BattleEffectFamily } from '../battleEffectPresentation';
import assets from './assets.json';
import { displaySize, effectDuration, EFFECT_SETTINGS, GROUP_HEAL_STAGGER, GROUP_IMPACT_COUNT, GROUP_IMPACT_INTERVAL, GROUP_SLASH_COUNT, type TargetSide } from './settings';

export interface EffectTarget { id: string; side: TargetSide }
type Point = { x: number; y: number; w: number };
const slashEnds = [35,70,110,155,210,260,310,380];
const projectileOffsets = [[0,0],[-27,-39],[-21,-54],[-16,-63],[8,-2],[-1,2],[33,3],[40,4]];
const impactPatterns = {
  enemy: [[50,37,100],[20,40,49],[78,40,58],[43,33,42],[60,46,68],[14,47,38],[84,31,43],[50,39,84]],
  ally: [[50,75,105],[11,75,40],[89,75,42],[32,74,47],[71,76,50],[51,73,43],[20,78,58],[80,72,55]],
};
function element(parent: HTMLElement, className: string, vars: Record<string,string|number> = {}) {
  const el = document.createElement('div'); el.className = className;
  for (const [key,value] of Object.entries(vars)) el.style.setProperty('--'+key,String(value));
  parent.append(el); return el;
}
function picture(parent: HTMLElement, src: string, className: string) {
  const img = document.createElement('img'); img.src=src; img.alt=''; img.className=className; img.draggable=false; parent.append(img); return img;
}
function position(el: HTMLElement, point: Point, width = point.w) {
  for(const [key,value] of Object.entries({x:point.x,y:point.y,width,size:width,'target-x':point.x,'target-y':point.y,'effect-size':width})) el.style.setProperty('--'+key,value+'%');
}
/** Only renders provided recorded targets. Has no game state, audio, timers or network writes. */
export function mountEffect(root: HTMLDivElement, family: BattleEffectFamily, side: TargetSide, targets: readonly EffectTarget[]) {
  const config=EFFECT_SETTINGS[family], duration=effectDuration(family,targets.length);
  for(const [key,value] of Object.entries(config.variables)) root.style.setProperty('--'+key,String(value));
  root.style.setProperty('--duration',config.duration/config.speed+'ms');
  root.style.setProperty('--time',config.duration/config.speed+'ms');
  root.style.setProperty('--effect-angle','0deg');
  const placements: Array<(points: Point[])=>void> = [];
  const sprites: Array<(elapsed: number)=>void> = [];
  const single = !family.endsWith('_all');
  if(single) for(let index=0;index<targets.length;index++) {
    const fx=element(root,family==='slash'?'effect-root is-playing':'fx playing');
    placements.push(points=>position(fx,points[index],displaySize(family,side)));
    for(const layer of assets[family].layers) picture(fx,layer.src,layer.className);
    if(family==='silence') element(fx,'ring');
    if(family==='slash') {
      const frames=assets.slash.assets.filter(src=>src.includes('frame-'));
      const img=picture(fx,frames[0],'fx-sprite'); let last=-1;
      sprites.push(elapsed=>{const frame=slashEnds.findIndex(end=>elapsed*config.speed<end);fx.style.visibility=frame<0?'hidden':'visible';if(frame>=0&&frame!==last){img.src=frames[frame];last=frame;}});
    }
    if(family==='projectile'||family==='stun') {
      const sprite=element(fx,'sprite'); const stun=family==='stun';
      if(stun) element(fx,'flash');
      sprites.push(elapsed=>{
        const time=elapsed*config.speed;
        const frame=Math.min(stun?11:7,Math.floor(time/(stun?90:650/8)));
        sprite.style.backgroundPosition=`${(frame%4)*100/3}% ${Math.floor(frame/4)*(stun?50:100)}%`;
        if(!stun){const [dx,dy]=projectileOffsets[frame];sprite.style.setProperty('--dx',dx/443.5*100+'%');sprite.style.setProperty('--dy',dy/443.5*100+'%');}
      });
    }
  }
  if(family==='slash_all') {
    const layer=element(root,'effect-layer');
    const types=['a','b','a','c','a','b','c']; const angles=[-3,2,4,-8,7,-4,9];
    for(let i=0;i<GROUP_SLASH_COUNT;i++) {
      const wrap=element(layer,'slash '+types[i],{angle:angles[i]+'deg'}); const sprite=element(wrap,'sprite');
      placements.push(points=>{const ordered=[...points].sort((a,b)=>a.x-b.x);const p=ordered[i===6?Math.floor(ordered.length/2):i%ordered.length];position(wrap,p,side==='ally'?27:p.w===66?49:41);});
      sprites.push(elapsed=>{const t=elapsed-i*110;wrap.style.visibility=t>=0&&t<300?'visible':'hidden';const frame=Math.max(0,Math.min(5,Math.floor(t/50)));sprite.style.backgroundPosition=`${frame%3*50}% ${Math.floor(frame/3)*100}%`;});
    }
  }
  if(family==='impact_all') {
    const mistLayer=element(root,'mist-layer'), impact=element(root,'impact-layer');
    const mist=element(mistLayer,'mist',{duration:duration+'ms'});
    placements.push(points=>position(mist,center(points),side==='enemy'?110:125));
    for(let i=0;i<GROUP_IMPACT_COUNT;i++) {
      const p=impactPatterns[side][i];
      const wave=element(impact,'wave',{duration:'560ms'}); wave.style.animationDelay=i*GROUP_IMPACT_INTERVAL+'ms';
      const place=(el:HTMLElement,w:number)=>(points:Point[])=>{const c=center(points);position(el,{x:c.x+p[0]-50,y:c.y+p[1]-(side==='enemy'?39:75),w},w);};
      placements.push(place(wave,p[2]));
      if(i%2===0){const core=element(impact,'core',{duration:'420ms'});core.style.animationDelay=i*GROUP_IMPACT_INTERVAL+'ms';placements.push(place(core,Math.min(p[2]*.45,37)));}
    }
  }
  if(family==='heal_all') {
    const fx=element(root,'fx playing'), field=element(fx,'field');
    const cross=picture(fx,'/battle-effects/heal_all/heal-cross-group.png','cross-group');
    placements.push(points=>{const c=center(points);field.style.setProperty('--field-y',c.y+'%');field.style.setProperty('--field-width',(side==='ally'?105:118)+'%');cross.style.setProperty('--cross-top',(c.y-(side==='ally'?28:29))+'%');});
    targets.forEach((_,i)=>{const unit=element(fx,'unit',{delay:i*GROUP_HEAL_STAGGER+'ms'});for(const [cls,file] of [['aura','spd-back-aura'],['rise','spd-thin-rise'],['sparks','spd-sparks']])picture(unit,`/battle-effects/heal_all/${file}.png`,cls);placements.push(points=>{position(unit,points[i]);unit.style.setProperty('--size','1');});});
  }
  function layout() {
    const stage=root.parentElement!; const bounds=root.getBoundingClientRect();
    const nodes=Array.from(stage.querySelectorAll<HTMLElement>('[data-unit-id]'));
    const points=targets.map(target=>{
      const node=nodes.find(el=>el.dataset.unitId===target.id);
      const anchor=node?.querySelector('[data-effect-anchor]')??node;
      const rect=anchor?.getBoundingClientRect();
      return rect&&bounds.width&&bounds.height?{x:(rect.left+rect.width/2-bounds.left)/bounds.width*100,y:(rect.top+rect.height/2-bounds.top)/bounds.height*100,w:side==='ally'?27:targets.length===1||node?.dataset.order==='0'?66:47}:null;
    });
    if(points.some(p=>!p)){root.style.visibility='hidden';return;}
    placements.forEach(place=>place(points as Point[]));
  }
  layout();
  const observer=new ResizeObserver(layout); observer.observe(root.parentElement!);
  const animations=root.getAnimations({subtree:true}); animations.forEach(a=>{a.pause();a.currentTime=0;});
  function seek(elapsed:number){root.style.visibility=elapsed>=duration?'hidden':'visible';animations.forEach(a=>a.currentTime=elapsed);sprites.forEach(tick=>tick(elapsed));}
  seek(0);
  return { duration, seek, dispose(){observer.disconnect();animations.forEach(a=>a.cancel());root.replaceChildren();} };
}
function center(points: Point[]): Point { return {x:points.reduce((n,p)=>n+p.x,0)/points.length,y:points.reduce((n,p)=>n+p.y,0)/points.length,w:100}; }
