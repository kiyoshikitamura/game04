/** Independent pure tests. No DB, Stripe HTTP, credentials or real accounts used. */
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && context.parentURL && !/\.[a-z]+$/i.test(specifier)) {
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
  }
  return nextResolve(specifier, context);
}});
const { verifyStripeEvent, validateSession, billingConfig, validateCheckoutOrigin } = await import('../../src/server/billing/contracts.ts');
const { reconcileCheckout } = await import('../../src/server/billing/reconciliation.ts');
let assertions=0;
const test = async (name, action) => { await action(); assertions++; console.log(`PASS ${name}`); };
const order = {id:'orderqa',user_id:'playerqa',product_id:'qa_product',amount_jpy:1000,billing_mode:'sandbox',status:'PENDING',stripe_session_id:'cs_test_qafixture',created_at:'2026-09-24T00:00:00Z',product_snapshot:{title:'QA only',items:[]}};
const paid = {id:order.stripe_session_id,livemode:false,status:'complete',payment_status:'paid',amount_total:1000,currency:'jpy',client_reference_id:order.id,metadata:{order_id:order.id,user_id:order.user_id,product_id:order.product_id,application:'game04'}};
await test('authentic paid session only',()=>{
 assert.equal(validateSession(paid,order),true);
 for(const patch of [{status:'open'},{payment_status:'unpaid'},{payment_status:'no_payment_required'},{status:'expired'}]) assert.equal(validateSession({...paid,...patch},order),false);
});
await test('tampered payment identity amount currency and mode rejected',()=>{
 for(const patch of [{amount_total:999},{currency:'usd'},{livemode:true},{id:'cs_live_wrong'},{client_reference_id:'other'},{metadata:{...paid.metadata,user_id:'other'}},{metadata:{...paid.metadata,product_id:'other'}},{metadata:{...paid.metadata,order_id:'other'}}]) assert.throws(()=>validateSession({...paid,...patch},order));
 assert.throws(()=>validateSession(paid,{...order,stripe_session_id:'cs_test_other'}));
});
await test('webhook raw body tampering stale signatures and multiple signatures',()=>{
 const raw=JSON.stringify({id:'evt_qa',livemode:false}),t='1790208000',now=Number(t)*1000,secret='whsec_qa_fixture';
 const sig=createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex');
 assert.equal(verifyStripeEvent(raw,`t=${t},v1=${sig}`,secret,now).id,'evt_qa');
 assert.throws(()=>verifyStripeEvent(raw+' ',`t=${t},v1=${sig}`,secret,now));
 assert.throws(()=>verifyStripeEvent(raw,`t=${t},v1=${sig}`,secret,now+301000));
 assert.equal(verifyStripeEvent(raw,`t=${t},v1=${'0'.repeat(64)},v1=${sig}`,secret,now).id,'evt_qa');
});
await test('sandbox production wrong database and redirect boundary',()=>{
 const env={BILLING_MODE:'sandbox',BILLING_SANDBOX_ENABLED:'true',VERCEL_ENV:'preview',NEXT_PUBLIC_APP_ENV:'preview',NEXT_PUBLIC_SUPABASE_URL:'https://lrgyllgzcdcphlbmkknc.supabase.co',STRIPE_SECRET_KEY:'sk_test_qa_fixture',STRIPE_WEBHOOK_SECRET:'whsec_qa_fixture',SUPABASE_SERVICE_ROLE_KEY:'qa_fixture',BILLING_RETURN_ORIGIN:'https://qa-game04.example.com'};
 assert.equal(billingConfig(env).mode,'sandbox');
 for(const patch of [{BILLING_MODE:'live'},{VERCEL_ENV:'production'},{NEXT_PUBLIC_SUPABASE_URL:'https://ktpolnkyyfkowxdmijww.supabase.co'},{STRIPE_SECRET_KEY:'sk_live_qa_fixture'},{BILLING_RETURN_ORIGIN:'https://www.tribe-neon.com'},{BILLING_SANDBOX_ENABLED:'false'},{BILLING_RETURN_ORIGIN:'https://qa-game04.example.com/other'}]) assert.throws(()=>billingConfig({...env,...patch}));
 assert.throws(()=>validateCheckoutOrigin(new Request('https://other.example.com/api/billing/checkout'),env.BILLING_RETURN_ORIGIN));
});
await test('unpaid complete stays pending without grant',async()=>{
 const calls=[]; const deps={order:async()=>order,validate:validateSession,rpc:async name=>{calls.push(name);}};
 assert.equal((await reconcileCheckout({...paid,payment_status:'unpaid'},deps)).status,'PENDING');assert.deepEqual(calls,[]);
});
await test('delayed unpaid notification cannot demote granted',async()=>{
 const calls=[]; const deps={order:async()=>({...order,status:'GRANTED'}),validate:validateSession,rpc:async name=>{calls.push(name);}};
 assert.equal((await reconcileCheckout({...paid,status:'expired',payment_status:'unpaid'},deps)).status,'GRANTED');assert.deepEqual(calls,[]);
});
await test('grant failure propagates then same order retries',async()=>{
 let stored={...order},attempts=0;
 const deps={order:async()=>stored,validate:validateSession,rpc:async(name)=>{assert.match(name,/grant_order/);attempts++;if(attempts===1)throw new Error('fixture transient grant failure');stored={...stored,status:'GRANTED'};return {status:'GRANTED',order_id:stored.id};}};
 await assert.rejects(()=>reconcileCheckout(paid,deps),/transient/);
 assert.equal(stored.status,'PENDING');assert.equal((await reconcileCheckout(paid,deps)).status,'GRANTED');
 assert.equal((await reconcileCheckout(paid,deps)).status,'GRANTED');assert.equal(attempts,2);
});
await test('expiry racing successful grant rereads authoritative order',async()=>{
 let stored={...order}; const deps={order:async()=>stored,validate:validateSession,rpc:async(name)=>{assert.match(name,/expire_order/);stored={...order,status:'GRANTED'};}};
 assert.equal((await reconcileCheckout({...paid,status:'expired',payment_status:'unpaid'},deps,order)).status,'GRANTED');
});
console.log(`Independent billing fixture groups passed: ${assertions}. Not live Stripe/DB acceptance.`);
