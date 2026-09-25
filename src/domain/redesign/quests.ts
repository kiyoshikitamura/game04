import { FORMAL_QUEST_STAGES } from './questMaster';
import type { QuestArea } from './types';
import { QUEST_BACKGROUND_PATHS } from './approvedBackgrounds';
export { questEnergyCost } from './questMaster';
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

export const QUEST_AREAS: QuestArea[] = AREAS.map(([id, name, , description], area) => ({id,index:area+1,name,description,image:QUEST_BACKGROUND_PATHS[id],stages:FORMAL_QUEST_STAGES.filter(stage=>stage.areaId===id)}));
export const QUEST_STAGES = FORMAL_QUEST_STAGES;
export function getQuestStage(id:string) { return QUEST_STAGES.find(stage=>stage.id===id); }
export function isQuestStageUnlocked(id:string, clearedStages:readonly string[]):boolean {
 const index=QUEST_STAGES.findIndex(stage=>stage.id===id);
 return index>=0 && (index===0 || clearedStages.includes(id) || clearedStages.includes(QUEST_STAGES[index-1].id));
}
export function nextQuestStage(clearedStages:readonly string[]) {return QUEST_STAGES.find(stage=>!clearedStages.includes(stage.id)&&isQuestStageUnlocked(stage.id,clearedStages))??QUEST_STAGES[QUEST_STAGES.length-1];}
