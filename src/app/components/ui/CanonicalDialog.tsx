"use client";

import React, { useRef, useState } from "react";
import { flushSync } from "react-dom";
import DialogSurface from "./DialogSurface";
import OutlawButton from "./OutlawButton";
import "./CanonicalDialog.css";

export type CanonicalDialogAction = {
  label: string;
  onClick: () => unknown;
  semantic?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export default function CanonicalDialog({
  title,
  children,
  onClose,
  actions = [],
  size = "standard",
  ariaLabel,
  loading = false,
  kind = "detail",
}: {
  title?: string;
  children: React.ReactNode;
  onClose?: () => unknown;
  actions?: CanonicalDialogAction[];
  size?: "standard" | "large";
  ariaLabel?: string;
  loading?: boolean;
  kind?: "detail" | "confirm" | "edit" | "result" | "notice";
}) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const runAction = (action: () => unknown) => {
    if (busy.current) return;
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
  const close = kind === 'result' || kind === 'notice' ? undefined : onClose;
  const visibleActions = kind === 'detail' && close && actions.length === 1 && actions[0].label === '閉じる' ? [] : actions;
  return <DialogSurface className="canonical-dialog-overlay" onCancel={close && !pending ? () => runAction(close) : undefined}>
    <section className={`canonical-dialog canonical-dialog--${size}`} role="dialog" aria-modal="true" aria-label={ariaLabel || title || "ダイアログ"}>
      {(title || close) && <header className="canonical-dialog-header">
        {title ? <h2>{title}</h2> : <span />}
        {close && <button type="button" className="canonical-dialog-close" disabled={pending} onClick={() => runAction(close!)} aria-label="閉じる">×</button>}
      </header>}
      <div className={`canonical-dialog-body ${loading ? "is-loading" : ""}`}>{children}</div>
      {visibleActions.length > 0 && <footer className="canonical-dialog-actions">
        {visibleActions.map((action) => <OutlawButton
          key={action.label}
          variant={action.semantic === "danger" ? "danger" : action.semantic === "primary" ? "primary" : "secondary"}
          disabled={action.disabled || pending}
          onClick={() => runAction(action.onClick)}
        >{action.label}</OutlawButton>)}
      </footer>}
    </section>
  </DialogSurface>;
}
