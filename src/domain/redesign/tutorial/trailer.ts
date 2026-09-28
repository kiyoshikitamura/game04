import { CHARACTER_MASTERS, FORMAL_SKILL_MASTERS, getCharacterStats } from '../masters';
import type { BattleFrame, BattleResult, BattleUnitState } from '../battle';
import type { BattleUnit, EnemyUnit, SkillMaster } from '../types';

export const TUTORIAL_TRAILER_VERSION = 'tutorial-trailer-feasibility-20260928';

const PARTY_IDS = ['char_ageha_01', 'char_karen_01', 'char_leo_01', 'char_koharu_01', 'char_go_01'] as const;
const ODA_ID = 'char_reiji_01';

function requireCharacter(id: string) {
  const master = CHARACTER_MASTERS.find(character => character.id === id);
  if (!master) throw new Error(`Trailer character not found: ${id}`);
  return master;
}

function trailerSkills(): SkillMaster[] {
  const skills = FORMAL_SKILL_MASTERS.filter(skill => skill.rarity === 'SSR' && skill.effects.some(effect => effect.type === 'damage')).slice(0, 3);
  if (skills.length !== 3) throw new Error('Trailer requires three formal SSR damage skills.');
  return skills.map(skill => structuredClone(skill));
}

function trailerUnit(id: string, skills: SkillMaster[]): BattleUnit {
  const master = requireCharacter(id);
  return {
    id: master.id,
    name: master.name,
    image: master.image,
    level: 100,
    element: master.element,
    stats: getCharacterStats(master, 100, 5),
    skills: skills.map(skill => structuredClone(skill)),
    passives: [],
  };
}

function snapshot(unit: BattleUnit, count = 3): BattleUnitState {
  return {
    id: unit.id,
    hp: unit.stats.hp,
    maxHp: unit.stats.hp,
    sp: 0,
    maxSp: unit.stats.sp,
    count,
    actions: 0,
    statuses: [],
    phase: null,
    skills: unit.skills,
  };
}

/**
 * Opening battle trailer proof.
 * This is an authored replay only: it does not call the simulator, settle rewards,
 * grant ownership, or mutate tutorial/player state.
 */
export function createTutorialTrailerBattle(): BattleResult {
  const ssrSkills = trailerSkills();
  const party = PARTY_IDS.map(id => trailerUnit(id, ssrSkills));

  const odaMaster = requireCharacter(ODA_ID);
  const odaSkill = structuredClone(ssrSkills[0]);
  odaSkill.target = 'all_enemies';
  const oda: EnemyUnit = {
    ...trailerUnit(ODA_ID, [odaSkill]),
    name: '魔王・織田信長',
    level: 100,
    stats: { ...getCharacterStats(odaMaster, 100, 5), hp: 999999, sp: 400 },
    actionCount: 99,
    order: 0,
    boss: true,
  };

  const allies = party.map(unit => snapshot(unit));
  const enemies = [snapshot(oda, 99)];
  const frames: BattleFrame[] = [];
  let sp = 400;
  let gauge = 200;
  let burst = false;
  let actions = 0;

  function emit(kind: BattleFrame['kind'], event: string, text: string, extra: Partial<BattleFrame> = {}) {
    frames.push({
      index: frames.length,
      wave: 1,
      kind,
      event,
      text,
      partySp: sp,
      maxSp: 400,
      burst,
      burstGauge: gauge,
      maxBurstGauge: 200,
      playerActions: actions,
      remainingActions: 300 - actions,
      skillStates: Object.fromEntries(party.map(unit => [unit.id, unit.skills.map(skill => ({
        skillId: skill.id,
        cost: burst ? Math.ceil(skill.spCost / 2) : skill.spCost,
        status: event === 'action_start' && extra.actorId === unit.id && extra.skillId === skill.id ? 'active' as const : 'ready' as const,
      }))])),
      party: structuredClone(allies),
      enemies: structuredClone(enemies),
      ...extra,
    });
  }

  emit('start', 'battle_start', '魔王・織田信長 Lv.100');

  party.forEach((unit, index) => {
    const skill = unit.skills[index % unit.skills.length];
    const extra = { actorId: unit.id, skillId: skill.id, targetIds: [oda.id] };
    actions++;
    allies[index].actions++;
    emit('action', 'action_start', `${unit.name} — ${skill.name}`, extra);
    enemies[0].hp -= 1;
    emit('action', 'damage', '1ダメージ', { ...extra, hits: [1] });
    emit('action', 'action_end', skill.name, extra);
  });

  const toyotomi = party[0];
  burst = true;
  gauge = 0;
  emit('burst', 'burst_start', `${toyotomi.name} — バースト！`, { actorId: toyotomi.id });

  toyotomi.skills.forEach((skill, index) => {
    const extra = { actorId: toyotomi.id, skillId: skill.id, targetIds: [oda.id] };
    actions++;
    allies[0].actions++;
    emit('action', 'action_start', `${skill.name} ${index + 1}/3`, extra);
    enemies[0].hp -= 1;
    emit('action', 'damage', '1ダメージ', { ...extra, hits: [1] });
    emit('action', 'action_end', skill.name, extra);
  });

  burst = false;
  const finisher = { actorId: oda.id, skillId: odaSkill.id, targetIds: party.map(unit => unit.id) };
  emit('enemy', 'action_start', `魔王・織田信長 — ${odaSkill.name}`, finisher);
  allies.forEach(state => { state.hp = 0; state.dead = true; });
  emit('enemy', 'damage', '織田信長の全体攻撃', finisher);
  party.forEach(unit => emit('enemy', 'death', `${unit.name} 戦闘不能`, { actorId: oda.id, targetIds: [unit.id] }));
  emit('end', 'battle_end', '敗北', { reason: 'party_defeated' });

  return {
    seed: 0,
    outcome: 'lose',
    totalDamage: 8,
    actualHpDamage: 8,
    playerActions: actions,
    wavesCleared: 0,
    party,
    waves: [[oda]],
    frames,
    rulesVersion: TUTORIAL_TRAILER_VERSION,
    burstPolicy: 'attack-free-enemy-pause-v2-20260927',
    reason: 'party_defeated',
    analysis: party.map((unit, index) => ({
      id: unit.id,
      name: unit.name,
      damage: index === 0 ? 4 : 1,
      healing: 0,
      spGenerated: 0,
      actions: index === 0 ? 4 : 1,
      skills: index === 0 ? 4 : 1,
      bursts: index === 0 ? 1 : 0,
    })),
  };
}
