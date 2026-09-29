import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='https://sengoku-hime-ennbu.com';
const api=await fetch(`${base}/api/title/online`);assert.equal(api.status,200);const online=await api.json();
const override=await fetch(`${base}/api/title/online?fixture=127`).then(r=>r.json());assert.notEqual(override.fixture,true);
assert.equal((await fetch(`${base}/qa/quest-invasion`)).status,404);
const browser=await chromium.launch();
try {
 const context=await browser.newContext({viewport:{width:375,height:780}});const page=await context.newPage();
 const errors=[],events=[];let visit;
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().includes('/rpc/game04_record_title_proof_event_v1')){const b=r.request().postDataJSON();events.push({type:b.p_event_type,status:r.status()});visit=b.p_visit_id;}});
 const countReady=page.waitForResponse(r=>r.url().includes('/api/title/online'));
 await page.goto(`${base}/?titleOnline=127`);const data=await (await countReady).json();assert.notEqual(data.fixture,true);
 assert.equal(await page.locator('.title-online-proof').count(),0);
 const observed=page.waitForResponse(r=>r.url().includes('/rpc/game04_record_title_proof_event_v1')&&r.request().postData()?.includes('SELECTION_VIEWED'));
 await page.getByRole('button',{name:'TAP TO START',exact:true}).click();
 assert((await observed).ok());await page.getByRole('button',{name:'はじめから',exact:true}).waitFor();
 assert.equal(await page.locator('.title-online-proof').count(),data.count>=30?1:0);
 const css=await page.evaluate(()=>Array.from(document.styleSheets).flatMap(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText)}catch{return []}}).join('\n'));
 assert(/animation:\s*2s[^;}]*titleOnlinePulse/.test(css));
 assert(/animation:\s*1\.8s[^;}]*rq-invasion-blink/.test(css));
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'scratch/release-verification/production-title.png'});
 const result={base,online,override,qaStatus:404,events,visit,errors,titlePulse:'2s',invasionNumberPulse:'1.8s'};
 await fs.writeFile('scratch/release-verification/production.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
