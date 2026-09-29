import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='https://game04-mh9yknzw2-kiyoshi-kitamura.vercel.app';
const out='scratch/release-verification'; await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch();const results=[];
try {
 for(const width of [360,375,390]) {
  const context=await browser.newContext({viewport:{width,height:780}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const count of [29,127]) {
   const fetched=page.waitForResponse(r=>r.url().includes('/api/title/online'));
   await page.goto(`${base}/?titleOnline=${count}`);await fetched;
   assert.equal(await page.locator('.title-online-proof').count(),0);
   await page.getByRole('button',{name:'TAP TO START',exact:true}).click();
   await page.getByRole('button',{name:'はじめから',exact:true}).waitFor();
   if(count===29)assert.equal(await page.locator('.title-online-proof').count(),0);
   else {
    const proof=page.locator('.title-online-proof');await proof.waitFor();
    assert.equal(await proof.innerText(),'● 現在127人がプレイ中');
    assert.equal(await proof.evaluate(e=>getComputedStyle(e).animationDuration),'2s');
    assert.notEqual(await proof.evaluate(e=>getComputedStyle(e).color),await page.locator('.title-online-number').evaluate(e=>getComputedStyle(e).color));
    const p=await proof.boundingBox(),c=await page.getByRole('button',{name:'はじめから',exact:true}).boundingBox();assert(p.y+p.height<c.y);
    await page.screenshot({path:`${out}/title-${width}.png`});
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await proof.evaluate(e=>getComputedStyle(e).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
   }
  }
  for(const area of ['', '?area=mino']) {
   await page.goto(`${base}/qa/quest-invasion${area}`);
   const number=page.locator('.rq-invasion-number').first();await number.waitFor();
   assert.equal(await number.evaluate(e=>getComputedStyle(e).animationDuration),'1.8s');
   assert.equal(await number.evaluate(e=>getComputedStyle(e.parentElement).animationName),'none');
   await page.screenshot({path:`${out}/invasion-${area?'stage':'area'}-${width}.png`});
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await number.evaluate(e=>getComputedStyle(e).animationName),'none');
   await page.emulateMedia({reducedMotion:'no-preference'});
  }
  assert.deepEqual(errors,[]);results.push({width,title:true,invasionArea:true,invasionStage:true,reducedMotion:true,pageErrors:errors});
  await context.close();
 }
 await fs.writeFile(`${out}/results.json`,JSON.stringify({base,results},null,2));console.log(JSON.stringify({passed:true,results}));
}finally{await browser.close();}
