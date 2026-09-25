import type { RaidMaster, RaidRoom, RaidBattleStartSnapshot } from './types';
/** User-supplied 2026-09-25 assets. Presentation only; no combat/progression changes. */
export const QUEST_BACKGROUND_PATHS: Record<string, string> = Object.fromEntries(
  ['mikawa','owari','mino','omi','kai','echigo','kyoto','izumo','satsuma','sekigahara'].map(id => [id, `/bg/approved-20260925/quest-${id}.webp`]),
);
export const INVASION_CASTLE_IDS = ['TI01','TI02','TI03','TI04','TI05'] as const;
export function invasionBackground(castleId: string, level = 1): string | undefined {
  if (!(INVASION_CASTLE_IDS as readonly string[]).includes(castleId) || !Number.isInteger(level) || level < 1 || level > 12) return undefined;
  const battleClass = level === 12 ? 'lord' : level % 3 === 0 ? 'gate' : 'normal';
  return `/bg/approved-20260925/invasion-${castleId}-${battleClass}.webp`;
}
export function raidBackground(master: Pick<RaidMaster, 'id' | 'backgroundUrl'>, level: number): string | undefined {
  return invasionBackground(master.id, level) ?? master.backgroundUrl;
}
/** A result may advance the shared room. The saved battle-start level owns its image. */
export function raidBattleBackground(room: RaidRoom, master: Pick<RaidMaster, 'id' | 'backgroundUrl'>, start?: RaidBattleStartSnapshot): string | undefined {
  if (start?.roomId === room.id) return raidBackground(master, start.level);
  // Old recordings without start identity must not borrow the current room's stage.
  return master.backgroundUrl;
}
