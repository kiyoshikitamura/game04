"use client";

import { useEffect } from "react";
import { LifecycleState } from "./components/LifecycleState";
import { reportTechnicalSignal } from "@/lib/observability/client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reportTechnicalSignal({
      name: "system.client_error",
      severity: "error",
      metadata: {
        component: "app-error-boundary",
        operation: "render",
        errorCode: error.digest ? "render-digest" : "render-error",
        routePath: window.location.pathname,
        online: navigator.onLine,
      },
    });
  }, [error]);

  return (
    <main className="shell title-shell">
      <p className="eyebrow">GAME04 · RECOVERY</p>
      <LifecycleState
        kind="error"
        title="画面を表示できませんでした。"
        message="問題を記録しました。もう一度読み込んでも解消しない場合は、時間をおいてお試しください。"
        actionLabel="再試行"
        onAction={reset}
      />
    </main>
  );
}
