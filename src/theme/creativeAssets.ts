import characters from './local-characters.json';

type Variant = 'full' | 'portrait' | 'card' | 'battle';
type CharacterArt = { id: string; name: string; legacyImage: string } & Partial<Record<Variant, string>>;
const art: CharacterArt[] = characters;

/** Resolve presentation independently of saved battle snapshots and numerical masters. */
export function characterArt(subject: { id?: string; name?: string; image?: string }, variant: Variant): string | undefined {
  const match = art.find(c => c.id === subject.id)
    ?? art.find(c => c.name === subject.name)
    ?? art.find(c => c.legacyImage === subject.image || Object.values(c).includes(subject.image ?? ''));
  if (variant === 'battle') return match?.battle;
  return match?.[variant] ?? match?.portrait ?? match?.full ?? subject.image;
}
