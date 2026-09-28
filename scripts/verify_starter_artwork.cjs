const cp=require('child_process'),fs=require('fs'),assert=require('assert/strict');
const cli=process.env.AGENT_BROWSER_CLI;assert(cli);
const run=(...args)=>cp.execFileSync(process.execPath,[cli,'--session','starter-artwork',...args],{encoding:'utf8',maxBuffer:2e6});
const out='docs/verification/starter-promotion-20260928';
const checks=[];
for(const [width,height] of [[320,480],[320,568],[375,667],[390,664],[390,844],[430,932],[667,375],[844,390]]){
 run('set','viewport',String(width),String(height));
 run('open','http://localhost:3188/qa/additional29?kind=starter');
 run('wait','--fn','document.querySelector(".g4-starter-artwork")?.naturalWidth === 1024');
 run('wait','250');
 const result=JSON.parse(run('eval',`(()=>{const d=document.querySelector('[role=dialog]'),i=d.querySelector('img'),b=d.querySelector('.canonical-dialog-body'),r=d.getBoundingClientRect(),ir=i.getBoundingClientRect(),br=b.getBoundingClientRect();return {width:innerWidth,height:innerHeight,dialogFits:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,imageFits:ir.left>=br.left&&ir.right<=br.right&&ir.top>=br.top&&ir.bottom<=br.bottom,noBodyClipping:b.scrollHeight<=b.clientHeight+1,contain:getComputedStyle(i).objectFit==='contain',imageComplete:i.complete&&i.naturalHeight===1536,buttonsFit:Array.from(d.querySelectorAll('button')).every(x=>{const a=x.getBoundingClientRect();return a.height>=44&&a.bottom<=innerHeight&&a.top>=0}),noPageOverflow:document.documentElement.scrollWidth<=innerWidth}})()`));
 for(const [key,value] of Object.entries(result))if(typeof value==='boolean')assert(value,`${width}x${height} ${key}`);
 if([375,390,667].includes(width))run('screenshot',`${out}/artwork-${width}x${height}.png`);
 checks.push(result);
}
assert(!run('errors').trim());
fs.writeFileSync(`${out}/artwork-results.json`,JSON.stringify({scope:'local Chromium mobile viewport simulation; physical phone not connected',checks},null,2)+'\n');
console.log(JSON.stringify(checks));
