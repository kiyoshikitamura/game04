import assert from "node:assert/strict";
import { test } from "node:test";
import { authNavigationMessage, safeInternalPath } from "../../src/lib/auth/navigation.ts";
import { decideProtectedRouteAccess } from "../../src/lib/auth/route-access.ts";

test("safe return paths remain on the application origin", () => {
  assert.equal(safeInternalPath("/home?tab=profile", "/"), "/home?tab=profile");
  assert.equal(safeInternalPath("https://example.invalid", "/home"), "/home");
  assert.equal(safeInternalPath("//example.invalid/path", "/home"), "/home");
  assert.equal(safeInternalPath("/\\example.invalid/path", "/home"), "/home");
});

test("only known authentication reasons become player-visible messages", () => {
  assert.match(authNavigationMessage("session-expired") ?? "", /有効期限/);
  assert.equal(authNavigationMessage("unknown"), null);
  assert.equal(authNavigationMessage(undefined), null);
});

test("protected-route access distinguishes offline, authenticated, and redirect states", () => {
  assert.deepEqual(decideProtectedRouteAccess({ configured: false }), { mode: "offline" });
  assert.deepEqual(decideProtectedRouteAccess({ configured: true, userId: "player-id" }), {
    mode: "authenticated",
    userId: "player-id",
  });
  assert.deepEqual(decideProtectedRouteAccess({ configured: true }), {
    mode: "redirect",
    reason: "session-required",
  });
  assert.deepEqual(decideProtectedRouteAccess({ configured: true, authError: true }), {
    mode: "redirect",
    reason: "session-error",
  });
});
