const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
const base=process.env.DBG031_BASE_URL||'http://localhost:3002',out='docs/verification/device-debug/dbg031';
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
try{for(const width of [375,390]){const page=await browser.newPage({viewport:{width,height:740}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/qa/redesign?view=character');await page.getByRole('navigation',{name:'育成',exact:true}).getByRole('button',{name:'装備',exact:true}).click();
const first=page.locator('.g4g-equipment button').first();await first.waitFor();
await page.waitForFunction(()=>[...document.querySelectorAll('.g4g-equipment img')].every(i=>i.complete&&i.naturalWidth===512));
await page.locator('.branded-loading').waitFor({state:'hidden'});
await page.screenshot({path:`${out}/list-${width}.png`});await first.click();
let dialog=page.getByRole('dialog');await dialog.locator('.g4g-detail-icon').waitFor();assert.equal(await dialog.locator('.g4g-detail-icon').getAttribute('src'),'/equipments/accessory_001.png');
await page.screenshot({path:`${out}/detail-${width}.png`});await dialog.getByRole('button',{name:'Lv育成',exact:true}).click();await page.getByRole('button',{name:'育成する',exact:true}).click();
await page.getByRole('heading',{name:'装備育成結果',exact:true}).waitFor();await page.screenshot({path:`${out}/growth-result-${width}.png`});
await page.goto(base+'/qa/redesign?view=character');
await page.getByRole('button',{name:/^1 くノ一/}).click();await page.locator('.g4g-equipment-slots button').filter({hasText:'アクセ1'}).click();
await page.getByRole('dialog').getByRole('button',{name:'銅の耳飾り Lv.1',exact:true}).click();
await page.getByRole('heading',{name:'編成保存結果',exact:true}).waitFor();await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).click();await page.locator('.g4g-equipment-slots img[src="/equipments/accessory_001.png"]').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/equipped-${width}.png`});
assert.deepEqual(errors,[]);report.push({width,list:14,detail:'ACCESSORY_001',growthResult:true,selection:'text-only existing design; selected slot displays approved image',errors});await page.close();}
fs.writeFileSync(out+'/ui.json',JSON.stringify({base,scope:'Offline QA state using production GrowthView, no DB mutation',report},null,2)+'\n');console.log('PASS equipment list/detail/growth result/selection at 375/390');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

