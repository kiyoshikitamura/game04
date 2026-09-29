// Isolated DOM lifecycle test: no real account, database, or payment.
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost',pretendToBeVisual:true});
for(const k of ['window','document','HTMLElement','MutationObserver'])global[k]=dom.window[k];
Object.defineProperty(global,'navigator',{value:dom.window.navigator,configurable:true});
global.IS_REACT_ACT_ENVIRONMENT=true;
global.requestAnimationFrame=cb=>setTimeout(cb,0);
global.cancelAnimationFrame=clearTimeout;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),assert=require('node:assert/strict');
const images=[];global.Image=class {constructor(){this.naturalWidth=1024;images.push(this)}set src(s){this.url=s}decode(){return this.decoding||(this.decoding=Promise.resolve())}};
const calls=[];global.__promoRpc=async(name,args)=>{calls.push(args?.p_action);return {data:args?.p_action==='shown'?{recorded:true}:{kind:'starter',purchased:false},error:null}};
(async()=>{
 await require('esbuild').build({entryPoints:['src/app/components/redesign/HomePromotion.tsx'],outfile:'node_modules/.cache/promotion-test.cjs',bundle:true,platform:'node',jsx:'automatic',external:['react','react-dom','react-dom/*'],loader:{'.css':'empty'},plugins:[{name:'mock-rpc',setup(b){b.onResolve({filter:/context\/GameContext$/},()=>({path:'context',namespace:'context'}));b.onLoad({filter:/.*/,namespace:'context'},()=>({contents:'import React from "react"; export const GameContext=React.createContext(null)'}));b.onResolve({filter:/supabase$/},()=>({path:'rpc',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const supabase={rpc:(...args)=>globalThis.__promoRpc(...args)}'}));}}]});
 const {default:Home}=require('../node_modules/.cache/promotion-test.cjs');
 const root=createRoot(document.getElementById('root'));
 const render=()=>root.render(React.createElement(Home,{owner:'fixture',active:true,blocked:false,onNavigate:()=>{}}));
 const wait=ms=>act(()=>new Promise(r=>setTimeout(r,ms)));
 await act(async()=>render());await wait(1600);
 assert(document.querySelector('[aria-busy="true"]'));assert(!calls.includes('shown'));assert.equal(document.querySelectorAll('.g4-starter-artwork').length,0);
 await act(async()=>images[0].onerror());assert(document.querySelector('[role="alert"]'));assert(!calls.includes('shown'));
 await act(async()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('再試行')).click());
 const img=images.at(-1);let decodeDone;img.decoding=new Promise(r=>decodeDone=r);
 await act(async()=>img.onload());assert(!calls.includes('shown'));assert(!document.querySelector('.g4-starter-artwork'));
 await act(async()=>decodeDone());assert(document.querySelector('.g4-starter-artwork'));assert.equal(calls.filter(x=>x==='shown').length,1);assert.equal(document.querySelector('.g4-starter-artwork').getAttribute('width'),'1024');
 await act(async()=>document.querySelector('[aria-label="閉じる"]').click());await wait(1600);assert(!document.querySelector('[role="dialog"]'));
 await act(async()=>root.unmount());
 console.log('PASS: slow image gate, failure/retry, decode gate, single shown after ready, close suppression. RPC mocked.');
})().catch(e=>{console.error(e);process.exit(1)});
