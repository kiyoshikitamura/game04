'use client';
import { useEffect, useState } from 'react';
import './creative.css';
import backgrounds from '@/theme/local-backgrounds.json';

export default function HomeEffect({ backgroundImage }: { backgroundImage: string }) {
  const effectId = backgrounds.find(entry=>entry.image===backgroundImage)?.characterId;
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!motion.matches && document.visibilityState === 'visible');
    update(); motion.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return enabled && effectId ? <iframe className="g4-home-effect" style={{ colorScheme: 'normal', background: 'transparent' }} src={`/creative/effects/${effectId}.html`} title="背景演出" tabIndex={-1} aria-hidden="true" sandbox="allow-scripts" /> : null;
}
