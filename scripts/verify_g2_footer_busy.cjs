const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const React=require('react');
const source=fs.readFileSync('src/app/components/redesign/RedesignShell.tsx','utf8');
const js=ts.transpile(source,{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true});
const out={};const mockReact={...React,useEffect:()=>{},useState:v=>[v,()=>{}],useRef:v=>({current:v}),useCallback:f=>f};
new Function('require','exports',js)(name=>name==='react'?mockReact:name==='react/jsx-runtime'?require(name):name.includes('GameContext')?{useGame:()=>({})}:name.endsWith('/masters')?{CHARACTER_MASTERS:[]}:name.endsWith('.css')?{}:{__esModule:true,default:'stub'},out);
const state={deck:[],cash:0,diamonds:0,energy:50,energyMax:100};
function find(node,test){if(!node||typeof node!=='object')return;if(test(node))return node;for(const child of React.Children.toArray(node.props?.children)){const found=find(child,test);if(found)return found;}}
for(const navigationBusy of [false,true]){
 const tree=out.default({state,activeTab:'character',onNavigate:()=>{},onAction:async()=>{},navigationBusy});
 const nav=find(tree,n=>n.props['aria-label']==='メインナビゲーション');
 assert.equal(nav.props['aria-busy'],navigationBusy);
 const buttons=React.Children.toArray(nav.props.children);assert.equal(buttons.length,5);assert.ok(buttons.every(b=>b.props.disabled===navigationBusy));
}
const parent=fs.readFileSync('src/app/components/redesign/RedesignApp.tsx','utf8');assert.match(parent,/navigationBusy=\{busy\}/);assert.match(parent,/function navigate\(next: string\) \{\s*if \(busy \|\| lock.current\) return;/);
console.log('PASS footer busy: all five buttons match mutation state; idle restored; navigate exclusion retained');
