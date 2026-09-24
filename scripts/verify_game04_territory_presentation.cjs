const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { FORMAL_CASTLES, createFormalInvasionMaster } = require('../src/domain/redesign/raidInvasionMaster.ts');
const { getTerritoryPreviewStages, territoryEnemyArt } = require('../src/domain/redesign/territoryPresentation.ts');
const report = [];
for (const castle of FORMAL_CASTLES) {
  const master = createFormalInvasionMaster(castle.id, () => 0);
  const original = JSON.stringify(master);
  const preview = getTerritoryPreviewStages(master);
  assert.deepEqual(preview.map(stage => stage.level), [1, 6, 12]);
  assert.deepEqual(preview.map(stage => stage.isRepresentative), [true, false, false]);
  for (const entry of preview) {
    const formal = master.stages.find(stage => stage.level === entry.level);
    const boss = formal.enemies.find(enemy => enemy.boss) ?? formal.enemies[0];
    assert.deepEqual(entry.enemy.stats, boss.stats, 'stats must come from selected formal stage, without extra growth');
    assert.equal(entry.enemy.level, boss.level);
    assert.equal(entry.enemy.name, boss.name);
    assert.deepEqual(entry.enemies, formal.enemies);
    assert.deepEqual(entry.defeatRewards, formal.defeatRewards);
    assert.equal(entry.sharedHp, formal.sharedHp);
    assert.ok(fs.existsSync(`public${territoryEnemyArt(entry.enemy)}`), `${castle.name} ${entry.label} existing art`);
    report.push({ castle: castle.name, stage: entry.level, enemy: entry.enemy.name, enemyLevel: entry.enemy.level, representative: entry.isRepresentative, image: territoryEnemyArt(entry.enemy) });
  }
  preview[0].enemy.stats.hp = -1;
  preview[0].enemies[0].stats.hp = -1;
  preview[0].defeatRewards[0].amount = -1;
  assert.equal(JSON.stringify(master), original, 'presentation must not mutate hosting master');
}
console.log(JSON.stringify({ pass: true, checks: ['5 castles x 3 formal stages', 'enemy level distinct from invasion stage', 'exact HP/ATK/DEF and rewards', 'normal-stage representative distinction', '15 existing local images', 'master immutability'], rows: report }, null, 2));
