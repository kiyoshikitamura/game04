import { readFileSync, writeFileSync } from 'node:fs';
import { simulateBattle } from '../src/domain/redesign/battle.ts';
import { createFormalBattleInput } from '../src/domain/redesign/formalBattleInput.ts';

// New formal simulations only. Input files are never modified; output must be new.
const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error('Usage: node scripts/run_game04_formal_battle.mjs input.json NEW-output.json');
const raw = JSON.parse(readFileSync(inputPath, 'utf8'));
const input = createFormalBattleInput(raw.seed, raw.party, raw.waves, raw.rules);
const result = simulateBattle(input);
writeFileSync(outputPath, JSON.stringify({ input, result }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ rulesVersion: result.rulesVersion, inputVersion: result.inputVersion, masterVersion: result.masterVersion, seed: result.seed, outcome: result.outcome, wavesCleared: result.wavesCleared, playerActions: result.playerActions }));
