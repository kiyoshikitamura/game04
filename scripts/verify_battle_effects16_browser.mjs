import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.EFFECTS_TEST_URL??'http://127.0.0.1:3116';
const out=process.env.EFFECTS_TEST_OUTPUT??'test-results/effects16';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.stack));
const report=[];
try {
  await page.goto(base+'/qa/battle-effects16');
  const families=await page.getByLabel('系統',{exact:true}).locator('option').allTextContents();
  // Predecode the exact shipped assets so captures exercise animation rather than network latency.
  const catalog=JSON.parse(await fs.readFile('src/app/components/redesign/battle-effects/assets.json','utf8'));
  await page.evaluate(async paths=>Promise.all(paths.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve();i.onerror=()=>reject(Error(src));i.src=src;}))),Object.values(catalog).flatMap(v=>v.assets));
  for(const side of ['enemy','ally'])for(const family of families){
    await page.getByLabel('対象側',{exact:true}).selectOption(side);
    await page.getByLabel('系統',{exact:true}).selectOption(family);
    await page.getByRole('button',{name:'再生',exact:true}).click();
    await page.waitForTimeout(family==='slash'?110:180);
    await page.getByRole('button',{name:'一時停止',exact:true}).click();
    const root=page.locator('.battleFx16');
    assert.equal(await root.getAttribute('data-target-side'),side);
    const sample=await root.evaluate(el=>({animations:el.getAnimations({subtree:true}).map(a=>({name:a.animationName,time:a.currentTime})),visible:Array.from(el.querySelectorAll('img,.sprite,.wave')).some(e=>parseFloat(getComputedStyle(e).opacity)>0&&getComputedStyle(e).visibility==='visible'),width:el.querySelector('.fx,.effect-root')?.style.getPropertyValue('--size')}));
    assert.equal(sample.visible,true,`${family}/${side}: no visible layer`);
    if(!['slash','slash_all','stun','projectile'].includes(family))assert.ok(sample.animations.length>0,`${family}: keyframes absent`);
    if(family==='slash_all')assert.equal(await root.locator('.slash').count(),7);
    if(family==='impact_all')assert.equal(await root.locator('.wave').count(),8);
    if(family==='heal_all')assert.equal(await root.locator('.unit').count(),side==='ally'?5:3);
    await page.getByTestId('effect-stage').screenshot({path:`${out}/${family}-${side}.png`});
    report.push({family,side,...sample});
    await page.getByRole('button',{name:'SKIP / 離脱',exact:true}).click();assert.equal(await root.count(),0);
    await page.getByRole('button',{name:'再開',exact:true}).click();
  }
  await page.getByLabel('系統',{exact:true}).selectOption('heal_all');
  await page.getByLabel('味方人数',{exact:true}).selectOption('6');
  assert.equal(await page.locator('.battleFx16 .unit').count(),6);
  await page.getByRole('button',{name:'再生',exact:true}).click();await page.waitForTimeout(160);
  await page.getByRole('button',{name:'一時停止',exact:true}).click();
  const current=()=>page.locator('.battleFx16').evaluate(e=>e.getAnimations({subtree:true})[0].currentTime);
  const pausedAt=await current();await page.waitForTimeout(180);assert.equal(await current(),pausedAt);
  await page.getByRole('button',{name:'速度 1',exact:true}).click();assert.equal(await current(),pausedAt);
  await page.getByRole('button',{name:'再開',exact:true}).click();await page.waitForTimeout(180);
  assert.ok((await current())-pausedAt>270,'2x must advance without resetting');
  await page.getByRole('button',{name:'速度 2',exact:true}).click();await page.waitForTimeout(800);
  assert.equal(await page.locator('.battleFx16').evaluate(e=>getComputedStyle(e).visibility),'hidden');
  await page.goto('about:blank');assert.equal(await page.locator('.battleFx16').count(),0);
  // Formal BattleView, approved simulated records only; mock unrelated art/audio locally.
  const image=await fs.readFile('public/battle-effects/heal_all/spd-back-aura.png');
  await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.abort();if(/\.(png|webp|jpg)$/.test(u.pathname)&&!u.pathname.startsWith('/battle-effects/'))return route.fulfill({contentType:'image/png',body:image});if(/\.(mp3|woff2)$/.test(u.pathname))return route.fulfill({status:204,body:''});return route.continue();});
  await page.goto(base+'/qa/battle-effects16?mode=recorded');
  const select=page.getByLabel('記録フレーム');
  const opts=await select.locator('option').evaluateAll(es=>es.map(e=>({value:e.value,text:e.textContent})));
  let found=false;
  for(const opt of opts.slice(1,30)){
    await select.selectOption(opt.value);await page.waitForTimeout(120);
    if(await page.locator('.battleFx16').count()){found=true;break;}
  }
  assert.ok(found,'formal recorded event should produce effects');
  const targetSide=await page.locator('.battleFx16').first().getAttribute('data-target-side');
  await page.getByRole('button',{name:'再開',exact:true}).click();
  await page.getByRole('button',{name:'再生速度 1倍'}).click();
  await page.getByRole('button',{name:/SKIP/}).click();
  assert.equal(await page.locator('.battleFx16').count(),0);
  assert.ok(await page.getByRole('button',{name:'結果へ',exact:true}).isVisible());
  await select.selectOption(opts[Math.max(0,opts.length-3)].value);
  await page.getByRole('button',{name:'再開',exact:true}).click();
  await page.getByRole('button',{name:'結果へ',exact:true}).waitFor({timeout:10000});
  assert.equal(await page.locator('.battleFx16').count(),0);
  await page.goto('about:blank');assert.equal(await page.locator('.battleFx16').count(),0);
  report.push({formalRecordedEvent:true,targetSide,skip:true,pause:true,speedChange:true,sixAllies:true});
  assert.deepEqual(errors,[]);
  await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
  console.log(`PASS: ${families.length*2} side/family cases, pause, 2x/3x, six allies, unmount, recorded-event SKIP. No browser errors.`);
} finally {await browser.close();}

