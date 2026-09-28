const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.QA_URL||'http://localhost:3040';
const out='docs/verification/tutorial-effects-20260928/recovery';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:375,height:664}});
 const report={base,checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
 try{
  let blocked=true;
  await page.route('**/battle-effects/tutorial-opening/char_ageha_01.png',r=>blocked?r.abort():r.continue());
  await page.goto(base+'/qa/tutorial-opening');
  for(let n=0;n<3;n++)await page.getByRole('button',{name:'次へ',exact:true}).click();
  await page.getByText('戦闘画像を読み込めませんでした。',{exact:true}).waitFor();
  const frame=()=>page.locator('[data-playback-frame]').getAttribute('data-playback-frame');
  assert.equal(await frame(),'0');await page.waitForTimeout(800);assert.equal(await frame(),'0');
  assert.equal(await page.locator('[data-tutorial-cutin]').count(),0);
  await page.screenshot({path:out+'/image-error.png'});blocked=false;
  await page.getByRole('button',{name:'再試行',exact:true}).click();
  await page.locator('[data-tutorial-cutin="char_ageha_01"]').waitFor({timeout:45000});
  report.checks.push('failed cutin load holds frame zero; retry decodes images and resumes once');
  await page.getByRole('button',{name:'再生速度 1倍',exact:true}).click();
  await page.locator('[data-tutorial-combo="1"]').waitFor({timeout:45000});
  await page.getByRole('button',{name:'一時停止',exact:true}).click();
  const pausedFrame=await frame();
  const time=()=>page.locator('[data-tutorial-combo]').evaluate(n=>n.getAnimations()[0]?.currentTime);
  const t=await time();await page.waitForTimeout(800);assert.equal(await frame(),pausedFrame);assert.ok(Math.abs((await time())-t)<50);
  await page.getByRole('button',{name:'バトルを続ける',exact:true}).click();
  await page.locator(`[data-tutorial-cutin][data-effect-frame="${pausedFrame}"]`).waitFor();
  report.checks.push('combo and lead-in freeze together; resume reaches the same action cutin');
  await page.reload();await page.locator('[data-opening-scene="world"]').waitFor();await page.waitForTimeout(1000);
  assert.equal(await page.locator('[data-tutorial-cutin],[data-tutorial-combo]').count(),0);
  assert.equal(await page.locator('[data-opening-scene]').getAttribute('data-opening-scene'),'world');
  report.checks.push('reload/unmount cancels ongoing animation and progression');
  assert.deepEqual(report.errors,[]);report.status='PASS';
 }catch(e){report.status='FAIL';report.failure=e.stack;await page.screenshot({path:out+'/failure.png'});process.exitCode=1;}
 finally{fs.writeFileSync(out+'/result.json',JSON.stringify(report,null,2));await browser.close();}
 console.log(JSON.stringify(report));
})();
