import rows from './data/raid-skill-values.json';
import definitions from './data/balance-v2.json';
import { getFormalRaidSkill } from './raidFormalSkills';
import type { SkillMaster } from './types';

/** Numeric authority only. Names/art remain an explicit creative acceptance dependency.
 * Design IDs are independent of legacy ownership IDs; no positional migration. */
export const FORMAL_SKILL_IDS = definitions.skills.map(skill => skill.designId);
export const isFormalSkillId = (id: string) => FORMAL_SKILL_IDS.includes(id);
export function getFormalOwnedSkill(id: string, lb: number): SkillMaster {
  return getFormalRaidSkill(id, lb);
}
export const FORMAL_SKILL_MASTERS = FORMAL_SKILL_IDS.map(id => getFormalOwnedSkill(id, 0));
export function formalSkillPerformance(id: string, lb: number): string | null {
  const row = rows.find(row => row.design_id === id && row.lb === lb);
  return row ? `${row.performance_text}／消費SP ${row.sp}` : null;
}
export const FORMAL_SKILL_CREATIVE_STATUS = FORMAL_SKILL_IDS.map(id => ({
  id, nameStatus: 'approval_pending', imageStatus: 'missing', legacyId: null,
}));
