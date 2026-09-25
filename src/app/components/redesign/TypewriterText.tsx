'use client';
import { useEffect, useState } from 'react';

export default function TypewriterText({ text, revealed, onFinished }: { text: string; revealed: boolean; onFinished: () => void }) {
  const [count, setCount] = useState(0);
  const characters = Array.from(text);
  useEffect(() => {
    if (revealed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || count >= characters.length) { onFinished(); return; }
    const timer = setTimeout(() => setCount(value => value + 1), 35);
    return () => clearTimeout(timer);
  }, [revealed, count, characters.length, onFinished]);
  return <p aria-label={text}><span aria-hidden="true">{revealed ? text : characters.slice(0, count).join('')}</span></p>;
}
