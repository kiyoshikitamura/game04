import rows from './data/formalMissions.json';
import { QUEST_AREAS, QUEST_STAGES } from './quests';
import type { Reward } from './types';
import type { MissionConfig, MissionMaster } from './missions';
export const FORMAL_MISSION_VERSION='game04-missions-v1-20260921';
function condition(row: typeof rows[number]): MissionMaster['condition'] {
 const n=Number(row.id.slice(2));
 if(n<=65){const designId=row.name.match(/\d+-\d+/)![0],stage=QUEST_STAGES.find(s=>s.designId===designId);if(!stage)throw Error(`任務ステージなし:${row.id}`);return {type:'stage_clear',stageId:stage.id};}
 if(n<=75)return {type:'area_clear',areaId:QUEST_AREAS[n-66].id};
 const nums=(row.name.match(/\d+/g)??[]).map(Number);
 let key:string,threshold:number|undefined,target=nums[0]??1;
 if(n<=82) key='quest_clear';
 else if(n<=91)key='player_level';
 else if(n<=98)key='character_count';
 else if(n<=102)key='ssr_character_count';
 else if(n===103)key='soul_unlock';
 else if(n<=111){key='character_level';threshold=nums[0];target=nums[1];}
 else if(n<=117){key='character_awakening';threshold=nums[0];target=nums[1];}
 else if(n<=123)key='skill_count';
 else if(n===124)key='ssr_skill_count';
 else if(n<=132){key='skill_lb';threshold=nums[0];target=nums[1];}
 else if(n===133)key='ssr_equipment_count';
 else if(n<=145){key='equipment_level';threshold=nums[0];target=nums[1];}
 else if(n<=157){key='equipment_lb';threshold=nums[0];target=nums[1];}
 else if(n===158){key='quest_five_party';target=1;}
 else if(n===159){key='quest_skill_slot2';target=1;}
 else if(n===160){key='quest_skill_slot3';target=1;}
 else if(n===161)key='encounter_battle';
 else if(n===162)key='encounter_win';
 else if(n===163)key='encounter_other_win';
 else if(n===164)key='encounter_rescue';
 else if(n<=169)key='encounter_qualified_defeat';
 else if(n===170)key='invasion_battle';
 else if(n===171)key='invasion_win';
 else if(n<=181)key=`invasion_${['okazaki','nagahama','kasugayama','tsutsujigasaki','azuchi'][Math.floor((n-172)/2)]}_${n%2===0?'gate':'lord'}`;
 else if(n===182)key='invasion_host';
 else key='invasion_host_qualified_clear';
 return {type:'metric',key,target,threshold};
}
export const FORMAL_NORMAL_MISSIONS:MissionMaster[]=rows.map(row=>({id:row.id,name:row.name,description:row.group,enabled:true,condition:condition(row),rewards:row.rewards as Reward[]}));
/** Daily master retained but not enabled until midnight/unclaimed policy is accepted. */
export const FORMAL_DAILY_MISSIONS:MissionMaster[]=[
 ...[1,3,5].map((target,i)=>({id:`DM00${i+1}`,name:`戦闘に${target}回挑戦`,description:'デイリー',enabled:false,condition:{type:'metric' as const,key:'battle',target,daily:true},rewards:[{kind:'cash' as const,amount:[1000,2000,3000][i]},{kind:'character_exp_item' as const,id:'small',amount:[2,3,5][i]}]})),
 ...[1,3,5].map((target,i)=>({id:`DM00${i+4}`,name:`出陣で${target}回勝利`,description:'デイリー',enabled:false,condition:{type:'metric' as const,key:'quest_clear',target,daily:true},rewards:[{kind:'cash' as const,amount:[1000,2000,3000][i]},{kind:'equipment_exp_item' as const,id:'small',amount:[2,3,5][i]}]})),
 {id:'DM007',name:'ノーマル召喚を1回行う',description:'デイリー',enabled:false,condition:{type:'metric',key:'normal_gacha',target:1,daily:true},rewards:[{kind:'cash',amount:1000}]},
 {id:'DM008',name:'育成を1回行う',description:'デイリー',enabled:false,condition:{type:'metric',key:'growth',target:1,daily:true},rewards:[{kind:'cash',amount:2000}]},
 ...[3,5].map((target,i)=>({id:`DM0${i+9}`,name:`デイリー任務を${target}件達成`,description:'デイリー',enabled:false,condition:{type:'metric' as const,key:'daily_completed',target,daily:true},rewards:[{kind:'cash' as const,amount:[5000,10000][i]},{kind:i===0?'character_exp_item' as const:'equipment_exp_item' as const,id:'medium',amount:1}]})),
];
// Latest authority adds invasion-order supply without replacing the accepted 183 rows.
export const INVASION_SUPPLY_MISSIONS:MissionMaster[]=[5,10,20,30].map(target=>({
 id:`NM_INVASION_WIN_${target}`,name:`領土侵攻の個人戦で${target}回勝利`,description:'領土侵攻',enabled:true,
 condition:{type:'metric',key:'invasion_win',target},rewards:[{kind:'unlock_item',amount:1}],
}));
export const FORMAL_MISSION_CONFIG:MissionConfig={enabled:true,missions:[
 ...FORMAL_NORMAL_MISSIONS.map(m=>m.id==='NM171'?{...m,rewards:[...m.rewards,{kind:'unlock_item' as const,amount:1}]}:m),
 ...INVASION_SUPPLY_MISSIONS,...FORMAL_DAILY_MISSIONS,
]};
