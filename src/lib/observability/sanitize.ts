import {
  isCorrelationId,
  isTechnicalSignalName,
  isTechnicalSignalSeverity,
  type TechnicalSignal,
} from "./contract.ts";

const stringLimits = {
  component: 64,
  operation: 64,
  errorCode: 48,
  status: 32,
  assetId: 96,
  routePath: 160,
} as const;
const numberKeys = new Set(["durationMs", "value", "attempt"]);
const booleanKeys = new Set(["recovered", "online"]);
const safeString = /^[a-zA-Z0-9._:/-]+$/;

export function sanitizeTechnicalMetadata(value: unknown) {
  const sanitized: Record<string, string | number | boolean> = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return sanitized;

  for (const [key, raw] of Object.entries(value)) {
    if (key in stringLimits && typeof raw === "string") {
      const limit = stringLimits[key as keyof typeof stringLimits];
      if (raw.length <= limit && safeString.test(raw) && !raw.includes("?")) sanitized[key] = raw;
    } else if (numberKeys.has(key) && typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 86_400_000) {
      sanitized[key] = raw;
    } else if (booleanKeys.has(key) && typeof raw === "boolean") {
      sanitized[key] = raw;
    }
  }

  return sanitized;
}

export function validateTechnicalSignal(value: unknown): TechnicalSignal | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1) return null;
  if (!isCorrelationId(candidate.eventId) || !isCorrelationId(candidate.correlationId)) return null;
  if (!isTechnicalSignalName(candidate.name) || !isTechnicalSignalSeverity(candidate.severity)) return null;
  if (typeof candidate.occurredAt !== "string" || !Number.isFinite(Date.parse(candidate.occurredAt))) return null;

  return {
    schemaVersion: 1,
    eventId: candidate.eventId,
    correlationId: candidate.correlationId,
    name: candidate.name,
    severity: candidate.severity,
    occurredAt: candidate.occurredAt,
    metadata: sanitizeTechnicalMetadata(candidate.metadata),
  };
}
