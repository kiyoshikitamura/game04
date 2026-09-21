const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, name) => module._compile(ts.transpileModule(fs.readFileSync(name,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, esModuleInterop:true}}).outputText, name);
const base='../src/domain/redesign/';
const g=require(base+'growth.ts'), m=require(base+'growthMaster.ts'), masters=require(base+'masters.ts');
const acq=require(base+'acquisitions.ts'), normal=require(base+'normalGacha.ts');
const s=masters.createInitialState('qa');
s.cash=10000000;s.growthInventory=m.emptyGrowthInventory();
s.growthInventory.expItems.character={small:10000,medium:10000,large:10000,xlarge:10000};
s.growthInventory.expItems.equipment={small:10000,medium:10000,large:10000,xlarge:10000};
const id=s.characters[0].id, rarity=masters.CHARACTER_MASTERS.find(x=>x.id===id).rarity;
const original=JSON.stringify(s);
let leveled=g.applyGrowthAction(s,'character_level',{characterId:id,items:{xlarge:100}});
assert.equal(leveled.characters[0].level,50);
assert.equal(leveled.characters[0].exp,m.cumulativeExp('character',rarity,50));
assert.equal(leveled.cash,s.cash-m.cumulativeCash('character',rarity,50));
assert.equal(JSON.stringify(s),original);
const before=JSON.stringify(leveled);
assert.throws(()=>g.applyGrowthAction(leveled,'character_level',{characterId:id,items:{small:1}}));
assert.equal(JSON.stringify(leveled),before);
const poor=structuredClone(s);poor.cash=0;assert.throws(()=>g.applyGrowthAction(poor,'character_level',{characterId:id,items:{xlarge:1}}));assert.equal(poor.growthInventory.expItems.character.xlarge,10000);
const specific=m.AWAKENING_SOULS[rarity][0];s.souls[id]=specific*2+1;
let exchanged=g.applyGrowthAction(s,'soul_exchange',{characterId:id,amount:specific*2});assert.equal(exchanged.souls[id],1);assert.equal(exchanged.growthInventory.genericSouls[rarity],specific);
let awakened=g.applyGrowthAction(exchanged,'character_awaken',{characterId:id,specificSouls:0,genericSouls:specific});assert.equal(awakened.characters[0].awakening,1);assert.equal(awakened.characters[0].level,1);assert.equal(awakened.cash,s.cash-specific*2000);
assert.throws(()=>g.applyGrowthAction(s,'soul_exchange',{characterId:id,amount:3}));
const player=m.applyPlayerExperience(1,0,1000,20,100);assert.equal(player.level,7);assert.equal(player.energy,100);assert.equal(m.applyPlayerExperience(1,0,1000,120,100).energy,120);assert.equal(m.applyPlayerExperience(99,m.playerCumulativeExp(99),99999,10,100).energy,100);assert.equal(m.applyPlayerExperience(100,m.playerCumulativeExp(100),99999,10,100).energy,10);
const pool=[];for(const [kind,list,gacha_id] of [['CHARACTER',masters.CHARACTER_MASTERS,'CHAR_NORMAL'],['SKILL',masters.SKILL_MASTERS,'SKILL_NORMAL'],['EQUIPMENT',masters.EQUIPMENT_MASTERS,'EQUIP_NORMAL']])for(const item of list)pool.push({gacha_id,item_id:item.id,item_type:kind,rarity:item.rarity});
const policy={...acq.PREVIEW_ACQUISITION_MASTER,characterDuplicateSouls:20,skillDuplicateMaterials:m.DUPLICATE_SKILL_MATERIALS,characterAtCap:'convert',skillAtCap:'convert'};
assert.equal(normal.applyNormalGacha(s,{count:1,currency:'CASH'},pool,'one',0,policy,()=>0).cost,1000);
assert.equal(normal.applyNormalGacha(s,{count:10,currency:'CASH'},pool,'ten',0,policy,()=>0).cost,10000);
const free=normal.applyNormalGacha(s,{count:10,currency:'FREE'},pool,'free',0,policy,()=>0);assert.equal(free.cost,0);assert.throws(()=>normal.applyNormalGacha(free.state,{count:10,currency:'FREE'},pool,'again',0,policy,()=>0));
console.log('PASS: EXP上限・銭差分・不足時非消費・魂交換/併用・Lv回復境界・有料/無料ガチャ');

const authority=fs.readFileSync(require('node:path').join(__dirname,'../docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md'),'utf8');
const tables=authority.split('## 付録A.')[1].split('## 付録B.')[0].split('### 装備');
for(const [index,kind] of ['character','equipment'].entries()){
 const rows=tables[index].split('\n').filter(line=>/^\| \d+ \|/.test(line));assert.equal(rows.length,100);
 for(const row of rows){const cells=row.split('|').map(x=>x.trim());const level=Number(cells[1]);for(const [r,rarity] of ['N','R','SR','SSR'].entries()){const [exp,cash]=cells[r+2].replaceAll(',','').split('/').map(Number);assert.equal(m.cumulativeExp(kind,rarity,level),exp);assert.equal(m.cumulativeCash(kind,rarity,level),cash);}}
}
const equipmentMaster=masters.EQUIPMENT_MASTERS.find(e=>e.rarity==='SSR');
const eq=structuredClone(s);eq.equipment=[{instanceId:'item',masterId:equipmentMaster.id,level:1,lb:0,exp:0,growthVersion:m.GROWTH_VERSION}];eq.materials.equipmentLb=1000;
const lb=g.applyGrowthAction(eq,'equipment_lb',{instanceId:'item'});assert.equal(lb.equipment[0].level,1);assert.equal(lb.equipment[0].lb,1);assert.equal(lb.materials.equipmentLb,994);assert.equal(lb.cash,eq.cash-3000);
const trained=g.applyGrowthAction(eq,'equipment_level',{instanceId:'item',items:{xlarge:20}});assert.equal(trained.equipment[0].level,50);assert.throws(()=>g.applyGrowthAction(trained,'equipment_dismantle',{instanceIds:['item']}));const broken=g.applyGrowthAction(trained,'equipment_dismantle',{instanceIds:['item'],confirmTrained:true});assert.equal(broken.materials.equipmentLb,1020);assert.equal(broken.cash,trained.cash);
const locked=structuredClone(eq);locked.equipment[0].locked=true;assert.throws(()=>g.applyGrowthAction(locked,'equipment_dismantle',{instanceIds:['item']}));
const unseen=masters.CHARACTER_MASTERS.find(c=>!s.characters.some(o=>o.id===c.id));const waiting=structuredClone(s);waiting.souls[unseen.id]=99;
const events=[{id:'char-first',kind:'character',masterId:unseen.id},{id:'char-duplicate',kind:'character',masterId:unseen.id}];const got=acq.applyAcquisitionEvents(waiting,events,policy);assert.equal(got.souls[unseen.id],119);assert.deepEqual(acq.applyAcquisitionEvents(got,events,policy),got);
console.log('PASS: 正本800件のEXP/銭セル・装備LB/上限/分解・新規/重複/再送');
