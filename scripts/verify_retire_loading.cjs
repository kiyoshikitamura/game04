const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.BASE_URL||'http://localhost:3013',out=process.env.QA_OUT||'../../outputs/retire-loading';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();try{
 const results=[];
 for(const width of [375,390]){
  const page=await browser.newPage({viewport:{width,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const mode of ['retire-loading','retire-error']){
   await page.goto(`${base}/qa/battle-device-five?mode=${mode}`);
   await page.getByRole('button',{name:'一時停止',exact:true}).click();
   await page.getByRole('button',{name:'リタイア',exact:true}).click();
   await page.getByRole('dialog',{name:'リタイアしますか？'}).getByRole('button',{name:'リタイア',exact:true}).click();
   const loading=page.locator('.g4-loading[data-context="screen"]');await loading.waitFor();
   assert.equal(await page.getByRole('region',{name:'戦闘終了'}).getAttribute('aria-busy'),'true');
   assert.equal(await page.getByRole('region',{name:'戦闘終了'}).getByRole('button').count(),0);
   assert.equal(await loading.locator('img').count(),0);assert.equal(await page.getByText('リタイアを保存しています…',{exact:true}).count(),0);
   await page.screenshot({path:`${out}/${mode}-short-${width}.png`});
   await loading.locator('img').waitFor();const bounds=await loading.boundingBox();assert(Math.abs(bounds.y+bounds.height/2-300)<3,'shared screen loader is centered');await page.screenshot({path:`${out}/${mode}-long-${width}.png`});
   if(mode==='retire-error'){
    await page.locator('.screen-state-error[role="alert"]').waitFor();assert.equal(await loading.count(),0);
    assert.equal(await page.getByRole('region',{name:'戦闘終了'}).getAttribute('aria-busy'),'false');
    await page.screenshot({path:`${out}/error-${width}.png`});
    await page.getByRole('button',{name:'再試行',exact:true}).click();await loading.waitFor();assert.equal(await page.locator('.screen-state-error[role="alert"]').count(),0);
   }
   await page.getByText('出撃元へ戻りました',{exact:true}).waitFor();
   assert.equal(await loading.count(),0);assert.equal(await page.locator('[data-completed]').getAttribute('data-completed'),'0');assert.equal(await page.locator('[data-next]').getAttribute('data-next'),'0');
   assert.equal(await page.locator('[data-retire-attempts]').getAttribute('data-retire-attempts'),mode==='retire-error'?'2':'1');
   results.push({width,mode,commonSpinner:true,commonLongLogo:true,noButtonsWhilePending:true,clearedOnSuccess:true,errorAndRetry:mode==='retire-error',completion:0,nextStage:0});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 fs.writeFileSync(out+'/result.json',JSON.stringify({base,results},null,2));console.log('PASS 375/390: common short/long loading, locked pending, error clears spinner, retry, return without completion/next');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
