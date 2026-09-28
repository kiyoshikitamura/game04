const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.BASE_URL||'http://localhost:3104',out='../../outputs/common-ui-continuation/categories';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),report=[];try{for(const width of [375,390]){
 const p=await browser.newPage({viewport:{width,height:480}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const shot=async state=>{await p.locator('.g4g-image-loading').waitFor({state:'hidden',timeout:90000});await p.waitForTimeout(150);await p.screenshot({path:`${out}/${state}-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.push({width,height:480,state,errors:[...errors]});fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));};
 await p.goto(base+'/qa/common-ui-audit?view=character');await p.locator('.g4-growth[aria-busy="false"]').waitFor({timeout:90000});
 for(const name of ['武将','スキル','装備']){await p.locator('.g4g-tabs').getByRole('button',{name,exact:true}).click();await shot(name+'一覧');const options=await p.locator('.g4g-filters select').first().locator('option').evaluateAll(es=>es.map(e=>({value:e.value,text:e.textContent})));for(const option of options.filter(o=>o.value)){await p.locator('.g4g-filters select').first().selectOption(option.value);await shot(name+'-'+option.value);}await p.locator('.g4g-filters select').first().selectOption('');}
 await p.locator('.g4g-tabs').getByRole('button',{name:'デッキ',exact:true}).click();await p.locator('.g4g-party button').first().click();await shot('武将詳細');
 for(const slot of ['武器','頭','身体','脚','アクセ1','アクセ2']){
  await p.getByRole('dialog').getByRole('button',{name:new RegExp('^'+slot+'\\s*未装備')}).click();const picker=p.getByRole('dialog',{name:'装備を変更'});await picker.waitFor();assert(await picker.locator('.g4-asset-choice').count()>0);await picker.locator('.g4-asset-choice').first().scrollIntoViewIfNeeded();await shot('選択-'+slot);await picker.getByRole('button',{name:'取消',exact:true}).click();
 }
 await p.getByRole('dialog').getByRole('button',{name:'Lv育成',exact:true}).first().click();await p.getByRole('group',{name:'Lv育成の内容'}).waitFor();await shot('EXP投入');const controls=p.getByRole('group',{name:'Lv育成の内容'});await controls.getByRole('button',{name:'育成する',exact:true}).scrollIntoViewIfNeeded();await shot('EXP固定操作');
 assert(await controls.getByRole('button',{name:'育成する',exact:true}).evaluate(e=>e.getBoundingClientRect().height>=48));
 assert(await p.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await p.goto(base+'/qa/common-ui-audit?view=character&state=empty');await p.locator('.g4g-image-loading').waitFor({state:'hidden',timeout:90000});for(const name of ['武将','スキル','装備']){await p.locator('.g4g-tabs').getByRole('button',{name,exact:true}).click();await p.getByRole('status').filter({hasText:'ありません'}).waitFor();await shot('未所持-'+name);}
 assert.deepEqual(errors,[]);await p.close();
}console.log('PASS category consumers');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
