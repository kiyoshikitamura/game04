"use client";
import type { CSSProperties } from 'react';
import type { RedesignState } from '@/domain/redesign/types';
import { CHARACTER_MASTERS, EQUIPMENT_MASTERS, SKILL_MASTERS, getSkillSlots, getCharacterPassive } from '@/domain/redesign/masters';
import { getCharacterLevelCap, getEquipmentLevelCap } from '@/domain/redesign/growth';
import { passiveDescription } from './battleLabels';
import { PRESENTATION } from '../ui/presentationSettings';
import Modal from './Modal';
import CreativeCharacter from './CreativeCharacter';
export type GrowthReceipt = { action:string; payload:Record<string,unknown>; before:RedesignState; after:RedesignState };
export const RESULT_ACTIONS = ['character_level','equipment_level','character_awaken','character_unlock','skill_level','equipment_lb','soul_exchange','soul_select'];
export default function GrowthResult({receipt,onClose}:{receipt:GrowthReceipt;onClose:()=>void}) {
 const {before,after,action,payload}=receipt;
 const id=String(payload.characterId??payload.instanceId??payload.skillId??'');
 const cm=CHARACTER_MASTERS.find(c=>c.id===id), bc=before.characters.find(c=>c.id===id), ac=after.characters.find(c=>c.id===id);
 const be=before.equipment.find(e=>e.instanceId===id), ae=after.equipment.find(e=>e.instanceId===id);
 const bs=before.skills.find(s=>s.id===id), as=after.skills.find(s=>s.id===id);
 const name=cm?.name ?? EQUIPMENT_MASTERS.find(e=>e.id===ae?.masterId)?.name ?? SKILL_MASTERS.find(s=>s.id===id)?.name ?? '';
 let title='育成完了', from='', to='';const changes:string[]=[];
 if(action.endsWith('_level')&&action!=='skill_level') {from=`Lv.${bc?.level??be?.level}`;to=`Lv.${ac?.level??ae?.level}`;changes.push(`EXP ${bc?.exp??be?.exp??0} → ${ac?.exp??ae?.exp??0}`);}
 if(action==='character_unlock'){title='武将獲得';from=`固有魂 ${(before.souls[id]??0)-(after.souls[id]??0)}個`;to='武将獲得';changes.push(`固有魂 ${before.souls[id]??0} → ${after.souls[id]??0}`,`Lv.${ac?.level}・覚醒+${ac?.awakening}`);}
 if(action==='character_awaken'&&bc&&ac&&cm){title='覚醒完了';from=`覚醒+${bc.awakening}`;to=`覚醒+${ac.awakening}`;
 changes.push(`Lv上限 ${getCharacterLevelCap(bc.awakening)} → ${getCharacterLevelCap(ac.awakening)}`);
 if(getSkillSlots(ac.awakening)>getSkillSlots(bc.awakening))changes.push(`スキル枠 ${getSkillSlots(bc.awakening)} → ${getSkillSlots(ac.awakening)}`);
 const oldPassive=getCharacterPassive(cm,bc.awakening), nextPassive=getCharacterPassive(cm,ac.awakening);
 if(nextPassive&&oldPassive?.level!==nextPassive.level)changes.push(`パッシブLv ${oldPassive?.level??0} → ${nextPassive.level}`);
 if(nextPassive&&JSON.stringify(oldPassive)!==JSON.stringify(nextPassive))changes.push(`パッシブ：${passiveDescription(nextPassive)}`);
 }
 if(action==='skill_level'){from=`LB+${bs?.level}`;to=`LB+${as?.level}`;}
 if(action==='equipment_lb'&&be&&ae){from=`LB+${be.lb}`;to=`LB+${ae.lb}`;changes.push(`Lv上限 ${getEquipmentLevelCap(be.lb)} → ${getEquipmentLevelCap(ae.lb)}`);}
 if(action==='soul_exchange'||action==='soul_select'){title='魂の交換完了';from=`固有魂 ${before.souls[id]??0}`;to=`固有魂 ${after.souls[id]??0}`;}
 const consumed:string[]=[];
 if(before.cash!==after.cash)consumed.push(`銭 ${before.cash.toLocaleString()} → ${after.cash.toLocaleString()}`);
 if(action!=='character_unlock'&&(before.souls[id]??0)!==(after.souls[id]??0))consumed.push(`固有魂 ${before.souls[id]??0} → ${after.souls[id]??0}`);
 if(cm){const rarity=cm.rarity;for(const [key,label] of [['genericSouls','汎用魂'],['soulSelectors','魂選択アイテム']] as const){const b=before.growthInventory?.[key][rarity]??0,a=after.growthInventory?.[key][rarity]??0;if(b!==a)consumed.push(`${rarity} ${label} ${b} → ${a}`);}}
 for(const [kind,label] of [['character','武将'],['equipment','装備']] as const){for(const [size,sizeLabel] of [['small','小'],['medium','中'],['large','大'],['xlarge','特大']] as const){const b=before.growthInventory?.expItems[kind][size]??0,a=after.growthInventory?.expItems[kind][size]??0;if(b!==a)consumed.push(`${label}EXP${sizeLabel} ${b} → ${a}`);}const b=before.growthInventory?.carryExp[kind]??0,a=after.growthInventory?.carryExp[kind]??0;if(b!==a)changes.push(`${label}繰越EXP ${b} → ${a}`);}
 for(const [key,label] of [['skill','スキルLB素材'],['equipmentLb','装備LB素材']] as const)if(before.materials[key]!==after.materials[key])consumed.push(`${label} ${before.materials[key]} → ${after.materials[key]}`);
 return <Modal kind="result" title={title} onClose={onClose}><div className="g4-growth-result" style={{'--g4-result-duration':`${PRESENTATION.resultDurationMs}ms`} as CSSProperties}>
 <h3>{name}</h3>
 <div className="g4-result-change"><span>{from}</span><span aria-label="から">→</span><strong className="g4-result-after"><span>{to}</span><i className="g4-result-sparks" aria-hidden="true">{Array.from({length:PRESENTATION.resultParticles},(_,i)=><i key={i} style={{'--x':`${i%2?97:0}%`,'--y':`${Math.floor(i/2)*28}%`} as CSSProperties}>✦</i>)}</i></strong></div>
 {cm&&<div className="g4-result-character"><CreativeCharacter character={cm}/></div>}
 {changes.map((line,i)=><p key={i}>{line}</p>)}{consumed.length>0&&<><h3>使用・所持数の変化</h3>{consumed.map((line,i)=><p key={i}>{line}</p>)}</>}
 </div></Modal>;
}
