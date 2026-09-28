import fs from'node:fs';import zlib from'node:zlib';import{buildBattleParty}from'../src/domain/redesign/masters.ts';import{OUT,save,run,inputFor,candidates,alter}from'./rebuild_stage68_five_tier.mjs';import{simulateBattle}from'../src/domain/redesign/battle.ts';import{loadout,hash}from'./audit_stage68.mjs';
const read=n=>JSON.parse(zlib.gunzipSync(fs.readFileSync(OUT+'/'+n+'.json.gz')));
const excluded=['raw','order-error','sp-order'];
import{mechanics}from'./stage68_five_tier_mechanics.mjs';
export{mechanics}from'./stage68_five_tier_mechanics.mjs';
const ids=(process.env.STAGE_IDS??'').split(',').filter(Boolean);
for(const id of ids){const x=read(id+'-validated'),screen=read(id+'-screen');save(id+'-validation-v1.json.gz',x);const cs=screen.candidates.map(c=>({...c,party:buildBattleParty(c.state)}));for(const c of candidates(x.stageOriginal).filter(c=>c.family==='sp-feed'))if(!cs.some(t=>t.name===c.name))cs.push(c);let proposal=structuredClone(x.stageProposal),history=[...x.history],iterations=[],valids=[];
 for(let round=0;round<5;round++){
  const start=86001+round*1000;
  // Discovery reused only for revisions, never presented as final independent validation.
  for(const c of cs)c.discovery=run(inputFor(proposal,c),85001,30,true);
  let ranked=[...cs].sort((a,b)=>b.discovery.wins-a.discovery.wins||a.discovery.meanActions-b.discovery.meanActions);let top=ranked.find(c=>!excluded.includes(c.family)&&mechanics(c,c.discovery))??ranked[0];
  for(let step=0;step<18;step++){
   const checks=ranked.filter(c=>!excluded.includes(c.family)&&mechanics(c,c.discovery)).slice(0,8);for(const c of checks)c.robust=run(inputFor(proposal,c),85001,60,true);
   checks.sort((a,b)=>b.robust.wins-a.robust.wins||a.robust.meanActions-b.robust.meanActions);top=checks.find(c=>mechanics(c,c.robust))??checks[0];const alt=checks.find(c=>c.family!==top.family&&mechanics(c,c.robust)&&c.robust.rate>=.6);
   if(top.robust.wins===60&&alt)break;
   let target=top.robust.wins<60?top:checks.find(c=>c.family!==top.family&&mechanics(c,c.robust))??checks[1];let changes=alter(proposal,[target.robust],[target],step);history.push(...changes);iterations.push({round,step,recipe:target.name,wins:target.robust.wins,n:60,changes});
   // Numerical firepower comparison in alter must use actual candidates if support-only target; no runtime mutation.
  }
  for(const c of cs)c.selection=run(inputFor(proposal,c),85501,20,true);
  ranked=[...cs].sort((a,b)=>b.selection.wins-a.selection.wins||a.selection.meanActions-b.selection.meanActions);top=ranked.find(c=>!excluded.includes(c.family)&&mechanics(c,c.selection))??ranked[0];const alternate=ranked.find(c=>c.family!==top.family&&!excluded.includes(c.family)&&mechanics(c,c.selection));const chosen=new Map();const add=(c,role)=>{if(!c)return;if(chosen.has(c.name))chosen.get(c.name).roles.push(role);else chosen.set(c.name,{...c,roles:[role]});};add(top,'primary');add(alternate,'different-mechanism');
  // Include robust-tested winner even if the short selection sample tied differently.
  const safe=cs.filter(c=>c.robust?.wins===60&&mechanics(c,c.robust)).sort((a,b)=>a.robust.meanActions-b.robust.meanActions)[0];add(safe,'robust-candidate');
  for(const sk of top.state.skills.filter(s=>alternate?.state.skills.some(t=>t.id===s.id))){if(['SKD003','SKD009'].includes(sk.id))continue;add(ranked.find(c=>!c.state.skills.some(s=>s.id===sk.id)&&!excluded.includes(c.family)),'without-'+sk.id);}
  for(const [role,target]of [['target60',.6],['target30',.3],['target10',.1],['target0',0]])add([...cs].sort((a,b)=>Math.abs(a.selection.rate-target)-Math.abs(b.selection.rate-target))[0],role);
  valids=[];for(const c of chosen.values()){const input=inputFor(proposal,c);valids.push({name:c.name,family:c.family,roles:c.roles,state:c.state,loadout:loadout(c.state),costs:c.costs,input,inputHash:hash(input),selection:c.selection,validation:run(input,start,200,true)});}
  const winner=valids.find(c=>c.validation.wins===200&&!excluded.includes(c.family)&&mechanics(c,c.validation));const other=winner&&valids.find(c=>c.family!==winner.family&&!excluded.includes(c.family)&&mechanics(c,c.validation)&&c.validation.rate>=.6);save(id+'-round-'+round+'.json.gz',{stage:id,proposal,history,iterations,records:valids,seeds:[start,start+199]});
  console.log(id,'round',round,'best',Math.max(...valids.map(c=>c.validation.wins)),'valid',!!winner,!!other);
  if(winner&&other||+id.split('-')[0]<=2||round===4){const primary=winner??valids.reduce((a,b)=>a.validation.wins>=b.validation.wins?a:b),base=primary.input,rev=structuredClone(base);rev.party.reverse();const before=[primary,other].filter(Boolean).map(c=>({name:c.name,family:c.family,input:inputFor(x.stageOriginal,{party:buildBattleParty(c.state)}),validation:run(inputFor(x.stageOriginal,{party:buildBattleParty(c.state)}),start,200,true)}));save(id+'-validated.json.gz',{...x,stageProposal:proposal,history,stabilization:iterations,validationSeeds:[start,start+199],selection:cs.map(c=>({name:c.name,family:c.family,state:c.state,results:c.selection})),records:valids,before,controls:[{name:'exact-party-order-reversed',input:rev,validation:run(rev,start,200,true)}]});save(id+'-sample-trace.json.gz',{input:base,seed:start,result:simulateBattle({...base,seed:start})});break;}
  // A failed independent round becomes discovery evidence for the next numerical revision. Preserve it.
  const target=valids.reduce((a,b)=>a.validation.wins>=b.validation.wins?a:b);const changes=alter(proposal,[target.validation],[{...target,party:target.input.party}],round);history.push(...changes);iterations.push({round,holdoutFailure:true,changes});
 }
}
