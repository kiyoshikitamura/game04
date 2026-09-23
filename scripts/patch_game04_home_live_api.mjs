import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

// Usage: node scripts/patch_game04_home_live_api.mjs live-v17.ts output.ts /absolute/esbuild/package.json
// No network, deployment, DB write, or source-wide API regeneration occurs here.
const [input, output, esbuildPackage] = process.argv.slice(2);
assert(input && output && esbuildPackage, 'Require reviewed live input, output, and pinned esbuild package path');
const { build, version } = createRequire(path.resolve(esbuildPackage))('esbuild');
assert.equal(version, '0.25.10', 'Use the reviewed bundler version');
const sha = value => createHash('sha256').update(value).digest('hex');
const live = await fs.readFile(input, 'utf8');
const reviewedSha = '685a752162156140ee49ee2a63e2f1d0db15f9e666efbdff553e17b9b77956c4';
assert.equal(sha(live), reviewedSha, 'Live API changed; review its new source before rebasing this patch');
const startToken = '    } else if (action === "set_home") {';
const endToken = '    } else if (["raid_join", "raid_leave", "raid_rescue", "raid_claim", "encounter_ignore"].includes(action)) {';
const start = live.indexOf(startToken), end = live.indexOf(endToken, start);
assert(start >= 0 && end > start && live.indexOf(startToken, start + 1) === -1, 'Expected one set_home branch');
const original = live.slice(start, end);
assert(original.includes('["castle-town", "castle-approach"].includes(payload.backgroundId)'), 'Unexpected original home validator');
const bundled = await build({
  stdin: { contents: "export { applyHomeSelection } from './src/domain/redesign/home';", resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, format: 'iife', globalName: '__game04HomeSelectionModule', platform: 'neutral', write: false,
  plugins: [{ name: 'reuse-reviewed-live-authorities', setup(builder) {
    builder.onResolve({ filter: /^\.\/(masters|quests)$/ }, args => {
      if (args.importer.endsWith('/src/domain/redesign/home.ts')) return { path: args.path, namespace: 'live-authorities' };
    });
    builder.onLoad({ filter: /.*/, namespace: 'live-authorities' }, args => ({ loader: 'js', contents: args.path === './masters'
      ? 'export const CHARACTER_MASTERS = __game04HomeLiveAuthorities.characters;'
      : 'export const QUEST_AREAS = __game04HomeLiveAuthorities.areas; export const isQuestStageUnlocked = __game04HomeLiveAuthorities.stageUnlocked;' }));
  } }],
});
const closure = `\n// BEGIN isolated home selection patch (reviewed live v17)\nvar __game04HomeApplySelection = (function(__game04HomeLiveAuthorities) {\n${bundled.outputFiles[0].text}\nreturn __game04HomeSelectionModule.applyHomeSelection;\n})({ characters: CHARACTER_MASTERS, areas: QUEST_AREAS, stageUnlocked: isQuestStageUnlocked });\n// END isolated home selection patch\n`;
assert(!live.includes('__game04HomeApplySelection'), 'Patch is already applied');
const replacement = `${startToken}\n      try { after = __game04HomeApplySelection(state, payload); }\n      catch (error) { throw new ApiError(error instanceof Error ? error.message : "本陣の変更を保存できませんでした。"); }\n`;
const serveToken = 'Deno.serve(';
const serve = live.indexOf(serveToken);
assert(serve >= 0 && serve < start, 'Require insertion after live master initialization and before handler');
const changedBranch = live.slice(0, start) + replacement + live.slice(end);
const patched = changedBranch.slice(0, serve) + closure + changedBranch.slice(serve);
assert.equal(patched.replace(closure, '').replace(replacement, original), live, 'All non-home live source must remain byte-for-byte identical');
let registeredHandler;
const context = vm.createContext({ Deno: { env: { get: () => '' }, serve: handler => { registeredHandler = handler; } }, structuredClone });
vm.runInContext(patched, context);
assert.equal(typeof registeredHandler, 'function');
vm.runInContext(`(() => {
  const state = createInitialState('home-patch-fixture');
  const saved = __game04HomeApplySelection(state, { characterId: state.characters[0].id, backgroundId: 'area:mikawa' });
  if (saved.homeBackgroundId !== 'area:mikawa') throw Error('Home patch save failed');
  let rejected = false;
  try { __game04HomeApplySelection(state, { backgroundId: 'area:sekigahara' }); } catch { rejected = true; }
  if (!rejected) throw Error('Home patch failed to reject locked background');
})()`, context);
await fs.writeFile(output, patched);
console.log(JSON.stringify({ inputSha256: sha(live), outputSha256: sha(patched), esbuildVersion: version, nonHomeSourceIdentical: true, replacedBranches: 1, isolatedVmValidation: 'PASS (no API request or DB write)', authoritySource: 'live v17 CHARACTER_MASTERS / QUEST_AREAS / isQuestStageUnlocked', patchBytes: closure.length }, null, 2));
