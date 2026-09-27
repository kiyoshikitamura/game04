/** Presentation configuration only. Eligibility is decided by the authenticated RPC. */
export const HOME_PROMOTIONS = {
  starter: {
    title: '初陣応援パック', image: '/creative/promotions/starter-pack-1500.png',
    message: '武将・スキル・武具の特選チケット詰め合わせ', value: '1,500円相当が100円！',
    action: 'パックを見る', destination: 'shop:beginner_pack_01',
  },
  'daily-free': {
    title: '毎日1回10連無料！', image: '/assets/promotions/b15/normal.png',
    message: '毎日1回10連無料！早速召喚しよう', value: '',
    action: '召喚する', destination: 'gacha',
  },
} as const;
export type HomePromotionKind = keyof typeof HOME_PROMOTIONS;
