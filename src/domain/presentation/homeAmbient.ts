/** Approved B07 ambient motion, keyed by scenery rather than character rarity. */
export const HOME_AMBIENT_SCENES = {
  'castle-town': 'sakura',
  mikawa: 'mikawa', owari: 'owari', mino: 'mino', omi: 'omi', kai: 'kai',
  echigo: 'echigo', kyoto: 'kyoto', izumo: 'izumo', satsuma: 'satsuma', sekigahara: 'sekigahara',
} as const;
export function homeAmbientSource(backgroundImage?: string): string | undefined {
  if (backgroundImage === '/bg/sengoku/castle-town.jpg' || backgroundImage === '/bg/sengoku/castle-approach.jpg') return '/creative/effects/ambient.html?scene=sakura';
  const id = /^\/bg\/approved-20260925\/quest-([a-z]+)\.webp$/.exec(backgroundImage ?? '')?.[1];
  return id && Object.prototype.hasOwnProperty.call(HOME_AMBIENT_SCENES, id)
    ? `/creative/effects/ambient.html?scene=${HOME_AMBIENT_SCENES[id as keyof typeof HOME_AMBIENT_SCENES]}` : undefined;
}
