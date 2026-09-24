const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, name) => module._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, name);
const masters = require('../src/domain/redesign/masters.ts');
const growth = require('../src/domain/redesign/growth.ts');
const state = masters.createInitialState('g2-auto-equip-compat');
// Imported/retained assets may not have a current master. They must survive,
// but cannot invalidate the complete automatically generated deck.
state.skills.unshift({ id: 'retained-unknown-skill', level: 10 });
state.skills.push({ id: 'SKD071', level: 1 });
state.equipment.unshift({ instanceId: 'retained-unknown-equipment', masterId: 'retained-unknown-master', level: 100, lb: 10 });
const original = structuredClone(state);
const skillDeck = growth.autoEquipSkills(state);
assert.ok(skillDeck.every(member => !member.skillIds.includes('retained-unknown-skill')));
assert.ok(skillDeck.every(member => member.skillIds.includes('SKD071')), 'formal skills remain selectable and shareable');
growth.validateDeck(state, skillDeck);
const equipmentDeck = growth.autoEquipEquipment(state);
assert.ok(equipmentDeck.every(member => !Object.values(member.equipment).includes('retained-unknown-equipment')));
growth.validateDeck(state, equipmentDeck);
assert.equal(new Set(equipmentDeck.flatMap(member => Object.values(member.equipment))).size,
  equipmentDeck.flatMap(member => Object.values(member.equipment)).length, 'equipment instances are not duplicated');
assert.deepEqual(state, original, 'automatic selection never deletes or rewrites retained inventory');
const saved = growth.applyGrowthAction(state, 'save_deck', { deck: skillDeck });
assert.deepEqual(saved.skills, original.skills);
assert.deepEqual(saved.equipment, original.equipment);
// An all-unknown inventory still produces valid empty slots and preserves assets.
const unknownOnly = { ...state, skills: [state.skills[0]], equipment: [state.equipment[0]],
  deck: state.deck.map(member => ({ ...member, skillIds: [], equipment: {} })) };
const emptySkills = growth.autoEquipSkills(unknownOnly);
const emptyEquipment = growth.autoEquipEquipment(unknownOnly);
assert.ok(emptySkills.every(member => member.skillIds.length === 0));
assert.ok(emptyEquipment.every(member => Object.keys(member.equipment).length === 0));
growth.validateDeck(unknownOnly, emptySkills);
growth.validateDeck(unknownOnly, emptyEquipment);
console.log('PASS unknown retained assets excluded from automatic selection; formal sharing, unique equipment, valid save, inventory preservation, empty slots');
