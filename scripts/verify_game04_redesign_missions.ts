import assert from 'node:assert/strict';
import { createInitialState } from '../src/domain/redesign/masters';
import { QUEST_AREAS } from '../src/domain/redesign/quests';
import { evaluateMissions, getClaimableMission, EMPTY_MISSION_CONFIG, type MissionConfig } from '../src/domain/redesign/missions';

const state = createInitialState('mission-fixture');
const area = QUEST_AREAS[0];
// Test-only quantities and conditions, never a release master.
const config: MissionConfig = { enabled: true, missions: [
  { id: 'fixture-stage', name: 'fixture', description: '', enabled: true, condition: { type: 'stage_clear', stageId: area.stages[0].id }, rewards: [{ kind: 'cash', amount: 1 }] },
  { id: 'fixture-area', name: 'fixture', description: '', enabled: true, condition: { type: 'area_clear', areaId: area.id }, rewards: [{ kind: 'skill_material', amount: 1 }] },
] };
assert.deepEqual(evaluateMissions(state, EMPTY_MISSION_CONFIG), []);
assert.throws(() => getClaimableMission(state, config, 'fixture-stage'));
state.clearedStages = [area.stages[0].id, area.stages[0].id];
assert.equal(evaluateMissions(state, config)[1].current, 1, 'duplicate clear must not increase progress');
assert.equal(getClaimableMission(state, config, 'fixture-stage').id, 'fixture-stage');
assert.throws(() => getClaimableMission(state, config, 'fixture-area'));
state.clearedStages = area.stages.map(stage => stage.id);
assert.equal(getClaimableMission(state, config, 'fixture-area').id, 'fixture-area');
state.claimedMissionIds = ['fixture-stage'];
assert.equal(evaluateMissions(state, config)[0].status, 'claimed');
assert.throws(() => getClaimableMission(state, config, 'fixture-stage'), 'replay not claimable');
assert.throws(() => getClaimableMission(state, config, 'unknown'));
assert.deepEqual(evaluateMissions(state, { ...config, enabled: false }), []);
assert.throws(() => evaluateMissions(state, { enabled: true, missions: [config.missions[0], config.missions[0]] }));
console.log('PASS: mission stage/area eligibility, duplicate progress, replay guard, disabled master');
