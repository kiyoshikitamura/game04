export const operationalStates = ["enabled", "maintenance", "disabled"] as const;
export type OperationalState = (typeof operationalStates)[number];

export type ApplicationAvailability = {
  state: OperationalState;
  messageCode: string | null;
  source: "dev-clean" | "fallback";
};

type OperationalRow = {
  feature_key?: unknown;
  state?: unknown;
  message_code?: unknown;
};

export const enabledFallback: ApplicationAvailability = {
  state: "enabled",
  messageCode: null,
  source: "fallback",
};

export function normalizeApplicationAvailability(input: unknown): ApplicationAvailability {
  if (!Array.isArray(input)) return enabledFallback;

  const row = input.find((candidate): candidate is OperationalRow => (
    typeof candidate === "object"
    && candidate !== null
    && (candidate as OperationalRow).feature_key === "application"
  ));
  if (!row || !operationalStates.includes(row.state as OperationalState)) return enabledFallback;

  const messageCode = typeof row.message_code === "string"
    && /^[a-z][a-z0-9_.-]{0,63}$/.test(row.message_code)
    ? row.message_code
    : null;

  return { state: row.state as OperationalState, messageCode, source: "dev-clean" };
}
