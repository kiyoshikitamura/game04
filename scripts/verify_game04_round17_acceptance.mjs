// Read-only pre-integration checks. This does not certify deployed battle inputs or UI timing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { simulateBattle } from '../src/domain/redesign/battle.ts';
import { createFormalBattleInput } from '../src/domain/redesign/formalBattleInput.ts';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const prefix = 'docs/product/balance_audits_20260922/';
const approved = read(prefix + 'round17_effective62.json');
const delta = read(prefix + 'round17_enemy_delta.json');
const references = read(prefix + 'round17_enemy_skill_check.json');
const evidence = read(prefix + 'round17_evidence/final17-results.json');
const formal = read('docs/product/masters_20260921/GAME04_DESIGN_MASTER_EXTRACT.json');
const roster = read('src/theme/sengoku-characters.json');
const report = {
  status: 'PRE_INTEGRATION_ONLY',
  approvalSha: '60fe2f382c56c4902ca5eecaf38401a491d02c0e',
  dataSha: 'f8741827daf9ffbb76b097c6d12a3950434af449',
  sourceChecks: [], stages: 0, enemies: 0, skillReferences: 0, deltaEnemies: 0,
  replay: [],
  notVerified: ['Deployed quest inputs', 'Gameplay character/skill/equipment integration', 'Real playback seconds and visual recognition'],
};
for (const expected of read(prefix + 'round17_source_check.json').files) {
  const source = fs.readFileSync(new URL(expected.path, root), 'utf8').replace(/\r\n/g, '\n');
  const sha256 = createHash('sha256').update(source).digest('hex');
  assert.equal(sha256, expected.sha256, expected.path);
  report.sourceChecks.push({ path: expected.path, sha256 });
}
const stages = new Map(approved.stages.map(stage => [stage.stage, stage]));
assert.equal(stages.size, 62);
for (const id of ['10-8', '10-9', '10-10']) assert.equal(stages.has(id), false);
assert.equal(references.rows.length, 336);
const refs = new Map(references.rows.map(row => [`${row.stage}:${row.enemyId}`, row]));
assert.equal(refs.size, 336);
for (const stage of stages.values()) {
  const ids = new Set();
  stage.waves.forEach((wave, waveIndex) => wave.forEach((enemy, position) => {
    const parts = enemy.id.split('/');
    assert.equal(parts[0], stage.stage);
    assert.equal(Number(parts[1].replace('W', '')), waveIndex + 1);
    assert.equal(Number(parts[2]), position + 1);
    assert.equal(enemy.order, position);
    assert.equal(ids.has(enemy.id), false);
    ids.add(enemy.id);
    const ref = refs.get(`${stage.stage}:${enemy.id}`);
    assert.ok(ref, enemy.id);
    assert.equal(formal.characters.find(row => row.id === ref.characterId)?.display_name_provisional, enemy.name);
    assert.equal(roster.find(row => row.characterId === ref.characterId)?.name, enemy.name);
    assert.deepEqual(enemy.skills.map(skill => skill.id), ref.skills.map(skill => skill.id));
    for (const [index, skill] of enemy.skills.entries()) {
      assert.ok(ref.skills[index].lbCandidates.length);
      for (const lb of ref.skills[index].lbCandidates) {
        const row = formal.skill_lb_rows.find(row => row.design_id === skill.id && row.lb === lb);
        assert.ok(row, `${enemy.id} ${skill.id} LB${lb}`);
        assert.equal(row.sp, skill.spCost, `${enemy.id} ${skill.id} SP`);
      }
      report.skillReferences++;
    }
    assert.ok(Number.isInteger(enemy.initialCount) && enemy.initialCount >= 1);
    assert.ok(Number.isInteger(enemy.actionCount) && enemy.actionCount >= 1);
    report.enemies++;
  }));
  const prepared = createFormalBattleInput(1, [], stage.waves, approved.rules);
  assert.deepEqual(prepared.waves, stage.waves, `${stage.stage}: formal input lost fields`);
  assert.notEqual(prepared.waves, stage.waves);
  report.stages++;
}
assert.equal(report.enemies, 336);
assert.equal(new Set(delta.allCandidateDiff.map(row => row.stage)).size, 49);
assert.equal(delta.allCandidateDiff.length, 175);
assert.equal(new Set(delta.new40StageDiff.map(row => row.stage)).size, 39);
assert.equal(delta.new40StageDiff.length, 150);
for (const row of delta.allCandidateDiff) {
  const enemy = stages.get(row.stage).waves[row.wave - 1][row.position - 1];
  assert.equal(enemy.id, row.enemyId);
  for (const [path, change] of Object.entries(row.fields)) {
    const value = path.split('.').reduce((object, key) => object[key], enemy);
    assert.deepEqual(value, change.candidate, `${row.stage} ${row.enemyId} ${path}`);
  }
  report.deltaEnemies++;
}
function summarize(result, party, seed) {
  const last = result.frames.at(-1);
  const casts = {}, enemyCasts = {}, effects = {};
  let skips = 0, enemySkips = 0;
  for (const frame of result.frames) {
    const ally = party.some(unit => unit.id === frame.actorId);
    if (frame.event === 'action_start') {
      const target = ally ? casts : enemyCasts;
      target[frame.skillId] = (target[frame.skillId] ?? 0) + 1;
    }
    if (ally && ['cleanse', 'effect_applied', 'heal', 'counter', 'shield_absorbed', 'revive'].includes(frame.event)) {
      const key = frame.skillId + ':' + frame.event;
      effects[key] = (effects[key] ?? 0) + 1;
    }
    if (frame.event === 'stun_skip') { if (ally) skips++; else enemySkips++; }
  }
  return { seed, win: result.outcome === 'win', actions: result.playerActions,
    hp: last.party.reduce((sum, unit) => sum + unit.hp, 0) / last.party.reduce((sum, unit) => sum + unit.maxHp, 0),
    alive: last.party.filter(unit => unit.hp > 0 && !unit.dead).length,
    skips, enemySkips, casts, enemyCasts, effects };
}
assert.equal(evidence.results.length, 40);
for (const entry of evidence.results) {
  assert.deepEqual(entry.waves, stages.get(entry.id).waves, `${entry.id}: evidence differs from approved input`);
  for (const [mode, saved] of Object.entries(entry.runs)) {
    // First, middle and last saved seeds for every stage and comparison mode.
    for (const index of new Set([0, Math.floor(saved.length / 2), saved.length - 1])) {
      const expected = saved[index];
      const input = createFormalBattleInput(expected.seed, entry.parties[mode], entry.waves, evidence.rules);
      const actual = summarize(simulateBattle(input), input.party, input.seed);
      assert.deepEqual(actual, expected, `${entry.id} ${mode} seed=${expected.seed}`);
      report.replay.push({ stage: entry.id, mode, seed: expected.seed, matched: true });
    }
  }
}
if (process.argv[2]) fs.writeFileSync(fileURLToPath(new URL(process.argv[2], root)), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, replay: { matched: report.replay.length, stages: evidence.results.length, seedsPerMode: 3 } }, null, 2));
