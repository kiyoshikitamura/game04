import assert from 'node:assert/strict';
import { createInitialState, CHARACTER_MASTERS } from '../src/domain/redesign/masters.ts';
import { QUEST_AREAS, QUEST_STAGES, isQuestStageUnlocked } from '../src/domain/redesign/quests.ts';
import { HOME_BACKGROUNDS, resolveHomeBackground, isHomeBackgroundUnlocked, applyHomeSelection } from '../src/domain/redesign/home.ts';

const initial = createInitialState('home-domain-fixture');
const before = structuredClone(initial);
const areaBackgrounds = HOME_BACKGROUNDS.filter(background => background.areaId);
assert.equal(areaBackgrounds.length, 10);
for (const area of QUEST_AREAS) {
  const background = areaBackgrounds.find(entry => entry.areaId === area.id);
  assert.equal(background.image, area.image, 'Home must share the existing quest image, without reassignment');
  const stageIndex = QUEST_STAGES.findIndex(stage => stage.id === area.stages[0].id);
  const cleared = QUEST_STAGES.slice(0, stageIndex).map(stage => stage.id);
  assert.equal(isHomeBackgroundUnlocked(background, cleared), isQuestStageUnlocked(area.stages[0].id, cleared));
  assert.equal(applyHomeSelection({ ...initial, clearedStages: cleared }, { backgroundId: background.id }).homeBackgroundId, background.id);
  if (stageIndex > 0) {
    assert.throws(() => applyHomeSelection(initial, { characterId: initial.characters[1].id, backgroundId: background.id }), /解放/);
    assert.equal(isHomeBackgroundUnlocked(background, cleared.slice(0, -1)), false);
  }
}
for (const id of ['bg_default', 'bg_kabukicho', 'castle-approach', 'castle-town']) {
  const saved = applyHomeSelection(initial, { characterId: initial.characters[0].id, backgroundId: id });
  assert.equal(saved.homeBackgroundId, id, 'Existing stored IDs are preserved');
  assert.equal(resolveHomeBackground(JSON.parse(JSON.stringify(saved)).homeBackgroundId).image, resolveHomeBackground(id).image);
}
const unowned = CHARACTER_MASTERS.find(character => !initial.characters.some(owned => owned.id === character.id));
assert.throws(() => applyHomeSelection(initial, { characterId: unowned.id }), /未所持/);
for (const id of ['invented', '', null, 1, {}]) assert.throws(() => applyHomeSelection(initial, { backgroundId: id }), /不正/);
assert.deepEqual(initial, before, 'Rejected and accepted drafts never mutate the supplied state');
const selected = applyHomeSelection(initial, { characterId: initial.characters[1].id, backgroundId: 'area:mikawa' });
assert.equal(selected.homeCharacterId, initial.characters[1].id);
assert.equal(selected.homeBackgroundId, 'area:mikawa');
assert.deepEqual(selected.deck, initial.deck, 'Home selection must not alter the battle deck');
assert.equal(selected.cash, initial.cash);
assert.equal(selected.energy, initial.energy);
console.log('PASS: 10 area unlock boundaries, shared quest mapping, old background IDs, atomic draft rejection, ownership, reload serialization, no battle/economy mutation. DOMAIN ONLY; live API/UI verification is separate.');
