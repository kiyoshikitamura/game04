const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,n)=>m._compile(ts.transpileModule(fs.readFileSync(n,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,n);
const {isExpired,projectPaidExpiry,paidItemPaths}=require('../src/domain/redesign/paidExpiry.ts');
const {createInitialState}=require('../src/domain/redesign/masters.ts');
const {emptyGrowthInventory}=require('../src/domain/redesign/growthMaster.ts');
const T=Date.parse('2027-01-01T00:00:00Z'),rows=[];
for(const delta of [-1,0,1]){
 const state=createInitialState('expiry-unit');state.growthInventory=emptyGrowthInventory();
 const lots=[],items=[{item_id:'SPECIAL_TICKET_SKILL',quantity:17}];
 for(const [item,path] of Object.entries(paidItemPaths)){let obj=state;for(const key of path.slice(0,-1))obj=obj[key];obj[path.at(-1)]=17;lots.push({item_id:item,quantity:3,claimed:true,expires_at:new Date(T).toISOString()},{item_id:item,quantity:4,claimed:true,expires_at:new Date(T+86400000).toISOString()});}
 lots.push({item_id:'SPECIAL_TICKET_SKILL',quantity:3,claimed:true,expires_at:new Date(T).toISOString()},{item_id:'ENERGY_DRINK',quantity:2,claimed:false,expires_at:new Date(T).toISOString()});
 const original=structuredClone(state),got=projectPaidExpiry(state,items,lots,T+delta),expected=delta<0?17:14;
 for(const path of Object.values(paidItemPaths)){let obj=got.state;for(const key of path)obj=obj[key];assert.equal(obj,expected);}
 assert.equal(got.items[0].quantity,expected);assert.deepEqual(state,original);assert.equal(items[0].quantity,17);
 assert.equal(isExpired(new Date(T).toISOString(),T+delta),delta>=0);assert.equal(isExpired(null,T+delta),false);
 rows.push({relative_to_T_ms:delta,expected,actual:got.state.energyDrinks,free_quantity_preserved:10,unexpired_paid_preserved:4,unclaimed_not_subtracted:true});
}
console.log(JSON.stringify(rows,null,2));
