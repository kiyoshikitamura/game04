const cp=require('child_process'),fs=require('fs'),assert=require('assert/strict');
const cli=process.env.AGENT_BROWSER_CLI;
assert(cli,'Set AGENT_BROWSER_CLI to agent-browser/bin/agent-browser.js');
const run=(...args)=>cp.execFileSync(process.execPath,[cli,'--session','starter-promotion',...args],{encoding:'utf8',maxBuffer:2e6});
const evaluate=code=>JSON.parse(run('eval',code));
const click=name=>{
 const line=run('snapshot','-i').split('\n').find(l=>l.includes(`button "${name}"`));
 assert(line,`missing ${name}`);run('click','@'+line.match(/ref=(\w+)/)[1]);
};
const output='docs/verification/starter-promotion-20260928';fs.mkdirSync(output,{recursive:true});
const checks=[];
for(const width of [375,390]){
 run('set','viewport',String(width),'664');
 run('open','http://localhost:3188/qa/starter-promotion');run('wait','--text','ガイド終了');
 run('wait','2200');assert(evaluate('!document.querySelector("[role=dialog]")'));
 click('表示記録を1回失敗');click('ガイド終了');run('wait','--text','キャラガチャ券');
 run('wait','--text','表示記録 1回');
 assert(evaluate('document.documentElement.scrollWidth<=innerWidth'));
 assert(evaluate('Array.from(document.querySelectorAll("[role=dialog] button")).every(b=>{const r=b.getBoundingClientRect();return r.height>=44&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth})'));
 run('screenshot',`${output}/starter-${width}.png`);
 click('100円パックを見る');run('wait','--text','shop:beginner_pack_01');
 click('ホームを離れる');click('ホームへ戻る');run('wait','2200');assert(evaluate('!document.querySelector("[role=dialog]")'));
 click('ガイド開始');click('翌日へ');run('wait','2200');assert(evaluate('!document.querySelector("[role=dialog]")'));
 click('購入済みにする');click('ガイド終了');run('wait','--text','このパックは購入済みです。');
 run('wait','--text','表示記録 2回');run('screenshot',`${output}/purchased-${width}.png`);
 click('ショップを見る');run('wait','--text','shop:beginner_pack_01');
 click('翌日の無料召喚');run('wait','--text','毎日1回10連無料！');click('召喚する');
 assert(evaluate('document.querySelector("[role=status]").textContent.includes("/ gacha")'));
 assert(!run('errors').trim());
 checks.push({width,initialGuideSuppressed:true,shownAfterGuide:true,acknowledgementRetried:true,ctaTarget:true,sameDaySuppressed:true,nextDayGuideSuppressed:true,nextDayPurchasedVisible:true,freeGachaCtaPreserved:true,buttonsFit:true});
}
fs.writeFileSync(`${output}/browser-results.json`,JSON.stringify({tool:'agent-browser',scope:'real React components with in-memory RPC; DB rules tested separately',checks},null,2)+'\n');
console.log(JSON.stringify(checks));
