// Build derivatives only. Preserve source artwork and numerical/gameplay masters.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require(require.resolve('sharp', { paths: [path.dirname(require.resolve('next/package.json'))] }));
const root = path.resolve(__dirname, '..');
async function main() {
  const read = async name => JSON.parse(await fs.readFile(path.join(root, 'src/theme', name), 'utf8'));
  const characters = await read('local-characters.json');
  const backgrounds = await read('character-backgrounds.json');
  const inputs = new Map();
  for (const row of characters) for (const key of ['full', 'portrait', 'card', 'battle']) {
    if (row[key]?.startsWith('/')) inputs.set(row[key], key === 'portrait' ? 640 : 1080);
  }
  for (const row of backgrounds) if (row.background?.startsWith('/')) inputs.set(row.background, 1080);
  inputs.set('/creative/backgrounds/char_ageha_01.png', 1080);
  inputs.set('/creative/branding/sengoku-hime-enbu-key-visual-20260928-v4.png', 1080);
  // Promotion artwork keeps its exact canvas dimensions; no resize/crop.
  inputs.set('/creative/promotions/starter-pack-100-20260928.png', null);
  inputs.set('/assets/promotions/b15/normal.png', null);
  const output = path.join(root, 'public/display-images');
  await fs.mkdir(output, { recursive: true });
  const manifest = {};
  const queue = [...inputs].sort(([a], [b]) => a.localeCompare(b));
  let before = 0, after = 0;
  async function worker() {
    while (queue.length) {
      const [src, width] = queue.shift();
      const original = await fs.readFile(path.join(root, 'public', src));
      const pipeline = sharp(original).rotate();
      if (width !== null) pipeline.resize({ width, withoutEnlargement: true });
      const bytes = await pipeline.webp({ quality: 82, alphaQuality: 100, effort: 4 }).toBuffer();
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 24);
      const filename = `${hash}.webp`;
      await fs.writeFile(path.join(output, filename), bytes);
      manifest[src] = `/display-images/${filename}`;
      before += original.length; after += bytes.length;
    }
  }
  await Promise.all([worker(), worker()]);
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(path.join(root, 'src/theme/display-image-manifest.json'), JSON.stringify(sorted, null, 2) + '\n');
  console.log(`Display images: ${inputs.size}, ${before} -> ${after} bytes`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
