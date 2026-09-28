const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, name) => module._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, name);
const m = require('../src/domain/redesign/masters.ts');
const g = require('../src/domain/redesign/growth.ts');
const { planAutoSkills, evaluateAutoSkill } = require('../src/domain/redesign/autoSkills.ts');
function fixture(ids, awakening = 0) {
  const state = m.createInitialState('auto-skills-synthetic');
  state.clearedStages = ['mikawa-3'];
  // Five real approved characters/skill masters; fabricated ownership for reproducible selection tests.
  state.characters = ['char_joe_01', 'char_daimon_01', 'char_aoi_01', 'char_jihoon_01', 'char_yuki_01']
    .map(id => ({ id, level: 10, awakening }));
  state.deck = state.characters.map(c => ({ characterId: c.id, skillIds: [], equipment: {} }));
  state.skills = ids.map(id => ({ id, level: id === 'SKD035' ? 5 : 0 }));
  return state;
}
function check(state) {
  const original = structuredClone(state);
  const plan = planAutoSkills(state);
  g.validateDeck(state, plan.deck);
  assert.deepEqual(state, original, 'selection must not mutate ownership or the deck');
  assert.deepEqual(g.autoEquipSkills({ ...state, deck: plan.deck }), plan.deck, 'rerun has no churn');
  assert.deepEqual(g.autoEquipSkills({ ...state, skills: [...state.skills].reverse() }), plan.deck, 'inventory order is not a tiebreak');
  for (const member of plan.deck) {
    assert.equal(new Set(member.skillIds).size, member.skillIds.length, 'no duplicate kind within one member');
    assert.ok(member.skillIds.every(id => state.skills.some(s => s.id === id)), 'only owned kinds');
  }
  const firstFallback = plan.choices.findIndex(choice => choice.duplicateFallback);
  if (firstFallback >= 0) {
    const unique = new Set(plan.choices.slice(0, firstFallback).map(c => c.skillId));
    assert.equal(unique.size, new Set(state.skills.filter(s => m.getOwnedSkillMaster(s.id, s.level)).map(s => s.id)).size,
      'fallback starts only after all available unique kinds are used');
  }
  return plan;
}
const enough = fixture(['SKD035','SKD001','SKD003','SKD009','SKD019','SKD013','SKD039','SKD042']);
const enoughPlan = check(enough);
assert.equal(new Set(enoughPlan.deck.flatMap(d => d.skillIds)).size, 5);
assert.ok(enoughPlan.choices.every(c => c.evaluation.attack && !c.duplicateFallback));
assert.ok(enoughPlan.choices.some(c => c.skillId === 'SKD013'), 'SSR attack is considered');
const shortage = check(fixture(['SKD035','SKD003','SKD039']));
assert.equal(new Set(shortage.deck.flatMap(d => d.skillIds)).size, 3);
assert.equal(shortage.choices.filter(c => c.duplicateFallback).length, 2);
assert.ok(shortage.choices.some(c => c.evaluation.attack));
const duplicates = structuredClone(enough);
duplicates.skills.push({ id: 'SKD035', level: 1 }, { id: 'SKD035', level: 8 });
assert.deepEqual(g.autoEquipSkills(duplicates), enoughPlan.deck, 'copies/LB variants do not create different kinds');
const mixed = check(fixture(['SKD035','SKD039','SKD042','SKD044','SKD066','SKD001']));
assert.ok(mixed.choices[0].evaluation.attack, 'attack precedes supports irrespective of their LB');
const manySlots = check(fixture(['SKD035','SKD003','SKD039','SKD013','SKD019','SKD009','SKD007'], 3));
assert.equal(manySlots.choices.length, 15);
assert.equal(manySlots.choices.filter(c => !c.duplicateFallback).length, 7);
assert.ok(manySlots.choices.slice(0, 5).every(c => c.slot === 0), 'first slots before extras');
const onlyOne = check(fixture(['SKD035'], 3));
assert.ok(onlyOne.deck.every(d => d.skillIds.length === 1), 'cannot fill a member with copies of the same kind');
assert.ok(check(fixture(['unknown-retained'])).deck.every(d => !d.skillIds.length));
const unit = m.buildBattleParty(enough)[0], template = m.getOwnedSkillMaster('SKD003',0);
assert.ok(evaluateAutoSkill({ ...template, rarity: 'SSR' }, 0, unit).score > evaluateAutoSkill({ ...template, rarity: 'R' }, 0, unit).score);
assert.ok(evaluateAutoSkill(template, 5, unit).score > evaluateAutoSkill(template, 0, unit).score);
assert.ok(evaluateAutoSkill({ ...template, effects: [{ type: 'damage', power: 150 }] }, 0, unit).score > evaluateAutoSkill({ ...template, effects: [{ type: 'damage', power: 100 }] }, 0, unit).score);
// Validate with the actual save contract (initial account has only its unlocked number of members).
const saveState = m.createInitialState('auto-skills-save');
saveState.skills = enough.skills;
const savedDeck = g.autoEquipSkills(saveState);
g.validateDeck(saveState, savedDeck);
const saved = g.applyGrowthAction(saveState, 'save_deck', { deck: savedDeck });
assert.deepEqual(JSON.parse(JSON.stringify(saved)).deck, savedDeck);
g.validateDeck(saveState, saveState.deck.map(d => ({ ...d, skillIds: ['SKD035'] })));
const oldCandidates = [...enough.skills].sort((a,b) => b.level-a.level || m.getOwnedSkillMaster(b.id,b.level).spCost-m.getOwnedSkillMaster(a.id,a.level).spCost);
const rows = enough.deck.map((member,index) => ({
  character: m.CHARACTER_MASTERS.find(c => c.id === member.characterId).name,
  before: m.getOwnedSkillMaster(oldCandidates[0].id,oldCandidates[0].level).name,
  after: enoughPlan.deck[index].skillIds.map(id => m.getOwnedSkillMaster(id,0).name),
  reason: enoughPlan.choices.find(c => c.characterId === member.characterId),
}));
const report = { fixture: 'Synthetic five-member ownership using real approved masters; not a read of the reporting user account',
  policy: 'unique kinds across formation, first slots before extras; attack first, then effect/compatibility/LB/rarity score; fallback only after kinds exhausted',
  owned: enough.skills, rows, shortage, manySlots, checks: 'PASS: diversity, shortage, attack priority, SSR, LB/kind identity, repeat/order determinism, slots, owned-only, immutable inventory, save roundtrip, manual sharing' };
if (process.argv.includes('--report')) {
  fs.mkdirSync('docs/verification/auto-skills-diversity', { recursive: true });
  fs.writeFileSync('docs/verification/auto-skills-diversity/results.json', JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({ checks: report.checks, rows },null,2));
