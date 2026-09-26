'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './actions.css';

/** Presentation only. The caller retains its existing request/transaction lock. */
export default function ActionButton({children, busy = false, busyLabel = '処理中', variant = 'secondary', className = '', disabled, ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {children: ReactNode; busy?: boolean; busyLabel?: string; variant?: 'primary'|'secondary'|'danger'}) {
  return <button type="button" {...props} className={`g4-action g4-action--${variant} semantic-cta semantic-cta--${variant} ${className}`} disabled={disabled || busy} aria-busy={busy}>
    <span className="g4-action-label" style={{visibility: busy ? 'hidden' : undefined}}>{children}</span>
    <span className="g4-action-pending" aria-hidden={!busy} style={{visibility: busy ? undefined : 'hidden'}}>{busyLabel}</span>
  </button>;
}
