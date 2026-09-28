import type { BattleResult } from '@/domain/redesign/battle';
import { projectRecordedBattleFrame } from '@/domain/presentation/recordedBattlePresentation';
import { burstPresentation } from '@/domain/presentation/battleLeadIn';
import { minimumEffectFrameDuration } from './recordedEffects';
import cutins from './tutorial-cutins.json';

export const TUTORIAL_CUTIN_MS = 3200;
export function tutorialCutin(result: BattleResult, index: number) {
  const presentation = projectRecordedBattleFrame(result, index);
  if (presentation.cutIn !== 'skill' || !presentation.actor) return undefined;
  // Stable explicit IDs only: never guess from an enemy's display name or rarity.
  return cutins[presentation.actor.id as keyof typeof cutins];
}
export const tutorialComboAsset = (count: number) => `/battle-effects/tutorial-opening/combo-${count}.png`;
export function tutorialEffectAssets(result: BattleResult) {
  return [...new Set(result.frames.flatMap((frame, index) => {
    const cutin = tutorialCutin(result, index);
    const count = frame.event === 'action_start' ? burstPresentation(result, index).count : 0;
    return [...(cutin ? [cutin.src] : []), ...(count > 0 ? [tutorialComboAsset(count)] : [])];
  }))];
}
export function minimumTutorialEffectDuration(result: BattleResult, index: number) {
  return Math.max(minimumEffectFrameDuration(result, index), tutorialCutin(result, index) ? TUTORIAL_CUTIN_MS : 0);
}
