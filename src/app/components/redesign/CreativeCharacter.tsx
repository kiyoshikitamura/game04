import type { CSSProperties } from 'react';
import { PRESENTATION } from '../ui/presentationSettings';
import { characterArt } from '@/theme/creativeAssets';
import './creative.css';

export default function CreativeCharacter({ character, square = false }: { character: { id: string; name: string; image: string; rarity: string }; square?: boolean }) {
  const phase = [...character.id].reduce((n,c)=>((n*31+c.charCodeAt(0))>>>0),0) % PRESENTATION.cardCycleMs;
  return <span style={{'--g4-aura-cycle':`${PRESENTATION.auraCycleMs}ms`,'--g4-particle-cycle':`${PRESENTATION.particleCycleMs}ms`,'--g4-card-delay':`-${phase}ms`,'--g4-card-cycle':`${PRESENTATION.cardCycleMs}ms`} as CSSProperties} className={`g4-creative-card g4-rarity-${character.rarity}${square ? ' is-square' : ''}`}>
    {['SR','SSR'].includes(character.rarity) && <i className="g4-card-shine" aria-hidden="true"/>}
    {character.rarity==='SSR' && <span className="g4-card-particles" aria-hidden="true">{Array.from({length:PRESENTATION.cardParticles},(_,i)=><i key={i}/>)}</span>}
    <img className="g4-creative-person" src={characterArt(character, square ? 'portrait' : 'card')} alt={character.name} />
    <img className="g4-creative-frame" src={`/creative/ui/${square ? 'square' : 'frame'}-${character.rarity}.png`} alt="" aria-hidden="true" />
  </span>;
}
