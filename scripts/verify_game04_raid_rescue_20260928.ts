import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createInitialState,BATTLE_RULES} from '../src/domain/redesign/masters';
import {isTerritoryUnlocked,isTerritoryRescueUnlocked,TERRITORY_HOST_POLICY_VERSION} from '../src/domain/redesign/territory';
import {createFormalInvasionMaster} from '../src/domain/redesign/raidInvasionMaster';
import {createRaidRoom} from '../src/domain/redesign/raid';
import {APPROVED_ACQUISITION_MASTER} from '../src/domain/redesign/acquisitions';
const uid='00000000-0000-4000-8000-000000000001', rid='00000000-0000-4000-8000-000000000002';
let state:any,room:any,captured:any,handler:any;
(globalThis as any).Deno={env:{get:(k:string)=>k==='SUPABASE_URL'?'https://soiksqgtmcnspfedmanr.supabase.co':'test'},serve:(fn:any)=>handler=fn};
globalThis.fetch=async(input:any,opts:any={})=>{
 const path=new URL(String(input)).pathname;const body=opts.body?JSON.parse(opts.body):{};let result:any;
 if(path==='/auth/v1/user')result={id:uid};
 else if(path.endsWith('/users'))result=[{id:uid,username:'fixture'}];
 else if(path.endsWith('/game04_requests')||path.endsWith('/game04_battles'))result=[];
 else if(path.endsWith('/game04_acquisition_input'))result={legacy:{characters:[],skills:[],equipment:[]},events:[],master:APPROVED_ACQUISITION_MASTER};
 else if(path.endsWith('/game04_get_session_state'))result=state;
 else if(path.endsWith('/game04_raid_rooms'))result=[{state:room,version:0}];
 else if(path.endsWith('/game04_commit_growth_state')){if(body.p_raid||body.p_battle){captured=body;return new Response(JSON.stringify({message:'CAPTURE_COMPLETE'}),{status:400,headers:{'content-type':'application/json'}});}state=body.p_state;result={state};}
 else throw Error('Unexpected fixture request '+path);
 return new Response(JSON.stringify(result),{headers:{'content-type':'application/json'}});
};
await import('data:text/javascript;base64,'+fs.readFileSync('supabase/functions/game04-redesign-api/index.ts').toString('base64'));
for(const clearedStages of [[],['owari-3'],['owari-4'],['mino-5']]){
 const eligible=clearedStages.includes('owari-4')||clearedStages.includes('mino-5');
 assert.equal(isTerritoryRescueUnlocked({clearedStages}),eligible);
 assert.equal(isTerritoryUnlocked({clearedStages}),clearedStages.includes('mino-5'));
 for(const action of ['raid_join','raid_battle']){
  state=createInitialState(uid);state.clearedStages=clearedStages;state.energy=100;state.tutorial=undefined;
  const master=createFormalInvasionMaster('TI01',()=>0);
  room=createRaidRoom('TI01','00000000-0000-4000-8000-000000000003',rid,Date.now(),{masterVersion:TERRITORY_HOST_POLICY_VERSION,raidMaster:master,battleRules:BATTLE_RULES} as any);
  if(action==='raid_battle')room.participants.push({userId:uid,name:'fixture',wins:0,attempts:0,totalDamage:0,joinedLevel:1});
  captured=undefined;
  const response=await handler(new Request('https://test.invalid',{method:'POST',headers:{authorization:'Bearer test'},body:JSON.stringify({action,payload:{roomId:rid,deferSettlement:true},requestId:crypto.randomUUID()})}));
  const text=await response.text();
  if(eligible)assert.ok(captured,`${action} ${clearedStages}: ${text}`);
  else{assert.equal(captured,undefined);assert.ok(text.includes('2-4'),text);}
  console.log('PASS',action,JSON.stringify(clearedStages),eligible?'allowed through server commit boundary':'rejected before raid mutation');
 }
}
