'use client';
import { useEffect, useState } from 'react';
import '../ui/game04-ui.css';
import {UI_MOTION} from '../ui/uiMotion';

export default function TypewriterText({ text, revealed, onFinished }: { text: string; revealed: boolean; onFinished: () => void }) {
  const [count, setCount] = useState(0);
  const characters = Array.from(text);
  useEffect(() => {
    if (revealed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || count >= characters.length) { onFinished(); return; }
    const timer = setTimeout(() => setCount(value => value + 1), UI_MOTION.characterMs);
    return () => clearTimeout(timer);
  }, [revealed, count, characters.length, onFinished]);
  return <p className="g4-typewriter" tabIndex={0} aria-label={text}><span aria-hidden="true">{revealed ? text : characters.slice(0, count).join('')}</span></p>;
}
