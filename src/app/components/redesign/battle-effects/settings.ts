import type { BattleEffectFamily } from '../battleEffectPresentation';
export type TargetSide = 'enemy' | 'ally';
export interface EffectSettings {
  size?: readonly [number, number];
  speed: number;
  duration: number;
  variables: Readonly<Record<string, number>>;
}
/** Size is the mock's stage-width percentage ONLY for single effects.
 * Group sizes multiply each mock layer's own reference width (see renderer). */
export const EFFECT_SETTINGS: Record<BattleEffectFamily, EffectSettings> = {
  slash: { size: [55,35], speed: 1.25, duration: 380, variables: {} },
  heal: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  atk_up: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  poison: { size: [60,50], speed: 1, duration: 1300, variables: {'mist-opacity':.3,'skull-opacity':.75,'drops-opacity':.8} },
  projectile: { size: [65,45], speed: 1.6, duration: 731.25, variables: {alpha:1} },
  impact: { size: [55,35], speed: 1.1, duration: 750, variables: {'mist-opacity':.3,'burst-opacity':.55,'particles-opacity':.9} },
  def_up: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  spd_up: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  atk_down: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  def_down: { size: [60,40], speed: 1, duration: 1000, variables: {'mist-opacity':.8} },
  blind: { size: [65,35], speed: 1, duration: 1500, variables: {'bank-opacity':1,'wisps-opacity':.45} },
  silence: { size: [45,30], speed: 1, duration: 1800, variables: {'crest-alpha':.7,'seal-alpha':.9} },
  stun: { size: [55,40], speed: 1, duration: 1080, variables: {alpha:.8} },
  slash_all: { speed:1, duration:960, variables:{scale:1,alpha:.9} },
  impact_all: { speed:1, duration:1400, variables:{'ring-opacity':1,'mist-opacity':.2,'core-opacity':.8} },
  heal_all: { speed:1, duration:1450, variables:{size:1,'field-alpha':.25,'aura-alpha':.55,'cross-alpha':.8} },
};
export const GROUP_SLASH_COUNT = 7;
export const GROUP_IMPACT_COUNT = 8;
export const GROUP_IMPACT_INTERVAL = 120;
export const GROUP_HEAL_STAGGER = 70;
export function effectDuration(family: BattleEffectFamily, targetCount = 1) {
  const config = EFFECT_SETTINGS[family];
  return config.duration / config.speed + (family === 'heal_all' ? Math.max(0,targetCount-1)*GROUP_HEAL_STAGGER : 0);
}
export function displaySize(family: BattleEffectFamily, side: TargetSide) {
  return EFFECT_SETTINGS[family].size?.[side === 'enemy' ? 0 : 1];
}
