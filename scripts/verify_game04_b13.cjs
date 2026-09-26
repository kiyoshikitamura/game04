const {chromium}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const out='docs/verification/device-debug/b13';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),report=[];
try{for(const width of [375,390]){
 const page=await browser.newPage({viewport:{width,height:664}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.B13_BASE_URL||'http://localhost:3013')+'/qa/b13-local');
 const controls=page.locator('nav[aria-label="B13検証操作"]');
 const ready=()=>page.waitForFunction(()=>document.querySelector('.g4-growth')?.getAttribute('aria-busy')==='false');
 const hide=()=>controls.evaluate(e=>e.style.visibility='hidden');const show=()=>controls.evaluate(e=>e.style.visibility='visible');
 const shot=async name=>{await hide();await page.screenshot({path:`${out}/${name}-${width}.png`});};
 await ready();await shot('deck-four');assert.equal(await page.getByText('総合HP',{exact:false}).count(),0);
 await page.locator('.g4g-party>button').nth(4).click();await ready();assert.match(await page.locator('.g4g-formation-help').innerText(),/空き枠/);
 await shot('formation');await page.locator('.g4g-grid>button').first().click();await page.waitForFunction(()=>document.querySelector('[data-deck]')?.getAttribute('data-deck')==='5');
 await ready();if(await page.getByRole('button',{name:'閉じる',exact:true}).count())await page.getByRole('button',{name:'閉じる',exact:true}).last().click();
 await shot('deck-five');
 await show();await page.getByRole('button',{name:'未解放',exact:true}).click();await ready();await hide();await page.locator('.g4g-party>button').nth(4).click();
 await page.getByRole('alert').filter({hasText:'クリアすると解放'}).waitFor();await shot('locked');await page.getByRole('button',{name:'閉じる',exact:true}).last().click();
 await show();await page.getByRole('button',{name:'未編成なし',exact:true}).click();await ready();await hide();await page.locator('.g4g-party>button').nth(4).click();await ready();await page.getByRole('status').filter({hasText:'未編成の武将がいません'}).waitFor();await shot('no-candidate');await page.getByRole('button',{name:'デッキに戻る'}).click();
 await show();await page.getByRole('button',{name:'4人初期化'}).click();await ready();await hide();await page.locator('.g4g-party>button').first().click();await page.locator('.g4g-passive').waitFor();await shot('passive');
 await page.locator('.g4g-modal .g4g-skill-row').first().click();await page.locator('.g4-asset-choice').first().waitFor();await shot('skill-selector');assert(await page.locator('.g4-asset-choice:disabled').count()>0);
 await page.getByRole('button',{name:'取消',exact:true}).click();await page.locator('.g4g-equipment-slots>button').first().click();await page.locator('.g4-asset-choice').first().waitFor();await shot('equipment-selector');
 await page.locator('.g4-asset-choice:not(:disabled)').first().click();await ready();if(await page.getByRole('button',{name:'閉じる',exact:true}).count()>1)await page.getByRole('button',{name:'閉じる',exact:true}).last().click();
 if(await page.locator('.g4g-equipment-slots').count()){await page.locator('.g4g-equipment-slots>button').first().click();await page.getByText('この枠に装備中',{exact:true}).waitFor();await shot('equipment-current');await page.getByRole('button',{name:'取消',exact:true}).click();}
 await show();await page.getByRole('button',{name:'装備なし',exact:true}).click();await ready();await hide();await page.locator('.g4g-party>button').first().click();await page.locator('.g4g-equipment-slots>button').first().click();await page.getByText('この部位に装備できる所持品がありません。',{exact:true}).waitFor();await shot('equipment-none');
 await show();await page.getByRole('button',{name:'4人初期化'}).click();await ready();await hide();const footer=[];
 for(const label of ['本陣','武将','共闘','出陣']){await page.getByRole('navigation',{name:'メインナビゲーション'}).getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(250);footer.push({label,sizes:await page.locator('.rd-chrome-footer img').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})))});if(label==='本陣'){await page.locator('.g4-home-effect').waitFor();assert.equal(await page.getByRole('button',{name:'表示切替',exact:true}).count(),1);const layers=await page.evaluate(()=>({effect:getComputedStyle(document.querySelector('.g4-home-effect')).zIndex,person:getComputedStyle(document.querySelector('.g4-home-cowboy')).zIndex,pointer:getComputedStyle(document.querySelector('.g4-home-effect')).pointerEvents}));assert(Number(layers.effect)>Number(layers.person));assert.equal(layers.pointer,'none');await shot('home');}if(label==='共闘')await shot('raid-footer');}
 footer.forEach(f=>f.sizes.forEach(s=>assert.deepEqual(s,{width:32,height:32})));
 for(const mode of ['characters','skills','prepare']){await show();await controls.getByLabel('検証状態').selectOption(mode);await hide();await page.waitForTimeout(1500);await shot(mode);}
 assert.deepEqual(errors,[]);report.push({width,footer,errors,deckSave:true,lockedExplanation:true,noCandidate:true,selectors:true});await page.close();
}fs.writeFileSync(`${out}/browser-verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
