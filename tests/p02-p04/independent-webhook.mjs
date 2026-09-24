/** Independent webhook dispatch/retry tests. Pure fixtures, no external effects. */
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({resolve(specifier,context,nextResolve){
 if(specifier.startsWith('.')&&context.parentURL&&!/\.[a-z]+$/i.test(specifier)){
  const url=new URL(`${specifier}.ts`,context.parentURL);if(existsSync(fileURLToPath(url)))return nextResolve(url.href,context);
 }return nextResolve(specifier,context);
}});
const {processStripeEvent}=await import('../../src/server/billing/webhook.ts');
const {BillingError}=await import('../../src/server/billing/contracts.ts');
const oid='00000000-0000-4000-8000-000000000001';
const event={id:'evt_independentqa',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_independentqa',metadata:{application:'game04'}}}};
const session={id:'cs_test_independentqa',client_reference_id:oid,metadata:{application:'game04'}};
let calls=[],grantAttempts=0,storedGranted=false,failGrant=false,failCompleted=false;
const deps={mode:'sandbox',session:async()=>{calls.push('fetch');return session;},order:async()=>({id:oid}),record:async(e,o,s,state)=>{calls.push(state);if(state==='COMPLETED'&&failCompleted){failCompleted=false;throw new Error('completion record unavailable');}},reconcile:async()=>{calls.push('reconcile');if(!storedGranted){grantAttempts++;if(failGrant){failGrant=false;throw new Error('grant unavailable');}storedGranted=true;}}};
await assert.rejects(()=>processStripeEvent({...event,livemode:true},deps)); assert.equal(calls.length,0);
assert.equal((await processStripeEvent({...event,type:'charge.refunded'},deps)).ignored,true);assert.equal(calls.length,0);
assert.equal((await processStripeEvent({...event,data:{object:{id:'cs_test_independentqa',metadata:{application:'game03'}}}},deps)).ignored,true);assert.equal(calls.length,0);
await processStripeEvent(event,deps);assert.deepEqual(calls,['fetch','RECEIVED','reconcile','COMPLETED']);assert.equal(grantAttempts,1);
await processStripeEvent(event,deps);assert.equal(grantAttempts,1);
console.log('PASS mode/app filtering, repeated notifications reconcile without trusting event log');
calls=[];storedGranted=false;grantAttempts=0;failGrant=true;
await assert.rejects(()=>processStripeEvent(event,deps),/grant unavailable/);assert.deepEqual(calls,['fetch','RECEIVED','reconcile','FAILED']);
await processStripeEvent(event,deps);assert.equal(grantAttempts,2);assert.equal(storedGranted,true);
console.log('PASS grant failure returns error and same-event retry succeeds');
calls=[];storedGranted=false;grantAttempts=0;failCompleted=true;
await assert.rejects(()=>processStripeEvent(event,deps),/completion record unavailable/);assert.equal(storedGranted,true);
await processStripeEvent(event,deps);assert.equal(grantAttempts,1);
console.log('PASS completed-log failure retries reconciliation without double fixture grant');
calls=[];
assert.equal((await processStripeEvent(event,{...deps,order:async()=>{throw new BillingError('not found',404);}})).ignored,true);
await assert.rejects(()=>processStripeEvent(event,{...deps,order:async()=>{throw new BillingError('database unavailable',503);}}));
assert.ok(!calls.includes('reconcile'));
console.log('PASS unknown shared-account order ignored; transient lookup failure remains retryable');
console.log('Independent webhook fixture groups passed: 4. DB atomicity and Stripe delivery remain external acceptance.');
