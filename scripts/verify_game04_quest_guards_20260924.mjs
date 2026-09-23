// Local-only fixture: execute the unchanged saved Edge handler with an in-memory transport.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { register } from 'node:module';
const loader = `import {readFile} from 'node:fs/promises';
export async function resolve(s,c,n){try{return await n(s,c);}catch(e){if(s.startsWith('.')||s.startsWith('file:'))for(const x of ['.ts','/index.ts']){try{return await n(s+x,c);}catch{}}throw e;}}
export async function load(u,c,n){if(u.endsWith('.json'))return {format:'module',shortCircuit:true,source:'export default '+await readFile(new URL(u),'utf8')};return n(u,c);}`;
register('data:text/javascript,' + encodeURIComponent(loader), import.meta.url);
const {createInitialState,importLegacyAssets} = await import('../src/domain/redesign/masters.ts');
const {APPROVED_ACQUISITION_MASTER,applyAcquisitionEvents} = await import('../src/domain/redesign/acquisitions.ts');
const {TERRITORY_MASTER} = await import('../src/domain/redesign/territory.ts');
const userId='00000000-0000-4000-8000-000000000024';
const requestId='00000000-0000-4000-8000-000000000025';
const originalFetch=globalThis.fetch;
const originalDeno=globalThis.Deno;
let handler, state, record, commits, calls;
globalThis.Deno={env:{get:key=>key==='SUPABASE_URL'?'https://lrgyllgzcdcphlbmkknc.supabase.co':'local-fixture-only'},serve:fn=>{handler=fn;}};
globalThis.fetch=async(input,options)=>{
 const url=new URL(String(input));assert.equal(url.hostname,'lrgyllgzcdcphlbmkknc.supabase.co');
 const p=url.pathname;calls.push(p);let value;
 if(p==='/auth/v1/user')value={id:userId};
 else if(p.endsWith('/users'))value=[{id:userId,username:'local-fixture'}];
 else if(p.endsWith('/game04_battles'))value=url.searchParams.get('id')===`eq.${requestId}`&&record?[record]:[];
 else if(p.endsWith('/game04_acquisition_input'))value={legacy:{characters:[],skills:[],equipment:[]},events:[],master:APPROVED_ACQUISITION_MASTER};
 else if(p.endsWith('/game04_get_growth_state'))value=state;
 else if(p.endsWith('/game04_commit_growth_state')){commits++;throw Error('Unexpected mutation in rejection/replay fixture');}
 else if(p.endsWith('/game04_raid_rooms_for_user')||p.endsWith('/game04_social_events')||p.endsWith('/game04_redesign_master'))value=[];
 else if(p.endsWith('/game04_territory_context'))value={master:TERRITORY_MASTER,progress:{experience:0},items:{},activeHostingCount:0};
 else throw Error(`Unexpected transport path: ${p}`);
 return new Response(JSON.stringify(value));
};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'game04-quest-guards-'));
try {
 fs.copyFileSync('supabase/functions/game04-redesign-api/index.ts',path.join(tmp,'handler.mjs'));
 await import(pathToFileURL(path.join(tmp,'handler.mjs')).href);
 const results=[];
 async function check(name,mutate,stageId,expected){
  state={...applyAcquisitionEvents(importLegacyAssets(createInitialState(userId),{characters:[],skills:[],equipment:[]}),[],APPROVED_ACQUISITION_MASTER),energy:50};record=null;commits=0;calls=[];mutate();
  const before=structuredClone(state);
  const response=await handler(new Request('https://local.invalid',{method:'POST',headers:{Authorization:'Bearer fixture'},body:JSON.stringify({action:'quest_battle',payload:{stageId},requestId})}));
  const body=await response.json();
  if(expected){assert.notEqual(response.status,200);assert.match(body.error,expected);}
  else {assert.equal(response.status,200);assert.deepEqual(body.battle,record.result.battle);assert.deepEqual(body.rewards,record.result.rewards);assert.equal(body.firstClear,false);}
  assert.equal(commits,0);assert.deepEqual(state,before);
  results.push({name,status:'PASS',httpStatus:response.status,commitCalls:commits,stateUnchanged:true,...(expected?{rejection:body.error}:{savedResultReturned:true}),transportCalls:calls});
 }
 await check('locked stage',()=>{},'mikawa-2',/未解放/);
 await check('insufficient energy',()=>{state.clearedStages=['mikawa-1'];state.energy=0;},'mikawa-1',/行動力/);
 await check('insufficient party',()=>{state.deck=state.deck.slice(0,4);},'mikawa-1',/5人/);
 await check('settled request replay',()=>{state.clearedStages=['mikawa-1'];state.energy=45;record={id:requestId,user_id:userId,status:'settled',kind:'quest',target_id:'mikawa-1',result:{battle:{outcome:'win',fixtureMarker:'saved-result'},rewards:[{kind:'cash',amount:500}],firstClear:false}};},'mikawa-1');
 const report={status:'PASS',scope:'Local fixture using unchanged saved Edge handler; all fetch calls intercepted in memory; no live HTTP/DB access.',checks:results,limitations:['Does not verify deployment environment or database transaction concurrency.','UI double-click/live DB evidence is recorded separately in LIVE_DB_READBACK.json.']};
 fs.writeFileSync('docs/design/quest/2026-09-24/GUARD_FIXTURE_VERIFICATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(results.map(({name,status,httpStatus,commitCalls})=>({name,status,httpStatus,commitCalls})),null,2));
} finally {globalThis.fetch=originalFetch;globalThis.Deno=originalDeno;fs.rmSync(tmp,{recursive:true,force:true});}
