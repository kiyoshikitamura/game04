import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const artifacts=await mkdtemp(join(tmpdir(),'game04-ui-'));
const base=process.env.PREVIEW_URL||'http://localhost:3105';
const browser=await chromium.launch({headless:true});
const results=[];
const ready=page=>page.locator('[data-ui-loading]').waitFor({state:'detached',timeout:25000});
try {
 const context=await browser.newContext({viewport:{width:320,height:360}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let release;const hold=new Promise(resolve=>release=resolve);let slow=true;
 await page.route('**/*',async route=>{if(slow&&route.request().resourceType()==='image'&&route.request().url().includes('/creative/'))await hold;await route.continue();});
 await page.goto(`${base}/qa/redesign`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-ui-loading]').waitFor();
 await page.locator('[data-ui-loading] .branded-loading').waitFor({timeout:15000});
 assert.equal(await page.locator('[data-ui-loading] .branded-loading').count(),1);
 assert.equal(await page.locator('[data-ui-loading] .g4-loading-spinner').count(),1);
 assert.equal(await page.locator('.rd-shell').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 await page.locator('.rd-footer button').nth(1).dispatchEvent('click');
 assert.equal(await page.locator('.rd-footer [aria-current=page]').textContent(),'ホーム');
 slow=false;release();await ready(page);
 assert.equal(await page.locator('.rd-shell').evaluate(el=>getComputedStyle(el).visibility),'visible');
 assert.equal(await page.locator('.rd-shell img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0);
 results.push('slow image batch / delayed logo / single spinner / footer blocked');
 // A failed image must remain blocked until a user explicitly retries.
 const failureContext=await browser.newContext({viewport:{width:375,height:568}});const failurePage=await failureContext.newPage();let fail=true;
 await failurePage.route('**/creative/characters/**',route=>fail?route.abort():route.continue());
 // Match actual character URLs without depending on a particular character id.
 await failurePage.route('**/*',route=>fail&&route.request().resourceType()==='image'&&route.request().url().includes('/creative/')?route.abort():route.continue());
 await failurePage.goto(`${base}/qa/redesign`,{waitUntil:'domcontentloaded'});
 await failurePage.getByRole('button',{name:'再試行',exact:true}).waitFor({timeout:20000});
 assert.equal(await failurePage.locator('.rd-shell').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 fail=false;await failurePage.getByRole('button',{name:'再試行',exact:true}).click();await ready(failurePage);
 assert.equal(await failurePage.locator('.rd-shell img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0);
 results.push('failed images are not ready / explicit retry recovers actual images');
 await failureContext.close();
 await page.getByRole('button',{name:'メニュー',exact:true}).click();await ready(page);await page.getByRole('button',{name:'QA',exact:true}).click();
 await page.getByLabel('低速処理確認（3秒・QAのみ）').check();
 await page.getByRole('button',{name:'SR・SSRと育成の確認データ',exact:true}).click();await ready(page);
 await page.locator('.g4g-tabs button').filter({hasText:/^キャラ$/}).click();await ready(page);
 assert.ok(await page.locator('.g4-rarity-SR .g4-card-shine').count()>0);
 assert.ok(await page.locator('.g4-rarity-SSR .g4-card-particles i').count()>0);
 const phases=await page.locator('.g4-card-shine').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).animationDelay));assert.ok(new Set(phases).size>1);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.g4-card-shine').first().evaluate(n=>getComputedStyle(n).display),'none');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('.g4-card-shine').first().evaluate(n=>getComputedStyle(n).animationPlayState),'paused');
 assert.equal(await page.locator('.g4-rarity-SSR').first().evaluate(n=>getComputedStyle(n,'::after').animationPlayState),'paused');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 results.push('SR shine / SSR particles / staggered phase / reduced motion / hidden tab pause');
 let releaseDialog;const dialogHold=new Promise(resolve=>releaseDialog=resolve);
 await page.route('**/characters/**',async route=>{await dialogHold;await route.continue();});
 await page.locator('.g4g-grid>button').nth(1).click();await page.locator('[data-ui-loading]').waitFor();
 assert.equal(await page.locator('[data-game-dialog]').evaluate(el=>getComputedStyle(el).visibility),'hidden');
 await page.locator('.g4-dialog-close').dispatchEvent('click');await page.locator('.rd-footer button').nth(1).dispatchEvent('click');
 assert.equal(await page.locator('[data-game-dialog]').count(),1);
 releaseDialog();await ready(page);await page.unroute('**/characters/**');
 assert.equal(await page.locator('[data-game-dialog]').evaluate(el=>getComputedStyle(el).visibility),'visible');
 await page.locator('.g4-dialog-surface').dispatchEvent('click');assert.equal(await page.locator('[data-game-dialog]').count(),1);
 results.push('dialog images prepared before reveal / immediate input block / backdrop blocked / dialog controls restored');
 const input=page.getByLabel('武将EXP小投入数');await input.fill('1');
 await page.getByRole('button',{name:'この内容で育成する',exact:true}).click();
 await page.locator('[data-ui-loading]').waitFor();
 assert.equal(await page.locator('[data-ui-loading] .g4-loading-spinner').count(),1);
 await page.locator('.rd-menu-button').dispatchEvent('click');await page.locator('.rd-footer button').nth(1).dispatchEvent('click');
 await ready(page);await page.getByRole('heading',{name:'育成完了',exact:true}).waitFor();
 const dialog=page.getByRole('dialog');assert.equal(await dialog.getByRole('button',{name:'閉じる',exact:true}).count(),1);assert.equal(await dialog.locator('.g4-dialog-close').count(),0);
 assert.ok((await dialog.innerText()).includes('100 → 99'));
 const close=await dialog.getByRole('button',{name:'閉じる',exact:true}).boundingBox();assert.ok(close.y+close.height<=360);
 await page.waitForTimeout(2000);assert.ok(await dialog.isVisible());await dialog.getByRole('button',{name:'閉じる',exact:true}).click();await ready(page);
 results.push('confirmed growth / exact consumed count / result persists / close reachable / duplicate navigation blocked');
 await page.getByRole('button',{name:'この内訳で覚醒する',exact:true}).click();await ready(page);
 await page.getByRole('heading',{name:'覚醒完了',exact:true}).waitFor();
 const awakening=await page.getByRole('dialog').innerText();assert.ok(awakening.includes('覚醒+1'));assert.ok(awakening.includes('Lv上限 50 → 60'));assert.ok(awakening.includes('スキル枠 1 → 2'));
 await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).click();await ready(page);
 await page.locator('.g4-dialog-close').click();await ready(page);
 await page.locator('.g4g-grid>button').filter({hasText:'魂の操作'}).first().click();await ready(page);
 await page.getByRole('button',{name:'固有魂で武将を迎える',exact:true}).click();await ready(page);
 await page.getByRole('heading',{name:'武将獲得',exact:true}).waitFor();
 const acquired=page.getByRole('dialog');assert.ok((await acquired.innerText()).includes('固有魂'));assert.equal(await acquired.locator('.g4-result-character img.g4-creative-person').count(),1);assert.equal(await acquired.locator('.g4-dialog-close').count(),0);
 await page.screenshot({path:join(artifacts,'acquisition-320.png')});
 results.push('confirmed awakening unlocks / soul consumption to acquired character / no result X');
 await page.goto(`${base}/qa/redesign`,{waitUntil:'domcontentloaded'});await ready(page);
 for(const width of [320,430]){
  await page.setViewportSize({width,height:568});
  for(const label of ['Home','Quest','Growth','Raid','領土侵攻','Battle','ガチャ','ショップ','ミッション']){
   if(await page.getByRole('button',{name:'QA操作を開く',exact:true}).count())await page.getByRole('button',{name:'QA操作を開く',exact:true}).click();
   else{await page.getByRole('button',{name:'メニュー',exact:true}).click();await ready(page);await page.getByRole('button',{name:'QA',exact:true}).click();}
   await page.locator('.qa-operations').getByRole('button',{name:label,exact:true}).click();await ready(page);
   const layout=await page.locator('.rd-shell').evaluate(root=>({overflow:root.scrollWidth>root.clientWidth+2,broken:[...root.querySelectorAll('img')].filter(i=>i.getClientRects().length&&(!i.complete||!i.naturalWidth)).length}));
   assert.equal(layout.overflow,false,`${label} overflow ${width}`);assert.equal(layout.broken,0,`${label} images ${width}`);
  }
 }
 results.push('all 9 QA views at 320/430px / no horizontal overflow or broken images');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({base,artifacts,results,pageErrors:errors},null,2));
} finally {await browser.close();}
