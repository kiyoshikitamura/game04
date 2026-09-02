"use client";

import { useState } from "react";
import { reportTechnicalSignal } from "@/lib/observability/client";
import { LifecycleState } from "./LifecycleState";

export function ObservabilityProbe() {
  const [state, setState] = useState<"idle" | "sending" | "accepted" | "failed">("idle");

  async function sendProbe() {
    setState("sending");
    const accepted = await reportTechnicalSignal({
      name: "system.lifecycle",
      severity: "info",
      metadata: {
        component: "engineering-observability-probe",
        operation: "manual-check",
        status: "ready",
        online: navigator.onLine,
      },
    });
    setState(accepted ? "accepted" : "failed");
  }

  return (
    <section className="card observability-probe">
      <h2>Technical signal probe</h2>
      <p>固定された技術信号だけを、個人情報なしでサーバーログへ送ります。</p>
      <button className="primary-action" type="button" onClick={() => void sendProbe()} disabled={state === "sending"}>
        {state === "sending" ? "送信中…" : "検証信号を送信"}
      </button>
      {state === "accepted" && <LifecycleState kind="notice" title="技術信号を受け付けました。" compact />}
      {state === "failed" && <LifecycleState kind="error" title="技術信号を送信できませんでした。" compact />}
    </section>
  );
}
