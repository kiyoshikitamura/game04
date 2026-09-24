import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

// Deterministic HTML composition: approved common chrome, untouched reference bodies.
const root = path.resolve('docs/design/character/2026-09-23');
const out = path.join(root, 'corrected');
const uri = async file => `data:image/${file.endsWith('.jpg') ? 'jpeg' : 'png'};base64,${(await fs.readFile(file)).toString('base64')}`;
const chrome = await uri('docs/verification/raid-20260923/body/raid-policy-list.jpg');
const items = [
  ['01-character-list-detail', 'corrected/01-character-list-detail-body.png', [[17,44,479,104,921,79],[529,44,479,104,921,79],[1042,44,478,104,921,79]]],
  ['02-deck-formation-skill-equipment', 'corrected/02-deck-formation-skill-equipment-baseline.png', [[10,28,365,94,900,70],[393,28,366,94,900,70],[778,28,366,94,900,70],[1162,28,365,94,900,70]]],
  ['03-character-growth-actions', '03-character-growth-actions.png', [[20,62,477,114,915,80],[529,62,478,114,915,80],[1040,62,478,114,915,80]]],
  ['04-character-growth-results', '04-character-growth-results.png', [[32,62,469,112,903,80],[534,62,469,112,903,80],[1037,62,470,112,903,80]]],
  ['05-skill-equipment-growth-actions', '05-skill-equipment-growth-actions.png', [[18,105,477,95,889,81],[531,105,477,95,889,81],[1043,105,476,95,889,81]]],
  ['06-skill-equipment-growth-results', 'corrected/06-skill-equipment-growth-results-body.png', [[17,98,479,102,890,84],[529,98,479,102,890,84],[1042,98,476,102,890,84]]],
];
function crop(x,y,w,h,sx,sy,sw,sh) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden"><img src="${chrome}" style="position:absolute;max-width:none;left:${-sx*w/sw}px;top:${-sy*h/sh}px;width:${1363*w/sw}px;height:${936*h/sh}px"></div>`;
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/tmp/game04-browser/chrome-headless-shell-linux64/chrome-headless-shell', args:['--no-sandbox'] });
const page = await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
for (const [name,source,panels] of items) {
  const body = await uri(path.join(root,source));
  let layers = '';
  for (const [x,y,w,h,fy,fh] of panels) {
    layers += crop(x,y,w,h,403,0,548,106);
    layers += `<div style="position:absolute;left:${x}px;top:${fy}px;width:${w}px;height:${fh}px;background:#1c191f;border-top:1px solid #9b8351;box-sizing:border-box"></div>`;
    for(let i=0;i<5;i++) {
      const cw=w/5;
      // Crop icon and label inside each approved footer cell; redraw only active route border.
      layers += crop(x+i*cw+2,fy+3,cw-4,fh-6,406+i*112,870,105,58);
      layers += `<div style="position:absolute;left:${x+i*cw}px;top:${fy}px;width:${cw}px;height:${fh}px;box-sizing:border-box;border-right:1px solid #6f6046;${i===2?'border:2px solid #d1b770;box-shadow:inset 0 -4px 8px #c2a44b66;':''}"></div>`;
    }
  }
  await page.setContent(`<html><body style="margin:0;width:1536px;height:1024px;overflow:hidden"><img src="${body}" style="position:absolute;width:1536px;height:1024px">${layers}</body></html>`);
  await page.locator('img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
  const target=path.join(out,`${name}-baseline.jpg`);
  await page.screenshot({path:target,type:'jpeg',quality:90});
  console.log(`${target} ${(await fs.stat(target)).size} bytes`);
}
await browser.close();
