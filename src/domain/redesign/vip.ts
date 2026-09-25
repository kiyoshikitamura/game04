/** GAME04_MASTER_AUTHORITY_LATEST_2026-09-21 §6. Checkout stays closed until P02 verification. */
export const VIP_PRODUCT = {
  id: 'game04_vip_30d', name: 'VIPパス', durationDays: 30,
  checkoutMode: 'payment', enabled: false, priceJpy: 480,
  benefits: { maxBattleSpeed: 3, battleSkip: true, dailyFreeDiamonds: 100, grantCount: 30, totalFreeDiamonds: 3000 },
} as const;
const HOUR = 60 * 60 * 1000;
export const VIP_DURATION_MS = 720 * HOUR;
export const VIP_GRANT_INTERVAL_MS = 24 * HOUR;
export function isVipActive(expiresAt: string | null | undefined, now = Date.now()): boolean {
  return !!expiresAt && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) > now;
}
export function nextBattleSpeed(current: number, vip: boolean): 1 | 2 | 3 {
  return current === 1 ? 2 : current === 2 && vip ? 3 : 1;
}
/** Trusted payment settlement time, never browser redirect time. One immutable row per order. */
export function vipGrantSchedule(startedAt: string): { ordinal: number; dueAt: string; freeDiamonds: number }[] {
  const start = Date.parse(startedAt);
  if (!Number.isFinite(start)) throw new Error('VIPの開始日時が不正です。');
  return Array.from({ length: VIP_PRODUCT.benefits.grantCount }, (_, index) => ({
    ordinal: index + 1, dueAt: new Date(start + index * VIP_GRANT_INTERVAL_MS).toISOString(),
    freeDiamonds: VIP_PRODUCT.benefits.dailyFreeDiamonds,
  }));
}
/** Worker reads these rows even after expiry: missed worker runs must not discard owed grants. */
export function dueVipGrants(startedAt: string, grantedOrdinals: readonly number[], now = Date.now()) {
  if (!Number.isFinite(now)) throw new Error('VIPの処理日時が不正です。');
  if (grantedOrdinals.some(n => !Number.isSafeInteger(n) || n < 1 || n > VIP_PRODUCT.benefits.grantCount)) throw new Error('VIPの付与記録が不正です。');
  const granted = new Set(grantedOrdinals);
  return vipGrantSchedule(startedAt).filter(row => Date.parse(row.dueAt) <= now && !granted.has(row.ordinal));
}
export function vipPurchasePeriod(previousExpiresAt: string | null | undefined, settledAt: string) {
  const start = Date.parse(settledAt);
  if (!Number.isFinite(start)) throw new Error('VIPの開始日時が不正です。');
  if (isVipActive(previousExpiresAt, start)) throw new Error('VIPの有効期間中は再購入できません。');
  return { startedAt: new Date(start).toISOString(), expiresAt: new Date(start + VIP_DURATION_MS).toISOString() };
}
