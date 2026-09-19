'use client';
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, onClose, children, footer, className = '' }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
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
    return () => { document.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(<div className="rd-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} className={`rd-modal ${className}`}><header className="rd-modal-header"><h2 id={id}>{title}</h2><button className="rd-button" onClick={onClose} aria-label="閉じる">×</button></header><div className="rd-modal-body">{children}</div>{footer && <footer className="rd-modal-footer">{footer}</footer>}</section></div>, document.body);
}
