const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('@playwright/test');
const catalog=require('../../src/app/components/redesign/battle-effects/skill-vfx24.json');
const base=process.env.QA_URL,out=process.env.QA_OUTPUT||'docs/verification/skill-vfx24/preview';
if(!base)throw Error('QA_URL required');
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.QA_SHARE_URL||base+'/qa/skill-vfx24');
 fs.mkdirSync(out,{recursive:true});const assets=[];const queue=catalog.flatMap(d=>[d.lead,d.hit]);
 await Promise.all(Array.from({length:4},async()=>{while(queue.length){const path=queue.shift();const response=await page.context().request.get(base+path);assert.equal(response.status(),200,path);assert.match(response.headers()['content-type'],/image\/webp/);const bytes=Buffer.from(await response.body());const sha=b=>crypto.createHash('sha256').update(b).digest('hex');assert.equal(sha(bytes),sha(fs.readFileSync('public'+path)),path);assets.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)});}}));

 const network=[];page.on('request',r=>network.push(r.url()));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/');assert.equal(response.status(),200);
 await page.waitForTimeout(3500);
 await page.screenshot({path:out+'/game-title.jpg',type:'jpeg',quality:85});
 assert(!network.some(url=>url.includes('/battle-effects/skill-vfx24/')),'title must not preload all VFX');
 assert(!network.some(url=>url.includes('soiksqgtmcnspfedmanr')),'Preview must not contact Production DB');
 const qa=await page.goto(base+'/qa/skill-vfx24');assert.equal(qa.status(),200);
 assert.equal(await page.getByLabel('演出',{exact:true}).locator('option').count(),24);
 assert.deepEqual(errors,[]);
 await browser.close();fs.writeFileSync(out+'/assets-and-title.json',JSON.stringify({status:'PASS',base,assets:assets.sort((a,b)=>a.path.localeCompare(b.path)),title:200,qa:200,noVfxPreloadAtTitle:true,noProductionDbRequest:true,errors},null,2));console.log('PASS deployed 48 assets byte hashes, public QA/title, Preview isolation, demand loading');
})().catch(e=>{console.error(e);process.exit(1)});
