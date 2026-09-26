import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const source='docs/verification/stage68-five-tier-20260926';
const out='docs/verification/stage68-recovery-20260927';
fs.mkdirSync(out,{recursive:true});
const read=name=>JSON.parse(fs.readFileSync(`${source}/${name}`));
const rows=read('audit-table.json'), patches=read('enemy-patches.json').stages;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=[];
for(const line of fs.readFileSync(`${source}/MANIFEST.sha256`,'utf8').trim().split(/\r?\n/)){
 const [,expected,name]=line.match(/^([a-f0-9]{64})\s+(.+)$/);
 const bytes=execFileSync('git',['show',`645512d:${source}/${name}`],{maxBuffer:100*1024*1024});
 assert.equal(sha(bytes),expected,name);manifest.push(name);
}
const sourceHashes=read('source-hashes.json');
for(const [name,expected] of Object.entries(sourceHashes))assert.equal(sha(execFileSync('git',['show',`645512d:${name}`],{maxBuffer:100*1024*1024})),expected,name);
const labels=['全勝','約60%','約30%','0%超～10%','観測0%'];
const checks=[];let trials=0;
for(const r of rows){
 const d=JSON.parse(zlib.gunzipSync(fs.readFileSync(`${source}/${r.stage}-validated.json.gz`)));
 const p=patches.find(p=>p.stage===r.stage);assert.deepEqual(p.changes,r.changes);
 for(const c of [...d.records,...d.before,...d.controls]){if(c.inputHash)assert.equal(c.inputHash,sha(JSON.stringify(c.input)));assert.equal(c.validation.n,c.validation.runs.length);assert.equal(c.validation.wins,c.validation.runs.filter(x=>x.outcome==='win').length);trials+=c.validation.n;}
 const spFeed=[];
 for(const name of [r.primary.name,r.alternative?.name].filter(Boolean)){
  const c=d.records.find(c=>c.name===name);if(c.family!=='sp-feed')continue;
  const attackIds=c.input.party.flatMap(p=>p.skills.filter(s=>s.effects.some(e=>e.type==='damage')).map(s=>s.id));
  const skills=[...new Set(c.input.party.flatMap(p=>p.skills.map(s=>s.id)))];
  const skillActivations=skills.map(id=>({id,runs:c.validation.runs.filter(x=>(x.casts[id]??0)>0).length}));
  const active=c.validation.runs.filter(x=>(x.casts.basic??0)>0&&x.spGain>0&&x.bursts>0&&attackIds.some(id=>(x.casts[id]??0)>0)).length;
  assert(c.input.party.some(p=>p.skills.length===0));assert(active>=c.validation.n/2);
  spFeed.push({name,n:c.validation.n,active,skillActivations,belowHalfSkills:skillActivations.filter(s=>s.runs<c.validation.n/2),note:'通常攻撃/SP獲得/BURST/攻撃技の実行を保存seedで確認。発動が半数未満の補助技は勝因としない。因果寄与や供給役別SP量の証明ではない。'});
 }
 const missing=r.tiers.flatMap((v,i)=>v?[]:[labels[i]]);
 const tiers=r.tiers.map((v,i)=>{
  if(!v)return {tier:labels[i],status:'未達：保存候補に該当なし'};
  const c=d.records.find(c=>c.name===v.name);assert(c);assert.equal(v.wins,c.validation.wins);assert.equal(v.n,c.validation.n);
  const rate=v.wins/v.n;assert([rate===1,rate>=.5&&rate<=.7,rate>=.2&&rate<=.4,rate>0&&rate<=.1,rate===0][i]);
  return {tier:labels[i],...v,observedPercent:100*rate,seedFirst:c.validation.runs[0].seed,seedLast:c.validation.runs.at(-1).seed,fundedForSwitch:r.acquisition.fundedRecipes.some(f=>f.name===v.name)};
 });
 checks.push({stage:r.stage,enemyFields:r.changes.length,primary:r.primary,alternative:r.alternative?{name:r.alternative.name,wins:r.alternative.wins,n:r.alternative.n}:null,missing,tiers,spFeed,supplyStatus:r.status});
}
assert.equal(checks.length,68);assert.equal(trials,161800);
const summary={recoveredSha:'645512d94b918ecbe0a205085696baecaa6353f0',node:process.version,platform:process.platform,manifestVerified:manifest.length,sourceHashesVerified:Object.keys(sourceHashes).length,stages:68,savedTrialsIncludingControls:trials,completeFiveTiers:checks.filter(r=>!r.missing.length).length,tierCoverage:labels.map((label,i)=>({label,count:rows.filter(r=>r.tiers[i]).length})),checks};
fs.writeFileSync(`${out}/recovery-checks.json`,JSON.stringify(summary,null,2)+'\n');
const table=['# 全68面の回収結果・5段階残件','', '具体的な敵before/after・理由は元資料のenemy-patches.json、編成・入手条件はGAME04_PROPOSED_GUIDE.mdを継承。ここでは未達を明示する。約60%は旧担当の50～70%、約30%は20～40%の探索帯。観測0%は理論上クリア不能の証明ではない。','', '|面|敵変更項目|主経路|別戦法|欠けている比較帯|','|---|---:|---|---|---|',...checks.map(r=>`|${r.stage}|${r.enemyFields}|${r.primary.name} ${r.primary.wins}/${r.primary.n}|${r.alternative?`${r.alternative.name} ${r.alternative.wins}/${r.alternative.n}`:'未成立'}|${r.missing.join('・')||'なし'}|`)];
fs.writeFileSync(`${out}/STAGE68_REMAINING.md`,table.join('\n')+'\n');
console.log(JSON.stringify({...summary,checks:undefined}));
