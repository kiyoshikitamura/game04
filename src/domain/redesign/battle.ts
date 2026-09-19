import type { BattleInput, BattleUnit, EnemyUnit, SkillMaster, SkillEffect, Element, Stats } from './types.ts';

export type BattleOutcome = 'win' | 'lose' | 'limit';
export interface BattleStatus { type: SkillEffect['type']; power: number; remaining: number; carry: boolean; sourceId?: string; sourceEnemy?: boolean; }
export interface BattleUnitState { id: string; hp: number; maxHp: number; sp: number; maxSp: number; count: number; actions: number; statuses: BattleStatus[]; phase: string | null; image?: string; }
export interface BattleFrame { index: number; wave: number; kind: 'start' | 'action' | 'enemy' | 'burst' | 'phase' | 'wave' | 'end'; actorId?: string; skillId?: string; text: string; partySp: number; maxSp: number; burst: boolean; party: BattleUnitState[]; enemies: BattleUnitState[]; }
export interface BattleAnalysis { id: string; name: string; damage: number; healing: number; spGenerated: number; actions: number; skills: number; bursts: number; }
export interface BattleResult { seed: number; outcome: BattleOutcome; totalDamage: number; playerActions: number; wavesCleared: number; party: BattleUnit[]; waves: EnemyUnit[][]; frames: BattleFrame[]; analysis: BattleAnalysis[]; }
interface RuntimeUnit extends BattleUnit { hp: number; sp: number; count: number; resetCount: number; order: number; enemy: boolean; actions: number; statuses: BattleStatus[]; appliedPhases: number[]; phase: string | null; phases?: EnemyUnit['phases']; deathHandled: boolean; }
const advantage: Record<Element, Element> = { fire: 'wind', wind: 'earth', earth: 'water', water: 'fire', light: 'dark', dark: 'light' };
export function elementMultiplier(attack: Element, defend: Element, rules: BattleInput['rules']): number {
  if (advantage[attack] === defend) return rules.advantageMultiplier;
  if (advantage[defend] === attack) return rules.disadvantageMultiplier;
  return 1;
}
export function burstChance(level: number, luk: number, divisor: number): number { return Math.min(80, Math.max(0, level / 2 + luk / Math.max(1, divisor))) / 100; }

