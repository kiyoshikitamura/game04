import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
// The catalog now projects approved theme names through shared modules.
// Load those imports while retaining the existing economy assertions.
const { resolve, dirname, extname } = await import('node:path');
const { runInThisContext } = await import('node:vm');
const modules = new Map();
function loadTs(file) {
  const absolute = resolve(extname(file) ? file : `${file}.ts`);
  if (modules.has(absolute)) return modules.get(absolute);
  if (absolute.endsWith('.json')) return JSON.parse(readFileSync(absolute, 'utf8'));
  const module = { exports: {} };
  modules.set(absolute, module.exports);
  const code = ts.transpileModule(readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const require = name => loadTs(name.startsWith('@/') ? resolve('src', name.slice(2)) : resolve(dirname(absolute), name));
  runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: absolute })(require, module, module.exports);
  return module.exports;
}
const { SHOP_PRODUCTS_MASTER: products, remainingShopPurchases } = loadTs('src/utils/shop_master_data.ts');
const packs=products.filter(p=>p.purchaseLimit);
assert.equal(packs.length,4);
assert.deepEqual(packs.map(p=>[p.id,p.priceJpy,p.purchaseLimit]),[
 ['beginner_pack_01',100,1],['ticket_pack_01',1500,3],['growth_pack_01',500,3],['awakening_pack_01',1000,3]
]);
const total={};let price=0;
for(const p of packs){
 assert.equal(p.timeLimitHours,undefined);
 price+=p.priceJpy*p.purchaseLimit;
 for(const item of p.items) total[item.itemId]=(total[item.itemId]||0)+item.quantity*p.purchaseLimit;
 assert.equal(remainingShopPurchases(p,p.purchaseLimit),0);
 assert.equal(remainingShopPurchases(p,p.purchaseLimit+1),0);
 assert.equal(remainingShopPurchases(p,0),p.purchaseLimit);
}
assert.equal(price,9100);
assert.deepEqual(total,{
 SPECIAL_TICKET_CHARACTER:16,SPECIAL_TICKET_SKILL:16,SPECIAL_TICKET_EQUIPMENT:16,CASH:91000,
 RAID_POINT_TICKET:3,CHAR_EXP_L:90,EQUIP_EXP_L:60,AWAKENING_BOOK:9,SKILL_MANUAL:9,EQUIP_LB_PART:9
});
assert.equal(new Set(products.map(p=>p.id)).size,products.length);
assert.deepEqual(products.filter(p=>p.category==='DIAMOND').map(p=>[p.priceJpy,p.items[0].quantity]),[[300,300],[500,500],[1000,1030],[2000,2080],[5000,5240],[10000,10680]]);
assert.deepEqual(products.filter(p=>p.shopType==='NORMAL').map(p=>[p.id,p.priceDiamond,p.items[0].quantity]),[
 ['energy_1',50,1],['energy_11',500,11],['bp_1',50,1],['bp_11',500,11],['rp_1',50,1],['rp_11',500,11],
 ['cash_3000',300,3000],['cash_5200',500,5200],['cash_10500',1000,10500],['cash_32000',3000,32000]
]);
console.log('PASS: 4 packs, lifetime caps, JPY 9,100 aggregate, quantities, DIA and exchange catalog');
