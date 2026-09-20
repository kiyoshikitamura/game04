import { CHARACTER_MASTERS, SKILL_MASTERS, EQUIPMENT_MASTERS } from './masters';
import type { EnemyUnit, QuestArea, QuestStage, SkillMaster } from './types';

/** Development balance. All content IDs remain stable when numeric masters are tuned. */
const AREAS = [
  ['mikawa', '三河の地', '最初の一歩', '敵の属性と行動カウントを見て、武将の並びを整えよう。'],
  ['owari', '尾張の旗', '熱き旗印', '複数の敵には全体攻撃と狙う順番が力になる。'],
  ['mino', '美濃の城', '堅城への道', '堅い守りには守備を下げる技を組み合わせよう。'],
  ['omi', '近江の湖', '湖上の盟約', '傷ついた仲間を回復し、連戦を切り抜けよう。'],
  ['kai', '甲斐の山', '風林の試練', '強い一撃に備え、守りと攻撃の順を考えよう。'],
  ['echigo', '越後の雪', '雪解けの義', '敵の回復役をどう崩すかが勝敗を分ける。'],
  ['kyoto', '京洛の影', '花と策謀', '弱体と継続ダメージを見極め、早めに決着をつけよう。'],
  ['izumo', '出雲の社', '祈りの向こう', '光と闇の相性、支援技の組み合わせを見直そう。'],
  ['satsuma', '薩摩の炎', '不屈の陣', '連戦に備えてHPとSPを残し、敵陣を突破しよう。'],
  ['sekigahara', '関ヶ原', '暁の約束', '変わりゆく敵の陣を読み、五人の力を結集しよう。'],
] as const;
const STAGE_NAMES = ['街道の先へ', '旗を掲げて', '渡りの陣', '夜明けの攻防', '崩れぬ誓い', '決戦前夜', '城門を越えて'];
function themeSkills(area: number, source: SkillMaster[]): SkillMaster[] {
  const effect = ['damage','damage','def_up','heal','atk_up','heal','poison','atk_down','def_up','damage'][area];
  const chosen = SKILL_MASTERS.find(s => s.effects.some(e => e.type === effect));
  return chosen ? [chosen, ...source.filter(s => s.id !== chosen.id)].slice(0, 2) : source.slice(0, 2);
}
function enemy(area: number, stage: number, wave: number, slot: number, boss: boolean): EnemyUnit {
  const master = CHARACTER_MASTERS[(area * 6 + stage + wave + slot) % CHARACTER_MASTERS.length];
  const rank = area * 7 + stage;
  const growth = 1 + rank * .09;
  const skills = themeSkills(area, SKILL_MASTERS.filter(s => s.element === master.element));
  return {
    id: `quest-enemy-${area + 1}-${stage + 1}-${wave + 1}-${slot + 1}`,
    name: master.name, image: master.image, element: master.element, level: 1 + rank,
    stats: { hp: Math.round((boss ? 1100 : 370) * growth), sp: boss ? 80 : 40, atk: Math.round((boss ? 100 : 55) * growth), def: Math.round((area === 2 ? 55 : 15) * growth), luk: 10 + rank },
    skills, passives: [], hitSpGain: 5, actionCount: boss ? 3 : 4 + (slot % 2), order: slot, boss,
    ...(boss ? { phases: [{ hpBelow: .45, name: '決死の陣', actionCount: 2, skills: themeSkills((area + 1) % 10, skills) }] } : {}),
  };
}
export const QUEST_AREAS: QuestArea[] = AREAS.map(([id, name, chapter, description], area) => ({
  id, index: area + 1, name, description,
  image: `/bg/sengoku/${area % 2 ? 'castle-town' : 'castle-approach'}.jpg`,
  stages: STAGE_NAMES.map((stageName, stage): QuestStage => {
    const waveCount = Math.min(5, 1 + Math.floor(stage / 2) + (area > 5 ? 1 : 0));
    return {
      id: `${id}-${stage + 1}`, areaId: id, index: stage + 1,
      name: stage === 6 ? chapter : stageName, description,
      energyCost: 3 + Math.floor(area / 2),
      waves: Array.from({ length: waveCount }, (_, wave) => {
        const boss = stage === 6 && wave === waveCount - 1;
        return Array.from({ length: boss ? 1 : Math.min(3, 1 + Math.floor(stage / 3) + (wave % 2)) }, (_, slot) => enemy(area, stage, wave, slot, boss));
      }),
      firstRewards: [{ kind: 'cash', amount: 100 + area * 30 }, { kind: 'soul', id: CHARACTER_MASTERS[(area * 6 + stage) % CHARACTER_MASTERS.length].id, amount: 2 }],
      rewards: [{ kind: 'cash', amount: 20 + area * 10 }, { kind: 'character_material', amount: 1 + Math.floor(area / 3) }, { kind: 'skill_material', amount: 1 }, { kind: 'equipment_material', amount: 1 }],
      rareRewards: [{ kind: 'soul', id: CHARACTER_MASTERS[(area * 6 + stage) % CHARACTER_MASTERS.length].id, amount: 1, chance: .08 }, { kind: 'equipment_lb', amount: 1, chance: .05 }, { kind: 'equipment', id: EQUIPMENT_MASTERS[(area * 7 + stage) % EQUIPMENT_MASTERS.length].id, amount: 1, chance: .12 }, ...(area >= 2 ? [{ kind: 'unlock_item' as const, amount: 1, chance: .04 }] : [])],
      encounterChance: .08,
    };
  }),
}));
export const QUEST_STAGES = QUEST_AREAS.flatMap(area => area.stages);
export function getQuestStage(id: string): QuestStage | undefined { return QUEST_STAGES.find(stage => stage.id === id); }
export function isQuestStageUnlocked(id: string, clearedStages: readonly string[]): boolean {
  const index = QUEST_STAGES.findIndex(stage => stage.id === id);
  return index >= 0 && (index === 0 || clearedStages.includes(QUEST_STAGES[index - 1].id));
}
export function nextQuestStage(clearedStages: readonly string[]): QuestStage {
  return QUEST_STAGES.find(stage => !clearedStages.includes(stage.id) && isQuestStageUnlocked(stage.id, clearedStages)) ?? QUEST_STAGES[QUEST_STAGES.length - 1];
}
