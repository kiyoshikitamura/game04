import rows from './data/raid-skill-values.json';
import definitions from './data/balance-v2.json';
import presentation from './data/formal-skill-presentation.json';
import { getBalanceV2Skill } from './balanceV2Masters';
/** Preserve numeric.md unrounded effect values; LB rows supply SP and display text only. */
export function getFormalRaidSkill(id:string,lb:number){
 const row=rows.find(r=>r.design_id===id&&r.lb===lb);if(!row)throw Error(`正式レイド技能がありません: ${id}/${lb}`);
 const skill=getBalanceV2Skill(id,lb);
 // A combined heal+shield must not become usable through its shield alone.
 // Approved common single-target heal condition also controls its second effect.
 if (['SKD039','SKD040','SKD068'].includes(id)) skill.condition={type:'ally_hp_below',value:.5};
 const definition=definitions.skills.find(entry=>entry.designId===id)!;
 const art=presentation.find(entry=>entry.id===id);if(!art)throw Error(`正式技能の表示定義がありません: ${id}`);
 return {...skill,id,name:art.name,image:art.image,spCost:row.sp,description:`${definition.targetDescription}・${row.performance_text}${definition.duration ? `・${definition.duration}ターン` : ''}`};
}
