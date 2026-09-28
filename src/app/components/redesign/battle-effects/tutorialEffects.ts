import type { BattleResult } from '@/domain/redesign/battle';
import { projectRecordedBattleFrame } from '@/domain/presentation/recordedBattlePresentation';
import { burstPresentation } from '@/domain/presentation/battleLeadIn';
import { minimumEffectFrameDuration } from './recordedEffects';
import ssrCutins from './tutorial-cutins.json';
import srCutins from './sr-cutins.json';
import characters from '@/theme/local-characters.json';

export const TUTORIAL_CUTIN_MS = 800;
const cutins = { ...ssrCutins, ...srCutins };
/** Match enemy instance IDs through the existing explicit name + image catalog. */
export function resolveSkillCutin(actor: { id: string; name: string; image: string }, stateImage?: string) {
  const image = stateImage || actor.image;
  const known = characters.find(character => character.id === actor.id);
  const imageMatches = (character: typeof characters[number]) => Object.entries(character).some(([key, value]) => !['id', 'name'].includes(key) && value === image);
  // A transformed/unknown phase image must not inherit an unrelated base cutin.
  const character = known
    ? (!stateImage || stateImage === actor.image || imageMatches(known) ? known : undefined)
    : characters.find(candidate => candidate.name === actor.name && imageMatches(candidate));
  return character ? cutins[character.id as keyof typeof cutins] : undefined;
}
export function tutorialCutin(result: BattleResult, index: number) {
  const presentation = projectRecordedBattleFrame(result, index);
  if (presentation.cutIn !== 'skill' || !presentation.actor) return undefined;
  return resolveSkillCutin(presentation.actor, presentation.actorState?.image);
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
