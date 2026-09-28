// Read-only replay verification. Synthetic acceptance inputs; no DB/network writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, parent, ...rest) { return resolve.call(this, name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : name, parent, ...rest); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
const { simulateBattle } = require('../src/domain/redesign/battle.ts');
const { commonBattleFixture } = require('../src/app/qa/battle-common/fixture.ts');
const report = [];
for (const scenario of ['presentation', 'six-waves', 'burst', 'interrupt', 'waves', 'limit', 'legacy']) {
  const input = commonBattleFixture(scenario);
  const result = simulateBattle(input);
  assert(result.frames.length > 1);
  for (const frame of result.frames) {
    for (const unit of [...frame.party, ...frame.enemies]) {
      assert(unit.hp >= 0 && unit.hp <= unit.maxHp, `HP bounds ${scenario}`);
      assert(unit.sp >= 0 && unit.sp <= unit.maxSp, `SP bounds ${scenario}`);
    }
  }
  if (scenario === 'six-waves') {
    assert.equal(result.waves.length, 6);
    assert.equal(result.wavesCleared, 6);
    assert.equal(result.outcome, 'win');
    for (let wave = 1; wave <= 6; wave++) {
      const frame = result.frames.find(f => f.wave === wave);
      assert(frame, `Wave ${wave}`);
      assert.equal(frame.enemies[0].sp, (wave - 1) * 5);
      assert.equal(frame.enemies[0].maxSp, 80);
    }
  }
  if (scenario === 'presentation') {
    assert(result.frames.some(f => f.event === 'burst_start'));
    assert(result.frames.some(f => f.event === 'damage'));
    assert(result.frames.some(f => f.party.some(u => u.statuses.length > 0)));
  }
  report.push({ scenario, frames: result.frames.length, waves: result.waves.length, wavesCleared: result.wavesCleared, outcome: result.outcome, events: [...new Set(result.frames.map(f => f.event))] });
}
console.log(JSON.stringify({ status: 'PASS', scope: 'Synthetic inputs through actual battle simulator; browser playback is a separate verification', scenarios: report }, null, 2));
const { QUEST_STAGES } = require('../src/domain/redesign/quests.ts');
const { createQuestBattleInput } = require('../src/domain/redesign/questMaster.ts');
const evidence = require('../src/app/qa/quest65/evidence.json');
const roster = require('../src/theme/sengoku-characters.json');
const assets = new Set();
const collect = input => [...input.party, ...input.waves.flat()].forEach(u => { assets.add(u.image); u.skills.forEach(s => assets.add(s.image)); });
collect(commonBattleFixture('presentation'));
const formal = ['7-7', '9-9'].map(id => {
  const stage = QUEST_STAGES.find(s => s.designId === id);
  const entry = evidence.results.find(r => r.id === id);
  const party = entry.parties.main.map(u => ({ ...u, image: roster.find(c => c.characterId === u.id)?.imagePath ?? u.image }));
  const seed = entry.runs.main[0].seed;
  const input = createQuestBattleInput(seed, party, stage, evidence.rules);
  collect(input);
  const result = simulateBattle(input);
  return { stage: id, seed, party: party.map(u => ({ id: u.id, level: u.level })), rulesVersion: input.rules.version, inputVersion: input.rules.inputVersion, frames: result.frames.length, waves: result.waves.length, wavesCleared: result.wavesCleared, outcome: result.outcome, events: [...new Set(result.frames.map(f => f.event))], measuredBrowserDuration: null, note: 'Simulation only; final 2x browser playback measurement pending.' };
});
fs.writeFileSync(path.join(root, 'docs/verification/battle-20260924/formal-replay-inputs.json'), JSON.stringify(formal, null, 2));
fs.writeFileSync(path.join(root, 'docs/verification/battle-20260924/required-assets.json'), JSON.stringify([...assets].filter(Boolean).sort(), null, 2));
