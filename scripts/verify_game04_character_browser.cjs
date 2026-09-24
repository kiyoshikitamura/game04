// QA fixture表示検証。実API・保存検証とは区別して記録する。
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {chromium}=require('@playwright/test');
const output='docs/verification/character-20260923';
async function main(){
 fs.mkdirSync(output,{recursive:true});
 const port=process.env.CHARACTER_QA_PORT||'3194';
 const target=process.env.CHARACTER_QA_URL||`http://127.0.0.1:${port}/qa/redesign?view=character`;
 let server;
 if(!process.env.CHARACTER_QA_URL){
  const fd=fs.openSync('/tmp/game04-character-browser-server.log','a');
  server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack','-H','127.0.0.1','-p',port],{stdio:['ignore',fd,fd],env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:require('../config/game04-preview-public.json').supabaseUrl,NEXT_PUBLIC_SUPABASE_ANON_KEY:require('../config/game04-preview-public.json').supabaseAnonKey,NEXT_PUBLIC_APP_ENV:'preview',NEXT_PUBLIC_ENABLE_QA_TOOLS:'true'}});
  for(let i=0;i<90;i++){try{const r=await fetch(target);if(r.ok)break;}catch{} await new Promise(r=>setTimeout(r,1000));}
 }
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHARACTER_CHROME||'/tmp/game04-browser/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox']});
 const record={kind:process.env.CHARACTER_QA_URL?'browser-target':'qa-fixture',target,at:new Date().toISOString(),screens:[],errors:[]};
 try {
  for(const height of [844,600]){
   const page=await browser.newPage({viewport:{width:390,height},reducedMotion:'reduce'});
   page.on('pageerror',e=>record.errors.push(e.message));
   await page.goto(target,{waitUntil:'networkidle'});
   await page.locator('.g4-growth').waitFor({state:'visible',timeout:60000});
   await page.locator('.g4-growth img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode().catch(()=>{}))));
   await page.screenshot({path:`${output}/fixture-deck-390x${height}.png`});
   record.screens.push({height,text:(await page.locator('body').innerText()).slice(0,18000),dialogs:await page.getByRole('dialog').count(),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
      const capture=async(name)=>{
    await page.getByText('必要画像を読み込んでいます。',{exact:true}).waitFor({state:'hidden',timeout:60000});
    await page.getByText('読み込み中',{exact:true}).waitFor({state:'hidden',timeout:60000}).catch(()=>{});
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));
    await page.screenshot({path:`${output}/fixture-${name}-390x${height}.png`});
    const modalChecks=await page.evaluate(()=>({inert:[...document.querySelectorAll('.rd-shell')].every(s=>s.inert),body:[...document.querySelectorAll('.rd-modal-body')].map(s=>({scrollHeight:s.scrollHeight,clientHeight:s.clientHeight,overflowY:getComputedStyle(s).overflowY,scrollbarColor:getComputedStyle(s).scrollbarColor}))}));
    const geometry=await page.getByRole('dialog').evaluateAll(ds=>ds.map(d=>{const r=d.getBoundingClientRect();return {title:d.getAttribute('aria-label'),x:r.x,y:r.y,width:r.width,height:r.height,scrollHeight:d.scrollHeight,clientHeight:d.clientHeight,overflowY:getComputedStyle(d).overflowY};}));
    record.screens.push({name,height,modalChecks,dialogs:geometry,text:(await page.locator('body').innerText()).slice(-18000),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   };
   await page.locator('.g4g-tabs').getByRole('button',{name:'キャラ',exact:true}).click();
   await capture('character-list');
   await page.locator('.g4g-grid button').first().click();await capture('character-detail');
   await page.getByRole('dialog').getByRole('button',{name:'Lv育成',exact:true}).first().click();await capture('character-growth');
   await page.getByRole('spinbutton',{name:'武将EXP小投入数'}).fill('1');
   await page.getByRole('button',{name:'この内容で育成する',exact:true}).click();await capture('character-result');
   await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).last().click();
   if(await page.getByRole('dialog').count())await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).first().click();
   for(const [tab,name]of [['スキル','skill'],['装備','equipment']]){
    await page.locator('.g4g-tabs').getByRole('button',{name:tab,exact:true}).click();await capture(`${name}-list`);
    await page.locator('.g4g-grid button').first().click();await capture(`${name}-detail`);
    await page.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).first().click();
   }
   await page.close();
  }
 }finally{
  fs.writeFileSync(`${output}/fixture-browser.json`,JSON.stringify(record,null,2));
  await browser.close();if(server)server.kill('SIGTERM');
 }
 console.log(JSON.stringify({kind:record.kind,screens:record.screens.length,errors:record.errors}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
