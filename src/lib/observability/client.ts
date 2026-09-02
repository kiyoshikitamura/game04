"use client";

import type { TechnicalSignal, TechnicalSignalInput } from "./contract.ts";
import { sanitizeTechnicalMetadata } from "./sanitize.ts";

let pageCorrelationId: string | undefined;

export function getPageCorrelationId() {
  pageCorrelationId ??= crypto.randomUUID();
  return pageCorrelationId;
}

export function createTechnicalSignal(input: TechnicalSignalInput): TechnicalSignal {
  return {
    schemaVersion: 1,
    eventId: crypto.randomUUID(),
    correlationId: getPageCorrelationId(),
    name: input.name,
    severity: input.severity,
    occurredAt: new Date().toISOString(),
    metadata: sanitizeTechnicalMetadata(input.metadata),
  };
}

export async function reportTechnicalSignal(input: TechnicalSignalInput) {
  const signal = createTechnicalSignal(input);
  try {
    const response = await fetch("/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-ID": signal.correlationId,
      },
      body: JSON.stringify(signal),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}
