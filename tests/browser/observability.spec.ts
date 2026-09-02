import { expect, test } from "@playwright/test";

const validSignal = {
  schemaVersion: 1,
  eventId: "20000000-0000-4000-8000-000000000001",
  correlationId: "20000000-0000-4000-8000-000000000002",
  name: "system.lifecycle",
  severity: "info",
  occurredAt: "2026-09-02T00:00:00.000Z",
  metadata: { component: "browser-probe", operation: "accept", online: true },
};

test("engineering probe sends an accepted correlated technical signal", async ({ page }) => {
  const requestPromise = page.waitForRequest((request) => request.url().endsWith("/api/telemetry"));
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/api/telemetry"));
  await page.goto("/engineering/observability");
  await page.getByRole("button", { name: "検証信号を送信" }).click();
  const request = await requestPromise;
  const response = await responsePromise;
  const payload = request.postDataJSON();

  expect(response.status()).toBe(200);
  expect(payload.name).toBe("system.lifecycle");
  expect(payload.correlationId).toBe(request.headers()["x-correlation-id"]);
  expect(JSON.stringify(payload)).not.toContain("email");
  expect(JSON.stringify(payload)).not.toContain("token");
  await expect(page.getByRole("heading", { name: "技術信号を受け付けました。" })).toBeVisible();
});

test("telemetry endpoint sanitizes metadata and rejects invalid boundaries", async ({ request }) => {
  const accepted = await request.post("/api/telemetry", {
    headers: { "X-Correlation-ID": validSignal.correlationId },
    data: { ...validSignal, metadata: { ...validSignal.metadata, email: "not-logged@example.invalid", token: "not-logged" } },
  });
  expect(accepted.status()).toBe(200);
  expect(await accepted.text()).not.toContain("example.invalid");
  expect(await accepted.text()).not.toContain("not-logged");

  const unknown = await request.post("/api/telemetry", { data: { ...validSignal, name: "product.unknown" } });
  expect(unknown.status()).toBe(400);

  const crossOrigin = await request.post("/api/telemetry", {
    headers: { Origin: "https://outside.invalid" },
    data: validSignal,
  });
  expect(crossOrigin.status()).toBe(403);

  const oversized = await request.post("/api/telemetry", {
    data: { ...validSignal, padding: "x".repeat(17 * 1024) },
  });
  expect(oversized.status()).toBe(413);
});
