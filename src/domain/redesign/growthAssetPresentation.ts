import type { ExpSize, Rarity } from './types';

/** Approved 2026-09-25 images; inventory IDs and numerical values are unchanged. */
export function growthExpImage(kind: 'character' | 'equipment', size: ExpSize): string {
  const prefix = kind === 'character' ? 'char' : 'equip';
  if (size === 'xlarge') return `/items/formal/${prefix}_exp_xl.webp`;
  return `/items/${prefix}_exp_${({small:'s',medium:'m',large:'l'} as const)[size]}.png`;
}
export function growthSoulImage(kind: 'generic_soul' | 'soul_selector', rarity: Rarity): string {
  return `/items/formal/${kind}_${rarity.toLowerCase()}.webp`;
}
export function growthRewardImage(reward: {kind: string; id?: string}): string | undefined {
  if ((reward.kind === 'character_exp_item' || reward.kind === 'equipment_exp_item') && ['small','medium','large','xlarge'].includes(reward.id ?? '')) {
    return growthExpImage(reward.kind === 'character_exp_item' ? 'character' : 'equipment', reward.id as ExpSize);
  }
  if ((reward.kind === 'generic_soul' || reward.kind === 'soul_selector') && ['N','R','SR','SSR'].includes(reward.id ?? '')) {
    return growthSoulImage(reward.kind, reward.id as Rarity);
  }
  return undefined;
}

/** Canonical receipt/shop identifiers for the same ten adopted assets. */
export function approvedGrowthItemImage(itemId?: string | null): string | undefined {
  if (itemId === 'CHAR_EXP_XL') return growthExpImage('character', 'xlarge');
  if (itemId === 'EQUIP_EXP_XL') return growthExpImage('equipment', 'xlarge');
  const match = /^(GENERIC_SOUL|SOUL_SELECTOR)_(N|R|SR|SSR)$/.exec(itemId ?? '');
  return match ? growthSoulImage(match[1] === 'GENERIC_SOUL' ? 'generic_soul' : 'soul_selector', match[2] as Rarity) : undefined;
}
