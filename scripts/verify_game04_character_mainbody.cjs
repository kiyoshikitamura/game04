// Actual root app, authenticated QA user and live GAME04 dev API. No fixture responses.
const fs=require('node:fs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('@playwright/test');
const output='docs/verification/character-20260923';
(async()=>{
 const config=require('../config/game04-preview-public.json');
 const session=JSON.parse(fs.readFileSync(process.env.CHARACTER_SESSION||'/tmp/character-qa-0924/session.json','utf8'));
 assert.equal(config.supabaseUrl,'https://lrgyllgzcdcphlbmkknc.supabase.co');
 assert.equal(JSON.parse(Buffer.from(config.supabaseAnonKey.split('.')[1],'base64url').toString()).ref,'lrgyllgzcdcphlbmkknc');
 assert.equal(session.user.id,'8aab5b69-efc8-4b8e-9e9c-147a2102c2dc');
 const port='3195',base=`http://127.0.0.1:${port}`;
 const fd=fs.openSync('/tmp/game04-character-mainbody-server.log','a');
 const server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack','-H','127.0.0.1','-p',port],{stdio:['ignore',fd,fd],env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:config.supabaseUrl,NEXT_PUBLIC_SUPABASE_ANON_KEY:config.supabaseAnonKey,NEXT_PUBLIC_APP_ENV:'preview'}});
 const report={kind:'mainbody-live-api',root:base,userId:session.user.id,at:new Date().toISOString(),authorization:'User requested GAME04-dev real API verification; AGENTS permits this dev only. Parent verified MCP project lrgyllgzcdcphlbmkknc=game04-dev-clean ACTIVE_HEALTHY. Prior unverified-destination attempt rejected by auto-review; this run fixes URL, public JWT ref, QA user ID and blocks all other browser origins.',screens:[],api:[],errors:[],failures:[],blockedOrigins:[]};let browser,page;
 try{
  for(let i=0;i<90;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,1000));}
  browser=await chromium.launch({headless:true,executablePath:'/tmp/game04-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox'],...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{})});
  page=await browser.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:true,reducedMotion:'reduce'});
  await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===base||url.origin===config.supabaseUrl)return route.continue();if(!report.blockedOrigins.includes(url.origin))report.blockedOrigins.push(url.origin);return route.abort('blockedbyclient');});
  await page.addInitScript(({session,key})=>localStorage.setItem(key,JSON.stringify(session)),{session,key:'sb-lrgyllgzcdcphlbmkknc-auth-token'});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',async response=>{if(response.url().includes('/functions/v1/game04-redesign-api')){try{const body=await response.json();report.api.push({status:response.status(),action:response.request().postDataJSON()?.action,version:body.state?.version,characters:body.state?.characters.length,equipment:body.state?.equipment.length,error:body.error});}catch{}}});
  const entry=await page.goto(base,{waitUntil:'domcontentloaded',timeout:120000});report.entryStatus=entry.status();console.log('root-entry',entry.status());
  await Promise.race([page.locator('.rd-footer').waitFor({timeout:30000}),page.getByRole('button',{name:'TAP TO START',exact:true}).waitFor({timeout:30000})]);if(await page.getByRole('button',{name:'TAP TO START',exact:true}).isVisible()){await page.getByRole('button',{name:'TAP TO START',exact:true}).click();await page.getByRole('button',{name:'続きから',exact:true}).click({timeout:90000});}
  await page.locator('.rd-footer').waitFor({timeout:120000});
  const capture=async(name)=>{await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));await page.screenshot({path:`${output}/mainbody-${name}-390x${page.viewportSize().height}.png`});report.screens.push({name,height:page.viewportSize().height,text:(await page.locator('body').innerText()).slice(-18000),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),images:await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.getBoundingClientRect().width&&!i.naturalWidth).map(i=>i.getAttribute('src')))});};
  for(const height of [844,600]){
   await page.setViewportSize({width:390,height});await page.locator('.rd-footer').getByRole('button',{name:/キャラ/}).click();await page.locator('.g4-growth').waitFor();await page.getByRole('dialog',{name:'画像を準備中'}).waitFor({state:'hidden',timeout:90000});await capture('deck');
   await page.locator('.g4g-tabs').getByRole('button',{name:'キャラ',exact:true}).click();await page.locator('.g4g-grid button').first().click();await capture('detail');await page.locator('.rd-modal-body').evaluate(e=>{e.scrollTop=e.scrollHeight;});await capture('detail-end');await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).first().click();
   await page.locator('.rd-footer').getByRole('button',{name:/クエスト/}).click();await capture('quest');
   await page.locator('.rd-footer').getByRole('button',{name:/レイド/}).click();await capture('raid');
  }
  await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'TAP TO START',exact:true}).click();await page.getByRole('button',{name:'続きから',exact:true}).click();await page.locator('.rd-footer').waitFor({timeout:120000});await page.locator('.rd-footer').getByRole('button',{name:/キャラ/}).click();await page.locator('.g4-growth').waitFor();await capture('reload-deck');assert.ok(report.api.some(a=>a.action==='get_state'&&a.status===200));assert.deepEqual(report.errors,[]);
 }catch(e){report.failures.push(e.message);if(page){report.failureText=(await page.locator('body').innerText()).slice(0,4000);await page.screenshot({path:`${output}/mainbody-blocked.png`});}process.exitCode=1;}finally{if(browser)await browser.close();server.kill('SIGTERM');fs.writeFileSync(`${output}/mainbody-browser.json`,JSON.stringify(report,null,2));}
 console.log(JSON.stringify({kind:report.kind,screens:report.screens.length,api:report.api,errors:report.errors,failures:report.failures}));
})();
