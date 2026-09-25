import { getFormalRaidSkill } from './raidFormalSkills';
import data from './data/raid-invasion.json';
import roster from '../../theme/sengoku-characters.json';
import { characterArt } from '../../theme/creativeAssets';
import { BALANCE_V2_CHARACTER_ASSIGNMENTS, getCharacterPassive } from './balanceV2Masters';
import { FORMAL_QUEST_STAGES } from './questMaster';
import type { EnemyUnit, RaidMaster, RaidStage, Reward, Element, Rarity, SkillMaster } from './types';

const castleNames = ['岡崎城','長浜城','春日山城','躑躅ヶ崎館','安土城'];
const lords = ['徳川家康','豊臣秀吉','上杉謙信','武田信玄','織田信長'];
export const FORMAL_CASTLES = castleNames.map((name,i)=>({id:`TI0${i+1}`,name,characterId:character(lords[i]).characterId}));
function character(name:string) { const row=roster.find(c=>c.name===name); if(!row)throw new Error(`侵攻武将不明: ${name}`);return row; }
function assignment(name:string) { const c=character(name),a=BALANCE_V2_CHARACTER_ASSIGNMENTS.find(r=>r.id===c.characterId);if(!a)throw new Error(`侵攻属性不明: ${name}`);return a; }
function passive(name:string,level:number) {const c=character(name),a=assignment(name);const lv=level<=30?0:level<=60?2:level<=80?4:level<=90?6:8;const p=getCharacterPassive({id:c.characterId,rarity:c.sourceRarity as Rarity,element:a.element as Element},lv/2);return p?[p]:[];}
function skill(id:string,lb:number):SkillMaster {const s=getFormalRaidSkill(id,lb); if(['SKD039','SKD040'].includes(id))s.condition={type:'ally_hp_below',value:.5};return s;}
function basis(lv:number,key:'hp'|'atk'|'def') {const anchors={hp:[12000,25000,45000,75000],atk:[1100,2200,4200,6500],def:[400,850,2100,4000]}[key];if(lv<40)return anchors[0]*(lv/40)**1.6;const i=Math.min(2,Math.floor((lv-40)/20)),t=((lv-(40+i*20))/20)**1.2;return anchors[i]+(anchors[i+1]-anchors[i])*t;}
const round10=(n:number)=>Math.round(n/10)*10;
const normalLevels=[1,2,4,5,7,8,10,11];
/** Enumerate the valid combination set first, then draw uniformly. Never relax constraints. */
function draw(castle:number,random:()=>number) {
 const choices=normalLevels.map(level=>data.candidates.filter(c=>c.level===level&&!c.names.includes(lords[castle])));
 const valid:(typeof data.candidates)[]=[];
 function visit(path:typeof data.candidates) {if(path.length===choices.length){valid.push([...path]);return;}for(const c of choices[path.length]){if(path.some(p=>p.names[0]===c.names[0]))continue;const element=assignment(c.names[0]).element;if(path.length>=2&&path.slice(-2).every(p=>assignment(p.names[0]).element===element))continue;path.push(c);visit(path);path.pop();}}
 visit([]);if(!valid.length)throw new Error('侵攻通常戦の適合組合せがありません');const r=random();if(r<0||r>=1||!Number.isFinite(r))throw new Error('侵攻抽選値が不正です');return valid[Math.floor(r*valid.length)];
}
function exp(kind:'character_exp_item'|'equipment_exp_item',amount:number):Reward[]{const result:Reward[]=[];for(const [id,value] of [['xlarge',20000],['large',5000],['medium',1000],['small',100]] as const){const n=Math.floor(amount/value);if(n)result.push({kind,id,amount:n});amount%=value;}if(amount)throw new Error('侵攻EXP報酬端数');return result;}
const rewardRows=[[2500,1000,500,1000,1,5000,5000,2,20000,20000,6,1,2,1,1],[4000,2000,1000,2000,1,10000,10000,4,40000,40000,12,1,3,1,1],[6000,3000,1500,3000,1,15000,15000,6,60000,60000,18,2,4,2,1],[8000,4000,2000,4000,1,20000,20000,8,80000,80000,24,2,5,2,2],[10000,5000,2500,5000,1,25000,25000,10,100000,100000,30,3,6,3,2]];
function rewards(castle:number,level:number):Reward[]{const r=rewardRows[castle],final=level===12,gate=level%3===0;const cash=final?r[8]:gate?r[5]:r[3],lb=final?r[10]:gate?r[7]:r[4],xp=final?r[9]:gate?r[6]:0;const out:Reward[]=[{kind:'cash',amount:cash},{kind:'skill_material',amount:lb},{kind:'equipment_lb',amount:lb},...exp('character_exp_item',xp),...exp('equipment_exp_item',xp)];if(final)out.push(...['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'].map((id,i)=>({kind:'ticket' as const,id,amount:r[11+i]})),{kind:'soul',id:FORMAL_CASTLES[castle].characterId,amount:r[14]});return out;}

