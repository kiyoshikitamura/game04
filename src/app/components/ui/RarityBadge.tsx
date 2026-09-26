import './rarity-badge.css';
/** Approved N/R/SR/SSR artwork; decorative card frames remain in CharacterDisplays. */
export default function RarityBadge({rarity,size='standard'}:{rarity:string;size?:'standard'|'small'}) {
  return ['N','R','SR','SSR'].includes(rarity)?<img className={`g4-rarity-badge g4-rarity-badge--${size}`} src={`/ui/rarity/rarity-badge-${rarity.toLowerCase()}.png`} alt={rarity}/>:<span>{rarity}</span>;
}
