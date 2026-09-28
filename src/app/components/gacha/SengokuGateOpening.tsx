"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import GachaModalPortal from "./GachaModalPortal";
import "./SengokuGateOpening.css";

type GateState = "WAITING" | "PLAYING" | "FINISHED";

export default function SengokuGateOpening({
  rarity = "SSR",
  onBegin,
  onComplete,
}: {
  rarity?: string;
  onBegin?: () => void;
  onComplete: () => void;
}) {
  const [state, setState] = useState<GateState>("WAITING");
  const completeTimer = useRef<number | null>(null);
  const completed = useRef(false);
  const openRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    if (completeTimer.current !== null) window.clearTimeout(completeTimer.current);
    setState("FINISHED");
    onComplete();
  }, [onComplete]);

  const play = useCallback(() => {
    if (state !== "WAITING") return;
    setState("PLAYING");
    onBegin?.();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 4000;
    completeTimer.current = window.setTimeout(finish, duration);
  }, [finish, onBegin, state]);

  useEffect(() => () => {
    if (completeTimer.current !== null) window.clearTimeout(completeTimer.current);
  }, []);

  useEffect(() => { if (state === "PLAYING") skipRef.current?.focus(); }, [state]);

  return (
    <GachaModalPortal onEscape={finish}>
    <section
      className={`sengoku-gate is-${state.toLowerCase()} rarity-${rarity.toLowerCase()}`}
      aria-label="登用結果の開門演出"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      data-gacha-gate-state={state}
    >
      <div className="sengoku-gate__scene" aria-hidden="true">
        <Image className="sengoku-gate__background" src="/gacha/sengoku-gate/gate-background.png" alt="" fill unoptimized priority sizes="100vw" />
        <Image className="sengoku-gate__rays" src="/gacha/sengoku-gate/gold-rays.png" alt="" fill unoptimized sizes="100vw" />
        <Image className="sengoku-gate__particles" src="/gacha/sengoku-gate/gold-particles.png" alt="" fill unoptimized sizes="100vw" />
        <Image className="sengoku-gate__light" src="/gacha/sengoku-gate/ssr-light.png" alt="" fill unoptimized sizes="100vw" />
        <Image className="sengoku-gate__door sengoku-gate__door--left" src="/gacha/sengoku-gate/gate-left.png" alt="" fill unoptimized priority sizes="100vw" />
        <Image className="sengoku-gate__door sengoku-gate__door--right" src="/gacha/sengoku-gate/gate-right.png" alt="" fill unoptimized priority sizes="100vw" />
        <Image className="sengoku-gate__flash" src="/gacha/sengoku-gate/transition-flash.png" alt="" fill unoptimized sizes="100vw" />
      </div>

      {state === "WAITING" && (
        <button ref={openRef} type="button" className="sengoku-gate__open" onClick={play}>
          <b>開門</b><span>タップして結果を見る</span>
        </button>
      )}
      <button ref={skipRef} type="button" className="sengoku-gate__skip" onClick={finish}>SKIP</button>
      <p className="sengoku-gate__status" role="status" aria-live="polite">
        {state === "WAITING" ? "開門を待っています" : state === "PLAYING" ? "開門中" : "結果を表示します"}
      </p>
    </section>
    </GachaModalPortal>
  );
}
