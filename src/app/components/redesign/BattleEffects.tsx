import type { CSSProperties } from 'react';
import type { BattleEffectFamily } from './battleEffectPresentation';
import styles from './BattleEffects.module.css';

export interface BattleEffectsProps { family: BattleEffectFamily; paused?: boolean; speed?: number; className?: string }
const sword = 'M42 68 L62 23 L70 16 L70 29 L50 71 M38 62 L56 71 M40 72 L36 82';
const shield = 'M50 17 L75 27 L72 53 Q68 70 50 82 Q32 70 28 53 L25 27 Z';
/** Overlay on the recorded target. The parent remounts per frame and owns playback timing. */
export function BattleEffects({ family, paused = false, speed = 1, className = '' }: BattleEffectsProps) {
  const slash = family === 'slash' || family === 'slash_all';
  const impact = family === 'impact' || family === 'impact_all';
  const healing = family === 'heal' || family === 'heal_all';
  const attack = family === 'atk_up' || family === 'atk_down';
  const defense = family === 'def_up' || family === 'def_down';
  return <span className={`${styles.effect} ${styles[family]} ${className}`} aria-hidden="true" data-battle-effect={family} data-paused={paused} style={{ '--effect-duration': `${400 / Math.max(1, speed)}ms` } as CSSProperties}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {slash && <g className={styles.slashMark}><path d="M9 81 Q40 29 92 17 Q52 55 9 81Z" /><path className={styles.edge} d="M10 82 L91 17" />{family === 'slash_all' && <><path d="M2 55 Q50 4 99 43 Q51 27 2 55Z" /><path className={styles.edge} d="M7 45 Q55 83 95 32" /></>}</g>}
      {impact && <><g className={styles.shock}><path d="M50 15L57 38L77 24L66 45L91 50L65 56L77 80L54 64L45 90L41 64L15 76L34 54L8 42L37 40Z" /><circle cx="50" cy="50" r="25" /></g>{family === 'impact_all' && <g className={styles.fracture}><ellipse cx="50" cy="69" rx="44" ry="14" /><path d="M50 55L38 74L23 80M50 55L62 72L83 83M50 55L48 89" /></g>}</>}
      {family === 'projectile' && <><g className={styles.flight}><path d="M8 79L75 27M8 87L72 35M22 86L80 38" /><path d="M69 21L88 17L84 35Z" /></g><circle className={styles.landing} cx="77" cy="26" r="16" /></>}
      {healing && <><g className={styles.healLight}><path d="M43 26H57V41H72V55H57V70H43V55H28V41H43Z" /><circle cx="24" cy="72" r="3" /><circle cx="74" cy="59" r="3" /><circle cx="67" cy="81" r="2" /></g>{family === 'heal_all' && <g className={styles.healSeal}><ellipse cx="50" cy="77" rx="43" ry="15" /><ellipse cx="50" cy="77" rx="33" ry="10" /><path d="M8 77H92M50 61V93M20 67L80 87M80 67L20 87" /></g>}</>}
      {(attack || defense) && <><g className={styles.emblem}><path d={attack ? sword : shield} />{family === 'def_down' && <path d="M52 18L43 38L59 47L41 62L52 81" />}</g><g className={styles.arrows}>{family.endsWith('_up') ? <path d="M14 70V36M6 46L14 36L22 46M86 70V36M78 46L86 36L94 46" /> : <path d="M14 33V69M6 59L14 69L22 59M86 33V69M78 59L86 69L94 59" />}</g></>}
      {family === 'spd_up' && <g className={styles.wind}><path d="M5 38Q29 24 71 37T88 22M3 53Q40 34 83 48M16 71Q45 55 89 64" /><path d="M39 39L57 49L39 59M55 39L73 49L55 59" /></g>}
      {family === 'poison' && <g className={styles.poisonMist}><circle cx="31" cy="61" r="17" /><circle cx="66" cy="56" r="20" /><path d="M49 18Q22 52 49 58Q75 53 49 18Z" /><circle cx="26" cy="27" r="4" /><circle cx="74" cy="21" r="3" /></g>}
      {family === 'blind' && <g className={styles.darkMist}><ellipse cx="50" cy="47" rx="43" ry="27" /><circle cx="26" cy="33" r="18" /><circle cx="71" cy="62" r="23" /><path d="M17 47Q50 23 82 47Q50 72 17 47M25 72L75 23" /></g>}
      {family === 'silence' && <g className={styles.seal}><path d="M31 9L72 14L67 91L27 86Z" /><circle cx="49" cy="49" r="16" /><path d="M36 37L62 62M37 62L62 37M39 23H61M38 75H59" /></g>}
      {family === 'stun' && <g className={styles.stars}><ellipse cx="50" cy="42" rx="39" ry="13" /><path d="M25 21L29 30L39 31L31 37L33 47L25 42L17 47L19 37L11 31L21 30ZM75 25L78 32L87 33L81 39L82 47L75 43L68 47L69 39L63 33L72 32M51 48L43 65H53L47 83L65 60H54L61 48Z" /></g>}
    </svg>
  </span>;
}
export default BattleEffects;
