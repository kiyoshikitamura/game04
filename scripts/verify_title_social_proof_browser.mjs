import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.TITLE_PROOF_BASE_URL || 'http://localhost:3146';
const output = 'docs/verification/title-social-proof';
await fs.mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true});
const results=[];
try {
 for (const width of [360,375,390]) {
  const context=await browser.newContext({viewport:{width,height:780},deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  for (const count of [29,30,39,40,99,100,127]) {
   const responseReady = page.waitForResponse(r=>r.url().includes('/api/title/online'));
   await page.goto(`${base}/?titleOnline=${count}`,{waitUntil:'domcontentloaded'});
   await page.getByRole('button',{name:'TAP TO START',exact:true}).waitFor({timeout:60000});
   assert.equal(await page.locator('.title-online-proof').count(),0);
   await responseReady;
   await page.getByRole('button',{name:'TAP TO START',exact:true}).click();
   await page.getByRole('button',{name:'はじめから',exact:true}).waitFor();
   const badge=page.locator('.title-online-proof');
   if(count<30) assert.equal(await badge.count(),0);
   else {
    await badge.waitFor();
    assert.equal(await badge.innerText(),`● 現在${count>=100?count:Math.floor(count/10)*10}人${count>=100?'':'以上'}がプレイ中`);
    const b=await badge.boundingBox(),c=await page.getByRole('button',{name:'はじめから',exact:true}).boundingBox();
    assert(b.y+b.height<=c.y && b.x>=0 && b.x+b.width<=width);
    assert.equal(await badge.evaluate(el=>getComputedStyle(el).animationDuration),'4s');
   }
   await page.screenshot({path:`${output}/${width}-${count}.png`});
   results.push({width,count,passed:true});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.title-online-proof').evaluate(el=>getComputedStyle(el).animationName),'none');
  results.push({width,reducedMotion:'PASS',pageErrors:errors});
  assert.deepEqual(errors,[]);
  await context.close();
 }
 // Live polling transition without altering game/DB: replace only the count endpoint.
 const context=await browser.newContext({viewport:{width:375,height:780}});
 const page=await context.newPage(); let count=127;
 await page.route('**/api/title/online*',route=>route.fulfill({json:{count,countedAt:new Date().toISOString(),fixture:true}}));
 await page.goto(base); await page.getByRole('button',{name:'TAP TO START',exact:true}).click();
 await page.locator('.title-online-proof').waitFor();
 count=29;
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await page.waitForFunction(()=>!document.querySelector('.title-online-proof'));
 results.push({transition:'127 -> 29',passed:true}); await context.close();
 // Error keeps the actual start CTA usable. Preview-only real game entry is checked separately.
 const failContext=await browser.newContext({viewport:{width:375,height:780}});
 const fail=await failContext.newPage();
 await fail.goto(`${base}/?titleOnline=error`);
 await fail.getByRole('button',{name:'TAP TO START',exact:true}).click();
 const start=fail.getByRole('button',{name:'はじめから',exact:true}); await start.waitFor();
 assert.equal(await start.isEnabled(),true);
 assert.equal(await fail.locator('.title-online-proof').count(),0);
 await start.click();
 await fail.waitForFunction(()=>!document.querySelector('.title-view-overlay'),{},{timeout:60000});
 await fail.screenshot({path:`${output}/failure-start.png`});
 results.push({failureStart:'Game started; title overlay closed'});
 await failContext.close();
 await fs.writeFile(`${output}/browser-results.json`,JSON.stringify({base,results},null,2));
 console.log(JSON.stringify({passed:true,checks:results.length,base}));
} finally {await browser.close();}
