const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,p);
const {getFormalRaidSkill}=require('../src/domain/redesign/raidFormalSkills.ts');
const {getBalanceV2Skill}=require('../src/domain/redesign/balanceV2Masters.ts');
const rows=require('../src/domain/redesign/data/raid-skill-values.json');
const presentation=require('../src/domain/redesign/data/formal-skill-presentation.json');
const adopted=require('../docs/verification/g2-20260925/decisions/SKD72_名称画像候補対応表.json');
const {growthRewardImage}=require('../src/domain/redesign/growthAssetPresentation.ts');
const definitions=require('../src/domain/redesign/data/balance-v2.json');
// Pre-adoption implementation, unchanged numerical effect mapping (baseline 0e7f37c9).
function baseline(id,lb){const row=rows.find(r=>r.design_id===id&&r.lb===lb),skill=getBalanceV2Skill(id,lb),values={};if(['SKD039','SKD040','SKD068'].includes(id))skill.condition={type:'ally_hp_below',value:.5};for(const text of row.performance_text.split('／')){const m=text.match(/^(.+):([\d.]+)/);if(m)values[m[1]]=Number(m[2]);}const labels={heal:'回復倍率',revive:'蘇生HP割合',dot:'継続ダメージ倍率',hot:'継続回復倍率',shield:'シールド倍率',counter:'反撃倍率',atk_up:'ATK強化',def_up:'DEF強化',atk_down:'ATK低下',def_down:'DEF低下'};for(const e of skill.effects){if(e.type==='damage'){e.power=values['攻撃倍率']??values['通常倍率']??e.power;if(values['条件倍率']!==undefined)e.bonusPower=values['条件倍率'];}else if(e.type==='stun'||e.type==='taunt')e.chance=(values['付与率']??e.chance*100)/100;else if(labels[e.type]&&values[labels[e.type]]!==undefined)e.power=values[labels[e.type]];}const d=definitions.skills.find(e=>e.designId===id);return {...skill,id,name:row.name_provisional,image:'',spCost:row.sp,description:`${d.targetDescription}・${row.performance_text}${d.duration?`・${d.duration}ターン`:''}`};}
const withoutArt=({name,image,...r})=>r;
assert.equal(presentation.length,72);assert.equal(new Set(presentation.map(r=>r.id)).size,72);
for(const art of presentation){assert.equal(art.name,adopted.find(r=>r.id===art.id).proposedName);assert.ok(fs.existsSync(path.join(__dirname,'../public',art.image)));for(let lb=0;lb<=10;lb++){const current=getFormalRaidSkill(art.id,lb);assert.deepEqual(withoutArt(current),withoutArt(baseline(art.id,lb)),`${art.id}/${lb} numerical/semantic regression`);assert.equal(current.name,art.name);assert.equal(current.image,art.image);}}
for(const kind of ['character_exp_item','equipment_exp_item'])assert.ok(fs.existsSync(path.join(__dirname,'../public',growthRewardImage({kind,id:'xlarge'}))));
for(const kind of ['generic_soul','soul_selector'])for(const id of ['N','R','SR','SSR'])assert.ok(fs.existsSync(path.join(__dirname,'../public',growthRewardImage({kind,id}))));
assert.equal(growthRewardImage({kind:'generic_soul',id:'invalid'}),undefined);
console.log(JSON.stringify({status:'PASS',formalSkills:72,lbRowsUnchanged:792,approvedMaterialImages:10,legacyMigration:false,scope:'module and disk assets; live display separately'}));
