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
await page.getByRole('button', { name: /攻略のヒント/ }).click();
await page.waitForTimeout(250);
await capture('06-hint-detail');
await page.getByRole('dialog', { name: '攻略のヒント' }).getByRole('button', { name: '戻る', exact: true }).click();
await page.getByRole('button', { name: /報酬を確認/ }).click();
await page.waitForTimeout(250);
await capture('07-reward-detail');
await page.getByRole('dialog', { name: '報酬を確認' }).locator('.canonical-dialog-body').evaluate(element => { element.scrollTop = element.scrollHeight; });
await page.waitForTimeout(150);
await capture('07-reward-detail-bottom');
await page.getByRole('dialog', { name: '報酬を確認' }).getByRole('button', { name: '戻る', exact: true }).click();
await page.getByRole('button', { name: '挑戦', exact: true }).click();
await page.waitForTimeout(250);
await capture('04-preparation');
await page.getByRole('button', { name: /1番/ }).click();
await page.waitForTimeout(250);
await capture('05-character-detail');
await page.getByRole('dialog', { name: /詳細/ }).getByLabel('閉じる').click();

const width = 1536;
const tileWidth = 210;
const tileHeight = 560;
const labelHeight = 36;
const canvasHeight = 1024 + labelHeight + tileHeight;
const mock = await sharp('docs/design/quest/2026-09-22/quest-approved-mock.png').resize(width, 1024, { fit: 'cover' }).png().toBuffer();
const orderedShots = ['01-area-list', '02-stage-list', '03-challenge', '04-preparation', '05-character-detail', '06-hint-detail', '07-reward-detail'].map(name => shots.find(shot => shot.name === name));
const composites = [{ input: mock, left: 0, top: 0 }];
for (let i = 0; i < orderedShots.length; i++) {
  const buffer = await sharp(orderedShots[i].file).resize(tileWidth, tileHeight, { fit: 'contain', background: '#120d0b' }).png().toBuffer();
  composites.push({ input: buffer, left: i * tileWidth, top: 1024 + labelHeight });
}
const labels = ['01 エリア', '02 ステージ', '03 挑戦前', '04 準備', '05 詳細', '06 ヒント', '07 報酬'];
const svg = `<svg width="${width}" height="${canvasHeight}"><rect x="0" y="1024" width="${width}" height="${labelHeight}" fill="#241916"/>${labels.map((label, i) => `<text x="${i * tileWidth + 12}" y="1024" dy="25" fill="#f6e5c4" font-family="sans-serif" font-size="16">${label}</text>`).join('')}</svg>`;
composites.push({ input: Buffer.from(svg), left: 0, top: 0 });
await sharp({ create: { width, height: canvasHeight, channels: 4, background: '#120d0b' } }).composite(composites).png().toFile(path.join(outDir, 'quest-visual-comparison-20260923.png'));
await browser.close();
console.log(JSON.stringify({ baseUrl, outDir, shots: shots.map(s => s.file), comparison: path.join(outDir, 'quest-visual-comparison-20260923.png') }, null, 2));
