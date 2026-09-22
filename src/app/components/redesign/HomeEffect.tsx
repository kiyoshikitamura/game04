'use client';
import { useEffect, useState } from 'react';
import './creative.css';

export default function HomeEffect({ characterId }: { characterId: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!motion.matches && document.visibilityState === 'visible');
    update(); motion.addEventListener('change', update); document.addEventListener('visibilitychange', update);
    return () => { motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  return enabled ? <iframe className="g4-home-effect" style={{ colorScheme: 'normal', background: 'transparent' }} src={`/creative/effects/${characterId}.html`} title="背景演出" tabIndex={-1} aria-hidden="true" sandbox="allow-scripts" /> : null;
}
