import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import { getFormalOwnedSkill } from '@/domain/redesign/formalOwnedSkills';
import { BACKGROUNDS, SCENES, STARTERS, STARTER_SKILLS } from '@/domain/redesign/tutorial/content';
import { characterArt } from '@/theme/creativeAssets';

// The whole short tutorial is known in advance. Decode it once before entry,
// including the practice battle, so scene changes never open a loading dialog.
const castIds = [...new Set([
  ...SCENES.flatMap(scene => 'cast' in scene ? [...scene.cast] : []),
  ...STARTERS, 'char_ageha_01', 'char_leo_01',
])];
export const TUTORIAL_ASSETS: string[] = [...new Set([
  ...Object.values(BACKGROUNDS),
  '/branding/tribe-neon-logo.png',
  ...castIds.flatMap(id => {
    const master = CHARACTER_MASTERS.find(character => character.id === id)!;
    return [characterArt(master, 'full'),
      ...(STARTERS.some(starter => starter === id) ? [characterArt(master, 'card'), characterArt(master, 'portrait')] : []),
      `/ui/raid/v2/element-${master.element}.png`];
  }),
  ...[...STARTER_SKILLS, 'SKD025'].map(id => getFormalOwnedSkill(id, 0).image),
].filter((src): src is string => !!src))];
