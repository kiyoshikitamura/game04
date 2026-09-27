const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.BASE_URL||'http://localhost:3013',out='../../outputs/battle-device-five';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();try{
 const results=[];
 for(const width of [375,390]){const page=await browser.newPage({viewport:{width,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const count of [1,2,3]){await page.goto(`${base}/qa/battle-device-five?count=${count}`);await page.locator('[data-unit-id="enemy-0"] [class*="status"] button').first().waitFor();await page.waitForFunction(()=>!document.querySelector('dialog[open][aria-label="戦闘画面の読み込み"]'));
   const metrics=await page.locator('[data-unit-id^="enemy-"]').evaluateAll(nodes=>nodes.map(node=>{const info=node.querySelector('[class*="unitInfo"]'),hp=node.querySelector('[class*="hpNumber"]'),status=info.querySelector('[class*="status"]'),count=info.querySelector('[class*="count"]'),icons=[...status.querySelectorAll('svg')];return {info:info.getBoundingClientRect().toJSON(),hp:hp.getBoundingClientRect().toJSON(),status:status.getBoundingClientRect().toJSON(),count:count.getBoundingClientRect().toJSON(),background:getComputedStyle(info).backgroundColor,icons:icons.map(icon=>icon.getBoundingClientRect().toJSON())}}));
   for(const m of metrics){assert(m.status.top>=m.hp.bottom-1);assert(m.count.top>=m.status.bottom-1);assert(m.status.left>=m.info.left&&m.status.right<=m.info.right+1);assert.equal(m.background,'rgba(0, 0, 0, 0.3)');assert(m.icons.every(i=>i.width>=14&&i.width<=16));}
   for(let i=0;i<metrics.length;i++)for(let j=i+1;j<metrics.length;j++){const a=metrics[i].info,b=metrics[j].info;assert(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top),'enemy information overlaps');}
   await page.getByRole('button',{name:'ほか3件の状態を表示',exact:true}).first().click();await page.getByRole('dialog').filter({hasText:'保持基礎量'}).waitFor();await page.keyboard.press('Escape');
   await page.screenshot({path:`${out}/enemies-${count}-${width}.png`});results.push({width,count,metrics});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 const page=await browser.newPage({viewport:{width:375,height:600}});
 for(const mode of ['normal','burst','wave']){await page.goto(`${base}/qa/battle-device-five?mode=${mode}`);await page.getByRole('button',{name:'一時停止',exact:true}).click();await page.getByRole('button',{name:'リタイア',exact:true}).click();await page.getByRole('dialog',{name:'リタイアしますか？'}).getByRole('button',{name:'リタイア',exact:true}).click();await page.getByText('出撃元へ戻りました',{exact:true}).waitFor();await page.waitForTimeout(1800);assert.equal(await page.locator('[data-completed]').getAttribute('data-completed'),'0');assert.equal(await page.locator('[data-next]').getAttribute('data-next'),'0');assert.equal(await page.locator('[data-playback-frame]').count(),0);results.push({retire:mode,noCompletion:true,noNext:true});}
 await page.goto(`${base}/qa/battle-device-five?mode=complete`);await page.getByRole('button',{name:'結果へ',exact:true}).waitFor();assert.equal(await page.locator('[data-completed]').getAttribute('data-completed'),'1');assert.equal(await page.locator('[data-next]').getAttribute('data-next'),'0');results.push({normalCompletion:1,autoNext:0});
 fs.writeFileSync(out+'/browser.json',JSON.stringify(results,null,2));console.log('PASS enemy 1/2/3 status flow, 14px icons, alpha .3, details; normal/burst/wave retire; completion once');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
