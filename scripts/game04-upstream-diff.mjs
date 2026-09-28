import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const baseline = JSON.parse(readFileSync(new URL('../config/game04-upstream.json', import.meta.url), 'utf8'));
const [sourceDirectory, nextProductionSha] = process.argv.slice(2);
if (!sourceDirectory || !/^[0-9a-f]{40}$/.test(nextProductionSha || '')) {
  throw new Error('Usage: node scripts/game04-upstream-diff.mjs <GAME03 checkout> <verified Production SHA>');
}
const run = (...args) => execFileSync('git', ['-C', sourceDirectory, ...args], { encoding: 'utf8' }).trim();
for (const sha of [baseline.productionSha, nextProductionSha]) run('cat-file', '-e', `${sha}^{commit}`);
const changes = run('diff', '--name-status', baseline.productionSha, nextProductionSha).split('\n').filter(Boolean);
console.log(JSON.stringify({ previousProduction: baseline.productionSha, nextProduction: nextProductionSha,
  changes: changes.map(line => {
    const [status, ...paths] = line.split('\t');
    const path = paths.at(-1);
    const category = /^(supabase\/|masters\/)/.test(path) ? 'DB・master（live定義照合必須）'
      : /^(public\/characters\/|public\/branding\/)/.test(path) ? 'キャラ・ロゴ（GAME04対応維持）'
      : /^(config\/|\.github\/)|supabase|billing|kpiRuntime|next.config/.test(path) ? '環境・運用（個別確認）'
      : '共通実装（テーマ差分と3者比較）';
    return { status, paths, category };
  }) }, null, 2));
