const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const esbuild=require(process.env.ESBUILD_MODULE||'esbuild');
fs.mkdirSync('scratch/starter-catalog',{recursive:true});
for(const [name,entry] of [['catalog','src/server/billing/catalog.ts'],['shop','src/utils/shop_master_data.ts']])
 esbuild.buildSync({entryPoints:[entry],bundle:true,platform:'node',outfile:`scratch/starter-catalog/${name}.cjs`});
const {catalogMatches,PAID_PACKS}=require(path.resolve('scratch/starter-catalog/catalog.cjs'));
const {SHOP_PRODUCTS_MASTER}=require(path.resolve('scratch/starter-catalog/shop.cjs'));
const rows=JSON.parse(fs.readFileSync('docs/verification/starter-promotion-20260928/catalog-input.json'));
assert(catalogMatches(rows),'actual isolated DB catalogue must permit checkout');
const ui=SHOP_PRODUCTS_MASTER.find(p=>p.id==='beginner_pack_01'),server=PAID_PACKS.find(p=>p.id===ui.id);
assert.equal(ui.priceJpy,100);assert.equal(ui.purchaseLimit,1);
assert.deepEqual(Object.fromEntries(ui.items.map(i=>[i.itemId,i.quantity])),server.items);
for(const change of [r=>r.items[0].quantity=1,r=>r.items.push({itemId:'ENERGY_DRINK',quantity:2}),r=>r.amount_jpy=99,r=>r.purchase_limit=0]){
 const invalid=structuredClone(rows);change(invalid.find(p=>p.id===ui.id));assert(!catalogMatches(invalid));
}
console.log('PASS actual DB catalogue + UI/server agreement; wrong quantity/extra item/price/limit rejected');
