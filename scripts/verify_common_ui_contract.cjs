const fs=require('fs'),assert=require('assert/strict');const read=p=>fs.readFileSync(p,'utf8');
assert(read('src/app/components/ui/OutlawButton.tsx').includes('return <ActionButton'),'One shared action renderer');
assert(!read('src/app/components/gacha/FormalGachaHub.tsx').includes('<p>{meta.rates}</p>'),'No duplicate inline rates');
assert(!read('src/app/components/redesign/TerritoryView.tsx').includes('function ElementBadge'),'No local element badge');
assert(read('src/app/components/redesign/GrowthView.tsx').includes('<ListControls'),'Search controls required');
assert(!read('src/app/sengoku-theme.css').includes('--font-sengoku: "Hiragino Mincho'),'No legacy all-serif font');
assert(read('src/app/components/ui/actions.css').includes('grid-template-areas'), 'Stable pending layout');
const assets=['/ui/sengoku/13-coin.png','/ui/sengoku/16-diamond.png','/creative/items/territory-invasion-ticket.png'];for(const p of assets)assert(fs.existsSync('public'+p),p);
console.log('PASS common UI static contract (visual comparison still required)');
for(const file of ['redesign/BattleView.tsx','redesign/GrowthControls.tsx','raid/RaidApprovedVisual.tsx'])assert(read('src/app/components/'+file).includes('ElementBadge'),'Shared element rendering: '+file);
assert(!read('src/app/components/ui/SubTabNav.css').includes('var(--neon-cyan)'),'Tabs must use common semantic tokens');
assert(read('src/app/components/ui/FullScreenPanel.tsx').includes('<CanonicalDialog'),'Panel consumers share dialog layout');
assert(!read('src/app/components/ui/FullScreenPanel.tsx').includes('ModalShell'),'Do not restore a second panel shell');
assert(/white-space:\s*nowrap/.test(read('src/app/components/ui/SubTabNav.css')),'Short tab labels remain on one line');
const postcss=require('postcss');
for(const file of ['InboxPanel.css','SettingsPanel.css','ui/EditableSettingSection.css']){
 const css=read('src/app/components/'+file);assert(!css.includes('--neon-cyan'),'No old cyan override: '+file);
 postcss.parse(css).walkDecls('font-size',d=>{if(/^\d+(\.\d+)?px$/.test(d.value))assert(parseFloat(d.value)>=14,'Support text minimum 14px: '+file+' '+d);});
}
for(const rarity of ['n','r','sr','ssr'])assert(fs.existsSync('public/ui/rarity/rarity-badge-'+rarity+'.png'),'Official rarity asset '+rarity);
postcss.parse(read('src/app/components/redesign/growth.css')).walkRules(r=>{
 if(/(^|[ >,+~])button(?=[\s.:#\[>+~,]|$)/.test(r.selector))assert(!/(^|[ >,+~])button(?!:not\(\.g4-action\))(?=[\s.:#\[>+~,]|$)/.test(r.selector),'Growth native button rules must exclude shared actions: '+r.selector);
});
assert(read('src/app/components/ShopTab.tsx').includes('mode="gems"'),'Approved normal gem products remain connected');
assert(!read('src/app/context/GameContext.tsx').includes('onPresentEquipmentProjection:'),'GAME04 receipt refresh must not query the absent legacy equipment table');

assert(read('src/app/components/redesign/PreparationModal.tsx').includes('RarityBadge'),'Preparation uses official rarity');
assert(read('src/app/components/redesign/FormalGachaView.tsx').includes('RarityBadge'),'Results use official rarity');
