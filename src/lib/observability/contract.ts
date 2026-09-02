export const technicalSignalNames = [
  "system.client_error",
  "system.asset_failure",
  "system.performance",
  "system.lifecycle",
] as const;

export type TechnicalSignalName = typeof technicalSignalNames[number];
export type TechnicalSignalSeverity = "info" | "warn" | "error";

export type TechnicalSignal = {
  schemaVersion: 1;
  eventId: string;
  correlationId: string;
  name: TechnicalSignalName;
  severity: TechnicalSignalSeverity;
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
};

export type TechnicalSignalInput = Pick<TechnicalSignal, "name" | "severity"> & {
  metadata?: Record<string, unknown>;
};

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const severities = new Set<TechnicalSignalSeverity>(["info", "warn", "error"]);
const signalNames = new Set<string>(technicalSignalNames);

export function isCorrelationId(value: unknown): value is string {
  return typeof value === "string" && idPattern.test(value);
}

export function isTechnicalSignalName(value: unknown): value is TechnicalSignalName {
  return typeof value === "string" && signalNames.has(value);
}

export function isTechnicalSignalSeverity(value: unknown): value is TechnicalSignalSeverity {
  return typeof value === "string" && severities.has(value as TechnicalSignalSeverity);
}
