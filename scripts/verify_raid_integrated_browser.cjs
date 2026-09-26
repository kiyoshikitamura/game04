// Browser checks exercise the production RaidView and RedesignShell via an offline fixture.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const out='docs/design/raid/2026-09-23/final-integration';
(async()=>{
 let server;let timer;const external=process.env.RAID_PREVIEW_URL;
 if(!external){server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1'],{env:{...process.env,NEXT_PUBLIC_USE_MOCK_DB:'true',NEXT_PUBLIC_APP_ENV:'development',NEXT_PUBLIC_ENABLE_QA_TOOLS:'true'},stdio:['ignore','pipe','pipe']});server.stderr.on('data',d=>process.stderr.write(d));await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('Ready')){clearTimeout(timer);resolve()}});server.on('exit',c=>reject(Error('server exited '+c)));timer=setTimeout(()=>reject(Error('server timeout')),60000)});}
 const browser=await chromium.launch({...(process.env.RAID_BROWSER_EXECUTABLE?{executablePath:process.env.RAID_BROWSER_EXECUTABLE}:{}),args:['--no-sandbox'],...(external&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
  fs.mkdirSync(out,{recursive:true});const page=await browser.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=external||'http://127.0.0.1:3000';
  const response=await page.goto(base+'/qa/raid-approved',{waitUntil:'networkidle',timeout:120000});assert.equal(response.status(),200);assert.ok(page.url().includes('/qa/raid-integrated'));
  await page.locator('.raid-approved-card').first().waitFor();
  const images=async()=>page.locator('.rd-shell img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));return imgs.filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src)});
  assert.deepEqual(await images(),[]);assert.equal(await page.locator('.raid-approved-card').count(),2);
  await page.getByRole('button',{name:'エンカウント',exact:true}).click();assert.equal(await page.locator('.raid-approved-card').count(),1);
  await page.getByRole('button',{name:'領土侵攻',exact:true}).click();assert.equal(await page.locator('.raid-approved-card').count(),1);
  await page.getByRole('button',{name:'すべて',exact:true}).click();
  await page.screenshot({path:out+'/body-list-390.png'});
  await page.getByRole('button',{name:'常闇の覇将の詳細'}).click();await images();
  await page.screenshot({path:out+'/body-detail-390.png'});
  for(const label of ['敵情報','参加者','報酬','救援']){await page.getByRole('navigation',{name:'レイド操作'}).getByRole('button',{name:label,exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();await dialog.getByRole('button',{name:'閉じる',exact:true}).click();}
  await page.locator('.rd-shell').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(150);
  const geometry=await page.locator('.rd-shell').evaluate(e=>({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight,overflow:e.scrollWidth>e.clientWidth,headerTop:e.querySelector('.rd-header').getBoundingClientRect().top}));
  assert.ok(geometry.top>0);assert.equal(geometry.overflow,false);assert.ok(Math.abs(geometry.headerTop)<2);assert.equal(await page.locator('.raid-approved-detail__compact').count(),1);
  await page.screenshot({path:out+'/body-lower-390.png'});
  assert.match(await page.locator('.raid-approved-detail__challenge button').innerText(),/20/);await page.locator('.raid-approved-detail__challenge button').click();await page.getByRole('dialog',{name:'出撃準備'}).waitFor();assert.equal(await page.getByRole('dialog').getByRole('button',{name:'挑む',exact:true}).isEnabled(),true);await page.getByRole('dialog').getByRole('button',{name:'戻る',exact:true}).click();
  await page.getByRole('button',{name:'レイド一覧'}).click();await page.getByRole('button',{name:/終了したレイド・未受取報酬/}).click();await page.getByRole('dialog').getByRole('button',{name:/未受取あり/}).click();
  await page.getByRole('button',{name:'報酬を確認する',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'受け取る',exact:true}).click();
  await page.getByRole('button',{name:'報酬を確認する',exact:true}).click();assert.equal(await page.getByRole('dialog').getByRole('button',{name:'受け取る',exact:true}).isDisabled(),true);await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).click();
  assert.equal((await page.locator('body').innerText()).includes('残り時間が短い順'),false);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/browser-results.json',JSON.stringify({url:base,scope:'Production shell/controller; offline fixture actions. Real Edge/DB checked separately.',viewport:{width:390,height:844},checks:['3 filters','list to detail','4 action dialogs','scroll to compact detail','fixed header','no horizontal overflow','preparation energy20','ended history to claim','second claim disabled','images decoded','no page errors'],geometry,errors},null,2)+'\n');
  console.log('PASS browser checks',geometry);
 }finally{await browser.close();server?.kill();clearTimeout(timer);}
})().catch(e=>{console.error(e);process.exit(1)});
