import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// 読取専用監査。DB・ユーザー投稿・実素材の削除は行わない。
const root = fileURLToPath(new URL('../', import.meta.url));
const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const runtime = tracked.filter(f => /^(src|masters)\//.test(f) && /\.(tsx?|css|json)$/.test(f) && existsSync(path.join(root, f)));
const texts = runtime.map(file => ({ file, text: readFileSync(path.join(root, file), 'utf8') }));
const characters = JSON.parse(readFileSync(path.join(root, 'src/theme/sengoku-characters.json'), 'utf8'));
const names = characters.map(c => c.upstreamName).filter(Boolean);
const skill = JSON.parse(readFileSync(path.join(root, 'src/domain/gameplay/canonical/data/skills_20260821.json'), 'utf8'));
const equipment = JSON.parse(readFileSync(path.join(root, 'src/domain/gameplay/canonical/data/equipment_20260821.json'), 'utf8'));
const oldMasterNames = [...(skill.skills || []), ...(equipment.equipments || [])].map(x => x.display_name).filter(Boolean);
const escaped = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const groups = [
  ['旧ブランド', /TRIBE\s*NEON|TRIBE/gi],
  ['旧地域', /東京|新宿|渋谷|池袋|六本木|秋葉原|川崎|横浜/g],
  ['旧キャラ名', new RegExp(names.map(escaped).join('|'), 'g')],
  ['旧技装備名', new RegExp(oldMasterNames.map(escaped).join('|'), 'g')],
];
const findings = [];
for (const { file, text } of texts) {
  const category = /\/qa\/|\/mock\//.test(file) ? 'QA・モック' : /\/canonical\/data\/|^masters\//.test(file) ? '原本マスター（表示変換を別途確認）' : /sengoku-characters\.json$/.test(file) ? '旧名対応表（保持）' : '稼働コード参照（表示・識別子を別途確認）';
  for (const [i, line] of text.split('\n').entries()) for (const [kind, re] of groups) {
    const terms = [...new Set(line.match(re) || [])];
    if (terms.length) findings.push({ file, line: i + 1, kind, terms, category });
  }
}
const themePaths = new Set(characters.map(c => c.imagePath));
const assets = tracked.filter(f => /^public\//.test(f) && /\.(png|jpe?g|webp|gif|svg|avif|mp3|wav|ogg)$/i.test(f));
const assetReferences = assets.map(file => {
  const url = '/' + file.slice('public/'.length);
  const refs = texts.filter(t => t.text.includes(url)).map(t => t.file);
  const dynamicPrefixes = texts.filter(t => t.text.includes(path.posix.dirname(url) + '/') && /\$\{|\.join\(|\+/.test(t.text)).map(t => t.file);
  const replacement = themePaths.has(url) || /\/(sengoku|ui\/sengoku)\//.test(url) || url === '/branding/tribe-neon-logo.png';
  const group = /\/(bg|background|banners|branding|gacha|raid|audio|sounds?)\//i.test(url) ? '背景・ロゴ・訴求・演出候補' : 'その他素材';
  return { file, group, state: replacement ? 'GAME04置換済・互換パス保持' : refs.length ? '静的参照あり・素材差替要確認' : dynamicPrefixes.length ? '動的参照候補・削除保留' : 'ソース静的参照なし・未使用候補（DB参照未判定）', refs, dynamicPrefixes };
});
const report = { basis: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), generatedBy: 'node scripts/audit_game04_legacy_materials.mjs', scope: '追跡済src/mastersの作業ツリーとpublicのGit一覧。並行変更後は再実行。DB由来URL・動的合成URL・画像内文字の目視は別工程。静的参照なしだけでは未使用を断定しない。', deleted: [], findings, assetReferences };
const out = path.join(root, 'docs/development/GAME04_LEGACY_AUDIT_20260918.json');
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
const count = key => Object.fromEntries([...new Set(assetReferences.map(a => a[key]))].map(k => [k, assetReferences.filter(a => a[key] === k).length]));
console.log(JSON.stringify({ report: path.relative(root, out), textFindings: findings.length, assets: assets.length, state: count('state'), deleted: 0 }, null, 2));
