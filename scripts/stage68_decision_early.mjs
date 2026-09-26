import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {stateFor,costs,loadout,hash} from './audit_stage68.mjs';
import {buildBattleParty} from '../src/domain/redesign/masters.ts';
import {run,inputFor} from './rebuild_stage68_five_tier.mjs';
const source='docs/verification/stage68-five-tier-20260926';
const out='docs/verification/stage68-decision-20260927';
const rows=JSON.parse(fs.readFileSync(`${source}/audit-table.json`));
const read=id=>JSON.parse(zlib.gunzipSync(fs.readFileSync(`${source}/${id}-validated.json.gz`)));
const save=(path,d)=>{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path+'.tmp',zlib.gzipSync(JSON.stringify(d)));fs.renameSync(path+'.tmp',path);};
const ids=process.argv.slice(2);
for(const id of ids){
 const path=`${out}/${id}-early.json.gz`;if(fs.existsSync(path)){console.log(id,'checkpoint already saved');continue;}
 const d=read(id),r=rows.find(r=>r.stage===id),base=d.records.find(c=>c.name===r.primary.name);
 const skillIds=id==='1-1'?[['SKD035'],['SKD003'],['SKD003']]:id==='1-2'?[['SKD003'],['SKD003'],['SKD003'],['SKD039']]:[[],[],['SKD019'],[],['SKD039']];
 assert.equal(skillIds.length,base.state.deck.length);
 const state=stateFor(base.state.deck.map((m,i)=>({id:m.characterId,skills:skillIds[i]})),r.profile.level,null,1,0);
 assert(state.skills.every(s=>r.acquisition.availableGuaranteedSkills.includes(s.id)));
 const input=inputFor(d.stageProposal,{party:buildBattleParty(state)}),inputHash=hash(input);
 const prior=[...d.records,...d.controls].find(c=>hash(c.input)===inputHash);
 const name=id==='1-1'?'starter-buff-first':id==='1-2'?'starter-rush':'starter-area-sp-feed';
 const core=id==='1-1'?'SKD035':id==='1-2'?'SKD003':'SKD019';
 const result={stage:id,name,core,state,loadout:loadout(state),costs:costs(state),input,inputHash,enemyUnchanged:true,supplyChanged:false,newTrials:0,status:'SCREEN_ONLY'};
 if(prior){result.validation=prior.validation;result.reused={path:`../stage68-five-tier-20260926/${id}-validated.json.gz`,name:prior.name};result.status='REUSED';}
 else {
  result.screen=run(input,210001,20,true);result.newTrials=20;save(path,result);
  // A bounded new strategy check: retain losing candidates for tier evidence as well.
  result.validation=run(input,211001,200,true);result.newTrials+=200;result.status='VALIDATED_NEW_INPUT';
 }
 result.coreActivationRuns=result.validation.runs.filter(r=>(r.casts?.[core]??0)>0).length;
 result.coreEffectRuns=result.validation.runs.filter(r=>Object.entries(r.effects??{}).some(([k,n])=>k.startsWith(core+':')&&n>0)).length;
 save(path,result);console.log(JSON.stringify({stage:id,name,wins:result.validation.wins,n:result.validation.n,core,active:result.coreActivationRuns,newTrials:result.newTrials}));
}
