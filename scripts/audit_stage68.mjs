import fs from 'node:fs';
import crypto from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {simulateBattle} from '../src/domain/redesign/battle.ts';
import {CHARACTER_MASTERS as CM,EQUIPMENT_MASTERS as EM,buildBattleParty,createInitialState,BATTLE_RULES,getEquipmentStats} from '../src/domain/redesign/masters.ts';
import {getFormalOwnedSkill} from '../src/domain/redesign/formalOwnedSkills.ts';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput} from '../src/domain/redesign/questMaster.ts';
import {validateDeck} from '../src/domain/redesign/growth.ts';
import {GROWTH_VERSION,cumulativeExp,cumulativeCash,AWAKENING_SOULS,LB_STEPS,SKILL_LB_FACTORS,EQUIPMENT_LB_FACTORS} from '../src/domain/redesign/growthMaster.ts';
export const OUT='docs/verification/stage68-audit-20260926';
fs.mkdirSync(OUT+'/evidence',{recursive:true});
export const read=p=>JSON.parse(fs.existsSync(p)?fs.readFileSync(p,'utf8'):gunzipSync(fs.readFileSync(p+'.gz')).toString('utf8'));
export const write=(p,v)=>fs.writeFileSync(OUT+'/'+p,JSON.stringify(v,null,2)+'\n');
export const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function evaluate(input,start,n,save){
 const runs=[];
 for(let seed=start;seed<start+n;seed++){
  const r=simulateBattle({...structuredClone(input),seed});const ids=new Set(input.party.map(x=>x.id));
  const dmg=r.frames.filter(f=>f.event==='damage'&&ids.has(f.actorId)).map(f=>f.hits.reduce((a,b)=>a+b,0));
  const casts={},effects={},enemyCasts={};let spMin=400,spMax=0,minDef=Infinity,maxDef=0;
  for(const f of r.frames){spMin=Math.min(spMin,f.partySp);spMax=Math.max(spMax,f.partySp);for(const e of f.enemies)if(e.hp>0){minDef=Math.min(minDef,e.effectiveDef??0);maxDef=Math.max(maxDef,e.effectiveDef??0);}
   if(f.event==='action_start'){let d=ids.has(f.actorId)?casts:enemyCasts;d[f.skillId]=(d[f.skillId]??0)+1;}
   if(ids.has(f.actorId)&&['cleanse','effect_applied','heal','counter','revive'].includes(f.event)){let k=f.skillId+':'+f.event;effects[k]=(effects[k]??0)+1;}
  }
  const bursts=r.frames.filter(f=>f.event==='burst_start').length;
  const one=dmg.filter(x=>x===1).length;
  runs.push({seed,outcome:r.outcome,reason:r.reason,actions:r.playerActions,wavesCleared:r.wavesCleared,damage:r.totalDamage,damageMin:dmg.length?Math.min(...dmg):0,damageMax:dmg.length?Math.max(...dmg):0,damageEvents:dmg.length,oneDamage:one,allOne:dmg.length>0&&one===dmg.length,bursts,spMin,spMax,spGenerated:r.analysis.reduce((a,b)=>a+b.spGenerated,0),casts,enemyCasts,effects,minEnemyEffectiveDef:minDef,maxEnemyEffectiveDef:maxDef,alive:r.frames.at(-1).party.filter(x=>x.hp>0).length,resultHash:hash(r)});
  if(save&&seed===start)write('evidence/'+save+'-sample.json',r);
 }
 const wins=runs.filter(x=>x.outcome==='win').length;
 return {n,wins,winRate:wins/n,actions:[Math.min(...runs.map(x=>x.actions)),Math.max(...runs.map(x=>x.actions))],meanActions:runs.reduce((a,b)=>a+b.actions,0)/n,allOneRuns:runs.filter(x=>x.allOne).length,reasons:Object.fromEntries([...new Set(runs.map(x=>x.reason))].map(x=>[x,runs.filter(y=>y.reason===x).length])),runs};
}
export function stateFor(members,level,eqRarity=null,eqLevel=1,lb=0){
 const state=createInitialState('00000000-0000-4000-8000-000000000047');
 state.characters=[];state.skills=[];state.deck=[];state.equipment=[];state.clearedStages=stages.map(x=>x.id);state.energy=100;state.cash=0;
 const aw=Math.max(0,Math.ceil((level-50)/10)),eqLb=Math.max(0,Math.ceil((eqLevel-50)/5));
 const raw=read('src/domain/redesign/data/formal-growth-equipment.json').equipment;
 const gear=eqRarity?['WEAPON','HEAD','BODY','LEGS','ACCESSORY','ACCESSORY'].map((slot,i)=>raw.filter(e=>e.rarity===eqRarity&&e.slot===slot).sort((a,b)=>(i===0||i>3?b.level100.atk-a.level100.atk:i===2?b.level100.hp-a.level100.hp:b.level100.def-a.level100.def))[0]):[];
 members.forEach((m,i)=>{
  const cm=CM.find(x=>x.id===m.id);if(!cm)throw Error(m.id);
  state.characters.push({id:m.id,level,awakening:aw,exp:cumulativeExp('character',cm.rarity,level),growthVersion:GROWTH_VERSION});
  const member={characterId:m.id,skillIds:m.skills,equipment:{}};
  for(const id of m.skills)if(!state.skills.some(s=>s.id===id))state.skills.push({id,level:lb});
  gear.forEach((e,j)=>{const instanceId=`audit-${i}-${j}`,slot=['weapon','head','body','legs','accessory1','accessory2'][j];member.equipment[slot]=instanceId;state.equipment.push({instanceId,masterId:e.id,level:eqLevel,lb:eqLb,exp:cumulativeExp('equipment',e.rarity,eqLevel),growthVersion:GROWTH_VERSION});});
  state.deck.push(member);
 });
 validateDeck(state,state.deck);return state;
}
export function costs(state){
 let charExp=0,eqExp=0,cash=0,skillMaterials=0,equipmentMaterials=0;const souls={};
 for(const c of state.characters){let r=CM.find(m=>m.id===c.id).rarity;charExp+=cumulativeExp('character',r,c.level);cash+=cumulativeCash('character',r,c.level);souls[c.id]=AWAKENING_SOULS[r].slice(0,c.awakening).reduce((a,b)=>a+b,0);cash+=souls[c.id]*2000;}
 for(const e of state.equipment){let r=EM.find(m=>m.id===e.masterId).rarity;eqExp+=cumulativeExp('equipment',r,e.level);cash+=cumulativeCash('equipment',r,e.level);let mat=LB_STEPS.slice(0,e.lb).reduce((a,b)=>a+b,0)*EQUIPMENT_LB_FACTORS[r];equipmentMaterials+=mat;cash+=mat*500;}
 for(const s of state.skills){let r=getFormalOwnedSkill(s.id,s.level).rarity,mat=LB_STEPS.slice(0,s.level).reduce((a,b)=>a+b,0)*SKILL_LB_FACTORS[r];skillMaterials+=mat;cash+=mat*1000;}
 return {fromLevel1:true,charExp,eqExp,cash,skillMaterials,equipmentMaterials,awakeningSouls:souls,acquisitionCostsExcluded:true};
}
export function loadout(state){return state.deck.map(m=>({...state.characters.find(c=>c.id===m.characterId),name:CM.find(c=>c.id===m.characterId).name,skills:m.skillIds.map(id=>({id,lb:state.skills.find(s=>s.id===id).level})),equipment:Object.entries(m.equipment).map(([slot,id])=>{const e=state.equipment.find(e=>e.instanceId===id);return {...e,slot,stats:getEquipmentStats(EM.find(m=>m.id===e.masterId),e.level,e.lb)};})}));}
export function parseGuides(){
 const text=fs.readFileSync(OUT+'/evidence/guide-before.md','utf8');const chunks=text.split(/\n## (?=\d+-\d+ )/).slice(1);const out={};
 for(const c of chunks){const id=c.match(/^\d+-\d+/)[0],level=+(c.match(/主力Lv \d+〜(\d+)/)?.[1]??1);
 const table=c.split('|行動順|')[1]?.split('**育成')[0]??'';
 const members=table.split('\n').filter(l=>/^\|[1-5]\|/.test(l)).map(l=>{let cells=l.split('|'),cm=CM.find(x=>cells[2].includes(x.name+'（'));if(!cm)throw Error('guide character '+l);return {id:cm.id,skills:[...cells[3].matchAll(/SKD\d{3}/g)].map(x=>x[0]).slice(0,1)};});
 if(!members.length)throw Error('no members '+id);out[id]={members,level};
 }return out;
}
if(process.argv[1].endsWith('audit_stage68.mjs')){
 const guides=parseGuides(),results=[];
 const only=process.env.AUDIT_ONLY;
 for(const stage of stages.filter(s=>!only||s.designId===only)){
  const g=guides[stage.designId];const baselineState=stateFor(g.members,g.level),baselineInput=createQuestBattleInput(1,buildBattleParty(baselineState),stage,BATTLE_RULES);
  const baseline=evaluate(baselineInput,47001,20);const screens=[];let chosenState,chosenInput;
  if(baseline.wins===baseline.n){chosenState=baselineState;chosenInput=baselineInput;}
  const area=+stage.designId.split('-')[0];
  const candidates=[{level:g.level,eq:'R',el:Math.min(50,g.level),lb:Math.min(10,Math.floor(area/2))},{level:Math.min(100,g.level+10),eq:'R',el:Math.min(50,g.level+10),lb:Math.min(10,Math.floor(area/2)+2)},{level:Math.min(100,g.level+20),eq:'SR',el:Math.min(80,g.level+20),lb:Math.min(10,area+2)},{level:100,eq:'SR',el:100,lb:10},{level:100,eq:'SSR',el:100,lb:10}];
  for(const c of candidates){if(chosenState)break;let s=stateFor(g.members,c.level,c.eq,c.el,c.lb),x=createQuestBattleInput(1,buildBattleParty(s),stage,BATTLE_RULES),v=evaluate(x,48001,12);screens.push({condition:c,...v});if(v.wins===v.n){chosenState=s;chosenInput=x;}}
  let validation=null,control=null,alternative=null;
  if(chosenState){validation=evaluate(chosenInput,49001,60,stage.designId);write('evidence/'+stage.designId+'-input.json',chosenInput);write('evidence/'+stage.designId+'-state.json',chosenState);
   const noSupport=structuredClone(chosenInput);noSupport.party.forEach(p=>p.skills=p.skills.filter(s=>s.effects.some(e=>e.type==='damage')));control=evaluate(noSupport,50001,20);
   const alt=structuredClone(chosenInput);alt.party.forEach(p=>{const d=p.skills.find(s=>s.effects.some(e=>e.type==='damage'));if(d)p.skills=[getFormalOwnedSkill('SKD009',chosenState.skills.find(s=>s.id===d.id)?.level??0)];});alternative=evaluate(alt,50001,20);
  }
  const row={id:stage.id,designId:stage.designId,name:stage.name,intent:stage.description,baselineLevel:g.level,baselineInput,baseline,screens,validation,control,alternative,loadout:chosenState?loadout(chosenState):null,costs:chosenState?costs(chosenState):null,status:validation?.winRate>=.95?'conditional':validation?.wins?'unstable':'not-established'};
  results.push(row);write(only?'partial-'+only+'.json':'results.json',results);console.log(stage.designId,'baseline',baseline.wins+'/20','selected',validation?.wins+'/60',screens.at(-1)?.condition??'none');
 }
}
