import type { BattleFrame, BattleResult, BattleStatus, BattleUnitState } from '@/domain/redesign/battle';
import type { BattleUnit, EnemyUnit, SkillEffect } from '@/domain/redesign/types';
import { getFormalOwnedSkill } from '@/domain/redesign/formalOwnedSkills';
import characters from '@/theme/local-characters.json';

export interface FixtureOptions { skillId:string; side:'ally'|'enemy'; burst:boolean; success:boolean; enemies:number; cutin:'SSR'|'SR' }
/** Synthetic, read-only presentation fixture. Formal effect order/target/hit count
 * are retained. Sample HP/damage are for visual inspection, not balance testing. */
export function createSkillVfxFixture(options:FixtureOptions):BattleResult {
  const skill=getFormalOwnedSkill(options.skillId,0);
  const ids=[options.cutin==='SSR'?'char_leo_01':'char_taiga_01','char_miyabi_01','char_ageha_01','char_cecile_01','char_reiji_01'];
  function unit(id:string,index:number):BattleUnit {
    const c=characters.find(c=>c.id===ids[index])!;
    return {id,name:c.name,image:c.battle||c.full,level:30,element:skill.element,stats:{hp:4000,sp:400,atk:600,def:100,luk:40},skills:[skill],passives:[]};
  }
  const party=ids.map((_,i)=>unit('vfx-ally-'+i,i));
  const enemies:EnemyUnit[]=Array.from({length:options.enemies},(_,i)=>({...unit('vfx-enemy-'+i,i),order:i,actionCount:3,initialCount:3,boss:i===0}));
  const state=(u:BattleUnit):BattleUnitState=>({id:u.id,hp:2400,maxHp:4000,sp:400,maxSp:400,count:3,actions:0,statuses:[],phase:null,image:u.image,skills:u.skills,dead:false});
  const allies=party.map(state), foes=enemies.map(state);
  const own=options.side==='ally'?allies:foes, opposing=options.side==='ally'?foes:allies,actor=own[0];
  const frames:BattleFrame[]=[];
  const burst=options.burst&&options.side==='ally';
  let hitTotal=0;
  const category=(s:BattleStatus)=>['shield','counter','taunt'].includes(s.type)?'protection':['atk_up','def_up'].includes(s.type)?'buff':['atk_down','def_down'].includes(s.type)?'debuff':s.type;
  function selected(effect:SkillEffect) {
    const rule=effect.target==='selected'||!effect.target?skill.target:effect.target;
    if(rule==='self')return [actor];
    if(rule==='all_enemies')return opposing;
    if(rule==='all_allies')return own;
    if(rule==='last')return opposing.slice(-1);
    if(['lowest_ally','first_ally','highest_atk_ally','counter_ally','dot_ally'].includes(rule))return [own[0]];
    return [opposing[0]];
  }
  if(options.success)for(const effect of skill.effects.filter(e=>e.type==='cleanse'))for(const target of selected(effect)) {
    const type:BattleStatus['type']=effect.cleanseCategory==='protection'?'shield':effect.cleanseCategory==='buff'?'atk_up':effect.cleanseCategory==='dot'?'dot':effect.cleanseCategory==='stun'?'stun':'def_down';
    target.statuses.push({type,power:20,remaining:3,carry:true,sourceId:'qa-setup',sourceSkillId:'qa-setup',appliedAction:0});
  }
  function push(event:string,targetIds:string[]=[],hits?:number[],reason?:string) {
    frames.push({index:frames.length,wave:1,kind:event==='end'?'end':event==='start'?'start':options.side==='ally'?'action':'enemy',actorId:actor.id,skillId:skill.id,event,text:event==='action_start'?skill.name:`${skill.name}：${event}`,partySp:320,maxSp:400,burst:event==='end'?false:burst,party:structuredClone(allies),enemies:structuredClone(foes),targetIds,hits,reason,burstGauge:burst?0:180,maxBurstGauge:200,playerActions:1,remainingActions:299});
  }
  push(burst?'burst_start':'start');push('action_start');
  for(const [sequence,effect] of skill.effects.entries())for(const target of selected(effect)) {
    if(effect.type==='damage') {
      const amount=286+sequence*37;target.hp-=amount;hitTotal+=amount;
      const count=effect.displayHits??1;
      push('damage',[target.id],Array.from({length:count},(_,i)=>Math.floor(amount/count)+(i<amount%count?1:0)));
    } else if(effect.type==='heal') {
      target.hp=Math.min(target.maxHp,target.hp+520);push('heal',[target.id]);
    } else if(effect.type==='cleanse') {
      const candidates=target.statuses.filter(s=>category(s)===effect.cleanseCategory).slice(0,Math.floor(effect.power));
      target.statuses=target.statuses.filter(s=>!candidates.includes(s));
      // Includes an explicit no-op recording to exercise old zero-removal saves.
      push('cleanse',[target.id],undefined,effect.cleanseCategory);
    } else if(!options.success)push('effect_miss',[target.id]);
    else {
      target.statuses.push({type:effect.type,power:effect.power,remaining:effect.duration??3,carry:true,sourceId:actor.id,sourceSkillId:skill.id,appliedAction:1,sequence});
      push('effect_applied',[target.id]);
    }
  }
  push('action_end');push('end');
  return {seed:240929,outcome:'win',totalDamage:hitTotal,playerActions:1,wavesCleared:1,party,waves:[enemies],frames,analysis:[],rulesVersion:'balance-v2-20260920',burstPolicy:'attack-free-enemy-pause-v2-20260927'};
}
