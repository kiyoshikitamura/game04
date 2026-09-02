import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeTechnicalMetadata, validateTechnicalSignal } from "../../src/lib/observability/sanitize.ts";

const validSignal = {
  schemaVersion: 1,
  eventId: "10000000-0000-4000-8000-000000000001",
  correlationId: "10000000-0000-4000-8000-000000000002",
  name: "system.lifecycle",
  severity: "info",
  occurredAt: "2026-09-02T00:00:00.000Z",
  metadata: { component: "unit-probe", operation: "validate", online: true },
};

test("technical metadata keeps only bounded operational fields", () => {
  const sanitized = sanitizeTechnicalMetadata({
    component: "safe-component",
    durationMs: 42,
    recovered: true,
    email: "person@example.invalid",
    token: "secret-token",
    message: "raw failure text",
    routePath: "/home?private=value",
  });
  assert.deepEqual(sanitized, { component: "safe-component", durationMs: 42, recovered: true });
  assert.equal(JSON.stringify(sanitized).includes("example.invalid"), false);
  assert.equal(JSON.stringify(sanitized).includes("secret-token"), false);
});

test("valid technical signals are normalized", () => {
  assert.deepEqual(validateTechnicalSignal(validSignal), validSignal);
});

test("unknown names, invalid identifiers, and malformed timestamps are rejected", () => {
  assert.equal(validateTechnicalSignal({ ...validSignal, name: "product.character_selected" }), null);
  assert.equal(validateTechnicalSignal({ ...validSignal, eventId: "not-an-id" }), null);
  assert.equal(validateTechnicalSignal({ ...validSignal, occurredAt: "not-a-date" }), null);
});

test("server validation strips unapproved metadata before logging", () => {
  const result = validateTechnicalSignal({
    ...validSignal,
    metadata: { component: "api-probe", password: "do-not-log", value: 7 },
  });
  assert.deepEqual(result?.metadata, { component: "api-probe", value: 7 });
});
