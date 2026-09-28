const cp=require('child_process'),fs=require('fs'),assert=require('assert/strict');const cli=process.env.EARLY_TOOLS+'/node_modules/agent-browser/bin/agent-browser.js';process.env.AGENT_BROWSER_SESSION='game04-early-retention';
const run=(...args)=>cp.execFileSync(process.execPath,[cli,...args],{encoding:'utf8',maxBuffer:2e6});
const evaluate=code=>JSON.parse(run('eval',code));
const click=name=>{const snapshot=run('snapshot','-i');const line=snapshot.split('\n').find(l=>l.includes(`button "${name}"`));assert(line,`button ${name} missing`);run('click','@'+line.match(/ref=(\w+)/)[1]);};
const checks=[];
for(const width of [375,390]){
 run('set','viewport',String(width),'664');run('open','http://127.0.0.1:3186');
 run('eval','localStorage.removeItem("early-fixture")');run('reload');click('join-maeda');
 assert(evaluate('document.querySelector("[role=dialog]").getBoundingClientRect().right<=innerWidth'));
 assert(evaluate('Array.from(document.querySelectorAll("[role=dialog] button")).every(b=>{const r=b.getBoundingClientRect();return r.height>=44&&r.bottom<=innerHeight&&r.left>=0})'));
 run('screenshot',`docs/verification/early-retention-20260926/guide-${width}.png`);click('部隊に加える');run('wait','--text','編成人数 4');run('reload');assert(evaluate('JSON.parse(localStorage.getItem("early-fixture")).deck.length===4'));
 click('equip-iwadan');click('前田利家に装備する');run('wait','--fn','!document.querySelector("[role=dialog]")');run('reload');assert(evaluate('JSON.parse(localStorage.getItem("early-fixture")).deck.some(m=>m.characterId==="char_jihoon_01"&&m.skillIds[0]==="SKD009")'));
 for(const guide of ['join-takenaka','equip-fire']){click(guide);click('あとで');run('wait','--fn','!document.querySelector("[role=dialog]")');run('reload');assert(evaluate(`JSON.parse(localStorage.getItem("early-fixture")).earlyProgress.guides[${JSON.stringify(guide)}]==="deferred"`));assert(evaluate('!document.querySelector("[role=dialog]")'));}
 click('おまかせ編成・装備');run('wait','--text','部隊を保存しました');assert(evaluate('JSON.parse(localStorage.getItem("early-fixture")).deck.length===5'));run('screenshot',`docs/verification/early-retention-20260926/preparation-${width}.png`);
 click('そのまま出撃');assert(evaluate('document.body.innerText.includes("出撃しました")'));
 click('missions');assert(evaluate('document.querySelectorAll("[role=dialog] button").length===1'));run('screenshot',`docs/verification/early-retention-20260926/missions-${width}.png`);click('任務へ');run('wait','--text','通常任務');run('reload');assert(evaluate('JSON.parse(localStorage.getItem("early-fixture")).earlyProgress.missionNavigationPending===true'));
 checks.push({width,guideFits:true,joinSaved:true,skillSaved:true,deferredSurvivesReload:true,autoLoadoutSaved:true,sortieOptional:true,mandatoryNavigationSurvivesReload:true});
}
// Failure cannot persist completion. Trigger through the visible fixture control before opening guide.
run('eval','localStorage.removeItem("early-fixture")');run('reload');let snap=run('snapshot','-i');let ref=snap.split('\n').find(l=>l.includes('checkbox "保存失敗"')).match(/ref=(\w+)/)[1];run('check','@'+ref);click('join-maeda');click('部隊に加える');run('wait','--text','保存失敗テスト');assert(evaluate('JSON.parse(localStorage.getItem("early-fixture")).earlyProgress.guides["join-maeda"]==="pending"'));
assert(evaluate('document.documentElement.scrollWidth<=innerWidth'));const errors=run('errors');assert(!errors.includes('Error:'));
fs.writeFileSync('docs/verification/early-retention-20260926/browser-results.json',JSON.stringify({tool:'agent-browser 0.38.1 / local Chromium',scope:'actual independent React components with local persistence fixture; no shared UI/API connection',checks,failedSaveRetainsPending:true,errors},null,2)+'\n');console.log(checks);
