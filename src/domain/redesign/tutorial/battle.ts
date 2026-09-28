import { buildBattleParty, CHARACTER_MASTERS } from '../masters';
import { getFormalOwnedSkill } from '../formalOwnedSkills';
import type { BattleFrame, BattleResult, BattleUnitState } from '../battle';
import type { BattleUnit, EnemyUnit, RedesignState } from '../types';
import { TUTORIAL_VERSION } from './content';

/** Authored tutorial recording; the shared simulator and quest 1-1 remain unchanged. */
export function createTutorialBattle(game: RedesignState): BattleResult {
  const party = buildBattleParty(game);
  const master = CHARACTER_MASTERS.find(c => c.id === 'char_leo_01')!;
  const enemy: EnemyUnit = { ...master, level: 1, stats: { hp: 50, sp: 200, atk: 1, def: 0, luk: 0 },
    skills: [getFormalOwnedSkill('SKD025', 0)], passives: [], actionCount: 3, order: 0, boss: true };
  const snapshot = (unit: BattleUnit): BattleUnitState => ({ id: unit.id, hp: unit.stats.hp, maxHp: unit.stats.hp,
    sp: 0, maxSp: unit.stats.sp, count: 3, actions: 0, statuses: [], phase: null, skills: unit.skills });
  const allies = party.map(snapshot), enemies = [snapshot(enemy)];
  const frames: BattleFrame[] = [];
  let sp = 0, gauge = 0, burst = false, actions = 0;
  function emit(kind: BattleFrame['kind'], event: string, text: string, extra: Partial<BattleFrame> = {}) {
    frames.push({ index: frames.length, wave: 1, kind, event, text, partySp: sp, maxSp: 75,
      burst, burstGauge: gauge, maxBurstGauge: 75, playerActions: actions, remainingActions: 300 - actions,
      skillStates: Object.fromEntries(party.map(unit => [unit.id, unit.skills.map(skill => ({
        skillId: skill.id, cost: burst ? 0 : skill.spCost,
        status: event === 'action_start' && extra.actorId === unit.id && extra.skillId === skill.id ? 'active' as const
          : !burst && sp < skill.spCost ? 'insufficient_sp' as const
          : skill.condition.type === 'ally_hp_below' && !allies.some(ally => ally.hp / ally.maxHp * 100 < (skill.condition.value ?? 50)) ? 'condition_unmet' as const
          : 'ready' as const,
      }))])),
      party: structuredClone(allies), enemies: structuredClone(enemies), ...extra });
  }
  emit('start', 'battle_start', '模擬戦 — 伊達政宗');
  party.forEach((unit, i) => {
    const extra = { actorId: unit.id, skillId: 'BASIC_ATTACK', targetIds: [enemy.id] };
    actions++; allies[i].actions++;
    emit('action', 'action_start', `${unit.name}の攻撃`, extra);
    enemies[0].hp--; enemies[0].count--; sp += 25; gauge += 25;
    emit('action', 'damage', '1ダメージ', { ...extra, hits: [1], spDelta: 25 });
    emit('action', 'action_end', 'SPが貯まっていく', extra);
  });
  const aoe = { actorId: enemy.id, skillId: 'SKD025', targetIds: party.map(u => u.id) };
  emit('enemy', 'action_start', '伊達政宗の紅蓮の大計', aoe);
  allies.forEach(unit => { unit.hp = Math.max(1, unit.hp - 50); });
  enemies[0].actions++; enemies[0].count = 3;
  emit('enemy', 'damage', '味方全員に50ダメージ', aoe);
  emit('enemy', 'action_end', '伊達政宗の攻撃が終わった', aoe);
  burst = true; gauge = 0;
  emit('burst', 'burst_start', '北条氏康 — バースト！', { actorId: party[0].id });
  for (let i = 0; i < 3; i++) {
    actions++; allies[0].actions++;
    const extra = { actorId: party[0].id, skillId: 'SKD003', targetIds: [enemy.id] };
    emit('action', 'action_start', `土割り ${i + 1}回目`, extra);
    enemies[0].hp = Math.max(0, enemies[0].hp - 20);
    emit('action', 'damage', '20ダメージ', { ...extra, hits: [20], spDelta: 0 });
    emit('action', 'action_end', '土割り', extra);
  }
  emit('enemy', 'death', '伊達政宗を倒した！', { actorId: enemy.id, targetIds: [enemy.id] });
  burst = false;
  emit('end', 'battle_end', '模擬戦に勝利！', { reason: 'final_wave_defeated' });
  return { seed: 0, outcome: 'win', totalDamage: 63, actualHpDamage: 50, playerActions: actions, wavesCleared: 1,
    party, waves: [[enemy]], frames, rulesVersion: TUTORIAL_VERSION, burstPolicy: 'attack-free-v1-20260926',
    analysis: party.map((unit, i) => ({ id: unit.id, name: unit.name, damage: i === 0 ? 61 : 1,
      healing: 0, spGenerated: 25, actions: i === 0 ? 4 : 1, skills: i === 0 ? 3 : 0, bursts: i === 0 ? 1 : 0 })) };
}

