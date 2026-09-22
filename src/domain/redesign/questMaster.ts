import data from './data/quest65.json';
import roster from '../../theme/sengoku-characters.json';
import { characterArt } from '../../theme/creativeAssets';
import type { BattleRules, BattleUnit, EnemyUnit, QuestStage, RedesignState, Reward } from './types';
import { createFormalBattleInput } from './formalBattleInput';

export const QUEST_MASTER_VERSION = data.version;
export const QUEST_STAGE_COUNTS = data.counts;
export const QUEST_ID_MAPPING = data.mapping;
export interface FormalQuestStage extends QuestStage {
  designId: string; playerExp: number; ticketChance: number;
  soulDrops: {kind: 'soul'; id: string; amount: number; chance: number; period: number; rarity: string}[];
}
// Approved combat fields remain intact. Only presentation is resolved through explicit character IDs.
export const FORMAL_QUEST_STAGES: FormalQuestStage[] = data.stages.map(source => {
  const stage = structuredClone(source) as FormalQuestStage;
  stage.waves.forEach((wave, wi) => wave.forEach((enemy, pi) => {
    const binding = data.bindings.find(row => row.stage === stage.designId && row.wave === wi + 1 && row.position === pi + 1 && row.enemyId === enemy.id);
    const character = roster.find(row => row.characterId === binding?.characterId);
    if (!binding || !character || character.name !== enemy.name) throw new Error(`敵マスター対応が不正です: ${enemy.id}`);
    enemy.image = characterArt({ id: character.characterId, name: character.name, image: character.imagePath }, 'battle') ?? character.imagePath;
  }));
  return stage;
});
export function createQuestBattleInput(seed: number, party: BattleUnit[], stage: FormalQuestStage, rules: BattleRules) {
  // Do not pass formal enemies through commonPreviewSkill/prepareBattleWaves.
  const input = createFormalBattleInput(seed, party, stage.waves as (EnemyUnit & {initialSp: number})[][], rules);
  return {...input, questSnapshot: structuredClone(stage), questMasterVersion: QUEST_MASTER_VERSION,
    playerExpReward: {amount: stage.playerExp, version: QUEST_MASTER_VERSION, status: 'APPROVED'}};
}
export function questEnergyCost(stage: QuestStage, state: Pick<RedesignState, 'clearedStages' | 'questAttempts'>): number {
  if (state.clearedStages.includes(stage.id)) return stage.energyCost;
  return (state.questAttempts?.[stage.id] ?? 0) > 0 ? 1 : 0;
}
export function questVictoryRewards(stage: FormalQuestStage, state: Pick<RedesignState, 'clearedStages' | 'questClearCounts'>, party: BattleUnit[], seed: number) {
  const firstClear = !state.clearedStages.includes(stage.id);
  const count = (state.questClearCounts?.[stage.id] ?? (firstClear ? 0 : 1)) + 1;
  const rewards: Reward[] = structuredClone([...stage.rewards, ...(firstClear ? stage.firstRewards : [])]);
  let rng = seed >>> 0;
  const random = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; };
  const luck = party.slice(0, 5).reduce((sum, member) => sum + Math.max(0, Math.min(100, member.stats.luk)), 0) / 5;
  const guaranteed: Reward[] = [];
  for (const drop of stage.soulDrops) {
    if (random() < Math.min(1, drop.chance * (1 + luck / 400))) rewards.push({kind:'soul',id:drop.id,amount:1});
    if (count % drop.period === 0) guaranteed.push({kind:'soul',id:drop.id,amount:1});
  }
  rewards.push(...guaranteed);
  if (random() < Math.min(1, stage.ticketChance * (1 + luck / 400))) {
    const roll = random();
    rewards.push({kind:'ticket',id:roll<.25?'SPECIAL_TICKET_CHARACTER':roll<.75?'SPECIAL_TICKET_SKILL':'SPECIAL_TICKET_EQUIPMENT',amount:1});
  }
  return {rewards, firstClear, count, guaranteed, encounterRoll: random()};
}
