'use client';
import { useEffect, useState } from 'react';
import './creative.css';
import backgrounds from '@/theme/local-backgrounds.json';
import { SSR_HOME_BACKGROUNDS } from '@/domain/redesign/approvedBackgrounds';
import { homeAmbientSource } from '@/domain/presentation/homeAmbient';

export default function HomeEffect({ backgroundImage, effectId: explicitEffectId }: { backgroundImage?: string; effectId?: string }) {
  const effectId = explicitEffectId ?? (SSR_HOME_BACKGROUNDS.find(entry=>entry.image===backgroundImage) ?? backgrounds.find(entry=>entry.image===backgroundImage))?.characterId;
  const source = explicitEffectId ? `/creative/effects/${explicitEffectId}.html`
    : homeAmbientSource(backgroundImage) ?? (effectId ? `/creative/effects/${effectId}.html` : undefined);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!motion.matches && document.visibilityState === 'visible');
    update(); motion.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return enabled && source ? <iframe key={source} className="g4-home-effect" style={{ colorScheme: 'normal', background: 'transparent' }} src={source} title="背景演出" tabIndex={-1} aria-hidden="true" sandbox="allow-scripts" /> : null;
}
