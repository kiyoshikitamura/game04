'use client';
import { useEffect, useState } from 'react';
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
  const key = [...new Set(sources)].sort().join('\n');
  const [result, setResult] = useState({ key: '', failed: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const images = key.split('\n').filter(Boolean).map(source => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.decode().then(() => resolve(), reject);
      image.onerror = reject;
      image.src = source;
    }));
    Promise.all(images).then(() => { if (active) setResult({ key, failed: false }); }, () => { if (active) setResult({ key, failed: true }); });
    return () => { active = false; };
  }, [key, attempt]);
  return { ready: result.key === key && !result.failed, failed: result.key === key && result.failed, retry: () => { setResult({ key: '', failed: false }); setAttempt(value => value + 1); } };
}
