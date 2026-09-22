"use client";
import { useEffect, useRef, type ReactNode } from 'react';
export default function ViewedItem({ children, onViewed, className }: { children: ReactNode; onViewed: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onViewed); callback.current = onViewed;
  useEffect(() => {
    const node = ref.current!;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const threshold = Math.min(.6, 120 / Math.max(1, node.getBoundingClientRect().height));
    const observer = new IntersectionObserver(([entry]) => {
      if (timer) clearTimeout(timer);
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) timer = setTimeout(() => {
        if (document.visibilityState === 'visible' && !node.closest('[inert]')) { callback.current(); observer.disconnect(); }
      }, 250);
    }, { threshold: [threshold] });
    observer.observe(node); return () => { observer.disconnect(); if (timer) clearTimeout(timer); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
