'use client';
import { useEffect, useState } from 'react';
import characterArt from '@/theme/local-characters.json';
import backgrounds from '@/theme/character-backgrounds.json';
import type { CharacterMaster } from '@/domain/redesign/types';

const decoded = new Map<string, Promise<void>>();
function decodeImage(src: string) {
  let task = decoded.get(src);
  if (!task) {
    task = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.decode().then(() => resolve(), reject);
      image.onerror = () => reject(new Error('画像を読み込めませんでした。'));
      image.src = src;
    });
    decoded.set(src, task);
    task.catch(() => decoded.delete(src));
  }
  return task;
}
export function characterImageSources(character: Pick<CharacterMaster, 'id'|'rarity'|'element'>): string[] {
  const artwork = characterArt.find(row => row.id === character.id);
  const background = backgrounds.find(row => row.characterId === character.id);
  return [artwork?.card, background?.background, `/creative/ui/frame-${character.rarity}.png`, `/creative/ui/element-${character.element}.png`].filter((path): path is string => Boolean(path));
}
export function useCharacterImageReadiness(sources: string[]) {
  const key = [...new Set(sources.filter(Boolean))].sort().join('\n');
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState({key: '', attempt: -1, error: false});
  useEffect(() => {
    let active = true;
    Promise.all(key ? key.split('\n').map(decodeImage) : []).then(() => {
      if (active) setLoaded({key, attempt, error: false});
    }).catch(() => { if (active) setLoaded({key, attempt, error: true}); });
    return () => { active = false; };
  }, [key, attempt]);
  return { ready: loaded.key === key && loaded.attempt === attempt && !loaded.error,
    failed: loaded.key === key && loaded.attempt === attempt && loaded.error,
    retry: () => setAttempt(value => value + 1) };
}
