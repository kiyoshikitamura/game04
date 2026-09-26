"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { registerPresentedDialog } from "./dialogPresence";
import OutlawButton from "./OutlawButton";
import "./CanonicalDialog.css";
import "./game04-ui.css";
import Game04Loading from "./Game04Loading";

export type CanonicalDialogAction = {
  label: string;
  onClick: () => unknown;
  semantic?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
};

export default function CanonicalDialog({
  title,
  children,
  onClose,
  actions = [],
  size = "standard",
  ariaLabel,
  loading = false,
  density = "standard",
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  onClose?: () => unknown;
  actions?: CanonicalDialogAction[];
  size?: "standard" | "large";
  ariaLabel?: string;
  loading?: boolean;
  density?: "standard" | "compact";
  className?: string;
}) {
  const busy = useRef(false);
  const dialog = useRef<HTMLElement>(null);
  const [pending, setPending] = useState(false);
  useLayoutEffect(registerPresentedDialog, []);
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]') ?? []).filter(e => !e.closest('[inert]'));
      const first = items[0], last = items.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', trap); previous?.focus(); };
  }, []);
  const runAction = (action: () => unknown, allowWhileLoading = false) => {
    if (busy.current || (loading && !allowWhileLoading)) return;
    busy.current = true;
    let result: unknown;
    try {
      flushSync(() => { setPending(true); result = action(); });
    } catch {
      busy.current = false;
      setPending(false);
      return;
    }
    // The caller owns close/replacement; no timeout and no automatic closing
    // of a newly presented result dialog from the previous action.
    Promise.resolve(result).then(() => {
      busy.current = false;
      setPending(false);
    }, () => {
      busy.current = false;
      setPending(false);
    });
  };
  return <div className="canonical-dialog-overlay">
    <section ref={dialog} tabIndex={-1} className={`canonical-dialog canonical-dialog--${size} canonical-dialog--${density} ${className}`} role="dialog" aria-modal="true" aria-busy={pending || loading} aria-label={ariaLabel || title || "ダイアログ"}>
      <header className="canonical-dialog-header">
        {title ? <h2>{title}</h2> : <span />}
        {onClose && <button type="button" className="canonical-dialog-close" disabled={pending} onClick={() => runAction(onClose, true)} aria-label="閉じる">×</button>}
      </header>
      <div className={`canonical-dialog-body ${loading ? "is-loading" : ""}`} inert={pending}>{loading ? <Game04Loading context="dialog"/> : children}</div>
      {actions.length > 0 && <footer className="canonical-dialog-actions">
        {actions.map((action) => <OutlawButton
          key={action.label}
          variant={action.semantic === "danger" ? "danger" : action.semantic === "primary" ? "primary" : "secondary"}
          disabled={action.disabled || pending || loading}
          isLoading={action.busy}
          loadingLabel={action.busyLabel}
          onClick={() => runAction(action.onClick)}
        >{action.label}</OutlawButton>)}
      </footer>}
    </section>
  </div>;
}
