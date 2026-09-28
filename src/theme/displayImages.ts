import manifest from './display-image-manifest.json';
import characters from './local-characters.json';
import backgrounds from './character-backgrounds.json';

/** Content-addressed build derivatives; originals remain the development fallback. */
export function displayImage(src: string): string;
export function displayImage(src: string | undefined): string | undefined;
export function displayImage(src: string | undefined): string | undefined {
  return src ? (manifest as Record<string, string>)[src] ?? src : src;
}
export const displayCharacters = characters.map(row => ({ ...row,
  full: displayImage(row.full), portrait: displayImage(row.portrait),
  card: displayImage(row.card), battle: displayImage(row.battle),
}));
export const displayBackgrounds = backgrounds.map(row => ({ ...row, background: displayImage(row.background) }));
