const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
function load(path){
 const source=fs.readFileSync(path,'utf8');
 const js=ts.transpile(source,{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true});
 const output={};
 new Function('require','exports',js)(name=>name==='next/link'?{__esModule:true,default:'legal-link'}:name==='../LegalPage'?{__esModule:true,default:'legal-page'}:name==='../SupportContact'?{__esModule:true,default:'support-contact'}:name.endsWith('legalConfig')?{GAME04_LEGAL:{supportEmail:null},pendingLegalValue:()=>''}:require(name),output);
 return output.default;
}
function nodes(node){if(!node||typeof node!=='object')return [];return [node,...React.Children.toArray(node.props?.children).flatMap(nodes)];}
(async()=>{
 for(const page of ['rights','age-rating','payments','cookies','terms','privacy','tokusho']){
  const component=load(`src/app/legal/${page}/page.tsx`);
  for(const from of ['settings',undefined]){
   const tree=await component({searchParams:Promise.resolve({from})});
   assert.equal(tree.props.returnToGame,from==='settings',`${page} close contract`);
   const children=nodes(tree).filter(n=>n.type==='legal-link'||n.type==='support-contact');
   assert.ok(children.length,`${page} inner link exists`);
   for(const child of children){
    if(child.type==='support-contact')assert.equal(child.props.returnToGame,from==='settings',`${page} contact propagation`);
    else {assert.equal(child.props.href.endsWith('?from=settings'),from==='settings',`${page} query preserved`); assert.equal(child.props.replace,from==='settings');}
   }
  }
 }
 const support=load('src/app/legal/SupportContact.tsx');
 assert.equal(support({returnToGame:true}).props.href,'/legal/contact?from=settings');
 assert.equal(support({}).props.href,'/legal/contact');
 console.log('PASS legal inner links: 7 pages × settings/direct, support fallback propagation');
})().catch(error=>{console.error(error);process.exitCode=1;});
