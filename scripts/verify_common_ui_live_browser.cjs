const fs=require('fs'),{chromium}=require('playwright'),assert=require('assert/strict');
const base=process.env.BASE_URL||'http://localhost:3104',out='../../outputs/common-ui-continuation/live-browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch(),report=[];try{for(const label of ['a','b']){
 const p=await b.newPage({viewport:{width:label==='a'?375:390,height:600}});
 const session=JSON.parse(fs.readFileSync(`../common-ui-live/${label}-session.json`));
 await p.addInitScript(session=>{localStorage.setItem('sb-znakrkaazliexzwihxge-auth-token',JSON.stringify(session));},session);
 await p.goto(base);await p.getByText('TAP TO START',{exact:true}).click();await p.getByRole('button',{name:'続きから',exact:true}).click();await p.getByRole('navigation',{name:'メインナビゲーション'}).waitFor({timeout:60000});await p.waitForTimeout(3000);
 const shot=async name=>{await p.screenshot({path:`${out}/${label}-${name}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.push({label,state:name,width:label==='a'?375:390,height:600});fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));};
 for(let i=0;i<4;i++){await p.waitForTimeout(600);if(!(await p.getByRole('dialog').count()))break;console.log('startup dialog',await p.getByRole('dialog').allTextContents());const close=p.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).last();if(await close.count())await close.click();else break;}
 await p.getByText('「一文字斬り」が最大限界突破に到達',{exact:true}).waitFor();await shot('home-activity');
 await p.getByRole('button',{name:'交流を開く ›',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'全体',exact:true}).click();
 const api=JSON.parse(fs.readFileSync('../../outputs/common-ui-continuation/community-live.json'));await p.getByRole('dialog').getByText(api.message,{exact:true}).waitFor();await shot('global-received');
 if(label==='a'){await p.getByRole('textbox',{name:'メッセージ',exact:true}).fill('共通UIブラウザー送信確認');await p.getByRole('button',{name:'送信',exact:true}).click();await p.getByRole('dialog').getByText('共通UIブラウザー送信確認',{exact:true}).last().waitFor();await shot('global-sent');}else{await p.getByRole('dialog').getByText('共通UIブラウザー送信確認',{exact:true}).last().waitFor();}
 await p.getByRole('dialog').getByRole('button',{name:/^DM/}).click();await shot('dm-inbox');await p.getByRole('dialog').getByRole('button',{name:'閉じる',exact:true}).first().click();
 const nav=p.getByRole('navigation',{name:'メインナビゲーション'});
 for(const tab of ['出陣','武将','共闘','召喚','本陣']){await nav.getByRole('button',{name:tab,exact:true}).click();await p.waitForTimeout(1700);await shot('tab-'+tab);}
 await p.getByRole('button',{name:'商店',exact:true}).click();await p.waitForTimeout(1500);await shot('shop');await p.getByRole('button',{name:'輝石商店',exact:true}).click();assert.equal(await p.locator('.g4-product-row').count(),7);await shot('gem-shop');
 await nav.getByRole('button',{name:'本陣',exact:true}).click();await p.getByRole('button',{name:'メニュー',exact:true}).click();await p.getByRole('button',{name:/^所持品/}).click();await p.getByRole('heading',{name:'所持品',exact:true}).waitFor();await shot('inventory');
 for(const category of ['召喚券','育成','魂','保管品']){await p.getByLabel('絞り込み',{exact:true}).selectOption(category);await p.waitForTimeout(300);await shot('inventory-'+category);}
 await p.getByRole('button',{name:'メニュー',exact:true}).click();await p.getByRole('button',{name:/^プレゼントBOX/}).click();await p.waitForTimeout(500);await shot('presents');
 if(label==='a'){
  const gift=p.locator('.inbox-present-item').filter({hasText:'共通UIブラウザー受取検証'});
  if(await gift.count()){await gift.getByRole('button',{name:'受け取る',exact:true}).click();await gift.waitFor({state:'hidden',timeout:30000});await shot('presents-claimed');}
  const expired=p.locator('.inbox-present-item').filter({hasText:'共通UI期限検証'});assert(await expired.getByRole('button',{name:'期限切れ',exact:true}).isDisabled());
  while(await p.getByRole('dialog').count()){await p.getByRole('dialog').last().getByRole('button',{name:'閉じる',exact:true}).last().click();await p.waitForTimeout(150);}await p.getByRole('button',{name:'メニュー',exact:true}).click();await p.getByRole('button',{name:/^所持品/}).click();await p.getByLabel('絞り込み',{exact:true}).selectOption('回復・侵攻');await p.locator('.g4-inventory-entry').filter({hasText:'活力丸'}).waitFor();await shot('inventory-after-claim');
 }
 const text=await p.locator('body').innerText();fs.writeFileSync(`${out}/${label}-text.txt`,text);await p.close();
}console.log(report);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
