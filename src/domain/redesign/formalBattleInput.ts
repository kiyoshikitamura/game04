import type { BattleInput, BattleRules, BattleUnit, EnemyUnit } from './types.ts';
import { BALANCE_BATTLE_VERSION, WAVE_SP_INPUT_VERSION } from './battleBalanceV2.ts';

/** Formal quest rows must supply starting SP separately from stats.sp (the cap). */
export type FormalQuestEnemy = EnemyUnit & { initialSp: number };
/** New formal simulations only. Never upgrade saved inputs with this function. */
export function createFormalBattleInput(seed: number, party: BattleUnit[], waves: FormalQuestEnemy[][], rules: BattleRules): BattleInput {
    if (!rules.balanceV2?.version) throw new Error('Explicit master version required');
    if (!waves.length || waves.length > 6 || waves.some(w => !w.length || w.length > 3)) throw new Error('Invalid battle formation');
    for (const enemy of waves.flat()) {
        if (!Number.isFinite(enemy.initialSp) || enemy.initialSp < 0 || enemy.initialSp > enemy.stats.sp) throw new Error('Formal quest requires explicit initialSp within stats.sp cap');
    }
    return structuredClone({ seed, party, waves, rules: { ...rules, version: BALANCE_BATTLE_VERSION, inputVersion: WAVE_SP_INPUT_VERSION } });
}
