import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import assert from 'node:assert/strict';
import {OUT,write,read,stateFor,parseGuides,hash} from './audit_stage68.mjs';
import {FORMAL_QUEST_STAGES as stages,createQuestBattleInput,questEnergyCost} from '../src/domain/redesign/questMaster.ts';
import {buildBattleParty,BATTLE_RULES} from '../src/domain/redesign/masters.ts';
import {APPROVED_ACQUISITION_MASTER} from '../src/domain/redesign/acquisitions.ts';
let handler,state,capture;const calls=[];
const context={console,structuredClone,URL,Response,Request,Headers,TextEncoder,TextDecoder,crypto:webcrypto,setTimeout,clearTimeout,Uint32Array,
 Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://znakrkaazliexzwihxge.supabase.co':'isolated-audit'},serve:f=>handler=f},
 fetch:async (u,opts={})=>{const url=new URL(String(u));assert.equal(url.hostname,'znakrkaazliexzwihxge.supabase.co');const path=url.pathname,body=opts.body?JSON.parse(opts.body):{};calls.push(path);let result;
  if(path==='/auth/v1/user')result={id:state.userId};
  else if(path.endsWith('/users'))result=[{id:state.userId,username:'isolated-stage68-audit'}];
  else if(path.endsWith('/game04_battles'))result=[];
  else if(path.endsWith('/game04_acquisition_input'))result={legacy:{characters:[],skills:[],equipment:[]},events:[],master:APPROVED_ACQUISITION_MASTER};
  else if(path.endsWith('/game04_get_session_state'))result=state;
  else if(path.endsWith('/game04_commit_growth_state')){if(body.p_battle?.status==='started'){capture=body;return new Response(JSON.stringify({message:'ISOLATED_CAPTURE_STOP'}),{status:400});}state={...body.p_state,version:state.version+1};result={state};}
  else throw Error('Unexpected isolated transport '+path);
  return new Response(JSON.stringify(result));
 }};
vm.createContext(context);vm.runInContext(fs.readFileSync(OUT+'/evidence/deployed-api-v8.ts','utf8'),context);
const guides=parseGuides(),rows=[];
for(const s of stages){const g=guides[s.designId];state=stateFor(g.members,g.level);state.earlyProgress={version:'early-retention-v1-20260926',preservedUnlockedStages:stages.map(x=>x.id),clearedAdditionalStages:['mikawa-4','mikawa-5','owari-5'],additionalStageAttempts:{},completedAreas:[],deckSlots:5,guides:{}};capture=undefined;calls.length=0;
 const res=await handler(new Request('https://isolated.invalid',{method:'POST',headers:{authorization:'Bearer isolated'},body:JSON.stringify({action:'quest_battle',payload:{stageId:s.id},requestId:webcrypto.randomUUID()})}));
 if(!capture)throw Error(s.designId+' '+await res.text());
 const expected=createQuestBattleInput(capture.p_battle.input.seed,buildBattleParty(state),s,BATTLE_RULES);
 assert.deepEqual(capture.p_battle.input,JSON.parse(JSON.stringify(expected)),s.designId);
 assert.equal(capture.p_energy_delta,0-questEnergyCost(s,state));
 rows.push({id:s.id,designId:s.designId,inputMatch:true,hash:hash(capture.p_battle.input),energyDelta:capture.p_energy_delta,calls:[...calls]});
 write('evidence/api-'+s.designId+'-input.json',capture.p_battle.input);
}
write('api-parity.json',{method:'deployed v8 bytes, strict in-memory transport, stop at first battle persistence; no real network/write',stages:rows});console.log('API input exact matches',rows.length);
