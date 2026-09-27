import type { BattleResult } from '../redesign/battle';
export type BattleLeadPhase='dark'|'start'|'wave'|'charge'|'sweep'|'pause'|'hit'|'release'|'combo';
export const INK_ROOT='/battle-effects/ink-burst/';
export const INK_ASSETS=['01_ink_sweep.png','02_burst_title.png','03_red_black_aura.png','04_ink_impact.png','05_ink_release.png','battle-start.png',...Array.from({length:5},(_,i)=>`combo-${i+1}.png`)];
export function burstPresentation(result:BattleResult,index:number){
 const frame=result.frames[index];
 const active=!!frame?.burst&&!['burst_end','burst_interrupted','burst_failed','wave','end'].includes(frame.event??'')&&frame.kind!=='end';
 let start=-1,count=0;
 for(let i=index;i>=0;i--){const f=result.frames[i];if(f.wave!==frame?.wave)break;if(f.event==='burst_start'){start=i;break;}if(['burst_end','burst_interrupted','burst_failed'].includes(f.event??''))break;}
 if(active&&start>=0)count=result.frames.slice(start,index+1).filter(f=>f.event==='action_start'&&f.burst).length;
 return {active,start,count:Math.min(5,count)};
}
export function battleLeadIn(result:BattleResult,index:number,initialFrame=0):{phase:BattleLeadPhase;ms:number}[]{
 const f=result.frames[index];if(!f||f.kind==='end'||index===result.frames.length-1)return [];
 const plan:{phase:BattleLeadPhase;ms:number}[]=[];
 if(index===0&&initialFrame===0)plan.push({phase:'dark',ms:280},{phase:'start',ms:1000});
 if((index===0&&initialFrame===0)||(index>initialFrame&&result.frames[index-1]?.wave!==f.wave))plan.push({phase:'wave',ms:900});
 if(f.event==='burst_start')plan.push({phase:'charge',ms:350},{phase:'sweep',ms:330},{phase:'pause',ms:150},{phase:'hit',ms:700},{phase:'release',ms:700});
 if(f.event==='action_start'&&burstPresentation(result,index).count>0)plan.push({phase:'combo',ms:650});
 return plan;
}
