// Refine the received inventory, preserving stable entries and verification evidence.
const fs=require('fs'),path=require('path'),ts=require('typescript');
const dir='docs/verification/common-ui-20260927';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const files=walk('src').filter(p=>/\.[jt]sx?$/.test(p)),set=new Set(files),dynamic=[];
const resolve=(file,spec)=>{const base=spec.startsWith('@/')?'src/'+spec.slice(2):spec.startsWith('.')?path.posix.normalize(path.posix.dirname(file)+'/'+spec):'';return [base,...['.tsx','.ts','.jsx','.js','/index.tsx','/index.ts'].map(s=>base+s)].find(p=>set.has(p));};
const graph=new Map();
for(const file of files){const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true),edges=[];
 function visit(n){let spec;
  if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier&&!n.isTypeOnly&&!n.importClause?.isTypeOnly)spec=n.moduleSpecifier;
  if(ts.isCallExpression(n)&&(n.expression.kind===ts.SyntaxKind.ImportKeyword||n.expression.getText(ast)==='require')){spec=n.arguments[0];if(spec&&!ts.isStringLiteralLike(spec))dynamic.push({file,line:ast.getLineAndCharacterOfPosition(n.pos).line+1,expression:n.getText(ast)});}
  if(spec&&ts.isStringLiteralLike(spec)){const target=resolve(file,spec.text);if(target)edges.push(target);}ts.forEachChild(n,visit);
 }visit(ast);graph.set(file,[...new Set(edges)]);
}
const seeds=files.filter(p=>/\/(page|layout|route)\.[jt]sx?$/.test(p));
const paths=new Map();for(const root of seeds){const queue=[[root]],seen=new Set();while(queue.length){const chain=queue.shift(),file=chain.at(-1);if(seen.has(file))continue;seen.add(file);if(!paths.has(file))paths.set(file,[]);paths.get(file).push(chain);for(const dep of graph.get(file)||[])queue.push([...chain,dep]);}}
const rows=JSON.parse(fs.readFileSync(dir+'/surface-inventory.json','utf8'));
const unresolved=[...new Set(rows.filter(r=>r.scope==='到達未確定'||r.originalScope==='到達未確定').map(r=>r.file))];
const evidence=unresolved.map(file=>({file,routePaths:paths.get(file)||[],inbound:[...graph].filter(([,deps])=>deps.includes(file)).map(([f])=>f),classification:paths.has(file)?'利用経路あり':'製品・QA・管理ルートから到達なし',reason:paths.has(file)?'Next route/layoutから値import・再export・literal import/requireの経路あり':'全srcの値import・再export・literal import/requireを走査。Next route/layout/routeを起点に到達なし。未使用クラスタ内の参照だけでは利用中としない。'}));
for(const row of rows){row.originalScope??=row.scope;const item=evidence.find(e=>e.file===row.file);if(!item)continue;row.reachability=item;row.status=item.routePaths.length?'未確認':dynamic.length?'未確認':'対象外';row.scope=item.classification;row.problem=item.routePaths.length?'利用経路あり・表示照合が必要':'旧部品／未接続のQA部品';row.result=row.status+'：'+item.reason;}
fs.writeFileSync(dir+'/surface-inventory.json',JSON.stringify(rows,null,2));fs.writeFileSync(dir+'/reachability.json',JSON.stringify({method:'TypeScript AST; value imports/reexports/literal dynamic imports; all Next page/layout/route roots',dynamicImports:dynamic,files:evidence},null,2));
console.log({inheritedEntries:rows.length,previouslyUnresolvedEntries:rows.filter(r=>r.originalScope==='到達未確定').length,files:unresolved.length,reachable:evidence.filter(e=>e.routePaths.length).length,computedDynamicImports:dynamic});

const esc=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ');
fs.writeFileSync(dir+'/SURFACES.md','# 継承した実装項目台帳\n\n静的項目は画面数でも合格数でもない。受領639項目を保持し、利用先の画面・状態はconsumer-cases.mdへ対応付ける。未到達根拠はreachability.json。代表検証の成功を各呼出しの全条件へ転記しない。\n\n|画面／状態・実装項目|経路|正本・使用部品|問題|修正先|確認結果|\n|---|---|---|---|---|---|\n'+rows.map(r=>'|'+[r.kind+': '+r.label,r.scope,'§'+r.rules+' / '+r.components,r.problem,r.file+':'+r.line,r.result].map(esc).join('|')+'|').join('\n')+'\n');
