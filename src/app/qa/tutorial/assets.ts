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
  ...['N','R'].flatMap(rarity => [`/creative/ui/frame-${rarity}.png`, `/creative/card-backgrounds/${rarity}.png`]),
  ...castIds.flatMap(id => {
    const master = CHARACTER_MASTERS.find(character => character.id === id)!;
    return [characterArt(master, 'full'),
      ...(STARTERS.some(starter => starter === id) ? [characterArt(master, 'card'), characterArt(master, 'portrait')] : []),
      `/ui/raid/v2/element-${master.element}.png`];
  }),
  ...[...STARTER_SKILLS, 'SKD025'].map(id => getFormalOwnedSkill(id, 0).image),
].filter((src): src is string => !!src))];

/** Only the current scene blocks entry. The following scene warms after display. */
export function tutorialSceneAssets(step: number): string[] {
  const scene=SCENES[step];
  if(!scene)return [];
  if('cast' in scene)return [scene.background,...scene.cast.map(id=>characterArt(CHARACTER_MASTERS.find(c=>c.id===id)!,'full'))].filter((src):src is string=>!!src);
  if(scene.id==='characters')return [BACKGROUNDS.guide,...STARTERS.flatMap(id=>{
    const c=CHARACTER_MASTERS.find(c=>c.id===id)!;
    return [characterArt(c,'card'),`/creative/card-backgrounds/${c.rarity}.png`,`/creative/ui/frame-${c.rarity}.png`,`/creative/ui/element-${c.element}.png`];
  })].filter((src):src is string=>!!src);
  if(scene.id==='skills')return [BACKGROUNDS.guide,...STARTER_SKILLS.map(id=>getFormalOwnedSkill(id,0).image)].filter((src):src is string=>!!src);
  if(scene.id==='battle')return [BACKGROUNDS.battle]; // BattleView owns its recording-specific entry gate.
  return [BACKGROUNDS.guide,characterArt(CHARACTER_MASTERS.find(c=>c.id==='char_ageha_01')!,'full')].filter((src):src is string=>!!src);
}

