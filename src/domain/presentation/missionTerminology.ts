import { game04WorldText } from "@/theme/world";
import { battleDisplayText } from "./battleTerminology.ts";

// マスターの達成条件・IDは保持し、表示文だけをページの呼称へ揃える。
export function missionDisplayText(value: unknown): string {
  return game04WorldText(battleDisplayText(value))
    .replace(/Raid\s+Boss\s+Clear/gi, "レイドボス撃破")
    .replace(/Raid\s+Boss/gi, "レイドボス")
    .replace(/Character/gi, "武将")
    .replace(/Equipment/gi, "装備")
    .replace(/Skill/gi, "戦技")
    .replace(/Quest/gi, "クエスト")
    .replace(/Raid/gi, "レイド")
    .replace(/Guild/gi, "同盟")
    .replace(/派遣/g, "探索");
}
