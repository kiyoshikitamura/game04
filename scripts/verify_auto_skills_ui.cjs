const fs = require('node:fs'), assert = require('node:assert/strict'), { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://localhost:3013';
const out = process.env.QA_OUT || '../../outputs/auto-skills-diversity';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  try {
    const results = [];
    for (const width of [375,390]) {
      const page = await browser.newPage({ viewport: { width, height: 600 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + '/qa/redesign?view=character');
      const auto = page.getByRole('button', { name: 'おまかせスキル', exact: true });
      async function applyAuto() {
        await auto.click();
        await page.locator('.g4g-result').waitFor();
        assert.equal(await page.getByRole('dialog').getByRole('alert').count(), 0);
        await page.getByRole('dialog').getByRole('button', { name: '閉じる', exact: true }).click();
      }
      await applyAuto();
      async function readSkills() {
        const values = [];
        for (let index = 0; index < 3; index++) {
          await page.locator('.g4g-party > button').nth(index).click();
          await page.getByRole('dialog').waitFor();
          values.push(await page.locator('.g4g-selected-skills b').allTextContents());
          await page.getByRole('dialog').getByRole('button', { name: '閉じる', exact: true }).last().click();
        }
        return values;
      }
      const first = await readSkills();
      assert.equal(new Set(first.flat()).size, 3, 'three distinct kinds on three fixture members');
      await applyAuto();
      assert.deepEqual(await readSkills(), first, 'repeated UI auto action preserves selection');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `${out}/auto-${width}.png` });
      results.push({ width, selected: first, repeatStable: true, errors });
      await page.close();
    }
    fs.writeFileSync(out + '/browser.json', JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
