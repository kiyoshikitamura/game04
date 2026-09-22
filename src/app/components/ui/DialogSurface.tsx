"use client";
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { registerPresentedDialog } from './dialogPresence';
import { createPortal } from 'react-dom';

const stack: HTMLElement[] = [];
const priorInert = new Map<HTMLElement, boolean>();
let previousOverflow = '';
function updateBackground() {
  const top = stack[stack.length - 1];
  for (const child of Array.from(document.body.children)) {
    if (!(child instanceof HTMLElement) || ['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) continue;
    if (!priorInert.has(child)) priorInert.set(child, child.inert);
    child.inert = !!top && child !== top && !child.contains(top);
  }
}
/** Portal + visible viewport, focus containment and background scroll lock. */
export default function DialogSurface({ children, onCancel, className = '' }: { children: ReactNode; onCancel?: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(onCancel); cancelRef.current = onCancel;
  useLayoutEffect(() => {
    const unregister = registerPresentedDialog();
    const node = ref.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (!stack.length) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; document.body.classList.add('g4-dialog-open'); }
    stack.push(node); updateBackground();
    const observer = new MutationObserver(updateBackground); observer.observe(document.body, { childList: true });
    const resize = () => {
      const viewport = window.visualViewport;
      Object.assign(node.style, { top: `${viewport?.offsetTop ?? 0}px`, left: `${viewport?.offsetLeft ?? 0}px`, width: `${viewport?.width ?? innerWidth}px`, height: `${viewport?.height ?? innerHeight}px` });
    };
    resize(); window.visualViewport?.addEventListener('resize', resize); window.visualViewport?.addEventListener('scroll', resize); window.addEventListener('resize', resize);
    const focusable = () => Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(e => e.getClientRects().length > 0);
    (node.querySelector<HTMLElement>('[autofocus]') ?? focusable()[0] ?? node).focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (stack.at(-1) !== node) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); cancelRef.current?.(); }
      if (event.key === 'Tab') {
        const items = focusable(), first = items[0], last = items.at(-1);
        if (!first) { event.preventDefault(); node.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement as HTMLElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement as HTMLElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key, true);
    return () => {
      unregister(); observer.disconnect(); stack.splice(stack.indexOf(node), 1); document.removeEventListener('keydown', key, true);
      window.visualViewport?.removeEventListener('resize', resize); window.visualViewport?.removeEventListener('scroll', resize); window.removeEventListener('resize', resize);
      if (stack.length) updateBackground();
      else { for (const [element, inert] of priorInert) element.inert = inert; priorInert.clear(); document.body.style.overflow = previousOverflow; document.body.classList.remove('g4-dialog-open'); }
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(<div ref={ref} tabIndex={-1} data-game-dialog className={`g4-dialog-surface ${className}`}>{children}</div>, document.body);
}
