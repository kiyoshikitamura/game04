const fs=require('fs'),path=require('path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/verification/device-debug/b13/mission-v3');fs.mkdirSync(dir,{recursive:true});
const {FORMAL_MISSION_CONFIG}=require('../src/domain/redesign/formalMissions.ts');
const {growthRewardImage}=require('../src/domain/redesign/growthAssetPresentation.ts');
const {raidRewardLabel}=require('../src/domain/redesign/raidPresentation.ts');
const image=p=>'data:image/'+(p.endsWith('.webp')?'webp':'png')+';base64,'+fs.readFileSync(path.join(root,'public',p)).toString('base64');
const titles={DM002:'戦闘に3回挑戦',DM005:'出陣で3回勝利',DM007:'ノーマル召喚を1回行う',DM008:'育成を1回行う',DM003:'戦闘に5回挑戦',DM006:'出陣で5回勝利',NM001:'1-1を初クリア',NM002:'1-2を初クリア',NM003:'1-3を初クリア',NM004:'2-1を初クリア',NM005:'2-2を初クリア',NM006:'2-3を初クリア'};
const rows=Object.entries(titles).map(([id,title])=>{const m=FORMAL_MISSION_CONFIG.missions.find(m=>m.id===id);if(!m)throw Error(id);return {...m,title,tab:id.startsWith('DM')?'daily':'normal',unit:id.startsWith('DM')?'回':'件',target:m.condition.target||1,rewards:m.rewards.map(r=>({...r,label:raidRewardLabel(r),image:image(growthRewardImage(r)||({cash:'/ui/sengoku/13-coin.png',unlock_item:'/creative/items/territory-invasion-ticket.png'})[r.kind])}))}});
fs.writeFileSync(path.join(dir,'mission-data.json'),JSON.stringify(rows.map(({rewards,...m})=>({...m,rewards:rewards.map(({image,...r})=>r)})),null,2));
let html=fs.readFileSync(path.join(__dirname,'b13-mission-v3.template.html'),'utf8').replace('__ROWS__',JSON.stringify(rows)).replace('__BANNER__',image('/assets/versioned/sengoku-mission-banner-v1.png'));
fs.writeFileSync(path.join(dir,'proposal.html'),html);console.log(dir);

