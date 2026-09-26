import fs from'node:fs';import zlib from'node:zlib';import{simulateBattle}from'../src/domain/redesign/battle.ts';import{buildBattleParty}from'../src/domain/redesign/masters.ts';import{getFormalOwnedSkill}from'../src/domain/redesign/formalOwnedSkills.ts';import{loadout,hash}from'./audit_stage68.mjs';import{save,OUT,run,inputFor,grade}from'./rebuild_stage68_five_tier.mjs';
const excluded=['raw','order-error','sp-order'];
const ids=(process.env.STAGE_IDS??'').split(',');
for(const id of ids.filter(Boolean)){
 const x=JSON.parse(zlib.gunzipSync(fs.readFileSync(OUT+'/'+id+'-screen.json.gz')));const cs=x.candidates.map(c=>({...c,party:buildBattleParty(c.state)}));const p=x.stageProposal;
 for(const c of cs)c.selection=run(inputFor(p,c),82001,20);
 const sorted=[...cs].sort((a,b)=>b.selection.wins-a.selection.wins||a.selection.meanActions-b.selection.meanActions);
 const primary=sorted.find(c=>!excluded.includes(c.family))??sorted[0];const alternate=sorted.find(c=>c.family!==primary.family&&!excluded.includes(c.family));
 const chosen=new Map();const add=(c,role)=>{if(!c)return;if(chosen.has(c.name))chosen.get(c.name).roles.push(role);else chosen.set(c.name,{...c,roles:[role]});};add(primary,'primary');add(alternate,'different-mechanism');
 const shared=primary.state.skills.map(s=>s.id).filter(s=>alternate?.state.skills.some(t=>t.id===s)&&!['SKD003','SKD009'].includes(s));
 for(const skill of shared){const alternative=sorted.find(c=>!c.state.skills.some(s=>s.id===skill)&&!excluded.includes(c.family));if(alternative)add(alternative,'without-'+skill);}
 for(const [name,target]of [['target60',.6],['target30',.3],['target10',.1],['target0',0]]){let a=[...cs].sort((a,b)=>Math.abs(a.selection.rate-target)-Math.abs(b.selection.rate-target)||a.selection.meanActions-b.selection.meanActions);add(a[0],name);}
 const records=[];
 for(const c of chosen.values()){const input=inputFor(p,c),validation=run(input,84001,200,true);records.push({name:c.name,family:c.family,roles:c.roles,state:c.state,loadout:loadout(c.state),costs:c.costs,input,inputHash:hash(input),selection:c.selection,validation,grade:grade(validation)});}
 const before=[primary,alternate].filter(Boolean).map(c=>({name:c.name,family:c.family,input:inputFor(x.stageOriginal,c),validation:run(inputFor(x.stageOriginal,c),84001,200,true)}));
 const base=inputFor(p,primary);const reversed=structuredClone(base);reversed.party.reverse();
 const controls=[{name:'exact-party-order-reversed',input:reversed,validation:run(reversed,84001,200,true)}];
 const metrics=records.map(c=>({name:c.name,roles:c.roles,win:c.validation.wins,n:c.validation.n}));
 const out={stage:id,id:x.id,name:x.name,intent:x.intent,profile:x.profile,status:'UNAPPROVED_ISOLATED_PROPOSAL',selectionSeeds:[82001,82020],validationSeeds:[84001,84200],stageOriginal:x.stageOriginal,stageProposal:p,history:x.history,selection:cs.map(c=>({name:c.name,family:c.family,state:c.state,results:c.selection})),records,before,controls};save(id+'-validated.json.gz',out);save(id+'-sample-trace.json.gz',{input:base,seed:84001,result:simulateBattle({...base,seed:84001})});console.log(id,JSON.stringify(metrics));
}
