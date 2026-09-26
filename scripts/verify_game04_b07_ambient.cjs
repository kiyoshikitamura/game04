const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
const out='docs/verification/device-debug/b07/ambient';fs.mkdirSync(out,{recursive:true});
const scenes=['sakura','mikawa','owari','mino','omi','kai','echigo','kyoto','izumo','satsuma','sekigahara'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),report=[];
 try{for(const width of [375,390]){
  const p=await browser.newPage({viewport:{width,height:664}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:3017/qa/b07');await p.locator('.g4-cowboy').waitFor();
  const nav=p.locator('nav[aria-label="B07検証操作"]');
  let oldFrame;
  for(const scene of scenes){
   await nav.evaluate(e=>e.style.display='');
   await p.getByLabel('背景',{exact:true}).selectOption(scene==='sakura'?'castle-town':'area:'+scene);
   await p.waitForFunction(scene=>document.querySelector('.g4-home-effect')?.getAttribute('src')==='/creative/effects/ambient.html?scene='+scene,scene);
   const frame=await p.locator('.g4-home-effect').elementHandle().then(e=>e.contentFrame());
   await frame.waitForFunction(scene=>document.documentElement.dataset.scene===scene&&document.documentElement.dataset.running==='true',scene);
   if(oldFrame)assert(oldFrame.isDetached());oldFrame=frame;
   await nav.evaluate(e=>e.style.display='none');
   await frame.waitForFunction(()=>document.querySelector('canvas').width>100&&document.querySelector('canvas').height>100);await p.waitForTimeout(180);
   const first=await frame.locator('canvas').evaluate(e=>e.toDataURL());
   await p.waitForTimeout(650);
   const pixels=await frame.locator('canvas').evaluate(e=>{
    const a=e.getContext('2d').getImageData(0,0,e.width,e.height).data;let active=0,maxAlpha=0;for(let i=3;i<a.length;i+=4){if(a[i])active++;maxAlpha=Math.max(maxAlpha,a[i]);}
    return {active,maxAlpha,data:e.toDataURL(),w:e.width,h:e.height};
   });
   assert(pixels.active>0);assert.notEqual(first,pixels.data,'motion must change '+scene);delete pixels.data;
   const counts=await frame.evaluate(()=>({particles:Number(document.documentElement.dataset.particles),mist:Number(document.documentElement.dataset.mistLayers)}));
   assert(counts.particles<=10&&counts.mist<=2);
   const layers=await p.locator('.g4-home-effect').evaluate(e=>{
    const c=document.querySelector('.g4-home-cowboy'),v=document.querySelector('.g4-home-visual'),r=e.getBoundingClientRect(),s=v.getBoundingClientRect();
    return {effects:Number(getComputedStyle(e).zIndex),character:Number(getComputedStyle(c).zIndex),pointer:getComputedStyle(e).pointerEvents,clipped:getComputedStyle(v).overflow==='hidden',inside:r.left>=s.left&&r.right<=s.right+1&&r.top>=s.top&&r.bottom<=s.bottom+1};
   });
   assert(layers.effects<layers.character&&layers.pointer==='none'&&layers.clipped&&layers.inside);
   assert.equal(await p.locator('.g4-home-effect').count(),1);
   await p.screenshot({path:`${out}/${scene}-${width}.png`});
   report.push({width,scene,counts,pixels,layers});
  }
  // Renderer owns its own stop/resume too, even if embedded outside HomeEffect.
  const active=p.frames().find(f=>f.url().includes('ambient.html'));
  await active.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await active.evaluate(()=>document.documentElement.dataset.running),'false');
  const stopped=await active.locator('canvas').evaluate(e=>e.toDataURL());await p.waitForTimeout(150);
  assert.equal(await active.locator('canvas').evaluate(e=>e.toDataURL()),stopped);
  await active.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await active.evaluate(()=>document.documentElement.dataset.running),'true');
  await active.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  assert.equal(await active.evaluate(()=>document.documentElement.dataset.running),'false');
  await active.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  assert.equal(await active.evaluate(()=>document.documentElement.dataset.running),'true');
  // Controlled visibility event for parent; real iPhone tab switching remains an acceptance check.
  const detached=p.waitForEvent('framedetached',{predicate:f=>f===active});
  await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
  await p.waitForFunction(()=>!document.querySelector('.g4-home-effect'));await detached;assert(active.isDetached());
  await p.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));});
  await p.locator('.g4-home-effect').waitFor();assert.equal(await p.locator('.g4-home-effect').count(),1);
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.g4-home-effect'));
  await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('.g4-home-effect').waitFor();
  await nav.evaluate(e=>e.style.display='');
  await p.getByLabel('背景',{exact:true}).selectOption('ssr:char_reiji_01');
  await p.waitForFunction(()=>document.querySelector('.g4-home-effect')?.getAttribute('src')==='/creative/effects/char_reiji_01.html');
  assert.equal(p.frames().filter(f=>f.url().includes('ambient.html')).length,0);
  await p.getByRole('button',{name:'tutorial',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.g4-home-effect'));
  assert.equal(p.frames().filter(f=>f.url().includes('/creative/effects/')).length,0);
  assert.deepEqual(errors,[]);await p.close();
 }
 fs.writeFileSync(out+'/verification.json',JSON.stringify({cases:report,lifecycle:['one iframe','scene replacement detaches old frame','local child visibility stop/resume','simulated BFCache pagehide/pageshow','simulated parent visibility destroy/resume','reduced-motion destroy/resume','SSR unchanged','departure destroys iframe'],errors:[]},null,2));
 console.log('PASS: 22 scenery/viewport cases; pixels animate; layers/counts/lifecycle/SSR/departure');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
