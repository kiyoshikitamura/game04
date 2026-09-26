import './creative.css';
const labels: Record<string, string> = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '闇' };
export default function ElementBadge({ element, className = '', size = 'standard' }: { element: string; className?: string; size?: 'small'|'standard'|'combat' }) {
  return labels[element] ? <img className={`g4-element-badge g4-element-badge--${size} ${className}`} src={size==='combat'?`/ui/raid/v2/element-${element}.png`:`/creative/ui/element-${element}.png`} alt={`${labels[element]}属性`} /> : null;
}
