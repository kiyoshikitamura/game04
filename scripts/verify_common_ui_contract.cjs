const fs=require('fs'),assert=require('assert/strict');const read=p=>fs.readFileSync(p,'utf8');
assert(read('src/app/components/ui/OutlawButton.tsx').includes('return <ActionButton'),'One shared action renderer');
assert(!read('src/app/components/gacha/FormalGachaHub.tsx').includes('<p>{meta.rates}</p>'),'No duplicate inline rates');
assert(!read('src/app/components/redesign/TerritoryView.tsx').includes('function ElementBadge'),'No local element badge');
assert(read('src/app/components/redesign/GrowthView.tsx').includes('<ListControls'),'Search controls required');
assert(!read('src/app/sengoku-theme.css').includes('--font-sengoku: "Hiragino Mincho'),'No legacy all-serif font');
assert(read('src/app/components/ui/actions.css').includes('grid-template-areas'), 'Stable pending layout');
const assets=['/ui/sengoku/13-coin.png','/ui/sengoku/16-diamond.png','/creative/items/territory-invasion-ticket.png'];for(const p of assets)assert(fs.existsSync('public'+p),p);
console.log('PASS common UI static contract (visual comparison still required)');
