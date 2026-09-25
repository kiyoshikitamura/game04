"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { registerPresentedDialog } from "../ui/dialogPresence";
import "./GachaModalPortal.css";

export default function GachaModalPortal({ children, onEscape }: { children: ReactNode; onEscape?: () => void }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const originFocus = useRef<HTMLElement | null>(null);

  useLayoutEffect(registerPresentedDialog, []);
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    originFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = [...document.body.children].filter((element): element is HTMLElement => element instanceof HTMLElement && element !== layer);
    const prior = siblings.map(element => ({ element, inert: element.inert }));
    for (const { element } of prior) element.inert = true;
    (layer.querySelector<HTMLElement>('button:not(:disabled),[href],input:not(:disabled),[tabindex]:not([tabindex="-1"])') ?? layer).focus();
    return () => {
      for (const { element, inert } of prior) element.inert = inert;
      originFocus.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscape) { event.preventDefault(); onEscape(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(layerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),[href],input:not(:disabled),[tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) { event.preventDefault(); layerRef.current?.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onEscape]);

  return createPortal(<div ref={layerRef} className="gacha-modal-portal" tabIndex={-1}>{children}</div>, document.body);
}
