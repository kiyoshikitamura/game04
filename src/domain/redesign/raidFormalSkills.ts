import rows from './data/raid-skill-values.json';
import definitions from './data/balance-v2.json';
import { getBalanceV2Skill } from './balanceV2Masters';
/** Use the approved rounded LB rows, not the historical preview interpolation precision. */
export function getFormalRaidSkill(id:string,lb:number){
 const row=rows.find(r=>r.design_id===id&&r.lb===lb);if(!row)throw Error(`正式レイド技能がありません: ${id}/${lb}`);
 const skill=getBalanceV2Skill(id,lb),values:Record<string,number>={};
 // A combined heal+shield must not become usable through its shield alone.
 // Approved common single-target heal condition also controls its second effect.
 if (['SKD039','SKD040','SKD068'].includes(id)) skill.condition={type:'ally_hp_below',value:.5};
 for(const text of row.performance_text.split('／')){const match=text.match(/^(.+):([\d.]+)/);if(match)values[match[1]]=Number(match[2]);}
 const labels:Record<string,string>={heal:'回復倍率',revive:'蘇生HP割合',dot:'継続ダメージ倍率',hot:'継続回復倍率',shield:'シールド倍率',counter:'反撃倍率',atk_up:'ATK強化',def_up:'DEF強化',atk_down:'ATK低下',def_down:'DEF低下'};
 for(const effect of skill.effects){
  if(effect.type==='damage'){effect.power=values['攻撃倍率']??values['通常倍率']??effect.power;if(values['条件倍率']!==undefined)effect.bonusPower=values['条件倍率'];}
  else if(effect.type==='stun'||effect.type==='taunt')effect.chance=(values['付与率']??effect.chance!*100)/100;
  else if(labels[effect.type]&&values[labels[effect.type]]!==undefined)effect.power=values[labels[effect.type]];
 }
 const definition=definitions.skills.find(entry=>entry.designId===id)!;
 return {...skill,id,name:row.name_provisional,image:'',spCost:row.sp,description:`${definition.targetDescription}・${row.performance_text}${definition.duration ? `・${definition.duration}ターン` : ''}`};
}
