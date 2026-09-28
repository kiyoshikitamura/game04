import catalog from './skill-vfx24.json' with { type: 'json' };
import type { Element } from '@/domain/redesign/types';

export const SKILL_VFX24 = catalog;
export type SkillVfxDefinition = typeof catalog[number];
export interface SkillVfxEvent {
  id: string;
  phase: 'strike' | 'support' | 'cleanse';
  leadIn: boolean;
  areaTargetIds: string[];
  element?: Element;
}
const bySkill = new Map(catalog.flatMap(effect=>effect.skillIds.map(id=>[id,effect] as const)));
export const skillVfxForId = (id?: string) => id ? bySkill.get(id) : undefined;
export const skillVfxById = (id: string) => catalog.find(effect=>effect.id===id)!;
export function skillVfxDuration(event: SkillVfxEvent) {
  if(event.phase==='cleanse') return 560;
  return event.leadIn ? (skillVfxById(event.id).category==='ssr'?760:620) : 420;
}
export function skillVfxAssets(event: SkillVfxEvent) {
  const effect=skillVfxById(event.id);
  return [effect.lead,effect.hit];
}
