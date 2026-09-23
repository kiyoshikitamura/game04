import { getFormalRaidSkill } from './raidFormalSkills';
import data from './data/raid-encounter.json';
import roster from '../../theme/sengoku-characters.json';
import { characterArt } from '../../theme/creativeAssets';
import { getCharacterPassive, BALANCE_V2_CHARACTER_ASSIGNMENTS } from './balanceV2Masters';
import type { EnemyUnit, RaidMaster, Reward, Rarity, Element } from './types';

export const RAID_MASTER_VERSION = data.version;
export function raidExpItems(kind: 'character_exp_item' | 'equipment_exp_item', amount: number): Reward[] {
 const rewards: Reward[]=[];
 for(const [id,value] of [['xlarge',20000],['large',5000],['medium',1000],['small',100]] as const){const count=Math.floor(amount/value);if(count)rewards.push({kind,id,amount:count});amount%=value;}
 if(amount)throw Error('EXP報酬は100単位で設定してください。');return rewards;
}
export function formalRaidCharacter(name:string){
 const character=roster.find(c=>c.name===name);if(!character)throw Error(`正式武将が見つかりません: ${name}`);
 const assignment=BALANCE_V2_CHARACTER_ASSIGNMENTS.find(c=>c.id===character.characterId);if(!assignment)throw Error(`正式割当が見つかりません: ${name}`);
 return {id:character.characterId,name:character.name,image:characterArt({id:character.characterId,name:character.name,image:character.imagePath},'battle')??character.imagePath,rarity:assignment.rarity as Rarity,element:assignment.element as Element};
}
function raidSkill(id:string,lb:number){const skill=getFormalRaidSkill(id,lb);if(['SKD039','SKD040'].includes(id))skill.condition={type:'ally_hp_below',value:.5};return skill;}
export const FORMAL_ENCOUNTER_MASTERS: RaidMaster[]=data.encounters.map(row=>{
 const definition=data.bosses.find(b=>b.designId===row.designId)!;
 const character=formalRaidCharacter(row.name), band=row.area<=3?0:row.area<=6?1:row.area<=8?2:3;
 const passiveLevel=row.area<=3?0:row.area<=6?2:row.area<=8?4:row.area===9?6:8;
 const passive=getCharacterPassive(character,passiveLevel/2);
 const enemy:EnemyUnit={id:`encounter_a${row.area}_${row.designId}`,name:character.name,image:character.image,element:character.element,level:row.level,stats:{hp:row.hp,atk:row.atk,def:row.def,sp:definition.sp,luk:0},initialSp:definition.sp,hitSpGain:10,initialCount:row.count,actionCount:row.count,order:0,boss:true,skills:definition.skills.map(id=>raidSkill(id,row.lb)),passives:passive?[passive]:[]};
 const escorts:Record<string,[string,string[]][]>={ERB10:[['山本勘助',['SKD037']],['前田利家',[]]],ERB15:[['上杉景勝',['SKD036']],['お市の方',['SKD039']]]};
 const enemies=[enemy,...(escorts[row.designId]??[]).map(([name,skills],index):EnemyUnit=>{
  const c=formalRaidCharacter(name),p=getCharacterPassive(c,passiveLevel/2),round10=(value:number)=>Math.round(value/10)*10;
  return {id:`${enemy.id}_escort${index+1}`,name:c.name,image:c.image,element:c.element,level:row.level,stats:{hp:round10(row.hp*.2),atk:round10(row.atk*.45),def:round10(row.def*.5),sp:100,luk:0},initialSp:100,hitSpGain:10,initialCount:9,actionCount:9,order:index+1,skills:skills.map(id=>raidSkill(id,row.lb)),passives:p?[p]:[]};
 })];
 const victoryRewards:Reward[]=[{kind:'cash',amount:[3000,6000,9000,12000][band]},...raidExpItems('character_exp_item',[1000,2500,5000,10000][band]),...raidExpItems('equipment_exp_item',[500,1500,3000,6000][band]),{kind:'soul',id:character.id,amount:character.rarity==='SR'&&band>0?2:1,chance:(character.rarity==='SR'?[.75,.5,.6,.75]:[.3,.4,.6,.7])[band]}];
 return {id:enemy.id,masterVersion:RAID_MASTER_VERSION,characterId:character.id,area:row.area,name:character.name,type:'encounter',enemy,enemies,energyCost:20,durationMinutes:60,maxParticipants:10,maxLevel:1,appearanceLevels:[1],appearanceImages:{},enemyGrowthPerLevel:0,sharedHpGrowthPerLevel:0,victoryMultiplier:1.5,sharedHp:row.sharedHp,participationRewards:[],victoryRewards,playerExp:[80,100,120,160,200,240,300,360,440,520][row.area-1],defeatRewards:[{kind:'soul',id:character.id,amount:band<2?1:2},...raidExpItems('character_exp_item',[5000,20000,20000,40000][band]),...raidExpItems('equipment_exp_item',[5000,20000,20000,40000][band]),{kind:'skill_material',amount:[2,4,6,8][band]},{kind:'equipment_lb',amount:[2,4,6,8][band]},{kind:'cash',amount:[5000,10000,20000,30000][band]}]};
});
/** Call only after the quest's encounter roll succeeds; rarity first, then equal within rarity. */
export function selectEncounterMaster(area:number,random:()=>number):RaidMaster {
 const ssr=random()<[0,0,.1,.2,.25,.3,.4,.5,.6,.7][area-1];
 const choices=FORMAL_ENCOUNTER_MASTERS.filter(m=>m.area===area&&(formalRaidCharacter(m.name).rarity==='SSR')===ssr);
 if(!choices.length)throw Error('正式遭遇プールがありません。');return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
}
