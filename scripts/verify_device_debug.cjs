const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const dir = 'docs/verification/device-debug/evidence';
const base = process.env.DEVICE_DEBUG_URL || 'http://localhost:3000';
(async () => {
  fs.mkdirSync(dir, {recursive:true});
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:664}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/qa/battle-common?canvas=1`);
    await page.waitForSelector('[data-unit-id]');
    await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
    const battle=page.locator('[data-playback-frame]');
    const height=await battle.evaluate(e=>e.getBoundingClientRect().height);
    assert(height<=644, `Battle height ${height} exceeds viewport reserve`);
    assert(Math.abs(await battle.evaluate(e=>Number(e.style.getPropertyValue('--battle-speed')))-1/1.3)<.001);
    const select=page.getByRole('combobox',{name:'記録フレーム'});
    const options=await select.locator('option').evaluateAll(nodes=>nodes.map(e=>({value:e.value,text:e.textContent})));
    for(const text of ['通常攻撃','検証用 攻撃','検証用の敵 −','豊臣秀吉 −','BURST発動']) {
      const option=options.find(e=>e.text.includes(text));
      if(!option) { if(text==='BURST発動') continue; throw Error(`Missing frame ${text}`); }
      await select.selectOption(option.value);
      await page.waitForTimeout(80);
      assert.equal(await page.locator('dialog[open]').count(),0,'Frame change reopened image gate');
      if(text.includes(' −')) assert(await page.locator('[data-hit]').count()>0,'Missing damage shake');
      if(text==='通常攻撃') assert.equal(await page.locator('[class*="feedback"]').count(),0);
      if(text==='検証用 攻撃') assert(await page.locator('[class*="skillFeedback"]').count()>0);
    }
    const burst=options.find(e=>e.text.includes('BURST開始')||e.text.includes('BURST発動')||e.text.includes('BURST再開'));
    assert(burst,'BURST fixture missing'); await select.selectOption(burst.value);
    assert.equal(await battle.evaluate(e=>Number(e.style.getPropertyValue('--battle-speed'))),1);
    await select.selectOption('0');
    await battle.scrollIntoViewIfNeeded();
    await page.screenshot({path:`${dir}/battle-390.png`});
    await page.getByRole('button',{name:'再開',exact:true}).click();
    await page.waitForTimeout(12000);
    assert(Number(await battle.getAttribute('data-playback-frame'))>5,'Playback did not advance');
    assert.equal(await page.locator('dialog[open]').count(),0);
    await page.getByRole('button',{name:'SKIP',exact:true}).click();
    await page.getByRole('heading',{name:'勝利',exact:true}).waitFor();
    assert.equal(await page.locator('[data-unit-id]').count(),0,'Result did not replace combat');
    await page.screenshot({path:`${dir}/victory-390.png`});
    await page.goto(`${base}/qa/device-debug`);
    await page.waitForSelector('.tutorial-copy');
    const paragraph=page.locator('.tutorial-copy p');
    const first=await paragraph.innerText(); await page.waitForTimeout(200);
    assert((await paragraph.innerText()).length>first.length,'Typewriter did not advance');
    await page.locator('.tutorial-next').click();
    assert.equal(await paragraph.innerText(),await paragraph.getAttribute('aria-label'),'First tap must reveal text');
    const scenes=page.getByRole('combobox',{name:'検証シーン'});
    for(const [value,name] of [['5','characters'],['8','skills'],['16','farewell']]) {
      await scenes.selectOption(value); await page.waitForTimeout(1200);
      await page.screenshot({path:`${dir}/tutorial-${name}.png`});
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(`${dir}/checks.json`,JSON.stringify({at:new Date().toISOString(),viewport:{width:390,height:664},battleHeight:height,checks:['normal duration factor 1.3','BURST baseline speed','no per-frame loading dialog','ally/enemy damage shake','skill name retained, action text removed','playback advances','result replaces combat','typewriter and tap reveal','tutorial card screenshots'],pageErrors:errors,scope:'Local Chromium fixture; no device acceptance, no DB writes'},null,2)+'\n');
    console.log('Device debug bounded browser checks passed');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
