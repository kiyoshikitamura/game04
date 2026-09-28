const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const js=ts.transpile(fs.readFileSync('src/utils/redesignQaTelemetry.ts','utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS});
const messages=[];const source={};const win={parent:{postMessage:(...args)=>messages.push(args)},location:{origin:'https://qa.example'}};
const perf={timeOrigin:123,now:()=>20,getEntriesByType:type=>type==='navigation'?[{type:'navigate',responseStart:1,responseEnd:2,domContentLoadedEventEnd:3,name:'SECRET_URL'}]:[{name:'first-paint',startTime:4}]};
function load(flag='true',allow='true',app='preview'){const exports={};new Function('exports','window','performance','process',js)(exports,win,perf,{env:{NEXT_PUBLIC_ENABLE_QA_TOOLS:flag,NEXT_PUBLIC_GAME04_QA_METRICS_ALLOWED:allow,NEXT_PUBLIC_APP_ENV:app}});return exports;}
const m={kind:'request',scope:'get_state',startedAt:1,settledAt:20,durationMs:19,outcome:'success',payload:'SECRET_PAYLOAD',userId:'SECRET_USER'};
for(const args of [['false','true','preview'],['true','false','preview'],['true','true','production']])load(...args).emitQaTiming(m);
assert.equal(messages.length,0,'disabled/production emits nothing');
const api=load();api.emitQaTiming(m);assert.equal(messages.length,1);assert.equal(messages[0][1],'https://qa.example');const msg=messages[0][0];assert.equal(JSON.stringify(msg).includes('SECRET'),false,'explicit projection removes unrelated values');
assert.equal(api.acceptsQaTimingEvent({source,origin:'https://qa.example',data:msg},'https://qa.example',source),true);
assert.equal(api.acceptsQaTimingEvent({source,origin:'https://other.example',data:msg},'https://qa.example',source),false);
assert.equal(api.acceptsQaTimingEvent({source:{},origin:'https://qa.example',data:msg},'https://qa.example',source),false);
assert.equal(api.isQaTimingMessage({...msg,metric:{...msg.metric,durationMs:NaN}}),false);
assert.equal(api.isQaTimingMessage({...msg,paints:[null]}),false);
api.emitQaTiming({...m,scope:'unrecognized_private_value'});assert.equal(messages.at(-1)[0].metric.scope,'other');
const parent=win.parent;win.parent=win;const count=messages.length;api.emitQaTiming(m);assert.equal(messages.length,count,'top-level page does not send');win.parent=parent;
messages.splice(1);
let list=[];for(let i=0;i<240;i++)list=api.appendQaTiming(list,msg);assert.equal(list.length,200);list=api.appendQaTiming(list,{...msg,timeOrigin:124});assert.equal(list.length,1,'new iframe navigation clears previous measurements');
api.beginQaImageGroup('home',0)('success');assert.equal(messages.length,1,'empty image group omitted');api.beginQaImageGroup('quest',3)('error');assert.equal(messages.at(-1)[0].metric.count,3);
const config=fs.readFileSync('next.config.ts','utf8');const configJs=ts.transpile(config,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true});
function configFlags(env){const out={};new Function('require','exports','process',configJs)(()=>({}),out,{env});return out.default.env;}
const branchEnv={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'work/game04-g2-20260924'};
for(const [env,expected] of [[branchEnv,'true'],[{...branchEnv,NEXT_PUBLIC_ENABLE_QA_TOOLS:'false'},'false'],[{...branchEnv,VERCEL_ENV:'production',NEXT_PUBLIC_ENABLE_QA_TOOLS:'true'},'false'],[{...branchEnv,NEXT_PUBLIC_APP_ENV:'production'},'false'],[{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'other'},'false'],[{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'other',NEXT_PUBLIC_ENABLE_QA_TOOLS:'true'},'true'],[{NODE_ENV:'development'},'false']]){const flags=configFlags(env);assert.equal(flags.NEXT_PUBLIC_ENABLE_QA_TOOLS,expected);assert.equal(flags.NEXT_PUBLIC_GAME04_QA_METRICS_ALLOWED,expected);}

const route=fs.readFileSync('src/app/qa/home-live-viewport/page.tsx','utf8');assert.match(route,/NEXT_PUBLIC_ENABLE_QA_TOOLS !== 'true'/);assert.match(route,/VERCEL_ENV === 'production'/);
console.log('PASS QA metrics: no-send gates, projection, source/origin, validation, cap200, reload reset, image count/outcome, server/build production guards');

for(const kind of ['action-feedback','action-result']){api.emitQaTiming({...m,kind,scope:'set_home'});assert.equal(messages.at(-1)[0].metric.scope,'set_home');assert(api.isQaTimingMessage(messages.at(-1)[0]));}
