const {chromium}=require('@playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs');
const catalog=require('../../src/app/components/redesign/battle-effects/skill-vfx24.json');
const base=process.env.QA_URL||'http://localhost:3054',out=process.env.QA_OUTPUT||'docs/verification/skill-vfx24/browser';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const report={base,cases:[],controls:[],errors:[],failed:[],writes:[]};
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.failed.push({url:r.url(),status:r.status()})});
 page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method())&&!r.url().includes('localhost'))report.writes.push({method:r.method(),url:r.url()})});
 await page.addInitScript(()=>{
   window.vfxEvents=[];const seen=new WeakSet();
   new MutationObserver(()=>document.querySelectorAll('[data-tutorial-cutin],[data-tutorial-combo],[data-vfx-id]').forEach(n=>{if(seen.has(n))return;seen.add(n);window.vfxEvents.push({run:n.closest('[data-run]')?.dataset.run,kind:n.dataset.vfxId?'vfx':n.dataset.tutorialCombo?'combo':'cutin',id:n.dataset.vfxId,phase:n.dataset.vfxPhase,lead:n.dataset.vfxLead,side:n.dataset.targetSide,frame:n.closest('[data-playback-frame]')?.dataset.playbackFrame});})).observe(document,{subtree:true,childList:true});
 });
 await page.goto(base+'/qa/skill-vfx24');
 await page.locator('[data-playback-frame]').waitFor();
 for(const side of ['ally','enemy'])for(const [index,effect] of catalog.entries()) {
   await page.getByLabel('演出',{exact:true}).selectOption(effect.id);
   await page.getByLabel('発動側',{exact:true}).selectOption(side);
   await page.evaluate(()=>{window.vfxEvents=[]});
   await page.getByRole('button',{name:/^(再生する|もう一度再生)$/}).click();
   const fx=page.locator(`[data-vfx-id="${effect.id}"]`).first();
   await fx.waitFor({state:'visible',timeout:20000});
   await page.waitForFunction(id=>{const e=document.querySelector(`[data-vfx-id="${id}"]`);return e&&+e.dataset.vfxTime>=130},effect.id);
   const observed=await fx.evaluate(n=>({side:n.dataset.targetSide,phase:n.dataset.vfxPhase,lead:n.dataset.vfxLead,parts:[...n.querySelectorAll('img')].map(i=>({src:new URL(i.src).pathname,loaded:i.complete&&i.naturalWidth>0,opacity:+getComputedStyle(i).opacity,transform:i.style.transform}))}));
   assert(observed.parts.every(p=>p.loaded),'all effect textures decoded');
   assert(observed.parts.some(p=>p.opacity>0),'animated visible layers');
   const support=['barrier-field','grand-healing','counter-stance','war-god-rally','purification'].includes(effect.id);
   assert.equal(observed.side,support?side:side==='ally'?'enemy':'ally');
   await page.locator('.vfx24-stage').screenshot({path:`${out}/${String(index+1).padStart(2,'0')}-${side}.jpg`,type:'jpeg',quality:82});
   await page.waitForFunction(()=>!document.querySelector('[data-vfx-id]')&&document.querySelector('[data-frame-event="end"]'),{timeout:20000});
   const events=await page.evaluate(()=>window.vfxEvents.filter(e=>e.run===document.querySelector('[data-run]').dataset.run));
   assert.equal(events.filter(e=>e.kind==='cutin').length,1);
   assert.equal(events.filter(e=>e.kind==='vfx'&&e.lead==='true').length,1);
   assert(events.findIndex(e=>e.kind==='cutin')<events.findIndex(e=>e.kind==='vfx'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   report.cases.push({id:effect.id,side,observed,events});
   console.log(`PASS ${side} ${index+1}/24 ${effect.id}`);
 }
 // Mid-effect pause freezes the seek clock; speed changes preserve current time.
 await page.getByLabel('演出',{exact:true}).selectOption('water-wave');
 await page.getByLabel('発動側',{exact:true}).selectOption('ally');
 await page.getByLabel('連撃も確認',{exact:true}).check();
 await page.evaluate(()=>{window.vfxEvents=[]});
 await page.getByRole('button',{name:'再生する',exact:true}).click();
 await page.locator('[data-tutorial-combo]').waitFor({state:'visible'});
 await page.locator('[data-vfx-id]').first().waitFor({state:'visible'});
 await page.getByRole('button',{name:'一時停止',exact:true}).click();
 const paused=await page.locator('[data-vfx-id]').first().getAttribute('data-vfx-time');
 await page.waitForTimeout(350);
 assert.equal(await page.locator('[data-vfx-id]').first().getAttribute('data-vfx-time'),paused);
 await page.getByRole('button',{name:'バトルを続ける',exact:true}).click();
 await page.getByRole('button',{name:'再生速度 1倍',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'再生速度 2倍',exact:true}).count(),1);
 await page.getByRole('button',{name:'SKIP',exact:true}).click();
 await page.waitForTimeout(100);
 assert.equal(await page.locator('[data-vfx-id],[data-tutorial-combo],[data-tutorial-cutin]').count(),0);
 const sequence=await page.evaluate(()=>window.vfxEvents.map(e=>e.kind));
 assert(sequence.indexOf('cutin')<sequence.indexOf('combo')&&sequence.indexOf('combo')<sequence.indexOf('vfx'));
 report.controls.push('cutin -> combo -> VFX; mid-VFX pause, resume, speed, SKIP cleanup');
 // Unsuccessful removal never shows the broken barrier, but the attack still plays.
 await page.getByLabel('連撃も確認',{exact:true}).uncheck();
 await page.getByLabel('演出',{exact:true}).selectOption('formation-break');
 await page.getByLabel('付与・解除が成立',{exact:true}).uncheck();
 await page.evaluate(()=>{window.vfxEvents=[]});
 await page.getByRole('button',{name:'再生する',exact:true}).click();
 await page.locator('[data-vfx-id][data-vfx-phase="strike"]').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-vfx-phase="cleanse"]').count(),0);
 const noRemoval=await page.evaluate(()=>window.vfxEvents.filter(e=>e.kind==='vfx'));
 assert(noRemoval.every(e=>e.phase==='strike'));
 await page.getByRole('button',{name:'一時停止',exact:true}).click();
 await page.getByRole('button',{name:'リタイア',exact:true}).last().click();
 const confirm=page.getByRole('dialog').getByRole('button',{name:'リタイア',exact:true});await confirm.click();
 await page.getByRole('status').filter({hasText:'再生を終了しました'}).waitFor();
 assert.equal(await page.locator('[data-vfx-id]').count(),0);
 report.controls.push('no-op cleanse preserves attack; retire disposes VFX');
 // SR and single-enemy mobile/desktop fit, on the same BattleView.
 for(const width of [375,1280]) {
   await page.setViewportSize({width,height:844});
   await page.getByLabel('敵の配置',{exact:true}).selectOption('1');
   await page.getByLabel('カットイン',{exact:true}).selectOption('SR');
   await page.getByLabel('演出',{exact:true}).selectOption('grand-healing');
   await page.getByLabel('付与・解除が成立',{exact:true}).check();
   await page.getByRole('button',{name:'再生する',exact:true}).click();
   await page.locator('[data-vfx-id]').first().waitFor({state:'visible'});
   await page.waitForTimeout(200);
   await page.screenshot({path:`${out}/healing-${width}.jpg`,type:'jpeg',quality:85,fullPage:true});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 report.controls.push('375px/390px/1280px, SR cutin and single-enemy layout');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);assert.deepEqual(report.writes,[]);
 report.status='PASS';fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();console.log('PASS 48 effect/side cases and playback controls');
})().catch(error=>{console.error(error);process.exit(1)});
