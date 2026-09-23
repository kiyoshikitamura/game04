/** Local contract tests only: not evidence of live API or browser acceptance.
 * Run: node scripts/verify_game04_raid_formal.mjs
 * Reference expectations are parsed directly from the adopted Markdown tables.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {FORMAL_ENCOUNTER_MASTERS,formalRaidCharacter}=require('../src/domain/redesign/raidFormalMaster.ts');
const {FORMAL_CASTLES,createFormalInvasionMaster}=require('../src/domain/redesign/raidInvasionMaster.ts');
const {createRaidRoom,getRoomRaidMaster,applyRaidAction}=require('../src/domain/redesign/raid.ts');
const {createInitialState}=require('../src/domain/redesign/masters.ts');
const read=name=>fs.readFileSync(new URL(`../docs/product/master_sources_20260921/${name}.md`,import.meta.url),'utf8');
const rows=text=>text.split('\n').filter(x=>x.startsWith('|')).map(x=>x.split('|').slice(1,-1).map(c=>c.trim()));
const num=x=>Number(x.replaceAll(',',''));
const encounterRows=rows(read('encounter')).filter(r=>/^\d+$/.test(r[0])&&/^ERB\d+$/.test(r[1]));
assert.equal(encounterRows.length,85);assert.equal(FORMAL_ENCOUNTER_MASTERS.length,85);
assert.equal(new Set(FORMAL_ENCOUNTER_MASTERS.map(m=>m.characterId)).size,25);
const expValue={small:100,medium:1000,large:5000,xlarge:20000};
const amount=(rewards,kind)=>rewards.filter(r=>r.kind===kind).reduce((n,r)=>n+r.amount,0);
const exp=(rewards,kind)=>rewards.filter(r=>r.kind===kind).reduce((n,r)=>n+r.amount*expValue[r.id],0);
const rewardText=read('rewards').split('### GAME04_両レイド報酬・ログボ前供給試算_v0.1.md')[1];
assert.ok(rewardText,'adopted raid reward source exists');
const encounterRewards=rows(rewardText).filter(r=>/^\d+–\d+$/.test(r[0]));
for(const r of encounterRows){
 const m=FORMAL_ENCOUNTER_MASTERS.find(m=>m.area===Number(r[0])&&m.name===r[2]);assert.ok(m,`missing ${r[0]}/${r[2]}`);
 assert.deepEqual([m.enemy.level,m.enemy.stats.hp,m.enemy.stats.atk,m.enemy.stats.def,m.enemy.actionCount,m.sharedHp],[r[3],r[4],r[5],r[6],r[7],r[10]].map(num),m.id);
 assert.equal(m.enemies.reduce((n,e)=>n+e.stats.hp,0),num(r[9]),`${m.id} total HP`);
 for(const e of m.enemies){assert.equal(e.initialSp,e.stats.sp);assert.equal(e.hitSpGain,10);assert.ok(fs.existsSync(new URL(`../public${e.image}`,import.meta.url)),e.image);}
 const rr=encounterRewards.find(x=>{const [lo,hi]=x[0].split('–').map(Number);return m.area>=lo&&m.area<=hi;});assert.ok(rr);
 assert.equal(amount(m.victoryRewards,'cash'),num(rr[3]));assert.equal(exp(m.victoryRewards,'character_exp_item'),num(rr[4]));assert.equal(exp(m.victoryRewards,'equipment_exp_item'),num(rr[5]));
 const soul=m.victoryRewards.find(x=>x.kind==='soul'),sr=formalRaidCharacter(m.name).rarity==='SR',soulExpected=rr[sr?1:2].match(/(\d+)%×(\d+)/);
 assert.equal(soul.chance,Number(soulExpected[1])/100);assert.equal(soul.amount,Number(soulExpected[2]));assert.equal(soul.id,m.characterId);
 assert.equal(amount(m.defeatRewards,'soul'),num(rr[6]));assert.equal(exp(m.defeatRewards,'character_exp_item'),num(rr[7]));assert.equal(exp(m.defeatRewards,'equipment_exp_item'),num(rr[7]));assert.equal(amount(m.defeatRewards,'skill_material'),num(rr[8]));assert.equal(amount(m.defeatRewards,'equipment_lb'),num(rr[8]));assert.equal(amount(m.defeatRewards,'cash'),num(rr[9]));
 assert.equal(m.playerExp,[80,100,120,160,200,240,300,360,440,520][m.area-1]);assert.equal(m.energyCost,20);assert.equal(m.maxLevel,1);assert.equal(m.durationMinutes,60);assert.equal([...m.victoryRewards,...m.defeatRewards].some(r=>r.kind==='ticket'),false);
}
console.log('PASS adopted encounter tables: 25 bosses / 85 rows, complete HP/ATK/DEF/count, full SP, images, reward bands and PlayerEXP');
const invasionText=read('invasion'),fixedRows=rows(invasionText).filter(r=>/^TI0\d\/\d+\/\d+$/.test(r[0]));
const castleRewardRows=rows(rewardText).filter(r=>['岡崎','長浜','春日山','躑躅ヶ崎館','安土'].includes(r[0]));
assert.equal(FORMAL_CASTLES.length,5);
for(const [ci,castle] of FORMAL_CASTLES.entries())for(const randomValue of [0,.5,.999999]){
 const m=createFormalInvasionMaster(castle.id,()=>randomValue),rr=castleRewardRows[ci];assert.equal(m.stages.length,12);assert.equal(m.maxLevel,12);assert.equal(m.durationMinutes,4320);assert.equal(m.playerExp,0);
 assert.equal(amount(m.victoryRewards,'cash'),num(rr[1]));assert.equal(exp(m.victoryRewards,'character_exp_item'),num(rr[2]));assert.equal(exp(m.victoryRewards,'equipment_exp_item'),num(rr[3]));
 const normal=m.stages.filter(s=>s.level%3!==0),names=normal.map(s=>s.enemies[0].name);assert.equal(new Set(names).size,8);
 const lord=['徳川家康','豊臣秀吉','上杉謙信','武田信玄','織田信長'][ci];assert.ok(normal.every(s=>s.enemies.every(e=>e.name!==lord)));
 for(let i=2;i<normal.length;i++)assert.ok(new Set(normal.slice(i-2,i+1).map(s=>s.enemies[0].element)).size>1);
 for(const s of m.stages){const final=s.level===12,gate=s.level%3===0;
  assert.equal(amount(s.defeatRewards,'cash'),num(rr[final?9:gate?6:4]));assert.equal(amount(s.defeatRewards,'skill_material'),num(rr[final?11:gate?8:5]));assert.equal(amount(s.defeatRewards,'equipment_lb'),num(rr[final?11:gate?8:5]));
  assert.equal(exp(s.defeatRewards,'character_exp_item'),final?num(rr[10]):gate?num(rr[7]):0);assert.equal(exp(s.defeatRewards,'equipment_exp_item'),final?num(rr[10]):gate?num(rr[7]):0);
  assert.equal(amount(s.defeatRewards,'soul'),final?num(rr[13]):0);assert.equal(amount(s.defeatRewards,'ticket'),final?rr[12].split('/').map(Number).reduce((a,b)=>a+b,0):0);
  for(const e of s.enemies){assert.equal(e.initialSp,e.stats.sp);assert.equal(e.hitSpGain,10);}
  if(gate){const expected=fixedRows.filter(r=>r[0].startsWith(`${castle.id}/${s.level}/`));assert.equal(s.enemies.length,expected.length);for(const [i,e] of s.enemies.entries()){const r=expected[i];assert.equal(e.name,r[1]);assert.deepEqual([e.level,e.stats.hp,e.stats.atk,e.stats.def,e.actionCount,e.initialSp],[r[3],r[4],r[5],r[6],r[7],r[8].split('/')[0]].map(num));}}
  const hpRows=rows(invasionText.split('## 10.')[1]);const hp=gate?hpRows.find(r=>r[0]===castle.name&&r.length===5)?.[s.level/3]:hpRows.find(r=>r[0]===castle.name&&Number(r[1])===s.level&&s.source.includes(`:${r[2]};`))?.[5];assert.ok(hp,`${castle.id}/${s.level} adopted HP row`);assert.equal(s.sharedHp,num(hp));
 }
}
console.log('PASS invasion: 5 castles × 12 stages × 3 draws, exact gate/lord stats, section10 shared HP, formation constraints and rewards');
const now=Date.parse('2026-09-23T12:00:00Z'),master=FORMAL_ENCOUNTER_MASTERS[0];
let room=createRaidRoom(master.id,'tester','formal-test',now),state=createInitialState('tester');state.energy=100;
const snapshot=JSON.stringify(room.raidSnapshot),originalMasterHp=master.sharedHp;master.sharedHp=1;assert.equal(getRoomRaidMaster(room).sharedHp,originalMasterHp);master.sharedHp=originalMasterHp;assert.equal(JSON.stringify(room.raidSnapshot),snapshot);
function action(name,payload={},time=now){const out=applyRaidAction(room,state,name,payload,time);room=out.room;state=out.state;return out;}
function battle(id,outcome,damage){return action('raid_battle',{battleId:id,battleLevel:room.level,seed:42,result:{outcome,totalDamage:damage}});}
const beforeLoss=structuredClone(state);const loss=battle('lose','lose',100);assert.deepEqual(loss.rewards,[]);assert.equal(state.cash,beforeLoss.cash);assert.equal(room.rewardGrants.length,0);assert.equal(room.hp,originalMasterHp-100);
for(let i=1;i<=2;i++){const out=battle(`win${i}`,'win',100);assert.ok(out.rewards.length>0);assert.equal(room.rewardGrants.length,0);}
const win=battle('win3','win',100);assert.equal(room.participants[0].wins,3);assert.equal(room.rewardGrants.length,0,'qualification alone grants nothing');
const saved=JSON.parse(JSON.stringify({room,state}));({room,state}=saved);const duplicate=structuredClone(saved);battle('win3','win',100);assert.deepEqual({room,state},duplicate,'battle replay after reload is idempotent');
battle('defeat','win',room.hp);assert.equal(room.status,'defeated');assert.equal(room.level,1);assert.equal(room.rewardGrants.length,1);action('raid_claim');const claimed=structuredClone({room,state});action('raid_claim');assert.deepEqual({room,state},claimed);
room=createRaidRoom(master.id,'tester','expired',now);state=createInitialState('tester');const expResult=action('raid_refresh',{},now+3600001);assert.equal(expResult.room.status,'expired');assert.equal(room.rewardGrants.length,0);
room=createRaidRoom(master.id,'owner','boundaries',now);state=createInitialState('tester');action('raid_join');action('raid_leave');assert.throws(()=>action('raid_join'),/退出/);
room=createRaidRoom(master.id,'tester','rescue',now);state=createInitialState('tester');for(let i=0;i<3;i++)action('raid_rescue');assert.throws(()=>action('raid_rescue'),/残り回数/);
state.energy=0;assert.throws(()=>battle('no-energy','win',100),/行動力/);
room.participants=Array.from({length:10},(_,i)=>({userId:`p${i}`,name:'test',wins:0,attempts:0,totalDamage:0,joinedLevel:1}));assert.throws(()=>action('raid_join'),/上限/);
console.log('PASS local transitions: loss no rewards, victory rewards, 3-win gate, fixed encounter level, snapshot isolation, JSON reload, battle/claim replay, expiry, leave, rescue cap, energy shortage, capacity');
// Formal invasion old-stage results count personal wins, never damage a later stage or grant retrospectively.
const invasion=createFormalInvasionMaster('TI01',()=>0);
const territorySnapshot={masterVersion:invasion.masterVersion,status:'PREVIEW_PROVISIONAL',raidMaster:invasion};
room=createRaidRoom(invasion.id,'tester','invasion-transitions',now,territorySnapshot);state=createInitialState('tester');state.energy=100;
battle('stage1-win','win',room.hp);assert.equal(room.level,2);assert.equal(room.rewardGrants.length,0);
const hp2=room.hp;
for(const id of ['oldstage-win2','oldstage-win3'])action('raid_battle',{battleId:id,battleLevel:1,energyAlreadyPaid:true,result:{outcome:'win',totalDamage:999999}});
assert.equal(room.hp,hp2);assert.equal(room.participants[0].wins,3);assert.equal(room.rewardGrants.length,0,'no retroactive stage1 grants');
for(let level=2;level<=12;level++){
 assert.equal(room.level,level);assert.deepEqual(getRoomRaidMaster(room).defeatRewards,invasion.stages[level-1].defeatRewards);
 action('raid_battle',{battleId:`stage${level}`,battleLevel:level,energyAlreadyPaid:true,result:{outcome:'win',totalDamage:room.hp}});
 assert.equal(room.rewardGrants.filter(g=>g.level===level).length,1);
 if(level<12)assert.equal(room.hp,invasion.stages[level].sharedHp);
}
assert.equal(room.level,12);assert.equal(room.status,'defeated');assert.equal(room.rewardGrants.length,11);
action('raid_claim');const invasionClaimed=structuredClone({room,state});action('raid_claim');assert.deepEqual({room,state},invasionClaimed);
console.log('PASS invasion transition: old-stage settlement, 3 wins across stages, no retroactive rewards, all 12 stages, final stop, repeat claim');
console.log('LIMIT: deterministic domain transition tests; live API, concurrency transactions, browser flow and battle-balance acceptance are separate.');
