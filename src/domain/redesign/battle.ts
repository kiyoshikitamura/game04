import { simulateBattle as simulatePreviousBattle } from './battleCommonV1.ts';
import { simulateBalanceBattle, BALANCE_BATTLE_VERSION } from './battleBalanceV2.ts';
export { BALANCE_BATTLE_VERSION } from './battleBalanceV2.ts';
import type { BattleInput, BattleUnit, EnemyUnit, SkillMaster, SkillEffect, Element, TargetRule } from './types.ts';
import { simulateBattle as simulateLegacy, burstChance as legacyBurstChance } from './battleLegacy.ts';
export type BattleOutcome = 'win' | 'lose' | 'limit';
export interface BattleStatus {
    type: SkillEffect['type'];
    power: number;
    remaining: number;
    carry: boolean;
    sourceId?: string;
    sourceEnemy?: boolean;
    sourceSkillId?: string;
    appliedAction?: number;
    amount?: number;
    healingBonus?: number;
    sequence?: number;
}
export interface BattleUnitState {
    id: string;
    hp: number;
    maxHp: number;
    sp: number;
    maxSp: number;
    count: number;
    actions: number;
    statuses: BattleStatus[];
    phase: string | null;
    image?: string;
    stunImmune?: boolean;
    dead?: boolean;
    effectiveAtk?: number;
    effectiveDef?: number;
    skills?: SkillMaster[];
    passiveEffects?: { id: string; type?: string; percent: number; targetElement?: string; active: boolean }[];
}
export interface BattleFrame {
    index: number;
    wave: number;
    kind: 'start' | 'action' | 'enemy' | 'burst' | 'phase' | 'wave' | 'end';
    actorId?: string;
    skillId?: string;
    text: string;
    partySp: number;
    maxSp: number;
    burst: boolean;
    party: BattleUnitState[];
    enemies: BattleUnitState[];
    burstGauge?: number;
    maxBurstGauge?: number;
    playerActions?: number;
    remainingActions?: number;
    event?: string;
    targetIds?: string[];
    spDelta?: number;
    gaugeDelta?: number;
    reason?: string;
    skillStates?: Record<string, {
        skillId: string;
        status: 'ready' | 'insufficient_sp' | 'condition_unmet' | 'active';
        cost: number;
        reason?: string;
    }[]>;
    hits?: number[];
}
export interface BattleAnalysis {
    id: string;
    name: string;
    damage: number;
    healing: number;
    spGenerated: number;
    actions: number;
    skills: number;
    bursts: number;
}
export interface BattleResult {
    seed: number;
    outcome: BattleOutcome;
    totalDamage: number;
    playerActions: number;
    wavesCleared: number;
    party: BattleUnit[];
    waves: EnemyUnit[][];
    frames: BattleFrame[];
    analysis: BattleAnalysis[];
    rulesVersion?: string;
    inputVersion?: string;
    masterVersion?: string;
    reason?: string;
}
const advantage: Record<Element, Element> = { fire: 'wind', wind: 'earth', earth: 'water', water: 'fire', light: 'dark', dark: 'light' };
export function elementMultiplier(a: Element, d: Element, rules: BattleInput['rules']): number { return advantage[a] === d ? rules.advantageMultiplier : advantage[d] === a ? rules.disadvantageMultiplier : 1; }
/** Compatibility export. The v2 engine uses commonBurstChance, never this legacy formula. */
export const burstChance = legacyBurstChance;
export const COMMON_BATTLE_VERSION = 'common-v2-20260920';
export const commonBurstChance = (luk: number) => Math.min(.8, .5 + Math.max(0, Math.min(100, luk)) * .003);
export const commonSpGain = (luk: number, basic: boolean) => Math.floor((basic ? 20 : 10) * (1 + Math.max(0, Math.min(100, luk)) / 200));
export function commonDamage(atk: number, def: number, power: number, element: number, random: number): number { return Math.max(1, Math.floor((atk * power / 100 - def) * element * (.9 + random * .2))); }
/** Display-only allocation; zeros are intentional so minimum damage is never multiplied. */
export function splitDisplayDamage(total: number, hits: number): number[] { const n = Math.max(1, Math.floor(hits)); return Array.from({ length: n }, (_, i) => Math.floor(total / n) + Number(i < total % n)); }
/** Saved inputs retain the engine version they started with. */
export function simulateBattle(input: BattleInput): BattleResult {
    if (input.rules.version === BALANCE_BATTLE_VERSION) return simulateBalanceBattle(input);
    return simulatePreviousBattle(input);
}
export { simulateCommonBattle } from './battleCommonV1.ts';

