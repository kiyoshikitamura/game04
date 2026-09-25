const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(module,name)=>module._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
const base='../src/domain/redesign/',m=require(base+'masters.ts'),f=require(base+'formalOwnedSkills.ts'),g=require(base+'growth.ts'),gm=require(base+'growthMaster.ts'),a=require(base+'acquisitions.ts');
const rows=require(base+'data/raid-skill-values.json');
const authority=fs.readFileSync('docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md','utf8');
for(const [kind,start,end] of [['character','### キャラ','### 装備'],['equipment','### 装備','## 付録B']]){
 const table=authority.split('## 付録A.')[1].split(start)[1].split(end)[0];
 const entries=table.split('\n').filter(line=>/^\| \d+ \|/.test(line));assert.equal(entries.length,100);
 for(const line of entries){const cols=line.split('|').slice(1,-1).map(s=>s.trim());const level=Number(cols[0]);for(const [i,rarity] of ['N','R','SR','SSR'].entries()){
  const [exp,cash]=cols[i+1].split('/').map(s=>Number(s.trim().replaceAll(',','')));
  assert.equal(gm.cumulativeExp(kind,rarity,level),exp,`${kind}/${rarity}/${level} EXP`);
  assert.equal(gm.cumulativeCash(kind,rarity,level),cash,`${kind}/${rarity}/${level} cash`);
 }}
}

assert.equal(f.FORMAL_SKILL_IDS.length,72);assert.equal(new Set(f.FORMAL_SKILL_IDS).size,72);
assert.equal(rows.length,792);
assert.equal(m.SKILL_MASTERS.length,50,'legacy gacha pool must not silently expand');
assert.equal(m.OWNABLE_SKILL_MASTERS.length,122);
const rarityCounts={};
for(const skill of f.FORMAL_SKILL_MASTERS)rarityCounts[skill.rarity]=(rarityCounts[skill.rarity]||0)+1;
assert.deepEqual(rarityCounts,{N:9,R:33,SR:16,SSR:14});
const labelTypes={攻撃倍率:'damage',通常倍率:'damage',回復倍率:'heal',蘇生HP割合:'revive',継続ダメージ倍率:'dot',継続回復倍率:'hot',シールド倍率:'shield',反撃倍率:'counter',ATK強化:'atk_up',DEF強化:'def_up',ATK低下:'atk_down',DEF低下:'def_down'};
for(const row of rows){
 const skill=f.getFormalOwnedSkill(row.design_id,row.lb);assert.equal(skill.id,row.design_id);assert.equal(skill.spCost,row.sp);
 for(const part of row.performance_text.split('／')){
  const [,label,raw]=part.match(/^(.+):([\d.]+)/),value=Number(raw);
  if(labelTypes[label])assert.equal(skill.effects.find(e=>e.type===labelTypes[label]).power,value,`${row.design_id}/${row.lb}/${label}`);
  else if(label==='条件倍率')assert.equal(skill.effects.find(e=>e.type==='damage').bonusPower,value);
  else if(label==='付与率')assert.equal(skill.effects.find(e=>e.type==='stun'||e.type==='taunt').chance,value/100);
  else if(label.includes('解除件数'))assert.ok(skill.effects.some(e=>e.type==='cleanse'&&e.power===value));
  else throw Error(`unchecked label ${label}`);
 }
}
let state=m.createInitialState('g2-unit-only');state.cash=1e8;state.materials.skill=1e5;state.growthInventory=gm.emptyGrowthInventory();
const legacySkills=structuredClone(state.skills),legacyDeck=structuredClone(state.deck);
state=a.applyAcquisitionEvents(state,[{id:'formal-grant',kind:'skill',masterId:'SKD071'}],a.APPROVED_ACQUISITION_MASTER);
assert.deepEqual(state.skills.filter(s=>!f.isFormalSkillId(s.id)),legacySkills);assert.deepEqual(state.deck,legacyDeck);
const once=structuredClone(state);state=a.applyAcquisitionEvents(state,[{id:'formal-grant',kind:'skill',masterId:'SKD071'}],a.APPROVED_ACQUISITION_MASTER);assert.deepEqual(state,once);
state=g.applyGrowthAction(state,'skill_level',{skillId:'SKD071'});assert.equal(state.skills.find(s=>s.id==='SKD071').level,1);
state.deck[0].skillIds=['SKD071'];state.deck[1].skillIds=['SKD071'];g.validateDeck(state,state.deck);
const party=m.buildBattleParty(state);for(const unit of party.slice(0,2))assert.equal(unit.skills[0].spCost,139);
const beforeFailure=structuredClone(state);assert.throws(()=>g.applyGrowthAction({...state,cash:0},'skill_level',{skillId:'SKD071'}));assert.deepEqual(state,beforeFailure);
const char=state.characters[0],rarity=m.CHARACTER_MASTERS.find(c=>c.id===char.id).rarity;
state.growthInventory.expItems.character.small=2;
const before=state.cash;
state=g.applyGrowthAction(state,'character_level',{characterId:char.id,items:{small:1}});
state=g.applyGrowthAction(state,'character_level',{characterId:char.id,items:{small:1}});
assert.equal(before-state.cash,gm.cumulativeCash('character',rarity,state.characters[0].level));
const capState=structuredClone(state),owned=capState.characters[0];owned.level=49;owned.exp=gm.cumulativeExp('character',rarity,50)-1;capState.growthInventory.expItems.character.xlarge=1;
const capped=g.applyGrowthAction(capState,'character_level',{characterId:owned.id,items:{xlarge:1}});
assert.equal(capped.characters[0].level,50);assert.equal(capped.growthInventory.carryExp.character,19999);
assert.equal(capState.cash-capped.cash,gm.cumulativeCash('character',rarity,50)-gm.cumulativeCash('character',rarity,49));
assert.deepEqual(gm.applyPlayerExperience(1,0,100,130,100),{level:2,exp:100,energy:130});
console.log('PASS 72 IDs / 792 LB rows / 122 separate ownership entries / legacy 50 unchanged / shared exact LB / replay idempotence / failure nonconsumption / cumulative cash / 19999 carry / overcap retention');
