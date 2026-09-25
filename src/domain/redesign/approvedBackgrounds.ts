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

/** Approved SSR acquisition backgrounds; character IDs retain the existing ownership contract. */
export const SSR_HOME_BACKGROUNDS = [
  {
    "id": "ssr:char_koharu_01",
    "name": "雪の春日山城",
    "image": "/bg/approved-20260925/ssr-char_koharu_01.webp",
    "characterId": "char_koharu_01",
    "characterName": "上杉謙信"
  },
  {
    "id": "ssr:char_leo_01",
    "name": "青葉城と仙台城下",
    "image": "/bg/approved-20260925/ssr-char_leo_01.webp",
    "characterId": "char_leo_01",
    "characterName": "伊達政宗"
  },
  {
    "id": "ssr:char_mio_01",
    "name": "米沢城下・花の宴",
    "image": "/bg/approved-20260925/ssr-char_mio_01.webp",
    "characterId": "char_mio_01",
    "characterName": "前田慶次"
  },
  {
    "id": "ssr:char_karen_01",
    "name": "駿府城と城下",
    "image": "/bg/approved-20260925/ssr-char_karen_01.webp",
    "characterId": "char_karen_01",
    "characterName": "徳川家康"
  },
  {
    "id": "ssr:char_miyabi_01",
    "name": "琵琶湖畔の坂本城",
    "image": "/bg/approved-20260925/ssr-char_miyabi_01.webp",
    "characterId": "char_miyabi_01",
    "characterName": "明智光秀"
  },
  {
    "id": "ssr:char_kengo_01",
    "name": "大多喜城を望む山道",
    "image": "/bg/approved-20260925/ssr-char_kengo_01.webp",
    "characterId": "char_kengo_01",
    "characterName": "本多忠勝"
  },
  {
    "id": "ssr:char_go_01",
    "name": "躑躅ヶ崎館と甲府盆地",
    "image": "/bg/approved-20260925/ssr-char_go_01.webp",
    "characterId": "char_go_01",
    "characterName": "武田信玄"
  },
  {
    "id": "ssr:char_kaede_01",
    "name": "上田城",
    "image": "/bg/approved-20260925/ssr-char_kaede_01.webp",
    "characterId": "char_kaede_01",
    "characterName": "真田幸村"
  },
  {
    "id": "ssr:char_reiji_01",
    "name": "安土城",
    "image": "/bg/approved-20260925/ssr-char_reiji_01.webp",
    "characterId": "char_reiji_01",
    "characterName": "織田信長"
  },
  {
    "id": "ssr:char_ageha_01",
    "name": "黄金期の大坂城",
    "image": "/bg/approved-20260925/ssr-char_ageha_01.webp",
    "characterId": "char_ageha_01",
    "characterName": "豊臣秀吉"
  }
] as const;
