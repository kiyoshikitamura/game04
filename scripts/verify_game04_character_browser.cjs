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
  server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack','-H','127.0.0.1','-p',port],{stdio:['ignore',fd,fd],env:{...process.env,NEXT_PUBLIC_APP_ENV:'preview',NEXT_PUBLIC_ENABLE_QA_TOOLS:'true'}});
  for(let i=0;i<90;i++){try{const r=await fetch(target);if(r.ok)break;}catch{} await new Promise(r=>setTimeout(r,1000));}
 }
 const browser=await chromium.launch({headless:true});
 const record={kind:process.env.CHARACTER_QA_URL?'browser-target':'qa-fixture',target,at:new Date().toISOString(),screens:[],errors:[]};
 try {
  for(const height of [844,600]){
   const page=await browser.newPage({viewport:{width:390,height},reducedMotion:'reduce'});
   page.on('pageerror',e=>record.errors.push(e.message));
   await page.goto(target,{waitUntil:'networkidle'});
   await page.screenshot({path:`${output}/fixture-deck-390x${height}.png`});
   record.screens.push({height,text:(await page.locator('body').innerText()).slice(0,18000),dialogs:await page.getByRole('dialog').count(),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   await page.close();
  }
 }finally{
  fs.writeFileSync(`${output}/fixture-browser.json`,JSON.stringify(record,null,2));
  await browser.close();if(server)server.kill('SIGTERM');
 }
 console.log(JSON.stringify({kind:record.kind,screens:record.screens.length,errors:record.errors}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
