import { characterArt } from '@/theme/creativeAssets';
import './creative.css';

export default function CreativeCharacter({ character, square = false }: { character: { id: string; name: string; image: string; rarity: string }; square?: boolean }) {
  return <span className={`g4-creative-card${square ? ' is-square' : ''}`}>
    <img className="g4-creative-person" src={characterArt(character, square ? 'portrait' : 'card')} alt={character.name} />
    <img className="g4-creative-frame" src={`/creative/ui/${square ? 'square' : 'frame'}-${character.rarity}.png`} alt="" aria-hidden="true" />
  </span>;
}
