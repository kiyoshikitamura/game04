// Independent oracle: parse approved prose table, never use implementation LB rows
// or balance-v2.json as expected values. Snapshot evidence remains version-bound.
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const {collect,root}=require('./runtime.cjs');
const source='docs/product/master_sources_20260921/numeric.md';
const text=fs.readFileSync(root+'/'+source,'utf8');
const rows=text.split('\n').filter(l=>/^\| SKD\d{3} \|/.test(l)).map(l=>l.split('|').slice(1,-1).map(s=>s.trim()));
assert.equal(rows.length,72);assert.equal(new Set(rows.map(r=>r[0])).size,72);
const labels={'攻撃倍率':['damage','power'],'通常倍率':['damage','power'],'条件倍率':['damage','bonusPower'],'回復倍率':['heal','power'],'蘇生HP割合':['revive','power'],'継続ダメージ倍率':['dot','power'],'継続回復倍率':['hot','power'],'シールド倍率':['shield','power'],'反撃倍率':['counter','power'],'ATK強化':['atk_up','power'],'DEF強化':['def_up','power'],'ATK低下':['atk_down','power'],'DEF低下':['def_down','power']};
const targets={'先頭敵':'first','敵全体':'all_enemies','最後尾の生存敵':'last','残HP実数最小の敵':'lowest_hp','配置順最初の付与可能敵':'first','自身':'self','味方全体の付与可能者':'all_allies','戦闘中ATK最大の付与可能敵':'highest_atk_enemy','共通単体回復条件':'lowest_ally','共通全体回復条件':'all_allies','HPが減った付与可能味方の残HP割合最低':'lowest_ally','配置順最初の戦闘不能味方':'dead_ally','付与可能味方の残HP割合最低':'lowest_ally','能力強化がある配置順最初の敵':'first','保護状態がある配置順最初の敵':'first','能力低下がある配置順最初の味方':'first_ally','継続ダメージがある配置順最初の味方':'first_ally','行動不能の配置順最初の味方':'first_ally','敵全体の付与可能者':'all_enemies','付与可能味方のキャラ＋装備ATK最大':'highest_atk_ally','配置順最初の付与可能味方':'first_ally','HPが減った味方に付与可能者がいれば生存味方全体':'all_allies','共通単体回復条件で選んだ同じ味方':'lowest_ally','付与可能な被弾誘導者優先、なければ配置順':'counter_ally','継続ダメージ対象優先、なければ共通単体回復条件':'dot_ally','味方全体・1人でも該当状態あり':'all_allies'};
const elements={火:'fire',水:'water',土:'earth',風:'wind',光:'light',闇:'dark'};
const cleanse={SKD051:'buff',SKD052:'protection',SKD053:'debuff',SKD054:'dot',SKD055:'stun',SKD056:'protection',SKD070:'dot',SKD072:'buff'};
const parse=s=>s.split('／').map(x=>{const m=x.match(/^(.+):([\d.]+)(%|件)$/);assert(m,x);return {label:m[1],value:Number(m[2])}});
const sources={repository:collect().skills,capturedApiV31:JSON.parse(fs.readFileSync(root+'/docs/verification/master-audit-20260925/observed/runtime.json')).skills};
const results={};
for(const [scope,skills] of Object.entries(sources)){
 let checked=0;const differences=[];const check=(id,lb,field,expected,actual)=>{checked++;if(typeof expected==='number'&&typeof actual==='number'?Math.abs(expected-actual)<1e-10:expected===actual)return;differences.push({id,lb,field,expected,actual});};
 for(const [id,name,rarityElement,spText,start,end,duration,targetText]of rows){
  const [rarity,element]=rarityElement.split('/'),[sp0,sp10]=spText.split('→').map(Number),a=parse(start),b=parse(end);assert.equal(a.length,b.length);assert(targets[targetText],targetText);
  for(let lb=0;lb<=10;lb++){
   const skill=skills[id+':'+lb];assert(skill,'missing '+id+':'+lb);const ratio=(lb/10)**1.25;
   check(id,lb,'rarity',rarity,skill.rarity);check(id,lb,'element',elements[element],skill.element);check(id,lb,'target',targets[targetText],skill.target);check(id,lb,'fixedTarget',targetText==='先頭敵',skill.fixedTarget);
   check(id,lb,'spCost',Math.ceil(sp0+(sp10-sp0)*ratio),skill.spCost);
   if(Number(id.slice(3))>=25)check(id,lb,'name',name,skill.name); // 001-024 later short-name approval overrides this prose.
   const singleHeal=targetText.startsWith('共通単体回復条件');check(id,lb,'condition.type',singleHeal?'ally_hp_below':'always',skill.condition.type);if(singleHeal)check(id,lb,'condition.value',.5,skill.condition.value);
   let effectIndex=0;
   for(let i=0;i<a.length;i++){
    assert.equal(a[i].label,b[i].label);const label=a[i].label,value=a[i].value+(b[i].value-a[i].value)*ratio;
    let type,field='power',expected=value;
    if(label==='付与率'){type=['SKD032','SKD065'].includes(id)?'stun':'taunt';field='chance';expected=value/100;}
    else if(label.includes('解除件数'))type='cleanse';else {assert(labels[label],label);[type,field]=labels[label];}
    const index=label==='条件倍率'?effectIndex-1:effectIndex++,effect=skill.effects[index];assert(effect,id+' '+index);
    check(id,lb,`effects/${index}/type`,type,effect.type);check(id,lb,`effects/${index}/${field}`,expected,effect[field]);
    if(type==='cleanse')check(id,lb,`effects/${index}/cleanseCategory`,label==='能力低下解除件数'?'debuff':label==='継続ダメージ解除件数'?'dot':cleanse[id],effect.cleanseCategory);
    if(!['damage','heal','revive','cleanse'].includes(type)){assert(/^\d+$/.test(duration));check(id,lb,`effects/${index}/duration`,Number(duration),effect.duration);check(id,lb,`effects/${index}/carryAcrossWaves`,true,effect.carryAcrossWaves);}
    if(type==='heal'||type==='revive')check(id,lb,`effects/${index}/healingFormula`,type==='heal'?'caster_atk_percent':'target_max_hp_percent',effect.healingFormula);
   }
   check(id,lb,'effects.length',effectIndex,skill.effects.length);
  }
 }
 results[scope]={checks:checked,differenceFields:differences.length,affectedSkills:new Set(differences.map(d=>d.id)).size,affectedLbRows:new Set(differences.map(d=>d.id+':'+d.lb)).size,differences};
}
const report={status:Object.values(results).some(r=>r.differenceFields)?'STOP':'PASS',authority:{path:source,sha256:crypto.createHash('sha256').update(text).digest('hex'),rule:'A+(B-A)*(LB/10)^1.25; internal unrounded; designated SP reduction uses ceil',priority:'MASTER_AUTHORITY_LATEST section 1 prioritizes numeric individual effects; later explicit rounding approval not found in reviewed records'},scope:'72 skills × 11 LB. Declared target/condition/effect order and quantities; no claim of complete battle selector behavior or live refetch.',results};
console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='STOP'?1:0;
