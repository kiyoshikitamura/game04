import fs from 'node:fs';
import assert from 'node:assert/strict';
const config = JSON.parse(fs.readFileSync('config/game04-preview-public.json'));
assert.equal(new URL(config.supabaseUrl).hostname, 'lrgyllgzcdcphlbmkknc.supabase.co');
const sessionPath = process.argv[2] || '/tmp/game04-work-live/guest.json';
const session = JSON.parse(fs.readFileSync(sessionPath));
const output = 'docs/verification/home-20260924/live-api.json';
const report = { project: 'lrgyllgzcdcphlbmkknc', apiVersion: 18, checkedAt: new Date().toISOString(), verification: 'live authenticated API; not fixture or browser evidence', userId: session.user.id, checks: [], patchInputNote: 'The reviewed /tmp/home-live-edge-v17.ts input is original get_edge_function tool content plus one trailing newline; SHA256 685a752162156140ee49ee2a63e2f1d0db15f9e666efbdff553e17b9b77956c4 includes that newline.' };
const save = () => { fs.mkdirSync('docs/verification/home-20260924', { recursive: true }); fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); };
async function call(action, payload = {}, requestId = crypto.randomUUID()) {
  const response = await fetch(config.supabaseUrl + '/functions/v1/game04-redesign-api', { method: 'POST', headers: { apikey: config.supabaseAnonKey, Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload, requestId }) });
  return { status: response.status, data: await response.json() };
}
async function ok(action, payload, id) { const response = await call(action, payload, id); assert.equal(response.status, 200, `${action}: ${response.data.error || response.status}`); return response.data.state; }
function sameSelection(a, b) { assert.equal(a.homeCharacterId, b.homeCharacterId); assert.equal(a.homeBackgroundId, b.homeBackgroundId); }
function check(name, detail = {}) { report.checks.push({ name, pass: true, ...detail }); save(); }
let original;
try {
  original = await ok('get_state');
  report.originalSelection = { characterId: original.homeCharacterId ?? null, backgroundId: original.homeBackgroundId ?? null };
  const characterId = original.characters.find(character => character.id !== original.deck[0]?.characterId)?.id || original.characters[0].id;
  const draft = { characterId, backgroundId: 'area:mikawa' };
  const requestId = crypto.randomUUID();
  let selected = await ok('set_home', draft, requestId);
  assert.equal(selected.homeCharacterId, characterId); assert.equal(selected.homeBackgroundId, draft.backgroundId);
  const reloaded = await ok('get_state'); sameSelection(selected, reloaded);
  check('武将と背景を同時保存しget_stateで復元', { saved: draft });
  const replay = await ok('set_home', draft, requestId); sameSelection(replay, selected); assert.equal(replay.version, selected.version);
  check('同一requestId再送でversion・選択の二重更新なし');
  for (const backgroundId of ['bg_default', 'bg_kabukicho', 'castle-town', 'castle-approach']) {
    selected = await ok('set_home', { backgroundId }); const reload = await ok('get_state'); assert.equal(reload.homeBackgroundId, backgroundId); sameSelection(selected, reload);
  }
  check('旧ID 2件と既存正規ID 2件の保存・再読込');
  const beforeRejection = await ok('get_state');
  for (const [name, payload] of [
    ['未解放背景＋別武将の原子的拒否', { characterId: original.deck[0].characterId, backgroundId: 'area:sekigahara' }],
    ['不正背景ID拒否', { backgroundId: 'not-a-real-home-background' }],
    ['未所持武将拒否', { characterId: 'not-an-owned-character', backgroundId: 'area:mikawa' }],
  ]) {
    const rejected = await call('set_home', payload); assert.equal(rejected.status, 400);
    const after = await ok('get_state'); sameSelection(after, beforeRejection); assert.equal(after.version, beforeRejection.version);
    check(name, { status: rejected.status, error: rejected.data.error });
  }
  const final = await ok('get_state');
  for (const key of ['cash', 'diamonds', 'characters', 'deck', 'skills', 'equipment', 'clearedStages', 'souls']) assert.deepEqual(final[key], original[key], `${key} changed`);
  check('編成・育成・所持品・銭・輝石・出陣進行を保持');
  report.pass = true;
} catch (error) { report.pass = false; report.error = error.message; }
finally {
  if (original) {
    const restore = { characterId: original.homeCharacterId ?? original.deck[0].characterId, backgroundId: original.homeBackgroundId ?? 'castle-approach' };
    try {
      const restored = await ok('set_home', restore); const reload = await ok('get_state'); sameSelection(restored, reload);
      report.restoredSelection = restore;
      report.restore = { pass: true, mode: original.homeCharacterId === undefined || original.homeBackgroundId === undefined ? '元の表示選択へ復元。元が未設定のためAPIで既定値を明示保存（キー不在への復元ではない）' : '元の保存値へ復元' };
    } catch (error) { report.restore = { pass: false, error: error.message }; report.pass = false; }
  }
  save();
}
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
