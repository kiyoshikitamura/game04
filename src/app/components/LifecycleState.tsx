"use client";

type LifecycleStateProps = {
  kind: "loading" | "unavailable" | "error" | "notice";
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function LifecycleState({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: LifecycleStateProps) {
  const live = kind === "error" ? "assertive" : "polite";

  return (
    <section
      className={`lifecycle-state lifecycle-${kind}${compact ? " lifecycle-compact" : ""}`}
      role={kind === "error" ? "alert" : "status"}
      aria-live={live}
      aria-busy={kind === "loading"}
    >
      {kind === "loading" && <span className="loading-indicator" aria-hidden="true" />}
      <div>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
      </div>
      {actionLabel && onAction && (
        <button className="secondary-action" type="button" onClick={onAction}>{actionLabel}</button>
      )}
    </section>
  );
}
