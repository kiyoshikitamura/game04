import { skillVfxById, skillVfxDuration, type SkillVfxEvent } from './skillVfx24';
import type { EffectTarget } from './renderer';
import type { TargetSide } from './settings';

type Point = {x:number;y:number;w:number;h:number};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-Math.pow(1-clamp(n),3);
const colors={fire:'#ff7935',water:'#69ccff',earth:'#efbd62',wind:'#91ffd5',light:'#ffefaa',dark:'#bc81ff'};

/** A seek-only renderer: no timers, game state, damage, audio or CSS clocks.
 * The existing battle playback clock owns pause/speed/skip and unmount cleanup. */
export function mountSkillVfx(root:HTMLDivElement,event:SkillVfxEvent,side:TargetSide,targets:readonly EffectTarget[]) {
  const definition=skillVfxById(event.id), profile=definition.profile;
  const duration=skillVfxDuration(event), direction=side==='enemy'?1:-1;
  const area=definition.category==='area'||['grand-crimson','grand-healing','barrier-field','war-god-rally','purification'].includes(event.id);
  const layers:Array<{img:HTMLImageElement;role:'lead'|'hit';copy:number;target:number}>=[];
  let points:Point[]=[], group:Point|undefined, elapsed=0;
  root.dataset.vfxId=event.id;root.dataset.vfxPhase=event.phase;root.dataset.vfxLead=String(event.leadIn);
  function picture(role:'lead'|'hit',copy:number,target:number) {
    const img=document.createElement('img');img.src=definition[role];img.alt='';img.draggable=false;
    img.className='skillVfx24-part';img.dataset.part=role;
    img.style.filter=`drop-shadow(0 0 3px ${colors[event.element??'light']}55)`;
    root.append(img);layers.push({img,role,copy,target});
  }
  if(event.phase==='cleanse') {
    targets.forEach((_,index)=>{picture('lead',0,index);if(profile==='purify')picture('hit',0,index);});
  } else {
    if(event.leadIn && profile!=='break') {
      const count=profile==='cross'?2:profile==='rain'?3:1;
      for(let copy=0;copy<count;copy++)picture('lead',copy,-1);
    }
    targets.forEach((_,index)=>picture('hit',0,index));
  }
  function anchor(id:string):Point|undefined {
    const bounds=root.getBoundingClientRect();
    const node=Array.from(root.parentElement!.querySelectorAll<HTMLElement>('[data-unit-id]')).find(el=>el.dataset.unitId===id);
    const rect=(node?.querySelector('[data-effect-anchor]')??node)?.getBoundingClientRect();
    if(!rect||!bounds.width||!bounds.height)return;
    return {x:rect.left+rect.width/2-bounds.left,y:rect.top+rect.height/2-bounds.top,w:rect.width,h:rect.height};
  }
  function layout() {
    const anchors=targets.map(target=>anchor(target.id));
    points=anchors.filter((p):p is Point=>!!p);
    const all=(area?event.areaTargetIds:targets.map(t=>t.id)).map(anchor).filter((p):p is Point=>!!p);
    if(all.length) {
      const left=Math.min(...all.map(p=>p.x-p.w/2)),right=Math.max(...all.map(p=>p.x+p.w/2));
      group={x:(left+right)/2,y:all.reduce((sum,p)=>sum+p.y,0)/all.length,w:right-left,h:Math.max(...all.map(p=>p.h))};
    }
    seek(elapsed);
  }
  function seek(ms:number) {
    elapsed=ms;
    root.dataset.vfxTime=String(Math.round(ms));
    root.style.visibility=ms>=duration||points.length!==targets.length||!group?'hidden':'visible';
    if(!group)return;
    const stageW=root.clientWidth;
    for(const layer of layers) {
      const {img,role,copy,target}=layer, isLead=role==='lead';
      const point=target<0?group:points[target];if(!point)continue;
      const delay=isLead?copy*55:event.leadIn&&event.phase!=='cleanse'?150:0;
      const t=clamp((ms-delay)/(duration-delay));
      const envelope=Math.min(clamp(t/.12),clamp((1-t)/.34));
      let width=Math.min(stageW*.72,Math.max(side==='ally'?95:150,point.w*1.22));
      if(target<0&&area)width=Math.min(stageW*.95,Math.max(width,point.w*1.12));
      let x=0,y=0,sx=1,sy=1,rotate=0,alpha=envelope*(isLead?.93:.85),clip='none';
      const move=ease(t), release=ease((t-.12)/.65);
      if(event.phase==='cleanse') {
        sx=sy=.7+move*.6;rotate=profile==='purify'?t*32:direction*t*15;
        if(!isLead){y=-move*point.h*.35;alpha*=.8;}
      } else if(isLead) {
        switch(profile) {
          case 'cleave': x=direction*(1-move)*-width*.25;y=(1-move)*-width*.2;rotate=direction*(-24+move*32);sx=sy=.65+move*.42;clip=`inset(0 ${100*(1-ease(t/.45))}% 0 0)`;break;
          case 'iaido': x=direction*(move-.5)*width*.22;sx=.15+move*1.1;sy=.65;alpha*=clamp((.8-t)/.18);break;
          case 'cross': rotate=(copy===0?-28:65)*direction;sx=sy=.4+move*.65;clip=`inset(0 ${100*(1-ease(t/.5))}% 0 0)`;break;
          case 'wave': x=direction*(move-.5)*width*.8;y=point.h*.1; sx=.55+move*.55;sy=.7+Math.sin(t*Math.PI)*.3;break;
          case 'ground': y=point.h*.28;sx=.35+move*.8;sy=.35+move*.55;break;
          case 'flame': y=point.h*.25;sx=.3+move*.8;sy=.5+move*.4;rotate=direction*t*8;break;
          case 'sweep': x=direction*(move-.5)*width*.45;sx=.45+move*.7;sy=.6+move*.4;rotate=direction*(-12+move*24);break;
          case 'spiral': rotate=direction*(-75+move*155);sx=sy=.2+move*.85;break;
          case 'rain': width*=.38;x=(copy-1)*group.w*.32;y=-point.h*.5+(move-.5)*point.h;sy=.45+move*.65;break;
          case 'dark': x=direction*(move-.5)*width*.35;rotate=direction*(-15+move*25);sx=sy=.4+move*.7;break;
          case 'thrust': x=-direction*width*.15;rotate=direction*move*210;sx=sy=.2+Math.sin(t*Math.PI)*.65;break;
          case 'light': rotate=direction*t*50;sx=sy=.15+move*.85;break;
          case 'poison': rotate=direction*(-18+move*36);sx=sy=.55+move*.5;break;
          case 'barrier': y=point.h*.25;sx=.3+move*.8;sy=.65;alpha*=.65;break;
          case 'healing': y=point.h*(.22-move*.4);sx=.5+move*.6;sy=.8;alpha*=.7;break;
          case 'counter': rotate=direction*move*65;sx=sy=.5+move*.5;break;
          case 'rally': width*=.65;y=-move*point.h*.23;rotate=direction*(-12+move*24);sx=sy=.4+move*.65;break;
        }
      } else {
        sx=sy=.3+release*.8;
        switch(profile) {
          case 'ground': case 'flame': y=point.h*(.18-release*.12);sy=.1+release*1.1;break;
          case 'wave': y=point.h*.13;sy=.35+release*.8;break;
          case 'rain': y=point.h*.2;sy=.65;break;
          case 'barrier': y=point.h*.03;sy=.2+release*.85;alpha*=.65;break;
          case 'healing': y=-release*point.h*.12;sy=.4+release*.65;alpha*=.62;break;
          case 'counter': rotate=direction*release*100;alpha*=.8;break;
          case 'rally': y=point.h*.25;sy=.8;break;
          case 'poison': y=point.h*.22;alpha*=.75;break;
          case 'spiral': rotate=direction*release*80;break;
          case 'thrust': case 'break': x=direction*(release-.5)*width*.4;sx=.2+release*1.05;sy=.7;clip=`inset(0 ${100*(1-ease(t/.45))}% 0 0)`;break;
          case 'iaido': sx=.5+release*.8;sy=.8;break;
          case 'light': rotate=direction*(-20+release*40);break;
          case 'dark': rotate=direction*release*20;break;
        }
      }
      // Mirror horizontal trajectories only; never flip falling light, earth or support vertically.
      const mirror=['cleave','iaido','cross','wave','sweep','poison','thrust','break','dark','light'].includes(profile)?direction:1;
      img.style.left=(point.x+x)+'px';img.style.top=(point.y+y)+'px';img.style.width=width+'px';
      img.style.opacity=String(ms<delay?0:alpha);img.style.clipPath=clip;
      img.style.transform=`translate(-50%,-50%) rotate(${rotate}deg) scale(${sx*mirror},${sy})`;
    }
  }
  const observer=new ResizeObserver(layout);observer.observe(root.parentElement!);layout();
  return {duration,seek,dispose(){observer.disconnect();root.replaceChildren();}};
}
