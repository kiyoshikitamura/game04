import { FORMAL_GROWTH_EQUIPMENT_MASTERS, getFormalEquipmentStats } from './formalGrowthMasters';
import { FORMAL_CHARACTER_ASSIGNMENTS, getFormalCharacterStats } from './formalCharacterStats';
import { GROWTH_VERSION } from './growthMaster';
import { grantGrowthReward, isGrowthRewardKind } from './growthReward';
import { BALANCE_V2_CONFIG, getCharacterPassive } from './balanceV2Masters';
export * from './balanceV2Masters';
import { applyAcquisitionEvents, PREVIEW_ACQUISITION_MASTER, type AcquisitionMaster } from './acquisitions';
import roster from '../../theme/sengoku-characters.json';
import names from '../../theme/sengoku-masters.json';
import oldSkills from '../gameplay/canonical/data/skills_20260821.json';
import oldEquipment from '../gameplay/canonical/data/equipment_20260821.json';
import assets from '../../../config/game04-master-assets.json';
import type { BattleRules, BattleUnit, CharacterMaster, Element, EquipmentMaster, EquipmentSlot, EnemyUnit, Rarity, RedesignState, SkillMaster, Stats } from './types';
export const BALANCE_STATUS = 'PREVIEW_PROVISIONAL_20260919';
export const ELEMENTS: Element[] = ['fire','water','earth','wind','light','dark'];
export const ELEMENT_NAMES: Record<Element,string> = { fire:'火',water:'水',earth:'土',wind:'風',light:'光',dark:'闇' };
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon','head','body','legs','accessory1','accessory2'];
export const SLOT_NAMES: Record<EquipmentSlot,string> = {weapon:'武器',head:'頭',body:'身体',legs:'脚',accessory1:'アクセ1',accessory2:'アクセ2'};
export const LEGACY_BATTLE_RULES: BattleRules = { defenseFactor:0.45, advantageMultiplier:1.5, disadvantageMultiplier:0.75, spRecoveryDivisor:120, burstLukDivisor:20, enemySpRecoveryDivisor:30, maxPlayerActions:300, initialSpRatio:0 };
/** Fixed common rules; character, skill and enemy numbers remain provisional. */
export const COMMON_BATTLE_RULES: BattleRules = {...LEGACY_BATTLE_RULES,version:'common-v2-20260920',defenseFactor:1};
export const BATTLE_RULES: BattleRules = {...COMMON_BATTLE_RULES,version:'balance-v2-20260920',inputVersion:'wave-sp-v1-20260921',balanceV2:BALANCE_V2_CONFIG};
export const COMMON_PREVIEW_DATA_STATUS = 'PREVIEW_PROVISIONAL_COMMON_V2_20260920';

