const {chromium}=require('@playwright/test'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out=process.env.QA_OUTPUT,base=process.env.QA_URL;
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:375,height:844}});
 await page.goto(process.env.QA_SHARE_URL||base+'/qa/skill-vfx24');
 const cases=[];
 for(const width of [375,1280])for(const effect of ['heavy-cleave','water-wave','barrier-field','grand-healing','formation-break','purification']){
  await page.setViewportSize({width,height:844});
  await page.getByLabel('敵の配置',{exact:true}).selectOption('1');
  await page.getByLabel('カットイン',{exact:true}).selectOption('SR');
  await page.getByLabel('演出',{exact:true}).selectOption(effect);
  await page.getByRole('button',{name:/^(再生する|もう一度再生)$/}).click();
  await page.waitForFunction(()=>{const fx=document.querySelector('[data-vfx-id]');if(!fx||+fx.dataset.vfxTime<220)return false;const button=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='一時停止');if(!button)return false;button.click();return true;});
  const fx=page.locator('[data-vfx-id]').first();await fx.waitFor({state:'visible'});
  const time=await fx.getAttribute('data-vfx-time');
  await page.screenshot({path:`${out}/${effect}-${width}.jpg`,type:'jpeg',quality:85,fullPage:true});
  assert.equal(await fx.getAttribute('data-vfx-time'),time);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  cases.push({width,effect,time});
 }
 fs.writeFileSync(out+'/layouts.json',JSON.stringify({status:'PASS',cases},null,2));await browser.close();console.log('PASS 12 frozen responsive VFX screenshots');
})().catch(e=>{console.error(e);process.exit(1)});
