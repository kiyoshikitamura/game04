export type TitleOnline = { count: number | null; countedAt: string | null; fixture?: boolean };
export const UNKNOWN_ONLINE: TitleOnline = { count: null, countedAt: null };
export const ONLINE_MAX_AGE_MS = 6 * 60_000;

export function onlinePresentation(count: number | null) {
  if (count === null || !Number.isSafeInteger(count) || count < 0) return { visible: false, range: 'unknown', text: '' };
  if (count < 30) return { visible: false, range: '<30', text: '' };
  const floor = Math.floor(count / 10) * 10;
  return { visible: true, range: count >= 100 ? '100+' : `${floor}-${floor + 9}`,
    text: count >= 100 ? `現在${count}人がプレイ中` : `現在${floor}人以上がプレイ中` };
}

export function validOnline(value: TitleOnline, now = Date.now()): boolean {
  const time = Date.parse(value.countedAt || '');
  return Number.isSafeInteger(value.count) && value.count! >= 0 && Number.isFinite(time)
    && time <= now + 5_000 && now - time <= ONLINE_MAX_AGE_MS;
}
