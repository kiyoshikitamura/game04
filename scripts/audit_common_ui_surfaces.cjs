const fs=require('fs'),path=require('path'),ts=require('typescript');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const files=walk('src/app').filter(p=>p.endsWith('.tsx'));
// Static import reachability separates live product consumers from QA and legacy files.
// Runtime-computed imports are not proof of absence; keep those as unverified.
const sourceFiles=walk('src').filter(p=>/\.(tsx?|jsx?)$/.test(p)), sourceSet=new Set(sourceFiles);
const resolve=(from,spec)=>{const base=spec.startsWith('@/')?'src/'+spec.slice(2):spec.startsWith('.')?path.posix.normalize(path.posix.dirname(from)+'/'+spec):'';return [base,base+'.tsx',base+'.ts',base+'/index.tsx',base+'/index.ts'].find(p=>sourceSet.has(p));};
const graph=new Map();
for(const file of sourceFiles){const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true),deps=[];function visit(n){let spec;if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&!n.isTypeOnly&&!n.importClause?.isTypeOnly)spec=n.moduleSpecifier;if(ts.isCallExpression(n)&&(n.expression.kind===ts.SyntaxKind.ImportKeyword||n.expression.getText(ast)==='require'))spec=n.arguments[0];if(spec&&ts.isStringLiteralLike(spec)){const target=resolve(file,spec.text);if(target)deps.push(target);}ts.forEachChild(n,visit);}visit(ast);graph.set(file,[...new Set(deps)]);}
const reach=seeds=>{const seen=new Set(),queue=[...seeds];while(queue.length){const file=queue.pop();if(seen.has(file))continue;seen.add(file);queue.push(...(graph.get(file)||[]));}return seen;};
const routes=files.filter(p=>p.endsWith('/page.tsx'));
const product=reach([...routes.filter(p=>!p.includes('/qa/')&&!p.includes('/admin/')),'src/app/layout.tsx']);
const qa=reach(routes.filter(p=>p.includes('/qa/'))),admin=reach(routes.filter(p=>p.includes('/admin/')));
const scope=file=>product.has(file)?'製品導線（静的import）':admin.has(file)?'管理導線':qa.has(file)?'QA導線':'到達未確定';
const rows=[];
for(const file of files){const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const components=[...source.matchAll(/import\s+(?:\{[^}]+\}|\w+).*?from ['"]([^'"]+)['"]/g)].map(m=>m[1]).filter(p=>/ui\/|Modal|Badge|Display|Shell|View|Panel/.test(p));
const add=(kind,label,line)=>rows.push({file,line,kind,label,scope:scope(file),rules:kind==='dialog'?'12/18.13/19':'2/3/10/18/19',components:components.join(';'),problem:'未照合（静的抽出）',fix:file,result:'未確認（個別証跡はREVIEW.md参照）'});
if(/\/page.tsx$/.test(file))add('route','/'+file.replace('src/app/','').replace('/page.tsx','').replace('page.tsx',''),1);
if(/components\//.test(file))add('component',path.basename(file,'.tsx'),1);
function visit(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){const tag=n.tagName.getText(ast);const attr=name=>{const a=n.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)===name);return a?.initializer?.getText(ast)||''};if(/Dialog|Modal|Panel/.test(tag))add('dialog',tag+' '+attr('title'),ast.getLineAndCharacterOfPosition(n.pos).line+1);if(attr('role').includes('tab')||attr('role').includes('alert')||attr('role').includes('status'))add('state',tag+' '+attr('role')+' '+attr('aria-label'),ast.getLineAndCharacterOfPosition(n.pos).line+1);}ts.forEachChild(n,visit)}visit(ast)}
const dir='docs/verification/common-ui-20260927';fs.mkdirSync(dir,{recursive:true});
// Keep review/evidence when refreshing source positions. Discovery is not a reset.
const key=r=>[r.file,r.kind,r.label].join('|');
const previous=fs.existsSync(dir+'/surface-inventory.json')?JSON.parse(fs.readFileSync(dir+'/surface-inventory.json','utf8')):[];
const byKey=new Map(previous.map(r=>[key(r),r]));
for(let i=0;i<rows.length;i++){const old=byKey.get(key(rows[i]));if(old){const fresh=rows[i];rows[i]={...old,...fresh,problem:old.problem,result:old.result};}}
for(const old of previous)if(!rows.some(r=>key(r)===key(old)))rows.push({...old,status:'対象外',result:'現行ソースから削除／共通部品への置換。旧項目を追跡用に保持。'});
fs.writeFileSync(dir+'/surface-inventory.json',JSON.stringify(rows,null,2));
const esc=s=>s.replaceAll('|','\\|').replaceAll('\n',' ');
fs.writeFileSync(dir+'/SURFACES.md','# 全画面・状態の静的棚卸し\n\n自動抽出したルート、部品、Dialog/Panel呼出し、状態表示。製品経路・QA・管理・到達未確定部品を含む母集団。動的な全状態の網羅や目視合格を意味しない。import到達性は実際の表示保証ではなく、動的条件・文字列生成importは未確認。具体的な適用・証跡・問題分類はREVIEW.mdを参照。\n\n|画面／状態|導線|適用ルール|使用部品|問題|修正先|確認結果|\n|---|---|---|---|---|---|---|\n'+rows.map(r=>`|${esc(r.kind+': '+r.label)}|${r.scope}|§${r.rules}|${esc(r.components)}|${r.problem}|${r.file}:${r.line}|${r.result}|`).join('\n')+'\n');console.log({files:files.length,entries:rows.length,routes:rows.filter(r=>r.kind==='route').length,scopes:rows.reduce((a,r)=>(a[r.scope]=(a[r.scope]||0)+1,a),{})});
