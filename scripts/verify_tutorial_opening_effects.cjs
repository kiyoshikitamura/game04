const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.QA_URL||'http://localhost:3040';
const out=path.resolve(process.env.QA_OUTPUT||'docs/verification/tutorial-effects-20260928/browser');
fs.mkdirSync(out,{recursive:true});
const width=Number(process.env.QA_WIDTH||390);
const reduced=process.env.QA_REDUCED==='1';
const report={base,width,reduced,errors:[],failedRequests:[],checks:[]};
async function main(){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width,height:664},isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)report.failedRequests.push({url:r.url(),status:r.status()})});
 await page.addInitScript(()=>{
  window.battleTimeline=[];window.lastBattleState="";window.effectEvents=[];window.effectSeen=new WeakSet();window.maxCutins=0;window.duplicateCombo=false;
  new MutationObserver(()=>{
   const battle=document.querySelector('[data-playback-frame]');
   const state=battle&&[document.querySelector('[data-opening-scene]')?.dataset.openingScene,battle.dataset.playbackFrame,battle.dataset.presentationPhase].join(':');
   if(battle&&state!==window.lastBattleState){window.lastBattleState=state;window.battleTimeline.push({scene:document.querySelector('[data-opening-scene]')?.dataset.openingScene,frame:Number(battle.dataset.playbackFrame),phase:battle.dataset.presentationPhase,event:battle.dataset.frameEvent,time:performance.now()});}
   window.maxCutins=Math.max(window.maxCutins,document.querySelectorAll('[data-tutorial-cutin]').length);
   if(document.querySelector('[data-tutorial-combo]')&&document.querySelector('.phase-combo .ink-words'))window.duplicateCombo=true;
   document.querySelectorAll('[data-tutorial-cutin],[data-tutorial-combo]').forEach(n=>{
    if(window.effectSeen.has(n))return;window.effectSeen.add(n);
    window.effectEvents.push({scene:document.querySelector('[data-opening-scene]')?.dataset.openingScene,frame:Number(n.dataset.effectFrame),kind:n.dataset.tutorialCutin?'cutin':'combo',value:n.dataset.tutorialCutin||n.dataset.tutorialCombo,time:performance.now()});
   });
  }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['data-playback-frame','data-presentation-phase']});
 });
 const scene=async name=>page.locator(`[data-opening-scene="${name}"]`).waitFor({timeout:90000});
 const next=async()=>page.getByRole('button',{name:'次へ',exact:true}).click();
 const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 try{
  await page.goto(base+'/qa/tutorial-opening');await scene('world');await noOverflow();
  const font=await page.locator('.opening-world-copy p').evaluate(n=>({family:getComputedStyle(n).fontFamily,weight:getComputedStyle(n).fontWeight}));
  assert.ok(font.family.includes('G4NotoSerif'));assert.equal(font.weight,'900');report.worldFont=font;
  await page.screenshot({path:path.join(out,`${width}-world.png`)});
  await next();await scene('challenge');await next();await scene('oda');await next();await scene('trailer');
  const cutin=page.locator('[data-tutorial-cutin]').first();await cutin.waitFor({timeout:60000});
  await page.getByRole('button',{name:'一時停止',exact:true}).click();
  const before=await page.evaluate(()=>({frame:document.querySelector('[data-playback-frame]').dataset.playbackFrame,times:document.querySelector('[data-tutorial-cutin]').getAnimations({subtree:true}).map(a=>a.currentTime)}));
  await page.waitForTimeout(700);
  const after=await page.evaluate(()=>({frame:document.querySelector('[data-playback-frame]').dataset.playbackFrame,times:document.querySelector('[data-tutorial-cutin]').getAnimations({subtree:true}).map(a=>a.currentTime)}));
  assert.equal(after.frame,before.frame);after.times.forEach((n,i)=>assert.ok(Math.abs(n-before.times[i])<50));
  report.checks.push('pause freezes frame and cutin animation');
  await page.getByRole('button',{name:'バトルを続ける',exact:true}).click();
  await page.waitForTimeout(300);
  await noOverflow();await page.screenshot({path:path.join(out,`${width}-cutin.png`)});
  const bounds=await page.locator('.tutorial-skill-fx').evaluate(n=>{
   const a=n.querySelector('.tutorial-skill-art'),s=n.querySelector('.tutorial-skill-name');
   return {width:parseFloat(getComputedStyle(a).width)/n.clientWidth,top:parseFloat(getComputedStyle(a).top)/n.clientHeight,skillTop:parseFloat(getComputedStyle(s).top)/n.clientHeight,fontSize:parseFloat(getComputedStyle(s).fontSize),duration:getComputedStyle(a).animationDuration,loaded:Array.from(n.querySelectorAll('img')).every(i=>i.complete&&i.naturalWidth>0)};
  });
  assert.ok(Math.abs(bounds.width-1.15)<.01);assert.ok(Math.abs(bounds.top-.17)<.01);assert.ok(Math.abs(bounds.skillTop-.45)<.01);assert.ok(bounds.loaded);report.bounds=bounds;assert.ok(bounds.fontSize>=22);if(!reduced)assert.equal(bounds.duration,'0.8s');
  await page.getByRole('button',{name:'再生速度 1倍',exact:true}).click();
  // updatePlaybackRate takes effect on the next browser animation frame.
  await page.waitForFunction(()=>{
   const effect=document.querySelector('[data-tutorial-cutin]');
   return effect&&effect.getAnimations({subtree:true}).every(animation=>animation.playbackRate===2);
  });
  const animations=await page.locator('[data-tutorial-cutin]').evaluate(n=>n.getAnimations({subtree:true}).map(a=>a.playbackRate));
  assert.ok(animations.every(n=>n===2));report.checks.push('speed change preserves mounted cutin and sets rate 2');
  await page.locator('[data-tutorial-combo="1"]').waitFor({timeout:60000});
  await page.waitForTimeout(100);await page.screenshot({path:path.join(out,`${width}-combo.png`)});
  await scene('need');
  const trailerEvents=await page.evaluate(()=>window.effectEvents.filter(e=>e.scene==='trailer'));
  assert.deepEqual(trailerEvents.filter(e=>e.kind==='cutin').map(e=>e.value),['char_ageha_01','char_karen_01','char_leo_01','char_koharu_01','char_go_01','char_ageha_01','char_ageha_01','char_ageha_01','char_reiji_01']);
  assert.deepEqual(trailerEvents.filter(e=>e.kind==='combo').map(e=>e.value),['1','2','3']);
  assert.equal(new Set(trailerEvents.map(e=>e.kind+e.frame)).size,trailerEvents.length);
  report.timeline=await page.evaluate(()=>window.battleTimeline);
  for(const combo of trailerEvents.filter(e=>e.kind==='combo')){
   const skill=trailerEvents.find(e=>e.kind==='cutin'&&e.frame===combo.frame);
   const damage=report.timeline.find(e=>e.scene==='trailer'&&e.frame===combo.frame+1&&e.event==='damage');
   assert.ok(skill&&damage);assert.ok(skill.time<combo.time&&combo.time<damage.time);
   assert.ok(combo.time-skill.time>=450&&combo.time-skill.time<900);
  }
  const second=trailerEvents.find(e=>e.value==='char_karen_01');
  const nextDamage=report.timeline.find(e=>e.scene==='trailer'&&e.frame===second.frame+1&&e.event==='damage');
  report.normalCutinAt2xMs=nextDamage.time-second.time;
  assert.ok(report.normalCutinAt2xMs>=350&&report.normalCutinAt2xMs<650);
  report.checks.push('trailer: 9 cutins once; 800ms baseline; skill then combo then damage for all 3 combos; automatic defeat transition');
  await next();await scene('name');await page.getByLabel('軍師名（1〜8文字）').fill('軍師確認');
  await page.getByRole('button',{name:'この名で軍師になる'}).click();await scene('recruit');await next();await scene('test');await next();await scene('formation');
  await noOverflow();await page.screenshot({path:path.join(out,`${width}-formation.png`)});
  await page.getByRole('button',{name:'おまかせ編成・戦技'}).click();await scene('ready');await page.getByRole('button',{name:'模擬戦を始める'}).click();await scene('practice');
  await page.getByRole('button',{name:'再生速度 1倍',exact:true}).click();
  await page.getByRole('region',{name:'戦闘リザルト',exact:true}).waitFor({timeout:90000});
  const practiceEvents=await page.evaluate(()=>window.effectEvents.filter(e=>e.scene==='practice'));
  const practiceTimeline=await page.evaluate(()=>window.battleTimeline.filter(e=>e.scene==='practice'));
  assert.ok(practiceTimeline.length>0);assert.ok(practiceTimeline.every(e=>e.phase!=='wave'));
  report.checks.push('practice has no wave announcement');
  assert.deepEqual(practiceEvents.filter(e=>e.kind==='cutin').map(e=>e.value),['char_leo_01']);
  assert.deepEqual(practiceEvents.filter(e=>e.kind==='combo').map(e=>e.value),['1','2','3']);
  assert.equal(await page.locator('[data-tutorial-cutin],[data-tutorial-combo]').count(),0);
  await page.screenshot({path:path.join(out,`${width}-victory.png`)});
  const actions=await page.getByRole('region',{name:'戦闘リザルト'}).locator('footer button').all();assert.equal(actions.length,1);await actions[0].click();await scene('farewell');
  await page.getByRole('button',{name:'チュートリアルを終える'}).click();await scene('complete');await noOverflow();
  await page.screenshot({path:path.join(out,`${width}-complete.png`)});
  report.checks.push('practice: Date cutin once, no SSR art on R starters, combos 1/2/3, victory/farewell/complete');
  report.events=await page.evaluate(()=>window.effectEvents);assert.equal(await page.evaluate(()=>window.maxCutins),1);assert.equal(await page.evaluate(()=>window.duplicateCombo),false);
  await page.getByRole('button',{name:'最初から確認する'}).click();await scene('world');assert.equal(await page.locator('[data-tutorial-cutin],[data-tutorial-combo]').count(),0);
  await next();await next();await next();await scene('trailer');await page.locator('[data-tutorial-cutin="char_ageha_01"]').waitFor({timeout:60000});
  report.checks.push('restart starts a fresh trailer, no lingering overlays');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);report.status='PASS';
 }catch(e){report.status='FAIL';report.failure=e.stack;await page.screenshot({path:path.join(out,`${width}-failure.png`)});throw e;}
 finally{fs.writeFileSync(path.join(out,`${width}-result.json`),JSON.stringify(report,null,2));await browser.close();}
 console.log(JSON.stringify({status:report.status,base,width,checks:report.checks}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
