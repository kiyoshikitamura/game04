import fs from 'node:fs';import zlib from'node:zlib';import{pathToFileURL}from'node:url';
import{simulateBattle}from'../src/domain/redesign/battle.ts';
import{FORMAL_QUEST_STAGES as STAGES,createQuestBattleInput}from'../src/domain/redesign/questMaster.ts';
import{buildBattleParty,BATTLE_RULES,CHARACTER_MASTERS as CM}from'../src/domain/redesign/masters.ts';
import{getFormalOwnedSkill,FORMAL_SKILL_MASTERS}from'../src/domain/redesign/formalOwnedSkills.ts';
import{stateFor,costs,loadout,hash,read,OUT as OLD}from'./audit_stage68.mjs';
export const OUT='docs/verification/stage68-five-tier-20260926';fs.mkdirSync(OUT,{recursive:true});
export const save=(name,obj)=>{let p=OUT+'/'+name,b=JSON.stringify(obj);if(p.endsWith('.gz'))b=zlib.gzipSync(b);fs.writeFileSync(p+'.tmp',b);fs.renameSync(p+'.tmp',p);};
export const IDS=['char_joe_01','char_yuki_01','char_daimon_01','char_jihoon_01','char_aoi_01'];
export function profile(s){let a=+s.designId.split('-')[0],i=s.index;const levels=[[1,3,5,7,9],[9,9,9,9,9],[20,22,24,26,28],[30,32,34,36,38],[40,42,44,46,48,50],[50,52,54,56,58,60],[60,62,64,66,68,70,72,74],[74,75,76,77,78,79,80,80],Array(10).fill(80),Array(10).fill(80)];return {area:a,level:levels[a-1][i-1],eq:a<4?null:a<7?'N':'R',eqLevel:a<4?1:a===4?20:a===5?30:a===6?40:a===7?30:a===8?40:50,lb:a<3?0:a<5?2:a<7?3:a<9?4:5};}
function skill(n){return 'SKD'+String(n).padStart(3,'0');}
function bestElement(s){const hp={fire:0,water:0,earth:0,wind:0,light:0,dark:0};for(const e of s.waves.flat())hp[e.element]=(hp[e.element]??0)+e.stats.hp;return Object.entries(hp).sort((a,b)=>b[1]-a[1])[0][0];}
const effective={fire:'water',water:'earth',earth:'wind',wind:'fire',light:'dark',dark:'light'},weak={fire:'wind',water:'fire',earth:'water',wind:'earth',light:'light',dark:'dark'},els=['fire','water','earth','wind','light','dark'];
export function theme(s){let d=s.description;if(/弱体|能力低下|能力を戻す/.test(d))return 'weaken';if(/継続ダメージ|継続被害|継続被害/.test(d))return 'dot';if(/反撃/.test(d))return 'counter';if(/後ろ|後列|支援を止め/.test(d))return 'backline';if(/全体|並んだ|分散/.test(d))return 'area';if(/保護|障壁|回復源|二重/.test(d))return 'purge-protection';if(/強化された|固めた|再付与|崩す場所/.test(d))return 'purge-buff';if(/止まった|状態|対策枠|解除|妨害/.test(d))return 'cleanse';if(/通常攻撃|SPを/.test(d))return 'basic';return 'boost';}
export function candidates(s){const p=profile(s),area=p.area;let idList=IDS;if(area===1&&s.index===1)idList=[IDS[0],IDS[2],IDS[4]];else if(area===1&&s.index<=3)idList=[IDS[0],IDS[2],IDS[3],IDS[4]];
 const pool=new Set([3,35,39,...(area>1||s.index>=3?[9]:[]),...(area>1||s.index>=5?[19]:[]),...(area>=3?[34,38,10,29,40,43]:[]),...(area>=4?[1,2,4,5,6,7,8,11,12,26,27,36,37,41,43,45,48,49]:[]),...(area>=5?[20,21,22,23,24,61,62]:[]),...(area>=6?[32,53,54,55,70]:[]),...(area>=7?[51,52]:[]),...(area>=8?[44]:[])]);
 const st=n=>pool.has(n)?n:pool.has(9)?9:3;let es=els.indexOf(effective[bestElement(s)]),ew=els.indexOf(weak[bestElement(s)]),hit=st(7+es),bad=st(7+ew),aoe=st(19+es);
 const definitions=[
 ['boost','attack-up',[3,35,hit,9,39]],['boost','double-rock',[3,35,9,9,39]],['weaken','armor-break',[3,38,hit,9,39]],['weaken','break-and-buff',[35,38,hit,9,39]],
 ['dot','poison-boost',[3,35,29,9,39]],['dot','poison-control',[37,38,29,hit,43]],['area','area-boost',[3,35,aoe,19,41]],['backline','rear-focus',[3,35,26,27,39]],
 ['counter','counter-boost',[49,35,hit,9,39]],['sustain','defensive',[36,37,hit,9,43]],['sustain','barrier',[45,35,hit,9,39]],['control','stun',[3,32,hit,26,39]],
 ['purge-buff','remove-buff',[51,35,hit,9,39]],['purge-protection','remove-protection',[52,35,hit,9,39]],['cleanse','cleanse-dot',[54,35,hit,9,39]],['cleanse','cleanse-stat',[53,35,hit,9,39]],['cleanse','cleanse-stun',[55,35,hit,9,39]],
 ['basic','cheap-attacks',[3,35,3,3,39]],['basic','basic-focus',[35,3,3,3,39]],['raw','no-support',[3,3,hit,9,39]],['raw','all-attack',[hit,hit,hit,hit,hit]],['raw','all-cheap',[3,3,3,3,3]],['raw','no-heal',[3,35,hit,9,hit]],['boost','poor-element',[3,35,bad,bad,39]],
 ];
 if(area>=3){definitions.push(['sp-feed','burst-focus',[[],[],[hit],[9],[39]]],['sp-feed','support-feed',[[],[35],[hit],[9],[39]]],['sp-feed','burst-focus-regen',[[],[],[hit],[9],[43]]],['sp-feed','burst-focus-greater-heal',[[],[],[hit],[9],[40]]],['sp-feed','break-regen',[[],[38],[hit],[9],[43]]]);}
 if(p.level>50){definitions.push(['sp-order','expensive-first',[[3],[35],[aoe,hit],[hit,3],[39]]],['sp-order','cheap-first',[[3],[35],[3,hit],[3,hit],[39]]],['counter','taunt-counter',[[49,48],[35],[hit],[9],[39]]]);}
 const defs=definitions.filter(([f,n,ss])=>ss.flat().every(v=>pool.has(v)));
 const result=[],seen=new Set();
 for(const [family,name,ss]of defs){let members=idList.map(id=>{const idx=IDS.indexOf(id);return {id,skills:(Array.isArray(ss[idx])?ss[idx]:[ss[idx]]).map(skill)};});let state=stateFor(members,p.level,p.eq,p.eqLevel,p.lb);
 if(p.eq){for(const d of state.deck){delete d.equipment.accessory1;delete d.equipment.accessory2;if(area===4){delete d.equipment.head;delete d.equipment.legs;}}let used=new Set(state.deck.flatMap(d=>Object.values(d.equipment)));state.equipment=state.equipment.filter(e=>used.has(e.instanceId));}
 // Deduplicate identical early recipes after reduced roster.
 const k=JSON.stringify(state.deck.map(d=>d.skillIds));if(seen.has(k))continue;seen.add(k);
 result.push({name,family,profile:p,state,party:buildBattleParty(state),costs:costs(state)});
 if(['attack-up','armor-break','rear-focus'].includes(name)){const alt=structuredClone(state);alt.deck.reverse();result.push({name:name+'-reversed',family:'order-error',profile:p,state:alt,party:buildBattleParty(alt),costs:costs(alt)});}
 }
 return result;
}
export function run(input,start,n,full=false){const runs=[];for(let seed=start;seed<start+n;seed++){let r=simulateBattle({...structuredClone(input),seed});const partyIds=new Set(input.party.map(p=>p.id));let one=0,count=0,min=Infinity,max=0,spent=0,prev=r.frames[0].partySp,positive=0,negative=0;const casts={},effects={},sources={},waveActions={},waveDamage={};let previousFrame=r.frames[0];for(const f of r.frames){waveActions[f.wave]=Math.max(waveActions[f.wave]??0,f.playerActions??0);const lost=f.party.reduce((n,p)=>n+Math.max(0,(previousFrame.party.find(q=>q.id===p.id)?.hp??p.hp)-p.hp),0);if(lost){let source=f.actorId;if(f.event==='dot')source=previousFrame.party.find(p=>p.id===f.actorId)?.statuses.filter(s=>s.type==='dot').sort((a,b)=>(b.amount??0)-(a.amount??0))[0]?.sourceId??source;if(source&&!partyIds.has(source))sources[source]=(sources[source]??0)+lost;}previousFrame=f;let delta=f.partySp-prev;if(delta>0)positive+=delta;else negative-=delta;if(f.event==='action_start'&&partyIds.has(f.actorId)){casts[f.skillId]=(casts[f.skillId]??0)+1;spent-=Math.min(0,delta);}if(partyIds.has(f.actorId)&&['effect_applied','cleanse','heal','revive','counter'].includes(f.event))effects[f.skillId+':'+f.event]=(effects[f.skillId+':'+f.event]??0)+1;if(f.event==='damage'&&partyIds.has(f.actorId)){const d=f.hits.reduce((a,b)=>a+b,0);count++;one+=d===1?1:0;let wd=waveDamage[f.wave]??={count:0,one:0,total:0};wd.count++;wd.one+=d===1?1:0;wd.total+=d;min=Math.min(min,d);max=Math.max(max,d);}prev=f.partySp;}
 runs.push({seed,outcome:r.outcome,reason:r.reason,actions:r.playerActions,waves:r.wavesCleared,damage:r.totalDamage,minDamage:count?min:0,maxDamage:max,oneDamage:one,damageEvents:count,bursts:r.analysis.reduce((a,b)=>a+b.bursts,0),spGain:positive,spLoss:negative,spSpent:spent,spEnd:prev,sources,waveActions,waveDamage,...(full?{casts,effects,summaryHash:hash({outcome:r.outcome,reason:r.reason,actions:r.playerActions,waves:r.wavesCleared,analysis:r.analysis,final:r.frames.at(-1)})}:{})});}
 const wins=runs.filter(r=>r.outcome==='win').length;return {n,wins,rate:wins/n,actions:[Math.min(...runs.map(r=>r.actions)),Math.max(...runs.map(r=>r.actions))],meanActions:runs.reduce((n,r)=>n+r.actions,0)/n,reasons:Object.fromEntries([...new Set(runs.map(r=>r.reason))].map(x=>[x,runs.filter(r=>r.reason===x).length])),runs};}
