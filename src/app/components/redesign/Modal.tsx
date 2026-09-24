'use client';
import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { registerPresentedDialog } from '../ui/dialogPresence';

const inertShells = new WeakMap<HTMLElement, { count: number; previous: boolean }>();

export default function Modal({ title, onClose, children, footer, className = '', closeDisabled = false, hideCloseButton = false }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; className?: string; closeDisabled?: boolean; hideCloseButton?: boolean }) {
  const id = useId();
  useLayoutEffect(registerPresentedDialog, []);
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = () => { if (!closeDisabled) onClose(); }; }, [onClose, closeDisabled]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const shells = [...document.querySelectorAll<HTMLElement>('.rd-shell')];
    for (const shell of shells) { const entry = inertShells.get(shell) ?? { count: 0, previous: shell.inert }; entry.count++; inertShells.set(shell, entry); shell.inert = true; }
    ref.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (!ref.current?.contains(document.activeElement)) return;
      if (event.key === 'Escape') { event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]');
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); for (const shell of shells) { const entry = inertShells.get(shell); if (entry && --entry.count === 0) { shell.inert = entry.previous; inertShells.delete(shell); } } previous?.focus(); };
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(<div className="rd-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !closeDisabled) onClose(); }}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} className={`rd-modal ${className}`}><header className="rd-modal-header"><h2 id={id}>{title}</h2>{!hideCloseButton && <button className="rd-button" onClick={onClose} disabled={closeDisabled} aria-label="閉じる">×</button>}</header><div className="rd-modal-body">{children}</div>{footer && <footer className="rd-modal-footer">{footer}</footer>}</section></div>, document.body);
}
