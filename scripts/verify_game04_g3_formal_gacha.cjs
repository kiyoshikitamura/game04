const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(module,name)=>module._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText,name);
const base='../src/domain/redesign/';
const master=require(base+'formalGachaMaster.ts'),gacha=require(base+'formalGacha.ts'),masters=require(base+'masters.ts');
master.validateFormalGachaMaster();
const expected={character:{N:15,R:20,SR:15,SSR:10,total:60,special:45},skill:{N:9,R:33,SR:16,SSR:14,total:72,special:63},equipment:{N:35,R:50,SR:55,SSR:20,total:160,special:125}};
for(const category of master.GACHA_CATEGORIES){
 const rows=master.FORMAL_GACHA_POOL.filter(row=>row.category===category);
 assert.equal(rows.length,expected[category].total);assert.equal(master.specialGachaPool(category).length,expected[category].special);
 for(const rarity of ['N','R','SR','SSR'])assert.equal(rows.filter(row=>row.rarity===rarity).length,expected[category][rarity]);
 assert.deepEqual(master.specialGachaExchangePool(category).map(row=>row.id).sort(),master.specialGachaPool(category).filter(row=>row.rarity==='SSR').map(row=>row.id).sort());
 const displayed=master.specialGachaPool(category).reduce((sum,row)=>sum+master.formalGachaProbability(row,'special'),0);assert.ok(Math.abs(displayed-100)<1e-9);
}
assert.equal(master.FORMAL_GACHA_POOL.length,292);assert.equal(new Set(master.FORMAL_GACHA_POOL.map(row=>`${row.category}:${row.id}`)).size,292);
assert.ok(Math.abs(master.normalGachaPool().reduce((sum,row)=>sum+master.formalGachaProbability(row,'normal'),0)-100)<1e-9);
const baseState=masters.createInitialState('g3-unit');baseState.cash=100000;baseState.diamonds=10000;baseState.questTicketGrants={SPECIAL_TICKET_CHARACTER:10,SPECIAL_TICKET_SKILL:10,SPECIAL_TICKET_EQUIPMENT:10};
const sequence=(...values)=>{let i=0;return()=>values[i++%values.length]};
let draw=gacha.applyFormalSpecialGacha(baseState,{requestId:'special-char-10',category:'character',count:10,payment:'DIAMONDS'},sequence(.999,.1,.7,.2,.95,.3,.5,.4,.2,.5,.4,.6,.3,.7,.6,.8,.8,.9,.1,.99));
assert.equal(draw.state.diamonds,7000);assert.equal(draw.state.specialGachaPoints.character,10);assert.equal(draw.receipt.results.length,10);assert.equal(baseState.diamonds,10000);
let ticket=gacha.applyFormalSpecialGacha(draw.state,{requestId:'ticket-skill',category:'skill',count:1,payment:'TICKET'},sequence(.99,.1));
assert.equal(ticket.state.questTicketGrants.SPECIAL_TICKET_SKILL,9);assert.equal(ticket.state.specialGachaPoints.skill,1);
assert.throws(()=>gacha.applyFormalSpecialGacha(ticket.state,{requestId:'ticket-ten',category:'skill',count:10,payment:'TICKET'},Math.random));
const beforeFailure=structuredClone(ticket.state);assert.throws(()=>gacha.applyFormalSpecialGacha({...ticket.state,diamonds:0},{requestId:'fail',category:'equipment',count:10,payment:'DIAMONDS'},Math.random));assert.deepEqual(ticket.state,beforeFailure);
for(const payment of ['CASH','ARBITRARY']){const before=structuredClone(ticket.state);assert.throws(()=>gacha.applyFormalSpecialGacha(ticket.state,{requestId:`bad-special-${payment}`,category:'character',count:1,payment},Math.random));assert.deepEqual(ticket.state,before);}
for(const payment of ['DIAMONDS','ARBITRARY']){const before=structuredClone(ticket.state);assert.throws(()=>gacha.applyFormalNormalGacha(ticket.state,{requestId:`bad-normal-${payment}`,count:1,payment,now:0},Math.random));assert.deepEqual(ticket.state,before);}
let free=gacha.applyFormalNormalGacha(ticket.state,{requestId:'free-normal',count:10,payment:'FREE',now:Date.parse('2026-09-24T15:00:00Z')},sequence(.999,.999,.5,.5));
assert.equal(free.receipt.pointsAdded,0);assert.equal(free.state.dailyNormalGachaDate,'2026-09-25');assert.throws(()=>gacha.applyFormalNormalGacha(free.state,{requestId:'free-normal-2',count:10,payment:'FREE',now:Date.parse('2026-09-25T14:59:59Z')},Math.random));
assert.doesNotThrow(()=>gacha.applyFormalNormalGacha(free.state,{requestId:'free-normal-3',count:10,payment:'FREE',now:Date.parse('2026-09-25T15:00:00Z')},sequence(.1,.1)));
const target=master.specialGachaExchangePool('character')[0];const exchangeState={...free.state,specialGachaPoints:{...free.state.specialGachaPoints,character:205}};
const exchanged=gacha.applyFormalSsrExchange(exchangeState,{requestId:'exchange-char',category:'character',itemId:target.id});assert.equal(exchanged.state.specialGachaPoints.character,5);assert.equal(exchanged.receipt.results[0].id,target.id);
assert.throws(()=>gacha.applyFormalSsrExchange(exchangeState,{requestId:'exchange-invalid',category:'character',itemId:master.specialGachaPool('character').find(row=>row.rarity==='R').id}));
console.log('PASS G3 formal gacha: 60/72/160; special 45/63/125; exact rates; diamond/ticket/points; fail-closed payment; JST free; SSR exchange parity.');
