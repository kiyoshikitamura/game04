const {chromium}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const out='docs/verification/device-debug/b07';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),report=[];
 try{
  for(const width of [375,390]){
   const p=await browser.newPage({viewport:{width,height:664}}),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.goto('http://localhost:3017/qa/b07');
   const nav=p.locator('nav[aria-label="B07検証操作"]');
   const hide=()=>nav.evaluate(e=>e.style.display='none'),show=()=>nav.evaluate(e=>e.style.display='');
   await p.locator('.g4-cowboy').waitFor();
   const frames=[];
   for(const id of ['char_ageha_01','char_reiji_01','char_joe_01','char_koharu_01','char_go_01']){
    await show();await p.getByLabel('武将',{exact:true}).selectOption(id);
    await p.locator(`.g4-cowboy[data-character="${id}"]`).waitFor();
    await hide();await p.waitForTimeout(120);
    const frame=await p.locator('.g4-home-cowboy').boundingBox(),cta=await p.locator('.g4-home-actions').boundingBox(),header=await p.locator('.rd-header').boundingBox();
    assert(frame.y>=header.y+header.height);assert(frame.y+frame.height<=cta.y+1);
    frames.push({id,frame,ctaY:cta.y});
    await p.screenshot({path:`${out}/home-${id}-${width}.png`});
   }
   await p.getByRole('button',{name:'切替',exact:true}).click();
   await p.locator('.g4-home-background-choices .g4-home-choice').first().waitFor();
   const order=await p.locator('.g4-home-background-choices .g4-home-choice strong').allTextContents();
   assert.equal(order[0],'夕桜の城下街');assert.equal(order[1],'三河の地');assert(!order.includes('夕桜の城門'));
   await p.screenshot({path:`${out}/selector-${width}.png`});
   await p.getByRole('button',{name:'閉じる',exact:true}).last().click();
   await show();
   await p.getByLabel('背景',{exact:true}).selectOption('ssr:char_reiji_01');
   await p.waitForFunction(()=>document.querySelector('.g4-home-effect')?.getAttribute('src')==='/creative/effects/char_reiji_01.html');
   assert.equal(await p.locator('.g4-home-effect').count(),1);
   await p.getByLabel('背景',{exact:true}).selectOption('area:mikawa');
   await p.waitForFunction(()=>!document.querySelector('.g4-home-effect'));
   await p.getByLabel('背景',{exact:true}).selectOption('castle-approach');
   await p.waitForFunction(()=>document.querySelector('.g4-home')?.getAttribute('style')?.includes('castle-town.jpg'));
   await p.locator('.g4-home-effect').waitFor();
   await p.emulateMedia({reducedMotion:'reduce'});
   await p.waitForFunction(()=>!document.querySelector('.g4-home-effect'));
   await p.emulateMedia({reducedMotion:'no-preference'});
   await p.locator('.g4-home-effect').waitFor();
   await p.getByRole('button',{name:'tutorial',exact:true}).click();
   await p.locator('.tutorial-cast .g4-cowboy').waitFor();
   assert.equal(await p.locator('.g4-home-effect').count(),0);
   await hide();
   const before=await p.locator('.tutorial-cast').boundingBox(),textBefore=await p.locator('.g4-typewriter').boundingBox();
   await p.waitForTimeout(500);
   await p.screenshot({path:`${out}/tutorial-typing-${width}.png`});
   await p.waitForTimeout(2200);
   const after=await p.locator('.tutorial-cast').boundingBox(),textAfter=await p.locator('.g4-typewriter').boundingBox(),copy=await p.locator('.tutorial-copy').boundingBox();
   assert.deepEqual(before,after);assert.equal(textBefore.height,112);assert.equal(textAfter.height,112);assert(after.y+after.height<=copy.y+1);
   await p.screenshot({path:`${out}/tutorial-${width}.png`});
   await show();
   const logins=[];
   for(const day of [1,3,7,15,30]){
    await p.getByLabel('日数',{exact:true}).fill(String(day));
    await p.getByRole('button',{name:'login',exact:true}).click();
    await p.locator('.g4-login-board').waitFor();
    await p.waitForTimeout(250);
    assert.equal(await p.locator('.g4-login-days>li').count(),30);
    assert.equal(await p.locator('.g4-login-days>li>ul>li').count(),81);
    assert.equal(await p.locator('.g4-login-days>li[data-status="本日"]').count(),1);
    assert.equal(await p.locator('.g4-login-days>li[data-status="受取済み"]').count(),day-1);
    assert.equal(await p.locator('.g4-login-days>li[data-status="次回"]').count(),day===30?0:1);
    assert.equal(await p.locator('.g4-login-today .g4-reward-list>li').count(),day===3?4:[7,15,30].includes(day)?3:2);
    const next=await p.locator('.g4-login-next .g4-login-heading').innerText();
    assert(next.includes(`${day%30+1}日目`));
    const bad=await p.locator('.g4-login-board img').evaluateAll(els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src));assert.deepEqual(bad,[]);
    if(day===3)await p.screenshot({path:`${out}/login-top-${width}.png`});
    if(day===30)await p.screenshot({path:`${out}/login-day30-${width}.png`});
    await p.locator('.g4-login-board-title').evaluate(e=>e.scrollIntoView({block:'start'}));
    if(day===3)await p.screenshot({path:`${out}/login-board-${width}.png`});
    await p.locator('.canonical-dialog-body').evaluate(e=>e.scrollTop=e.scrollHeight);
    const metrics=await p.locator('.canonical-dialog').evaluate(e=>{
     const body=e.querySelector('.canonical-dialog-body'),footer=e.querySelector('footer'),button=footer.querySelector('button'),label=button.querySelector('span'),end=e.querySelector('[data-login-end]');
     const b=button.getBoundingClientRect(),l=label.getBoundingClientRect();
     return {height:e.getBoundingClientRect().height,end:end.getBoundingClientRect().bottom,footer:footer.getBoundingClientRect().top,atEnd:Math.abs(body.scrollHeight-body.clientHeight-body.scrollTop)<2,horizontal:body.scrollWidth<=body.clientWidth,ctaHeight:b.height,ctaCentered:Math.abs(b.x+b.width/2-l.x-l.width/2)<1};
    });
    assert(metrics.height<=664*.8+1&&metrics.end<=metrics.footer&&metrics.atEnd&&metrics.horizontal&&metrics.ctaHeight>=48&&metrics.ctaCentered,JSON.stringify(metrics));
    if(day===3)await p.screenshot({path:`${out}/login-end-${width}.png`});
    logins.push({day,next,metrics});
    assert.equal(await p.getByRole('button',{name:'閉じる',exact:true}).count(),1);
    await p.getByRole('button',{name:'閉じる',exact:true}).click();
    await p.locator('.canonical-dialog').waitFor({state:'detached'});
    assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
   }
   assert.deepEqual(errors,[]);
   report.push({width,height:664,frames,order,typewriter:{before,after,height:textAfter.height},logins,effectLifecycle:'SSR to quest, legacy fallback, reduced motion, departure: pass',errors});
   await p.close();
  }
  fs.writeFileSync(out+'/browser-verification.json',JSON.stringify(report,null,2));console.log('PASS: 375/390, five character poses, five login days, 81 reward rows, sort, typewriter, effect lifecycle');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