const power: Record<Rarity,number> = {N:1,R:1.08,SR:1.16,SSR:1.24};
const image = (id:string) => assets.assets.find(a=>a.id===id)?.path ?? '/menu/event_banner_placeholder.png';
const name = (id:string) => (names as Record<string,string>)[id] ?? id;
export const COMMON_CHARACTER_MASTERS: CharacterMaster[] = roster.map((c,i) => {
 const rarity=c.sourceRarity as Rarity, factor=power[rarity], role=['攻撃','守備','回復','支援','技巧'][i%5];
 return {id:c.characterId,name:c.name,image:c.imagePath,rarity,element:ELEMENTS[i%6],role,
 stats:{hp:Math.round((950+(i%5===1?300:0))*factor),sp:60+(i%5)*5,atk:Math.round((110+(i%5===0?30:0))*factor),def:Math.round((45+(i%5===1?20:0))*factor),luk:20+i%15},
 passive:{id:`passive_${c.characterId}`,name:['武勇の心得','守勢の心得','慈愛の心得','陣形の心得','機略の心得'][i%5],stat:(['atk','def','hp','sp','luk'] as (keyof Stats)[])[i%5],percent:2,target:'party'}};
});
/** Approved 60-character rarity, element and ability type; legacy masters remain separate. */
export const CHARACTER_MASTERS:CharacterMaster[]=COMMON_CHARACTER_MASTERS.map(old=>{
 const a=FORMAL_CHARACTER_ASSIGNMENTS.find(a=>a.id===old.id);
 const master:CharacterMaster={...old,...(a?{rarity:a.rarity as Rarity,element:a.element as Element,role:a.role}:{}),passive:undefined};
 master.passive=getCharacterPassive(master,0);return master;
});
export const LEGACY_SKILL_MASTERS: SkillMaster[] = oldSkills.skills.filter(s=>!s.exclusive_character_id).map((s,i)=> {
 const kind=i%8, rarity=s.rarity as Rarity, f=power[rarity];
 const effect: SkillMaster['effects'] = kind===1?[{type:'def_up',power:20,duration:3,carryAcrossWaves:false}]:kind===2?[{type:'heal',power:120*f}]:kind===3?[{type:'poison',power:15,duration:3,carryAcrossWaves:false}]:kind===4?[{type:'atk_up',power:20,duration:3,carryAcrossWaves:true}]:kind===5?[{type:'revive',power:30}]:kind===6?[{type:'def_down',power:25,duration:3,carryAcrossWaves:false}]:[{type:'damage',power:(kind===7?90:180)*f}];
 return {id:s.skill_id,name:name(s.skill_id),image:image(s.skill_id),rarity,element:ELEMENTS[i%6],spCost:24+(i%4)*8,condition:kind===2?{type:'ally_hp_below',value:0.65}:kind===5?{type:'ally_dead'}:{type:'always'},target:kind===1||kind===4?'all_allies':kind===2?'lowest_ally':kind===5?'dead_ally':kind===7?'all_enemies':'lowest_hp',effects:effect,description:['敵単体へ属性攻撃','味方全体の守備を強化','傷ついた味方を回復','敵に継続ダメージ','味方全体の攻撃を強化','戦闘不能の味方を蘇生','敵の守備を低下','敵全体へ属性攻撃'][kind]};
});
/** Explicit preview adapter, not approval of individual formulas or values. Legacy records stay unchanged. */
export function commonPreviewSkill(skill:SkillMaster):SkillMaster {
 const unsupported=skill.effects.some(e=>e.type==='poison'||e.type==='sp');
 return {...structuredClone(skill),
  ...(unsupported?{unsupportedReason:'継続ダメージ・SP補充は共通ルール未FIXのため新戦闘では発動保留'}:{}),
  effects:skill.effects.filter(e=>e.type!=='poison'&&e.type!=='sp').map(e=>({...e,
   ...(e.type==='heal'?{healingFormula:e.healingFormula??'caster_atk_percent' as const}:{}),
   ...(e.type==='revive'?{healingFormula:e.healingFormula??'target_max_hp_percent' as const}:{}),
   ...(e.duration?{carryAcrossWaves:true}:{}),
  })),
  description:unsupported?'【発動保留・未FIX】継続ダメージ／SP補充の詳細ルール待ち':`${skill.description}（個別倍率・消費SP・回復式は開発仮設定）`,
 };
}
export const SKILL_MASTERS:SkillMaster[]=LEGACY_SKILL_MASTERS.map(commonPreviewSkill);
export const COMMON_SKILL_MASTERS=SKILL_MASTERS;
/** New inputs only. Never run this over a saved battle input or legacy room snapshot. */
export function prepareBattleWaves(waves:EnemyUnit[][],rules:BattleRules):EnemyUnit[][] {
 const frozen=structuredClone(waves);
 if(rules.version!=='common-v2-20260920'&&rules.version!=='balance-v2-20260920')return frozen;
 return frozen.map(wave=>wave.map(enemy=>({...enemy,hitSpGain:enemy.hitSpGain??5,
  skills:enemy.skills.map(commonPreviewSkill),passives:enemy.passives.filter(p=>p.stat==='atk'||p.stat==='def'),
  phases:enemy.phases?.map(phase=>({...phase,skills:phase.skills?.map(commonPreviewSkill)})),
 })));
}
export const LEGACY_EQUIPMENT_MASTERS: EquipmentMaster[] = oldEquipment.equipments.filter(e=>!e.exclusive_character_id).map(e=> {
 const rarity=e.rarity as Rarity, f=power[rarity], slot: EquipmentSlot = e.category==='WEAPON'?'weapon':e.category==='HEAD'?'head':e.category==='BODY'?'body':e.category==='LEGS'?'legs':'accessory1';
 return {id:e.equipment_id,name:name(e.equipment_id),image:image(e.equipment_id),rarity,slot,stats:{hp:slot==='body'?Math.round(80*f):0,sp:slot==='accessory1'?5:0,atk:slot==='weapon'?Math.round(16*f):0,def:slot==='head'||slot==='legs'?Math.round(8*f):0,luk:slot==='accessory1'?3:0}};
});
export const EQUIPMENT_MASTERS = FORMAL_GROWTH_EQUIPMENT_MASTERS;
export function getSkillSlots(awakening:number) {return awakening>=3?3:awakening>=1?2:1;}
export function getLegacyCharacterStats(master:CharacterMaster,level:number,awakening:number):Stats {return Object.fromEntries(Object.entries(master.stats).map(([k,v])=>[k,Math.round(v*(1+(Math.max(1,level)-1)*0.055)*(awakening>=4?1+(awakening-3)*0.1:1))])) as Stats;}
export function getCharacterStats(master:CharacterMaster,level:number,awakening:number):Stats {
 return getFormalCharacterStats(master.id,level,getLegacyCharacterStats(master,level,awakening).sp);
}
export function getLegacyEquipmentStats(master:EquipmentMaster,level:number,lb:number):Stats {return Object.fromEntries(Object.entries(master.stats).map(([k,v])=>[k,Math.round(v*(1+(Math.max(1,level)-1)*0.04)*(1+lb*0.1))])) as Stats;}
export function getEquipmentStats(master:EquipmentMaster,level:number,_lb:number):Stats {return getFormalEquipmentStats(master.id,level);}
export function buildBattleParty(state:RedesignState,rules:BattleRules=BATTLE_RULES):BattleUnit[] {return state.deck.map(member=> {
 const owned=state.characters.find(c=>c.id===member.characterId), master=(rules.version==='balance-v2-20260920'?CHARACTER_MASTERS:COMMON_CHARACTER_MASTERS).find(c=>c.id===member.characterId);
 if(!owned||!master) throw new Error('編成キャラが見つかりません');
 const stats=(rules.version==='balance-v2-20260920'?getCharacterStats:getLegacyCharacterStats)(master,owned.level,owned.awakening);
 for(const instanceId of Object.values(member.equipment)){const e=state.equipment.find(e=>e.instanceId===instanceId),m=(rules.version==='balance-v2-20260920'?EQUIPMENT_MASTERS:LEGACY_EQUIPMENT_MASTERS).find(m=>m.id===e?.masterId);if(e&&m){const bonus=(rules.version==='balance-v2-20260920'?getEquipmentStats:getLegacyEquipmentStats)(m,e.level,e.lb);for(const key of Object.keys(stats) as (keyof Stats)[])stats[key]+=bonus[key];}}
 return {id:master.id,name:master.name,image:master.image,level:owned.level,element:master.element,stats,skills:member.skillIds.slice(0,getSkillSlots(owned.awakening)).map(id=>{const s=(rules.version==='common-v2-20260920'||rules.version==='balance-v2-20260920'?SKILL_MASTERS:LEGACY_SKILL_MASTERS).find(s=>s.id===id),o=state.skills.find(s=>s.id===id);if(!s||!o)throw new Error('未所持のスキルです');return {...s,effects:s.effects.map(e=>({...e,power:e.power*(1+o.level*0.05)}))};}),passives:rules.version==='balance-v2-20260920'?(getCharacterPassive(master,owned.awakening)?[getCharacterPassive(master,owned.awakening)!]:[]):master.passive&&(rules.version!=='common-v2-20260920'||master.passive.stat==='atk'||master.passive.stat==='def')?[{...master.passive,level:owned.awakening*2,percent:master.passive.percent*(1+owned.awakening*2)}]:[]};
 });}
