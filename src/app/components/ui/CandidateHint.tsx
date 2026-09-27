'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import './candidate-hint.css';

/** Stop the hint after the candidate list is reached; never intercept game controls. */
export default function CandidateHint({ active, selection, children }: { active: boolean; selection: number; children: ReactNode }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    if (!active || !anchor.current) return;
    let reached = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) reached = true;
      setShow(!reached);
    }, { rootMargin: '0px 0px -100px 0px', threshold: 0 });
    observer.observe(anchor.current);
    return () => observer.disconnect();
  }, [active, selection]);
  return <><div ref={anchor} />{children}{active && show && <span className="g4-candidate-hint" role="status">下の武将から選択 ↓</span>}</>;
}
