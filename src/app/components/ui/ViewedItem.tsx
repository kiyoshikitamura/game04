"use client";
import { isPresentationBusy, subscribePresentation } from './presentationTasks';
import { useEffect, useRef, type ReactNode } from 'react';
export default function ViewedItem({ children, onViewed, className }: { children: ReactNode; onViewed: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onViewed); callback.current = onViewed;
  useEffect(() => {
    const node = ref.current!;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const threshold = Math.min(.6, 120 / Math.max(1, node.getBoundingClientRect().height));
    let entry: IntersectionObserverEntry | undefined;
    let done=false;
    const check=()=>{
      if(timer)clearTimeout(timer);
      if(done||!entry?.isIntersecting||entry.intersectionRatio<threshold||isPresentationBusy())return;
      timer=setTimeout(()=>{
        if(!isPresentationBusy()&&document.visibilityState==='visible'&&!node.closest('[inert]')&&getComputedStyle(node).visibility==='visible'){
          done=true;callback.current();observer.disconnect();
        }
      },250);
    };
    const observer=new IntersectionObserver(([latest])=>{entry=latest;check();},{threshold:[threshold]});
    const unsubscribe=subscribePresentation(check);
    document.addEventListener('visibilitychange',check);
    observer.observe(node);return()=>{observer.disconnect();unsubscribe();document.removeEventListener('visibilitychange',check);if(timer)clearTimeout(timer);};
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