export function createInitialState(userId:string):RedesignState {
 const starters=CHARACTER_MASTERS.filter(c=>c.rarity==='N').slice(0,5);
 return {userId,version:0,cash:0,diamonds:0,energy:0,energyMax:50,energyDrinks:0,souls:{},characters:starters.map(c=>({id:c.id,level:1,awakening:0,exp:0,growthVersion:GROWTH_VERSION})),skills:SKILL_MASTERS.slice(0,8).map(s=>({id:s.id,level:0})),equipment:[],deck:starters.slice(0,3).map((c,i)=>({characterId:c.id,skillIds:[SKILL_MASTERS[i%SKILL_MASTERS.length].id],equipment:{}})),materials:{character:20,skill:10,equipment:20,equipmentLb:5,unlock:1},clearedStages:[],vipExpiresAt:null};
}

export interface LegacyAssets {
 characters: {id:string;character_id:string;level:number;awakening_level:number}[];
 skills: {id:string;skill_card_id:string;plus_val:number}[];
 equipment: {id:string;equipment_id:string;level:number;plus_val:number}[];
}
/** Append-only import ledger keeps original rows untouched and imports later gacha grants once. */
export function importLegacyAssets(original:RedesignState,legacy:LegacyAssets):RedesignState {
 const state=structuredClone(original); state.souls??={}; const ledger=new Set(state.legacyImportedIds??[]);
 for(const c of legacy.characters){const key=`character:${c.id}`;if(ledger.has(key)||!CHARACTER_MASTERS.some(m=>m.id===c.character_id))continue;const owned=state.characters.find(m=>m.id===c.character_id);if(owned){owned.level=Math.max(owned.level,c.level);owned.awakening=Math.max(owned.awakening,Math.min(5,c.awakening_level));state.souls[c.character_id]=(state.souls[c.character_id]??0)+10;}else state.characters.push({id:c.character_id,level:c.level,awakening:Math.min(5,c.awakening_level)});ledger.add(key);}
 for(const s of legacy.skills){const key=`skill:${s.id}`;if(ledger.has(key)||!SKILL_MASTERS.some(m=>m.id===s.skill_card_id))continue;const owned=state.skills.find(m=>m.id===s.skill_card_id);if(owned){owned.level=Math.max(owned.level,Math.min(10,s.plus_val));state.materials.skill+=2;}else state.skills.push({id:s.skill_card_id,level:Math.min(10,s.plus_val)});ledger.add(key);}
 for(const e of legacy.equipment){const key=`equipment:${e.id}`;if(ledger.has(key)||!EQUIPMENT_MASTERS.some(m=>m.id===e.equipment_id))continue;state.equipment.push({instanceId:e.id,masterId:e.equipment_id,level:e.level,lb:e.plus_val});ledger.add(key);}
 state.legacyImportedIds=[...ledger]; return state;
}
export function buildInitialState(userId:string,legacy:LegacyAssets):RedesignState {return importLegacyAssets(createInitialState(userId),legacy);}

