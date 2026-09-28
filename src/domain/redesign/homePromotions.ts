/** Presentation configuration only. Eligibility is decided by the authenticated RPC. */
export const HOME_PROMOTIONS = {
  starter: {
    title: '初陣応援パック', image: '/creative/promotions/starter-pack-100-20260928.png',
    message: '新たな仲間と、次の戦へ。', value: '100円（税込）',
    action: '100円パックを見る', destination: 'shop:beginner_pack_01',
  },
  'daily-free': {
    title: '毎日1回10連無料！', image: '/assets/promotions/b15/normal.png',
    message: '毎日1回10連無料！早速召喚しよう', value: '',
    action: '召喚する', destination: 'gacha',
  },
} as const;
export type HomePromotionKind = keyof typeof HOME_PROMOTIONS;
