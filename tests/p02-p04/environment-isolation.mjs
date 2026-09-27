import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && context.parentURL && !/\.[a-z]+$/i.test(specifier)) {
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
  }
  return nextResolve(specifier, context);
}});
const { billingConfig, sandboxEnvironmentChecks, assertPurchaseOperatingStates } = await import('../../src/server/billing/contracts.ts');
const { isValidSupabaseUrl } = await import('../../src/utils/supabaseUrl.ts');
const dev = 'https://znakrkaazliexzwihxge.supabase.co';
const prod = 'https://soiksqgtmcnspfedmanr.supabase.co';
const sandbox = { BILLING_MODE:'sandbox', BILLING_SANDBOX_ENABLED:'true', VERCEL_ENV:'preview', NEXT_PUBLIC_APP_ENV:'preview', NEXT_PUBLIC_SUPABASE_URL:dev, STRIPE_SECRET_KEY:'sk_test_fixture', STRIPE_WEBHOOK_SECRET:'whsec_fixture', SUPABASE_SERVICE_ROLE_KEY:'fixture', BILLING_RETURN_ORIGIN:'https://game04-preview.example.com' };
const live = {...sandbox, BILLING_MODE:'live', BILLING_LIVE_ENABLED:'true', VERCEL_ENV:'production', NEXT_PUBLIC_APP_ENV:'production', NEXT_PUBLIC_SUPABASE_URL:prod, STRIPE_SECRET_KEY:'sk_live_fixture', BILLING_RETURN_ORIGIN:'https://sengoku-hime-ennbu.com'};
assert.equal(billingConfig(sandbox).mode,'sandbox');
assert.equal(billingConfig(live).mode,'live');
let rejected=0;
for (const [environment, correct] of [['preview',dev],['production',prod]]) {
  for (const url of [dev,prod,'https://ktpolnkyyfkowxdmijww.supabase.co','https://lrgyllgzcdcphlbmkknc.supabase.co','https://api.tribe-neon.com']) {
    assert.equal(isValidSupabaseUrl(url,environment),url===correct);
  }
}
for (const patch of [{VERCEL_ENV:'preview'},{NEXT_PUBLIC_APP_ENV:'preview'},{NEXT_PUBLIC_SUPABASE_URL:dev},{BILLING_LIVE_ENABLED:'false'},{STRIPE_SECRET_KEY:'sk_test_fixture'},{BILLING_RETURN_ORIGIN:'https://game04-preview.example.com'},{BILLING_RETURN_ORIGIN:'https://www.sengoku-hime-ennbu.com'},{BILLING_RETURN_ORIGIN:'https://tribe-neon.com'},{BILLING_RETURN_ORIGIN:'https://sengoku-hime-ennbu.com:8443'}]) {
  assert.throws(()=>billingConfig({...live,...patch}));rejected++;
}
for (const patch of [{VERCEL_ENV:'production'},{NEXT_PUBLIC_APP_ENV:'production',NEXT_PUBLIC_SUPABASE_URL:prod},{STRIPE_SECRET_KEY:'sk_live_fixture'},{BILLING_RETURN_ORIGIN:'https://sengoku-hime-ennbu.com'},{BILLING_RETURN_ORIGIN:'https://www.sengoku-hime-ennbu.com'},{BILLING_RETURN_ORIGIN:'https://api.tribe-neon.com'},{BILLING_MODE:'invalid'}]) {
  assert.throws(()=>billingConfig({...sandbox,...patch}));rejected++;
}
assert.equal(sandboxEnvironmentChecks(live).preview_database,false);
assert.equal(sandboxEnvironmentChecks(live).return_origin_valid,false);
const states=[{feature_key:'MAINTENANCE',state:'MAINTENANCE',mutation_allowed:false},{feature_key:'PAYMENT',state:'OPEN',mutation_allowed:true}];
assert.throws(()=>assertPurchaseOperatingStates(states,'PAYMENT',false));
assert.doesNotThrow(()=>assertPurchaseOperatingStates(states,'PAYMENT',true));
assert.throws(()=>assertPurchaseOperatingStates([states[0],{...states[1],state:'CLOSED'}],'PAYMENT',true));
console.log(`PASS sandbox/live contracts; ${rejected} mixed configurations rejected; maintenance/tester gate retained. Pure fixture, not deployed acceptance.`);
