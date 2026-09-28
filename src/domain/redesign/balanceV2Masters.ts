import data from './data/balance-v2.json';
import type { BalanceV2Config, CharacterMaster, Passive, PassiveType, SkillEffect, SkillMaster, TargetRule, Rarity, Element } from './types';
export const BALANCE_V2_MASTER_VERSION = data.version;
export const BALANCE_V2_CHARACTER_ASSIGNMENTS = data.assignments;
export const BALANCE_V2_LB_DISPLAY_ROWS = data.lbDisplayRows;
export const BALANCE_V2_CONFIG: BalanceV2Config = {status:'PREVIEW_PROVISIONAL',version:data.version,damageBonusCap:50,healingBonusCap:80,shieldBonusCap:50,shieldHpCap:.5,periodicCapMultiplier:2,lowHpThreshold:.4,highHpThreshold:.7,diversityFactors:[0,.25,.5,.75,1]};
const passiveNames=['同属性ATK支援','同属性DEF支援','生存味方の属性数で自身ATK','他の生存味方が2属性以上で自身DEF','通常攻撃ダメージ','単体攻撃スキルダメージ','全体攻撃スキルダメージ','能力低下中の敵への直接ダメージ','継続ダメージ中の敵への直接ダメージ','与回復量（蘇生除外）','被回復量（蘇生除外）','付与シールド量','反撃ダメージ','HP40%以下で自身ATK','HP70%以上で自身DEF','能動ATK強化中の自身DEF'];
const passiveMax=[[8,12,16],[12,18,24],[20,30,40],[25,35,45],[20,30,40],[10,15,20],[10,15,20],[15,22,30],[20,30,40],[20,30,40],[20,30,40],[20,30,40],[25,35,45],[25,35,45],[20,30,40],[20,30,40]];
export function getCharacterPassive(master:Pick<CharacterMaster,'id'|'rarity'|'element'>,awakening:number):Passive|undefined {
 const a=data.assignments.find(a=>a.id===master.id);if(!a||master.rarity==='N')return undefined;
 const index=Number(a.passiveType.slice(1))-1, level=Math.max(0,Math.min(5,awakening))*2;
 const percent=passiveMax[index][['R','SR','SSR'].indexOf(a.rarity)]*(.4+.6*(level/10)**1.3);
 return {id:`balance_v2_${a.passiveType}${index<2?'_'+a.element:''}`,type:a.passiveType as PassiveType,name:passiveNames[index],stat:[1,3,14,15].includes(index)?'def':'atk',percent,level,target:index<2?'party':'self',...(index<2?{targetElement:a.element as Element}:{})};
}
/** Candidate IDs are separate from owned legacy IDs. This does not add any gacha entries. */
export function getBalanceV2Skill(designId:string,lb:number,options:{firstTargetMode?:'fixed'|'default'}={}):SkillMaster {
 if(!Number.isInteger(lb)||lb<0||lb>10)throw new Error('検証スキルLBは0〜10');
 const s=data.skills.find(s=>s.designId===designId||s.id===designId);if(!s)throw new Error('検証スキルID不明');
 const n=Number(s.designId.slice(3)), ratio=(lb/10)**1.25;
 const vals=s.effects0.map((e,i)=>e.value+(s.effects10[i].value-e.value)*ratio);
 const lasting=(type:SkillEffect['type'],power:number):SkillEffect=>({type,power,duration:s.duration??3,carryAcrossWaves:true});
 const effects:SkillEffect[]=[];
 for(let i=0;i<s.effects0.length;i++){
  const label=s.effects0[i].label, v=vals[i];
  if(label==='条件倍率')continue;
  if(label==='攻撃倍率'||label==='通常倍率')effects.push({type:'damage',power:v,...(label==='通常倍率'?{bonusPower:vals[i+1],bonusCondition:([28,59].includes(n)?'debuff':[30].includes(n)?'dot':'hp_below') as 'debuff'|'dot'|'hp_below',hpThreshold:BALANCE_V2_CONFIG.lowHpThreshold}:{})});
  else if(label==='付与率')effects.push({...lasting([32,65].includes(n)?'stun':'taunt',1),chance:v/100});
  else if(label.includes('解除件数'))effects.push({type:'cleanse',power:v,cleanseCategory:label==='能力低下解除件数'?'debuff':label==='継続ダメージ解除件数'?'dot':({51:'buff',52:'protection',53:'debuff',54:'dot',55:'stun',56:'protection',70:'dot',72:'buff'} as const)[n as 51]});
  else if(label==='回復倍率')effects.push({type:'heal',power:v,healingFormula:'caster_atk_percent'});
  else if(label==='蘇生HP割合')effects.push({type:'revive',power:v,healingFormula:'target_max_hp_percent'});
  else {const type=({'継続ダメージ倍率':'dot','継続回復倍率':'hot','シールド倍率':'shield','反撃倍率':'counter','ATK強化':'atk_up','DEF強化':'def_up','ATK低下':'atk_down','DEF低下':'def_down'} as Record<string,SkillEffect['type']>)[label];if(!type)throw new Error(`未知効果:${label}`);effects.push(lasting(type,v));}
 }
 let target:TargetRule='first';
 if([19,20,21,22,23,24,25,58,59,60,63,64,65].includes(n))target='all_enemies';
 else if([35,36,41,42,47,66,67,71].includes(n))target='all_allies';
 else if([33,34,45,48,49,50].includes(n))target='self';
 else if([26,57].includes(n))target='last';
 else if(n===27)target='lowest_hp';
 else if(n===37)target='highest_atk_enemy';
 else if([39,40,43,46,68].includes(n))target='lowest_ally';
 else if(n===44)target='dead_ally';
 else if(n===61)target='highest_atk_ally';
 else if([53,54,55,62].includes(n))target='first_ally';
 else if(n===69)target='counter_ally';
 else if(n===70)target='dot_ally';
 return {id:s.id,name:`【検証仮称】${s.name}`,image:'/menu/event_banner_placeholder.png',rarity:s.rarity as Rarity,element:s.element as Element,spCost:Math.ceil(s.sp0+(s.sp10-s.sp0)*ratio),condition:{type:'always'},target,fixedTarget:[56,72].includes(n)||([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,28,29,30,31].includes(n)&&(options.firstTargetMode??'fixed')==='fixed'),effects,description:`${s.designId} / LB${lb} / ${s.targetDescription}${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,28,29,30,31].includes(n)?`（先頭狙い解釈未決・検証用:${options.firstTargetMode??'fixed'}）`:''}。名称・画像未対応。数値は検証用仮値 (${data.version})。ガチャ未接続。`};
}
export const BALANCE_V2_SKILL_CANDIDATES:SkillMaster[]=data.skills.map(s=>getBalanceV2Skill(s.designId,0));
export const BALANCE_V2_SKILL_ID_MAPPING=data.skills.map(s=>({designId:s.designId,candidateId:s.id,legacyId:null,imageStatus:s.imageStatus,status:'QA_ONLY_NOT_GACHA'}));
/** Fixed attack-role body anchors. Interpolation between anchors is preview-only; awakening is not added twice. */
export const BALANCE_V2_ATTACK_ANCHORS:Record<Rarity,{hp:number[];def:number[];atk:number[]}>= {
 N:{hp:[600,4600,13600],def:[30,380,1230],atk:[100,200,380,600,850,1150,1500,1880,2290,2730,3200]},
 R:{hp:[750,6300,19300],def:[40,550,1850],atk:[150,300,550,880,1300,1800,2400,3080,3850,4720,5700]},
 SR:{hp:[1050,9700,30700],def:[60,880,3180],atk:[300,520,900,1450,2200,3150,4300,5650,7200,8950,10900]},
 SSR:{hp:[1500,14200,47200],def:[90,1400,5150],atk:[500,800,1350,2100,3050,4250,5850,7800,10150,12900,16000]},
};
export function interpolatePreviewAnchor(level:number,levels:number[],values:number[]):number {const l=Math.max(levels[0],Math.min(levels[levels.length-1],level));for(let i=1;i<levels.length;i++)if(l<=levels[i])return Math.round(values[i-1]+(values[i]-values[i-1])*(l-levels[i-1])/(levels[i]-levels[i-1]));return values[values.length-1];}
