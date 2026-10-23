const fs = require('node:fs'), assert = require('node:assert/strict'), ts = require('typescript');
require.extensions['.ts'] = (module, name) => module._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
const g = require('../src/domain/redesign/gacha.ts');
const {createInitialState} = require('../src/domain/redesign/masters.ts');
const {SSR_HOME_BACKGROUNDS} = require('../src/domain/redesign/approvedBackgrounds.ts');
const now = Date.parse('2026-09-25T14:59:59.999Z');
function fresh() { return {...createInitialState('g3-pure-test'), characters:[],skills:[],equipment:[],cash:100000,diamonds:100000,souls:{},gachaPoints:{character:203,skill:105,equipment:107},questTicketGrants:{SPECIAL_TICKET_CHARACTER:8}}; }
function sequence(values) { let i=0; return () => values[i++ % values.length]; }
function near(a,b) { assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`); }
const counts = {normal:292,character:45,skill:63,equipment:125};
const all = [];
for (const category of Object.keys(counts)) {
 const rows=g.gachaRates(category); assert.equal(rows.length,counts[category]); assert.equal(new Set(rows.map(r=>r.kind+':'+r.id)).size,rows.length);
 near(rows.reduce((s,r)=>s+r.probability,0),100);
 for(const rarity of ['N','R','SR','SSR']) {
  const bucket=rows.filter(r=>r.rarity===rarity); near(bucket.reduce((s,r)=>s+r.probability,0),g.GACHA_CATEGORIES[category].rarityWeights[rarity]/100);
  for(const kind of ['character','skill','equipment']) {
   const group=bucket.filter(r=>r.kind===kind); if(!group.length)continue;
   for(const row of group)near(row.probability,group[0].probability);
   if(category==='normal')near(group.reduce((s,r)=>s+r.probability,0),(g.GACHA_CATEGORIES.normal.rarityWeights[rarity]/100)*({character:.2,skill:.3,equipment:.5}[kind]));
  }
 }
 if(category!=='normal')assert.deepEqual(g.gachaExchangeTargets(category).map(r=>r.id),rows.filter(r=>r.rarity==='SSR').map(r=>r.id));
 all.push(...rows.map(row=>({category,...row,ssrExchangeTarget:category!=='normal'&&row.rarity==='SSR',ticketId:g.GACHA_CATEGORIES[category].ticketId??null})));
}
// Exercise every exact rarity/category boundary and both ends of each uniform ID interval.
for(const category of Object.keys(counts)) {
 let offset=0;
 for(const rarity of ['N','R','SR','SSR']) {
  const weight=g.GACHA_CATEGORIES[category].rarityWeights[rarity]; if(!weight)continue;
  const rarityRoll=offset/10000; offset+=weight;
  let kindOffset=0;
  for(const kind of category==='normal'?['character','skill','equipment']:[category]) {
   const rows=g.gachaPool(category).filter(r=>r.rarity===rarity&&r.kind===kind);
   for(let i=0;i<rows.length;i++)for(const unit of [(i+.000001)/rows.length,(i+.999999)/rows.length]) {
    const random=sequence(category==='normal'?[rarityRoll,kindOffset/100,unit]:[rarityRoll,unit]);
    const result=g.applyGachaDraw(fresh(),{category,payment:category==='normal'?'cash':'gems',count:1},`boundary-${category}-${rarity}-${kind}-${i}-${unit}`,now,random);
    assert.equal(result.results[0].id,rows[i].id);
   }
   kindOffset+=({character:20,skill:30,equipment:50}[kind]);
  }
 }
}
for(const category of ['character','skill','equipment']) {
 for(const count of [1,10]) {
  const state=fresh(),before=structuredClone(state),r=g.applyGachaDraw(state,{category,payment:'gems',count},`${category}-${count}`,now,()=>.999999);
  assert.deepEqual(state,before); assert.equal(r.state.diamonds,state.diamonds-g.GACHA_CATEGORIES[category].singleCost*count);assert.equal(r.pointGain,count);assert.equal(r.pointsAfter,state.gachaPoints[category]+count);
  assert.ok(r.results.every(x=>x.rarity==='SSR'));assert.equal(r.state.missionProgress.daily['2026-09-25'].normal_gacha,undefined);
  if(count===10&&category==='character') { assert.equal(r.state.characters.length,1);assert.equal(r.state.souls[r.results[0].id],180);assert.equal(r.results[0].isNew,true);assert.equal(r.results[1].conversion.amount,20); }
  if(count===10&&category==='skill') { assert.equal(r.state.skills.length,1);assert.equal(r.state.skills[0].level,0);assert.equal(r.state.materials.skill-state.materials.skill,180); }
  if(count===10&&category==='equipment') { assert.equal(r.state.equipment.length,10);assert.equal(new Set(r.state.equipment.map(e=>e.instanceId)).size,10); }
  assert.throws(()=>g.applyGachaDraw(r.state,{category,payment:'gems',count},`${category}-${count}`,now,()=>{throw Error('rerolled');}),/完了済み/);
  assert.deepEqual(JSON.parse(JSON.stringify(r)).results,r.results);
 }
 const state=fresh(),ticket=g.applyGachaDraw(state,{category,payment:'ticket',count:1},`ticket-${category}`,now,()=>.999999,{ticketBalance:1});
 assert.equal(ticket.cost,1);assert.equal(ticket.state.diamonds,state.diamonds);assert.deepEqual(ticket.state.questTicketGrants,state.questTicketGrants);assert.equal(ticket.pointGain,1);assert.equal(ticket.ticketId,g.GACHA_CATEGORIES[category].ticketId);
 const target=g.gachaExchangeTargets(category)[0];const exchange=g.applyGachaExchange(state,{category,masterId:target.id},`exchange-${category}`,now);
 assert.equal(exchange.state.gachaPoints[category],state.gachaPoints[category]-g.GACHA_CATEGORIES[category].exchangePoints);assert.equal(exchange.pointGain,0);assert.equal(exchange.state.cash,state.cash);assert.equal(exchange.state.diamonds,state.diamonds);assert.equal(exchange.state.missionProgress.daily['2026-09-25'],undefined);
}
let state=fresh();state.homeBackgroundId='castle-town';
const ssr=SSR_HOME_BACKGROUNDS[0];state.souls[ssr.characterId]=39;
let exchanged=g.applyGachaExchange(state,{category:'character',masterId:ssr.characterId},'background',now);
assert.equal(exchanged.state.souls[ssr.characterId],39);assert.ok(exchanged.state.unlockedHomeBackgroundIds.includes(ssr.id));assert.equal(exchanged.state.homeBackgroundId,'castle-town');
exchanged.state.characters[0].awakening=5;exchanged.state.gachaPoints.character=200;
const capped=g.applyGachaExchange(exchanged.state,{category:'character',masterId:ssr.characterId},'cap',now);
assert.equal(capped.state.souls[ssr.characterId],59);assert.equal(capped.state.unlockedHomeBackgroundIds.filter(id=>id===ssr.id).length,1);
const skill=g.gachaExchangeTargets('skill')[0];state=fresh();state.skills=[{id:skill.id,level:10}];const lb=g.applyGachaExchange(state,{category:'skill',masterId:skill.id},'lb10',now);assert.equal(lb.state.materials.skill-state.materials.skill,20);
state=fresh();const free=g.applyGachaDraw(state,{category:'normal',payment:'free',count:10},'free',now,()=>0);
assert.equal(free.state.cash,state.cash);assert.equal(free.state.dailyNormalGachaDate,'2026-09-25');assert.equal(free.state.missionProgress.daily['2026-09-25'].normal_gacha,10);assert.deepEqual(free.state.gachaPoints,state.gachaPoints);
assert.throws(()=>g.applyGachaDraw(free.state,{category:'normal',payment:'free',count:10},'free-again',now,()=>0));
const tomorrow=g.applyGachaDraw(free.state,{category:'normal',payment:'free',count:10},'free-tomorrow',now+1,()=>0);assert.equal(tomorrow.state.dailyNormalGachaDate,'2026-09-26');assert.equal(tomorrow.state.missionProgress.daily['2026-09-26'].normal_gacha,10);
const paid=g.applyGachaDraw(state,{category:'normal',payment:'cash',count:10},'paid',now,()=>0);assert.equal(paid.state.cash,state.cash-10000);assert.equal(paid.state.dailyNormalGachaDate,undefined);
for(const [payload,overrides,context] of [
 [{category:'normal',payment:'cash',count:1},{cash:999},{}],
 [{category:'character',payment:'gems',count:1},{diamonds:299},{}],
 [{category:'character',payment:'ticket',count:1},{},{ticketBalance:0}],
 [{category:'character',payment:'ticket',count:10},{},{ticketBalance:10}],
 [{category:'normal',payment:'gems',count:1},{},{}],
 [{category:'normal',payment:'free',count:1},{},{}],
 [{category:'__proto__',payment:'cash',count:1},{},{}],
]) { const original={...fresh(),...overrides},before=structuredClone(original);assert.throws(()=>g.applyGachaDraw(original,payload,'fail',now,()=>0,context));assert.deepEqual(original,before); }
for(const invalid of [-1,1,NaN,Infinity]){state=fresh();const before=structuredClone(state);assert.throws(()=>g.applyGachaDraw(state,{category:'normal',payment:'cash',count:10},'invalid-rng',now,()=>invalid));assert.deepEqual(state,before);}
state=fresh();const before=structuredClone(state);assert.throws(()=>g.applyGachaExchange(state,{category:'skill',masterId:g.gachaPool('skill').find(r=>r.rarity==='R').id},'bad-exchange',now));assert.deepEqual(state,before);
const dir='docs/verification/g3-20260925';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(`${dir}/formal-gacha-pool-correspondence.json`,JSON.stringify({masterVersion:g.GACHA_MASTER_VERSION,probabilityUnit:'percent',sampling:'integer rarity; normal category 20/30/50; uniform index within kind and rarity; no rounded weights',categories:g.GACHA_CATEGORIES,rows:all},null,2)+'\n');
console.log('PASS G3: 292 formal IDs, 45/63/125 specials; all interval endpoints; probabilities/categories/uniformity; cash/gems/tickets/free/exchange; duplicate/cap/soul preservation; missions/JST/background; pure failure/replay guard. No DB grants.');
