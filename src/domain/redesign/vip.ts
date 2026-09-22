/** 販売価格・付与物はM9で確定。権利の仕様のみ今回のAuthority。 */
export const VIP_PRODUCT = {
  id: 'game04_vip_30d', name: 'VIPパス', durationDays: 30,
  checkoutMode: 'payment', enabled: false, priceJpy: null,
  benefits: { maxBattleSpeed: 3, battleSkip: true },
} as const;

export function isVipActive(expiresAt: string | null | undefined, now = Date.now()): boolean {
  return !!expiresAt && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) > now;
}
export function nextBattleSpeed(current: number, vip: boolean): 1 | 2 | 3 {
  return current === 1 ? 2 : current === 2 && vip ? 3 : 1;
}
