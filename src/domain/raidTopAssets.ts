import { RAID_MASTERS } from '@/domain/redesign/raid';
import { CHARACTER_MASTERS } from '@/domain/redesign/masters';
import type { RaidTopEnemy } from './raidTop';

const FORMAL_ROSTER = [12, 24, 30, 36, 5] as const;
const FORMAL_PRESENTATION = {
  encounter_flame: { baseId: 'azuchi', areaName: '安土城', backgroundUrl: '/creative/backgrounds/char_koharu_01.png' },
  unlock_shadow: { baseId: 'azuchi', areaName: '安土城', backgroundUrl: '/creative/backgrounds/char_go_01.png' },
} as const;
const attributeFor = (element: string): RaidTopEnemy['attribute'] => ({ fire: 'EVIL', dark: 'CHAOS', water: 'ORDER', earth: 'JUSTICE', wind: 'JUSTICE', light: 'ORDER' }[element] ?? 'UNKNOWN') as RaidTopEnemy['attribute'];

/** GAME04再設計の開催Masterだけを表示経路へ供給する。旧GAME03 canonicalは参照しない。 */
export function resolveRaidTopEnemy(variantId: string, memberCharacterIds?: readonly string[] | null): RaidTopEnemy | null {
  const master = RAID_MASTERS.find((entry) => entry.id === variantId);
  const presentation = master ? FORMAL_PRESENTATION[master.id as keyof typeof FORMAL_PRESENTATION] : null;
  if (!master || !presentation || memberCharacterIds === null) return null;
  const ids = memberCharacterIds ?? FORMAL_ROSTER.map(index => CHARACTER_MASTERS[index]?.id);
  if (ids.length !== 5 || new Set(ids).size !== 5 || ids.some(id => !id)) return null;
  const roster = ids.map((id) => {
    const character = CHARACTER_MASTERS.find((entry) => entry.id === id);
    return character ? { id, name: character.name, imageUrl: character.image } : null;
  });
  if (roster.some((entry) => entry === null)) return null;
  const members = roster.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  return { variantId, baseId: presentation.baseId, areaName: presentation.areaName, bossName: master.name, attribute: attributeFor(master.enemy.element), level: master.enemy.level, maxParticipants: master.maxParticipants, maxLevel: master.maxLevel, backgroundUrl: presentation.backgroundUrl, leaderImageUrl: master.enemy.image, roster: members };
}

/** GAME04正式開催Masterの素材目録。『本日の対象』ではない。 */
export const RAID_TOP_ENEMIES: readonly RaidTopEnemy[] = RAID_MASTERS
  .map((master) => resolveRaidTopEnemy(master.id))
  .filter((enemy): enemy is RaidTopEnemy => enemy !== null);
