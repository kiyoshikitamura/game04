const fs=require('fs'),path=require('path'),ts=require('typescript');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const files=walk('src/app').filter(p=>p.endsWith('.tsx'));
const rows=[];
for(const file of files){const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const components=[...source.matchAll(/import\s+(?:\{[^}]+\}|\w+).*?from ['"]([^'"]+)['"]/g)].map(m=>m[1]).filter(p=>/ui\/|Modal|Badge|Display|Shell|View|Panel/.test(p));
const add=(kind,label,line)=>rows.push({file,line,kind,label,rules:kind==='dialog'?'12/18.13':'2/3/10/18',components:components.join(';'),problem:'未照合（静的抽出）',fix:file,result:'未確認'});
if(/\/page.tsx$/.test(file))add('route','/'+file.replace('src/app/','').replace('/page.tsx','').replace('page.tsx',''),1);
if(/components\//.test(file))add('component',path.basename(file,'.tsx'),1);
function visit(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){const tag=n.tagName.getText(ast);const attr=name=>{const a=n.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)===name);return a?.initializer?.getText(ast)||''};if(/Dialog|Modal|Panel/.test(tag))add('dialog',tag+' '+attr('title'),ast.getLineAndCharacterOfPosition(n.pos).line+1);if(attr('role').includes('tab')||attr('role').includes('alert')||attr('role').includes('status'))add('state',tag+' '+attr('role')+' '+attr('aria-label'),ast.getLineAndCharacterOfPosition(n.pos).line+1);}ts.forEachChild(n,visit)}visit(ast)}
const dir='docs/verification/common-ui-20260927';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/surface-inventory.json',JSON.stringify(rows,null,2));
const esc=s=>s.replaceAll('|','\\|').replaceAll('\n',' ');
fs.writeFileSync(dir+'/SURFACES.md','# 全画面・状態の静的棚卸し\n\n自動抽出したルート、部品、Dialog/Panel呼出し、状態表示。製品経路・QA・管理・旧未到達部品を含む母集団。動的な全状態の網羅や目視合格を意味しない。到達性・承認見本との照合は別途記録する。\n\n|画面／状態|適用ルール|使用部品|問題|修正先|確認結果|\n|---|---|---|---|---|---|\n'+rows.map(r=>`|${esc(r.kind+': '+r.label)}|§${r.rules}|${esc(r.components)}|${r.problem}|${r.file}:${r.line}|${r.result}|`).join('\n')+'\n');console.log({files:files.length,entries:rows.length,routes:rows.filter(r=>r.kind==='route').length});