/** New hosting only. Persist the whole returned master in the room snapshot. */
export function createFormalInvasionMaster(castleId:string,random:()=>number=Math.random):RaidMaster {
 const ci=FORMAL_CASTLES.findIndex(c=>c.id===castleId);if(ci<0)throw new Error(`侵攻城ID不明: ${castleId}`);const castle=FORMAL_CASTLES[ci],lb=[2,4,6,8,9][ci],selected=draw(ci,random),stages:RaidStage[]=[];
 for(let level=1;level<=12;level++) {
  const candidate=selected.find(c=>c.level===level);let enemies:EnemyUnit[],sharedHp:number,source:string;
  if(candidate){const [designId,wave]=candidate.source.split('/');const original=FORMAL_QUEST_STAGES.find(s=>s.designId===designId)?.waves[Number(wave)-1];if(!original||original.length!==candidate.names.length)throw new Error(`侵攻参照Wave不正: ${candidate.source}`);const row=data.normalHp.find(h=>h.castle===castle.name&&h.level===level&&h.source===candidate.source)!;
   enemies=original.map((base,i)=>{if(base.name!==candidate.names[i])throw new Error(`侵攻配置不一致: ${candidate.source}`);const origin=data.original.find(o=>o.id===`${candidate.source}/${i+1}`)!;const e=structuredClone(base),target=row.enemyLevel;e.actionCount=origin.count;e.initialCount=origin.count;e.stats.sp=origin.sp;e.phases=undefined;/* Original 24 candidate waves have no phase; quest's later tuning is not inherited. */e.id=`${castleId}/${level}/${i+1}`;e.level=target;for(const key of ['hp','atk','def'] as const)e.stats[key]=round10((key==='def'?origin.defense:origin[key])*basis(target,key)/basis(origin.level,key));e.initialSp=e.stats.sp;e.hitSpGain=10;e.passives=passive(e.name,target);e.skills=candidate.skills[i].map(id=>skill(id,lb));return e;});sharedHp=row.sharedHp;source=`invasion source tables 20260921:${candidate.source}; section10 H=${row.referenceHp}`;
  }else{enemies=data.fixed.filter(f=>f.castleId===castleId&&f.level===level).map(f=>{const c=character(f.name);return {id:`${castleId}/${level}/${f.order+1}`,name:f.name,image:characterArt({id:c.characterId,name:c.name,image:c.imagePath},'battle')??c.imagePath,level:f.enemyLevel,element:assignment(f.name).element as Element,stats:{hp:f.hp,atk:f.atk,def:f.defense,sp:f.sp,luk:0},initialSp:f.sp,hitSpGain:10,actionCount:f.count,initialCount:f.count,order:f.order,boss:f.role==='B',skills:f.skills.map(id=>skill(id,lb)),passives:passive(f.name,f.enemyLevel)};});sharedHp=data.fixedHp[ci].values[level/3-1];source=`${data.version}:${castleId}/${level}`;}
  stages.push({level,enemies,sharedHp,defeatRewards:rewards(ci,level),source});
 }
 const r=rewardRows[ci];return {id:castleId,name:castle.name,type:'unlock',damagePolicy:'actual-hp-v1-20260925',masterVersion:data.version,characterId:castle.characterId,enemy:stages[0].enemies[0],enemies:stages[0].enemies,stages,energyCost:20,durationMinutes:4320,maxParticipants:20,maxLevel:12,appearanceLevels:[1],appearanceImages:{},enemyGrowthPerLevel:0,sharedHpGrowthPerLevel:0,victoryMultiplier:1.5,sharedHp:stages[0].sharedHp,participationRewards:[],defeatRewards:stages[0].defeatRewards,victoryRewards:[{kind:'cash',amount:r[0]},...exp('character_exp_item',r[1]),...exp('equipment_exp_item',r[2])],playerExp:0};
}