/** Caller performs chance roll on server; this function applies one already-selected reward. */
export function grantReward(original:RedesignState,reward:import('./types').Reward,instanceId?:string,acquisitionMaster:AcquisitionMaster=PREVIEW_ACQUISITION_MASTER):RedesignState {
 if(isGrowthRewardKind(reward.kind)) return grantGrowthReward(original,{...reward,kind:reward.kind});
 const state=structuredClone(original); const amount=reward.amount;
 if(!Number.isSafeInteger(amount)||amount<0) throw new Error('報酬数量が不正です');
 if(reward.kind==='character'||reward.kind==='skill'||reward.kind==='equipment'){
  if(!reward.id||!instanceId) throw new Error('獲得イベントIDが必要です');
  return applyAcquisitionEvents(state,Array.from({length:amount},(_,i)=>({id:`reward:${instanceId}:${i}`,kind:reward.kind as 'character'|'skill'|'equipment',masterId:reward.id!,instanceId:amount===1?instanceId:`${instanceId}:${i}`})),acquisitionMaster);
 }
 switch(reward.kind){
 case 'ticket':
  if(!reward.id||!['SPECIAL_TICKET_CHARACTER','SPECIAL_TICKET_SKILL','SPECIAL_TICKET_EQUIPMENT'].includes(reward.id))throw new Error('券IDが不正です');
  state.questTicketGrants??={};state.questTicketGrants[reward.id]=(state.questTicketGrants[reward.id]??0)+amount;break;
 case 'cash':state.cash+=amount;break;
 case 'character_material':state.materials.character+=amount;break;
 case 'skill_material':state.materials.skill+=amount;break;
 case 'equipment_material':state.materials.equipment+=amount;break;
 case 'equipment_lb':state.materials.equipmentLb+=amount;break;
 case 'unlock_item':state.materials.unlock+=amount;break;
 case 'soul':if(reward.id){state.souls??={};state.souls[reward.id]=(state.souls[reward.id]??0)+amount;}break;
 }
 return state;
}


