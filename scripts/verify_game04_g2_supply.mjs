import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// The same extension-less domain imports used by the application, without a bundler dependency.
registerHooks({
 resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL) {
   const url = new URL(specifier, context.parentURL);
   if (!/\.[a-z]+$/i.test(url.pathname) && existsSync(fileURLToPath(url) + '.ts')) return next(url.href + '.ts', context);
  }
  return next(specifier, context);
 },
 load(url, context, next) {
  if (url.endsWith('.json')) return { format: 'module', source: `export default ${readFileSync(fileURLToPath(url),'utf8')}`, shortCircuit: true };
  return next(url, context);
 },
});
const { loginBonusForDay, nextLoginBonus, LOGIN_BONUS_VERSION, jstLoginDate } = await import('../src/domain/redesign/loginBonus.ts');
const { VIP_PRODUCT, dueVipGrants, vipPurchasePeriod, isVipActive } = await import('../src/domain/redesign/vip.ts');
const totals = {};
let gems = 0;
for (let day=1; day<=30; day++) {
 const row = loginBonusForDay(day); gems += row.freeDiamonds;
 for (const r of row.rewards) totals[`${r.kind}:${r.id??''}`] = (totals[`${r.kind}:${r.id??''}`]??0)+r.amount;
}
assert.deepEqual(totals, {'soul:char_reiji_01':60,'cash:':300000,'character_exp_item:large':6,'equipment_exp_item:large':12,'ticket:SPECIAL_TICKET_CHARACTER':2,'ticket:SPECIAL_TICKET_SKILL':4,'ticket:SPECIAL_TICKET_EQUIPMENT':2});
assert.equal(gems,300);
const at = Date.parse('2026-09-24T14:59:59Z');
assert.equal(jstLoginDate(at),'2026-09-24'); assert.equal(jstLoginDate(at+1000),'2026-09-25');
const p={version:LOGIN_BONUS_VERSION,totalLogins:30,lastGrantedDate:'2026-09-20'};
const n=nextLoginBonus(p,at);assert.equal(n.grant.day,1);assert.equal(n.progress.totalLogins,31);
assert.equal(nextLoginBonus(n.progress,at).grant,null);
assert.equal(nextLoginBonus(n.progress,at+1000).grant.day,2);
const start='2026-09-24T01:02:03Z', now=Date.parse(start), hour=3600000;
assert.equal(VIP_PRODUCT.priceJpy,480);
assert.equal(dueVipGrants(start,[],now-1).length,0);
assert.equal(dueVipGrants(start,[],now).length,1);
assert.equal(dueVipGrants(start,[1],now+24*hour-1).length,0);
assert.equal(dueVipGrants(start,[1],now+24*hour).length,1);
assert.equal(dueVipGrants(start,[],now+696*hour).length,30);
assert.equal(dueVipGrants(start,[],now+720*hour).reduce((n,r)=>n+r.freeDiamonds,0),3000);
const expiry=vipPurchasePeriod(null,start).expiresAt;
assert.equal(isVipActive(expiry,now+720*hour-1),true);
assert.equal(isVipActive(expiry,now+720*hour),false);
assert.throws(()=>vipPurchasePeriod(expiry,start));
assert.doesNotThrow(()=>vipPurchasePeriod(expiry,expiry));
const { applyShopEnergyDrink, applyShopExchange } = await import('../src/domain/redesign/shop.ts');
const state={userId:'unit',version:0,diamonds:500,cash:0,energy:99,energyMax:100,energyDrinks:2,souls:{},materials:{unlock:0}};
assert.equal(applyShopEnergyDrink(state).energy,149);
assert.equal(applyShopEnergyDrink(state).energyDrinks,1);
assert.equal(state.energy,99);
assert.throws(()=>applyShopEnergyDrink({...state,energy:100}));
assert.throws(()=>applyShopEnergyDrink({...state,energyDrinks:0}));
assert.equal(applyShopExchange(state,{exchangeId:'energy_drink',quantity:10}).energyDrinks,12);
assert.equal(applyShopExchange(state,{exchangeId:'energy_drink',quantity:10}).diamonds,0);
for(const payload of [{exchangeId:'constructor'},{exchangeId:'toString'},{exchangeId:'energy_drink',quantity:1.5},{exchangeId:'raid_unlock',quantity:2}]) assert.throws(()=>applyShopExchange(state,payload));
console.log('PASS: approved 30-login totals/JST/repeat/no-backfill; VIP exact 24h/696h/720h/retry/repurchase; medicine overflow/non-consumption; exchange integer/ID/quantity guards. DOMAIN ONLY.');
const { FORMAL_MISSION_CONFIG, FORMAL_NORMAL_MISSIONS, FORMAL_DAILY_MISSIONS } = await import('../src/domain/redesign/formalMissions.ts');
const { evaluateMissions, getClaimableMission } = await import('../src/domain/redesign/missions.ts');
const { captureMissionAssets, recordMissionEvent } = await import('../src/domain/redesign/missionProgress.ts');
const { createInitialState } = await import('../src/domain/redesign/masters.ts');
assert.equal(FORMAL_NORMAL_MISSIONS.length,183);assert.equal(FORMAL_DAILY_MISSIONS.length,10);
assert.equal(new Set(FORMAL_MISSION_CONFIG.missions.map(m=>m.id)).size,197);
assert.equal(FORMAL_MISSION_CONFIG.missions.flatMap(m=>m.rewards).filter(r=>r.kind==='unlock_item').reduce((n,r)=>n+r.amount,0),5);
const initial=createInitialState('mission-test');
const cleared={...initial,clearedStages:['mikawa-1']};
assert.equal(evaluateMissions(cleared,FORMAL_MISSION_CONFIG).find(m=>m.id==='NM001').status,'claimable');
assert.equal(evaluateMissions(cleared,FORMAL_MISSION_CONFIG).find(m=>m.id==='NM002').status,'progress');
assert.throws(()=>getClaimableMission({...cleared,claimedMissionIds:['NM001']},FORMAL_MISSION_CONFIG,'NM001'));
const grown=captureMissionAssets({...initial,equipment:[{instanceId:'one',masterId:'test',level:100,lb:10}]});
grown.equipment=[];
assert.equal(evaluateMissions(grown,FORMAL_MISSION_CONFIG).find(m=>m.id==='NM143').status,'claimable');
const event={id:'settled:first',counters:['battle','quest_clear'],at};
const once=recordMissionEvent(initial,event),twice=recordMissionEvent(once,event);
assert.equal(twice.missionProgress.counters.battle,1);
assert.equal(twice.missionProgress.daily['2026-09-24'].quest_clear,1);
const missionTotals={};for(const m of FORMAL_NORMAL_MISSIONS)for(const r of m.rewards)missionTotals[r.kind]=(missionTotals[r.kind]??0)+r.amount;
assert.equal(missionTotals.cash,1427000);assert.equal(missionTotals.skill_material,494);assert.equal(missionTotals.equipment_lb,551);assert.equal(missionTotals.soul,150);
console.log('PASS: normal183/daily10 unique master; first clear reward/no duplicate claim; dismantled instance history; settled event dedupe; approved cash/LB/soul totals. Daily unresolved policies remain disabled.');
