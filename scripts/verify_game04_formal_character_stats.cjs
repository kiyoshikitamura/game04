const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {CHARACTER_MASTERS,COMMON_CHARACTER_MASTERS,getCharacterStats,getLegacyCharacterStats,buildBattleParty,createInitialState,COMMON_BATTLE_RULES,BATTLE_RULES}=require('../src/domain/redesign/masters.ts');
const data=require('../src/domain/redesign/data/formal-character-stats.json');
const text=fs.readFileSync('docs/product/master_sources_20260921/numeric.md','utf8');
const rows=section=>section.split('\n').filter(l=>l.startsWith('|')).map(l=>l.split('|').slice(1,-1).map(v=>v.trim()));
const atk=rows(text.split('### ATK基準点')[1].split('### HP/DEF')[0]).filter(r=>/^\d+$/.test(r[0]));
const hp=rows(text.split('### HP/DEF基準点')[1].split('## 3.')[0]).filter(r=>/^\d+$/.test(r[0]));
const individuals=rows(text).filter(r=>r.length===10&&r[0].startsWith('char_'));
const close=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} != ${expected}`);
assert.equal(CHARACTER_MASTERS.length,60);assert.equal(individuals.length,60);
for(const row of individuals){
 const master=CHARACTER_MASTERS.find(m=>m.id===row[0]);assert.ok(master);
 assert.equal(master.rarity,row[2]);assert.equal(master.role,row[4]);
 const rarity=['N','R','SR','SSR'].indexOf(row[2]),formal=data.characters.find(c=>c.id===row[0]);
 const role=data.roles[row[4]],profile=data.profiles[row[5]];
 for(let i=0;i<atk.length;i++){
  const level=Number(atk[i][0]),stats=getCharacterStats(master,level,5),expected={hp:Number(hp[i][rarity+1].replaceAll(',',''))*role.hp*profile.hp,atk:Number(atk[i][rarity+1].replaceAll(',',''))*role.atk*profile.atk,def:Number(hp[i][rarity+5].replaceAll(',',''))*role.def*profile.def};
  for(const key of ['hp','atk','def'])close(stats[key],expected[key],`${master.id} Lv${level} ${key}`);
  const zero=getCharacterStats(master,level,0);for(const key of ['hp','atk','def','luk'])close(zero[key],stats[key],`${master.id} awakening does not multiply ${key}`);
  assert.equal(stats.sp,getLegacyCharacterStats(master,level,5).sp,'SP unchanged');
 }
 const max=getCharacterStats(master,100,5);for(const [i,key] of ['hp','atk','def','luk'].entries())close(max[key],Number(row[i+6]),`${master.id} authoritative Lv100 ${key}`);
 for(const level of [1,25,50,75,100]){const stats=getCharacterStats(master,level,0),base=level<=50?10+10*(level-1)/49:20+10*(level-50)/50;close(stats.luk,base+profile.luk,`${master.id} LUK`);}
 const middle=getCharacterStats(master,55,0),lo=getCharacterStats(master,50,0),hi=getCharacterStats(master,60,0);for(const key of ['hp','atk','def'])close(middle[key],(lo[key]+hi[key])/2,`${master.id} unrounded interpolation`);
 assert.ok(formal);
}
const state=createInitialState('verify-formal-character');state.characters=CHARACTER_MASTERS.map(c=>({id:c.id,level:100,awakening:5}));state.deck=['char_rui_01','char_takuro_01','char_sora_01','char_maya_01','char_alice_01'].map(characterId=>({characterId,skillIds:[],equipment:{}}));
const legacy=buildBattleParty(state,COMMON_BATTLE_RULES);for(const member of legacy)assert.deepEqual(member.stats,getLegacyCharacterStats(COMMON_CHARACTER_MASTERS.find(c=>c.id===member.id),100,5));
const party=buildBattleParty(state,BATTLE_RULES);for(const member of party)assert.deepEqual(member.stats,getCharacterStats(CHARACTER_MASTERS.find(c=>c.id===member.id),100,5));
console.log('PASS 60 characters × 11 authority anchors, 60 Lv100 reference rows, role/individual/LUK/interpolation, awakening independence, legacy SP and legacy rules');
console.log(JSON.stringify(party.map(p=>({id:p.id,name:p.name,stats:p.stats})),null,2));