export function inputFor(s,c){return createQuestBattleInput(1,c.party,s,BATTLE_RULES);}
export function grade(v){if(v.wins===v.n)return '最適解（検証全勝）';if(v.wins===0)return '未勝利（観測0%）';if(v.rate<=.1)return 'ほぼ厳しい';if(v.rate<.45)return 'ギリギリ';return '次点';}
export function alter(s,evals,cands,step){const sorted=evals.map((v,i)=>({v,c:cands[i]})).sort((a,b)=>b.v.wins-a.v.wins||Math.max(...b.v.runs.map(x=>x.waves))-Math.max(...a.v.runs.map(x=>x.waves))||b.v.runs.reduce((a,b)=>a+b.damage,0)-a.v.runs.reduce((a,b)=>a+b.damage,0));let best=sorted[0];if(best.v.wins===best.v.n){const winnerFamily=best.c.family;best=sorted.find(x=>x.c.family!==winnerFamily&&!['raw','order-error','sp-order'].includes(x.c.family)&&x.v.wins<x.v.n)??best;}let changes=[];
 const change=(enemy,field,value,reason)=>{let before=enemy.stats[field];if(value>=before)return;enemy.stats[field]=Math.max(1,Math.round(value));changes.push({enemy:enemy.id,field:'stats.'+field,before,after:enemy.stats[field],reason});};
 const failed=best.v.runs.filter(r=>r.outcome!=='win');let reached=Math.min(s.waves.length-1,Math.min(...(failed.length?failed:best.v.runs).map(x=>x.waves)));const timed=failed.filter(r=>r.reason==='action_limit');if(timed.length){const durations={};for(const r of timed){let previous=0;for(const [w,n]of Object.entries(r.waveActions??{})){durations[+w-1]=(durations[+w-1]??0)+n-previous;previous=n;}}const longest=Object.entries(durations).sort((a,b)=>b[1]-a[1])[0];if(longest)reached=+longest[0];}let wave=s.waves[reached];
 const direct=cands;const force=Math.max(...direct.flatMap(c=>c.party.flatMap(p=>p.skills.filter(k=>k.effects.some(e=>e.type==='damage')).map(k=>p.stats.atk*Math.max(...k.effects.filter(e=>e.type==='damage').map(e=>e.power))/100))));
 const blockers=Number.isFinite(force)&&force>0?wave.filter(e=>e.stats.def>force*.83):[];
 if(blockers.length){for(const e of blockers)change(e,'def',Math.min(e.stats.def*.86,force*.82),'防御が到達火力を上回る敵のみ突破余地を確保');return changes;}
 const limits=failed.filter(r=>r.reason==='action_limit').length;
 if(limits>failed.length/2){const oneRatio=best.v.runs.reduce((n,r)=>n+(r.waveDamage?.[reached+1]?.one??r.oneDamage),0)/Math.max(1,best.v.runs.reduce((n,r)=>n+(r.waveDamage?.[reached+1]?.count??r.damageEvents),0));if(oneRatio>.55){const e=[...wave].sort((a,b)=>b.stats.def-a.stats.def)[0];change(e,'def',e.stats.def*.85,'強化後DEF/実ダメージの停滞を確認した敵を局所調整');return changes;}const healers=wave.filter(e=>e.skills.some(k=>k.effects.some(f=>['heal','hot'].includes(f.type))));if(healers.length&&step%3===0){const e=healers.sort((a,b)=>b.stats.atk-a.stats.atk)[0];change(e,'atk',e.stats.atk*.84,'回復供給の膠着を緩和し処理順の選択を残す');}else{const e=[...wave].sort((a,b)=>b.stats.hp-a.stats.hp)[0];change(e,'hp',e.stats.hp*.8,'300行動に収まらない耐久負担を局所調整');}return changes;}
 const threat=e=>e.stats.atk*Math.max(100,...e.skills.flatMap(k=>k.effects.filter(f=>f.type==='damage').map(f=>f.power*(k.target==='all_enemies'?3:1))))/Math.max(1,e.actionCount);
 const sourceTotals={};for(const r of (failed.length?failed:best.v.runs))for(const [id,v]of Object.entries(r.sources??{}))sourceTotals[id]=(sourceTotals[id]??0)+v;const sourceId=Object.entries(sourceTotals).sort((a,b)=>b[1]-a[1])[0]?.[0];const e=s.waves.flat().find(e=>e.id===sourceId)??[...wave].sort((a,b)=>threat(b)-threat(a))[0];change(e,'atk',e.stats.atk*.85,'全派の実HP損失から主な攻撃・継続被害の発生源を局所調整');return changes;
}
export async function screenStage(s){const cs=candidates(s),proposal=structuredClone(s),history=[];let vs;
 // Stage 3-1 inherits the separately explored candidate, not a live-master edit.
 if(s.designId==='3-1')for(const w of proposal.waves){const e=w[0];history.push({enemy:e.id,field:'stats.def',before:e.stats.def,after:550,reason:'既存の防御低下/攻撃強化2系統の独立評価を引継ぎ'});e.stats.def=550;}
 const original=cs.map(c=>run(inputFor(s,c),81001,6));
 for(let step=0;step<42;step++){
  vs=step===0&&s.designId!=='3-1'?original:cs.map(c=>run(inputFor(proposal,c),81001,6));
  let top=vs.findIndex(v=>v.wins===6),best=vs.reduce((a,b)=>Math.max(a,b.wins),0);let multiple=top>=0&&vs.some((v,i)=>cs[i].family!==cs[top].family&&!['raw','order-error'].includes(cs[i].family)&&v.wins>=3);
  if(top>=0&&(multiple||profile(s).area<=2))break;
  if(step===41)break;history.push(...alter(proposal,vs,cs,step));
 }
 const out={stage:s.designId,id:s.id,name:s.name,intent:s.description,profile:profile(s),status:'UNAPPROVED_ISOLATED_PROPOSAL',stageOriginal:s,stageProposal:proposal,history,candidates:cs.map((c,i)=>({name:c.name,family:c.family,state:c.state,costs:c.costs,original:original[i],screen:vs[i]}))};save(s.designId+'-screen.json.gz',out);console.log(s.designId,'candidates',cs.length,'changes',history.length,'best',Math.max(...vs.map(x=>x.wins)), 'families',cs.filter((c,i)=>vs[i].wins>=3&&!['raw','order-error'].includes(c.family)).map(c=>c.family).join(','));return out;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){let ids=(process.env.STAGE_IDS??'').split(',').filter(Boolean);for(const s of STAGES.filter(s=>!ids.length||ids.includes(s.designId)))await screenStage(s);}
