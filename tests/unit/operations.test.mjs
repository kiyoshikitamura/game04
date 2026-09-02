import assert from "node:assert/strict";
import { test } from "node:test";
import { enabledFallback, normalizeApplicationAvailability } from "../../src/lib/operations/contract.ts";

test("operational projection accepts the bounded application state", () => {
  assert.deepEqual(normalizeApplicationAvailability([{
    feature_key: "application",
    state: "maintenance",
    message_code: "system.maintenance",
    updated_at: "2026-09-02T00:00:00Z",
    operator_email: "must-not-cross-boundary@example.invalid",
  }]), {
    state: "maintenance",
    messageCode: "system.maintenance",
    source: "dev-clean",
  });
});

test("missing, malformed, and unknown operational data fails open", () => {
  assert.deepEqual(normalizeApplicationAvailability(null), enabledFallback);
  assert.deepEqual(normalizeApplicationAvailability([{ feature_key: "application", state: "broken" }]), enabledFallback);
  assert.deepEqual(normalizeApplicationAvailability([{ feature_key: "gameplay", state: "disabled" }]), enabledFallback);
});

test("unapproved message codes are removed from a valid state", () => {
  assert.deepEqual(normalizeApplicationAvailability([{
    feature_key: "application",
    state: "disabled",
    message_code: "unsafe free-form message",
  }]), { state: "disabled", messageCode: null, source: "dev-clean" });
});