/** Pure seeded server authority. Presentation never resolves damage or grants rewards. */
export function simulateBattle(input: BattleInput): BattleResult {
  if (input.party.length !== 5 || input.waves.length < 1 || input.waves.length > 5 || input.waves.some(w => w.length < 1 || w.length > 3)) throw new Error('Battle requires five party members and 1–5 waves of 1–3 enemies');
  if (new Set(input.party.map(p => p.id)).size !== 5) throw new Error('Duplicate party member');
  const rules = input.rules;
  for (const n of [rules.spRecoveryDivisor, rules.enemySpRecoveryDivisor, rules.burstLukDivisor, rules.maxPlayerActions]) if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid battle rules');
  let seed = input.seed >>> 0;
  const random = () => { seed += 0x6D2B79F5; let t = seed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const makeUnit = (u: BattleUnit, enemy: boolean): RuntimeUnit => {
    const e = u as EnemyUnit;
    return { ...u, stats: { ...u.stats }, skills: [...u.skills], hp: u.stats.hp, sp: enemy ? u.stats.sp : 0, count: enemy ? Math.max(1, e.actionCount) : 0, resetCount: enemy ? Math.max(1, e.actionCount) : 0, order: e.order ?? 0, enemy, actions: 0, statuses: [], appliedPhases: [], phase: null, phases: e.phases, deathHandled: false };
  };
  const party = input.party.map(u => makeUnit(u, false));
  // All passives are applied once and same-stat bonuses add before multiplication.
  const applyPassives = (units: RuntimeUnit[]) => {
    for (const target of units) {
      const sums: Partial<Stats> = {};
      for (const owner of units) for (const passive of owner.passives) if (passive.target === 'party' || owner.id === target.id) sums[passive.stat] = (sums[passive.stat] ?? 0) + passive.percent;
      for (const key of Object.keys(sums) as (keyof Stats)[]) target.stats[key] = Math.max(1, Math.round(target.stats[key] * (1 + (sums[key] ?? 0) / 100)));
      target.hp = target.stats.hp;
      if (target.enemy) target.sp = target.stats.sp;
    }
  };
  applyPassives(party);
  const maxSp = party.reduce((sum, u) => sum + u.stats.sp, 0);
  let partySp = Math.max(0, Math.min(maxSp, Math.round(maxSp * rules.initialSpRatio)));
  let wave = 0, playerActions = 0, totalDamage = 0, wavesCleared = 0, burst = false;
  let enemies: RuntimeUnit[] = input.waves[0].map(u => makeUnit(u, true));
  applyPassives(enemies);
  const frames: BattleFrame[] = [];
  const analysis = party.map(u => ({ id: u.id, name: u.name, damage: 0, healing: 0, spGenerated: 0, actions: 0, skills: 0, bursts: 0 }));
  const snapshot = (u: RuntimeUnit): BattleUnitState => ({ id: u.id, hp: u.hp, maxHp: u.stats.hp, sp: u.sp, maxSp: u.stats.sp, count: u.count, actions: u.actions, statuses: u.statuses.map(s => ({ ...s })), phase: u.phase, image: u.image });
  const frame = (kind: BattleFrame['kind'], text: string, actorId?: string, skillId?: string) => frames.push({ index: frames.length, wave: wave + 1, kind, text, actorId, skillId, partySp, maxSp, burst, party: party.map(snapshot), enemies: enemies.map(snapshot) });
  const side = (u: RuntimeUnit) => u.enemy ? enemies : party;
  const opposite = (u: RuntimeUnit) => u.enemy ? party : enemies;
  const stat = (u: RuntimeUnit, key: 'atk' | 'def') => Math.max(1, u.stats[key] * (1 + u.statuses.reduce((v, s) => v + (s.type === `${key}_up` ? s.power / 100 : s.type === `${key}_down` ? -s.power / 100 : 0), 0)));
  const condition = (u: RuntimeUnit, skill: SkillMaster): boolean => {
    const value = skill.condition.value ?? 0.5;
    switch (skill.condition.type) {
      case 'hp_below': return u.hp / u.stats.hp <= value;
      case 'ally_hp_below': return side(u).some(t => t.hp > 0 && t.hp / t.stats.hp <= value);
      case 'ally_dead': return side(u).some(t => t.hp <= 0);
      case 'enemy_count': return opposite(u).filter(t => t.hp > 0).length >= value;
      case 'every_n_actions': return (u.actions + 1) % Math.max(1, value) === 0;
      default: return true;
    }
  };
  const choose = (u: RuntimeUnit, sp: number, discount = 1) => u.skills.map((skill, slot) => ({ skill, slot })).filter(({ skill }) => skill.spCost > 0 && condition(u, skill) && Math.ceil(skill.spCost * discount) <= sp).sort((a, b) => b.skill.spCost - a.skill.spCost || a.slot - b.slot)[0]?.skill;
  const targets = (u: RuntimeUnit, skill: SkillMaster): RuntimeUnit[] => {
    const allies = side(u).filter(t => t.hp > 0), foes = opposite(u).filter(t => t.hp > 0);
    switch (skill.target) {
      case 'self': return [u];
      case 'dead_ally': return side(u).filter(t => t.hp <= 0).slice(0, 1);
      case 'all_allies': return allies;
      case 'lowest_ally': return allies.sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp).slice(0, 1);
      case 'all_enemies': return foes;
      case 'lowest_hp': return foes.sort((a, b) => a.hp / a.stats.hp - b.hp / b.stats.hp).slice(0, 1);
      case 'highest_hp': return foes.sort((a, b) => b.hp - a.hp).slice(0, 1);
      case 'random': return foes.length ? [foes[Math.floor(random() * foes.length)]] : [];
      default: return foes.slice(0, 1);
    }
  };
  const basic = (u: RuntimeUnit): SkillMaster => ({ id: 'basic', name: '通常攻撃', image: '', rarity: 'N', element: u.element, spCost: 0, condition: { type: 'always' }, target: 'first', effects: [{ type: 'damage', power: 100 }], description: '前方の敵へ通常攻撃' });
  const effect = (u: RuntimeUnit, t: RuntimeUnit, e: SkillEffect, element: Element): { achievement: number; text: string } => {
    const a = analysis.find(x => x.id === u.id);
    if (e.type === 'damage') {
      if (t.hp <= 0) return { achievement: 0, text: '' };
      const mult = elementMultiplier(element, t.element, rules);
      const damage = Math.max(1, Math.round((stat(u, 'atk') * e.power / 100 - stat(t, 'def') * rules.defenseFactor) * mult));
      const actual = Math.min(t.hp, damage); t.hp -= actual;
      if (!u.enemy && t.enemy) { totalDamage += damage; if (a) a.damage += damage; }
      if (t.enemy) t.sp = t.hp > 0 ? Math.min(t.stats.sp, t.sp + Math.floor(actual / rules.enemySpRecoveryDivisor)) : 0;
      return { achievement: actual, text: `${t.name} −${damage}${mult > 1 ? ' WEAK' : mult < 1 ? ' RESIST' : ''}` };
    }
    if (e.type === 'heal' || e.type === 'revive') {
      if (e.type === 'heal' && t.hp <= 0 || e.type === 'revive' && t.hp > 0) return { achievement: 0, text: '' };
      const amount = Math.min(t.stats.hp - t.hp, Math.max(1, Math.round(e.type === 'revive' ? t.stats.hp * e.power / 100 : u.stats.atk * e.power / 100)));
      t.hp += amount; t.deathHandled = false;
      if (e.type === 'revive' && t.enemy) { t.count = t.resetCount; t.sp = 0; }
      if (a) a.healing += amount;
      return { achievement: amount, text: `${t.name} ${e.type === 'revive' ? '蘇生' : '回復'} +${amount}` };
    }
    if (e.type === 'sp') {
      if (t.enemy) t.sp = Math.max(0, Math.min(t.stats.sp, t.sp + e.power));
      else partySp = Math.max(0, Math.min(maxSp, partySp + e.power));
      return { achievement: Math.max(0, e.power), text: `SP ${e.power >= 0 ? '+' : ''}${e.power}` };
    }
    if (t.hp > 0) t.statuses.push({ type: e.type, power: e.power, remaining: Math.max(1, e.duration ?? 3), carry: e.carryAcrossWaves ?? false, sourceId: u.id, sourceEnemy: u.enemy });
    return { achievement: Math.abs(e.power), text: `${t.name} ${e.type === 'poison' ? '毒' : e.type === 'atk_up' ? '攻撃上昇' : e.type === 'def_up' ? '防御上昇' : e.type === 'atk_down' ? '攻撃低下' : '防御低下'}` };
  };
  const handleDeaths = () => {
    // Bounded only against malformed cyclic death-effect masters.
    for (let chain = 0; chain < 30; chain++) {
      const dead = [...party, ...enemies].find(t => t.hp <= 0 && !t.deathHandled);
      if (!dead) break;
      dead.deathHandled = true; dead.sp = 0; dead.count = 0;
      for (const e of dead.deathEffects ?? []) {
        const list = e.type === 'revive' ? [dead] : ['damage', 'poison', 'atk_down', 'def_down'].includes(e.type) ? opposite(dead) : side(dead);
        for (const t of list) effect(dead, t, e, dead.element);
      }
    }
  };
  const phases = () => {
    for (const u of enemies) if (u.hp > 0) u.phases?.forEach((phase, i) => {
      if (!u.appliedPhases.includes(i) && u.hp / u.stats.hp <= phase.hpBelow) {
        u.appliedPhases.push(i); u.phase = phase.name;
        if (phase.image) u.image = phase.image;
        if (phase.skills) u.skills = phase.skills;
        if (phase.actionCount) { u.resetCount = phase.actionCount; u.count = Math.min(u.count, phase.actionCount); }
        frame('phase', `${u.name}：${phase.name}`, u.id);
      }
    });
  };
  const act = (u: RuntimeUnit, skill: SkillMaster, discount = 1) => {
    const cost = Math.ceil(skill.spCost * discount);
    if (u.enemy) u.sp -= cost; else partySp -= cost;
    const spentSp = partySp;
    let achievement = 0;
    const texts: string[] = [];
    for (const t of targets(u, skill)) for (const e of skill.effects) { const applied = effect(u, t, e, skill.element); achievement += applied.achievement; if (applied.text) texts.push(applied.text); }
    if (!u.enemy) {
      const gained = Math.max(0, Math.floor(achievement * u.stats.luk / rules.spRecoveryDivisor));
      const before = partySp; partySp = Math.min(maxSp, partySp + gained);
      const a = analysis.find(x => x.id === u.id)!; a.actions++; a.skills += Number(skill.id !== 'basic'); a.spGenerated += partySp - before;
      texts.push(`SP +${partySp - before}`); playerActions++;
    }
    u.actions++;
    for (const s of u.statuses) if (s.type === 'poison' && u.hp > 0) {
      const damage = Math.max(1, Math.round(u.stats.hp * s.power / 100));
      u.hp = Math.max(0, u.hp - damage);
      if (u.enemy && s.sourceEnemy === false) {
        totalDamage += damage;
        const source = analysis.find(a => a.id === s.sourceId);
        if (source) source.damage += damage;
      }
      texts.push(`${u.name} 毒 −${damage}`);
    }
    u.statuses = u.statuses.map(s => ({ ...s, remaining: s.remaining - 1 })).filter(s => s.remaining > 0);
    handleDeaths(); phases();
    frame(u.enemy ? 'enemy' : 'action', `${u.name} · ${skill.name}　${texts.join(' / ')}`, u.id, skill.id);
    return spentSp < maxSp && partySp >= maxSp;
  };
  const enemyInterrupts = () => {
    for (const u of enemies) if (u.hp > 0) u.count--;
    const last = frames[frames.length - 1];
    if (last?.kind === 'action') last.enemies = enemies.map(snapshot);
    for (const u of [...enemies].sort((a, b) => a.order - b.order)) {
      if (u.hp <= 0 || u.count > 0 || !party.some(t => t.hp > 0)) continue;
      frame('enemy', `${u.name}：Enemy Action`, u.id);
      let skill = choose(u, u.sp);
      if (!skill) act(u, basic(u));
      // Positive SP costs make the sequence naturally finite. Guard prevents bad SP-generating masters looping.
      let guard = 0;
      while (skill && u.hp > 0 && party.some(t => t.hp > 0) && guard++ < 100) { act(u, skill); skill = choose(u, u.sp); }
      u.count = u.hp > 0 ? u.resetCount : 0;
      frame('enemy', `${u.name}：次の行動まで ${u.count}`, u.id);
    }
  };
  frame('start', '全武将のパッシブが発動。合戦開始');
  let cursor = 0;
  while (party.some(u => u.hp > 0) && playerActions < rules.maxPlayerActions) {
    if (enemies.every(u => u.hp <= 0)) {
      wavesCleared++;
      if (wave + 1 >= input.waves.length) break;
      wave++; enemies = input.waves[wave].map(u => makeUnit(u, true)); applyPassives(enemies);
      for (const u of party) u.statuses = u.statuses.filter(s => s.carry);
      frame('wave', `WAVE ${wave + 1}：HP・SPを引き継いで進軍`);
    }
    const u = party[cursor % 5]; cursor++;
    if (u.hp <= 0) continue;
    const reachedFull = act(u, choose(u, partySp) ?? basic(u));
    if (reachedFull && u.hp > 0 && enemies.some(e => e.hp > 0) && random() < burstChance(u.level, u.stats.luk, rules.burstLukDivisor)) {
      burst = true; analysis.find(a => a.id === u.id)!.bursts++; frame('burst', `${u.name} BURST！ 消費SP 50%`, u.id);
    }
    enemyInterrupts();
    if (burst) {
      for (let n = 0; n < 5 && partySp > 0 && u.hp > 0 && enemies.some(e => e.hp > 0) && playerActions < rules.maxPlayerActions; n++) {
        const skill = choose(u, partySp, 0.5); if (!skill) break;
        act(u, skill, 0.5); enemyInterrupts();
      }
      burst = false; frame('burst', 'BURST終了。編成順の行動へ戻る');
    }
  }
  if (enemies.every(u => u.hp <= 0) && wavesCleared <= wave) wavesCleared++;
  const outcome: BattleOutcome = !party.some(u => u.hp > 0) ? 'lose' : wavesCleared === input.waves.length ? 'win' : 'limit';
  frame('end', outcome === 'win' ? '勝利' : outcome === 'lose' ? '敗北' : '決着に至らず撤退');
  return { seed: input.seed, outcome, totalDamage, playerActions, wavesCleared, party: input.party, waves: input.waves, frames, analysis };
}
