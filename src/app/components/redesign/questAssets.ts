'use client';
import { useCharacterImageReadiness } from './CharacterImageReadiness';
import artwork from '@/theme/local-characters.json';
import backgrounds from '@/theme/character-backgrounds.json';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import type { BattleUnit } from '@/domain/redesign/types';

export function partyArtwork(party: BattleUnit[]) {
  return party.flatMap(unit => {
    const art = artwork.find(entry => entry.id === unit.id);
    const background = backgrounds.find(entry => entry.characterId === unit.id)?.background;
    const rarity = CHARACTER_MASTERS.find(entry => entry.id === unit.id)?.rarity;
    return [art?.card, background, rarity ? `/creative/ui/frame-${rarity}.png` : undefined, `/creative/ui/element-${unit.element}.png`].filter((source): source is string => Boolean(source));
  });
}
export function useQuestAssets(sources: string[]) {
  return useCharacterImageReadiness(sources, 'quest');
}
