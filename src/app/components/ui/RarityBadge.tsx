import './rarity-badge.css';
/** Rarity is text; element badges have a separate visual contract. */
export default function RarityBadge({rarity,size='standard'}:{rarity:string;size?:'standard'|'small'}) {
  return <span className={`g4-rarity-badge g4-rarity-badge--${size}`}>{rarity}</span>;
}
