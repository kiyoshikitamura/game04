import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseUrl = process.argv[2];
if (!baseUrl) throw new Error('Usage: node scripts/capture-quest-visual-comparison.mjs <preview-url>');
const outDir = path.resolve('docs/design/quest/2026-09-22/comparison');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const shots = [];
async function capture(name) {
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); }))));
  await page.waitForTimeout(350);
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  shots.push({ name, file });
}

await page.goto(`${baseUrl}/qa/redesign?view=quest`, { waitUntil: 'networkidle' });
await page.waitForTimeout(250);
await capture('01-area-list');
await page.getByRole('button', { name: /第1章/ }).click();
await page.waitForTimeout(250);
await capture('02-stage-list');
await page.getByRole('button', { name: /1-1/ }).click();
await page.waitForTimeout(250);
await capture('03-challenge');
await page.getByRole('button', { name: '挑戦', exact: true }).click();
await page.waitForTimeout(250);
await capture('04-preparation');
await page.getByRole('button', { name: /1番/ }).click();
await page.waitForTimeout(250);
await capture('05-character-detail');
await page.getByRole('dialog', { name: /詳細/ }).getByLabel('閉じる').click();

const width = 1536;
const tileWidth = 300;
const tileHeight = 650;
const labelHeight = 36;
const canvasHeight = 1024 + labelHeight + tileHeight;
const mock = await sharp('docs/design/quest/2026-09-22/quest-approved-mock.png').resize(width, 1024, { fit: 'cover' }).png().toBuffer();
const composites = [{ input: mock, left: 0, top: 0 }];
for (let i = 0; i < shots.length; i++) {
  const buffer = await sharp(shots[i].file).resize(tileWidth, tileHeight, { fit: 'contain', background: '#120d0b' }).png().toBuffer();
  composites.push({ input: buffer, left: i * tileWidth, top: 1024 + labelHeight });
}
const labels = ['01 エリア一覧', '02 ステージ一覧', '03 挑戦ダイアログ', '04 出撃準備', '05 武将詳細'];
const svg = `<svg width="${width}" height="${canvasHeight}"><rect x="0" y="1024" width="${width}" height="${labelHeight}" fill="#241916"/>${labels.map((label, i) => `<text x="${i * tileWidth + 12}" y="1024" dy="25" fill="#f6e5c4" font-family="sans-serif" font-size="16">${label}</text>`).join('')}</svg>`;
composites.push({ input: Buffer.from(svg), left: 0, top: 0 });
await sharp({ create: { width, height: canvasHeight, channels: 4, background: '#120d0b' } }).composite(composites).png().toFile(path.join(outDir, 'quest-visual-comparison-20260923.png'));
await browser.close();
console.log(JSON.stringify({ baseUrl, outDir, shots: shots.map(s => s.file), comparison: path.join(outDir, 'quest-visual-comparison-20260923.png') }, null, 2));
