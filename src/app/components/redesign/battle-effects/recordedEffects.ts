import type { BattleResult } from '../../../../domain/redesign/battle';
import { projectRecordedBattleFrame } from '../../../../domain/presentation/recordedBattlePresentation';
import { resolveBattleFrameEffects } from '../battleEffectPresentation';
import { effectDuration } from './settings';
import assets from './assets.json';

export function recordedEffects(result: BattleResult, index: number) {
  const frame=result.frames[index];
  return frame?resolveBattleFrameEffects(frame,result.frames[index-1],projectRecordedBattleFrame(result,index).skill):[];
}
/** Presentation-only minimum; never mutates the recorded frames or their outcomes. */
export function minimumEffectFrameDuration(result: BattleResult,index: number) {
  const effects=recordedEffects(result,index);
  return Math.max(0,...effects.map(effect=>effectDuration(effect.family,effects.filter(other=>other.family===effect.family&&result.frames[index].party.some(u=>u.id===other.targetId)===result.frames[index].party.some(u=>u.id===effect.targetId)).length)));
}
export function effectAssetPaths(effects: ReturnType<typeof recordedEffects>) {
  return [...new Set(effects.flatMap(effect=>assets[effect.family].assets))];
}
