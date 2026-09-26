const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const base=process.argv[2]||'http://localhost:3097',out=process.argv[3]||'docs/verification/paid-expiry-20260927/local';
const session=JSON.parse(fs.readFileSync(process.env.QA_SESSION_FILE||'.expiry-local/session.json','utf8'));
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});
 const report=[];
 for(const width of [375,390]){
  const ctx=await browser.newContext({viewport:{width,height:844}});
  await ctx.addInitScript(s=>localStorage.setItem('sb-znakrkaazliexzwihxge-auth-token',JSON.stringify(s)),session);
  const page=await ctx.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().includes('/rpc/billing_refresh_paid_assets'))requests.push(r.status());});
  await page.goto(base+'/qa/paid-expiry',{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'所持品',exact:true}).waitFor();
  await page.locator('.g4-inventory-entry').first().waitFor();
  await page.screenshot({path:path.join(out,'inventory-'+width+'.png'),fullPage:true});
  const inventory=await page.locator('.g4-inventory-entry').allTextContents();
  await page.getByRole('button',{name:'購入分の有効期限',exact:true}).click();
  await page.locator('.shop-paid-expiry-list li').first().waitFor();
  await page.screenshot({path:path.join(out,'expiry-'+width+'.png'),fullPage:true});
  await page.getByText('失効履歴',{exact:true}).click();
  await page.locator('details li').last().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'history-'+width+'.png'),fullPage:true});
  const dialog=await page.getByRole('dialog').innerText();
  assert.ok(dialog.includes('失効履歴'));assert.ok(dialog.includes('×3'));assert.ok(dialog.includes('×2'));
  assert.ok(!dialog.includes('ダイヤ'));
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'所持品',exact:true}).waitFor();
  const reloaded=await page.locator('.g4-inventory-entry').allTextContents();
  assert.deepEqual(reloaded,inventory);assert.equal(errors.length,0);
  assert.ok(requests.length>=3&&requests.every(s=>s===200));
  report.push({width,inventory,reloaded,expiryHistory:true,errors,rpcStatuses:requests});
  await ctx.close();
 }
 await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.message);process.exit(1);});
