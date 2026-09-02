import { expect, test } from "@playwright/test";

test("versioned neutral assets load and unknown IDs use the fallback", async ({ page }) => {
  await page.goto("/engineering/assets");

  const sample = page.locator('[data-asset-id="system.sample.tile"]');
  await expect(sample).toBeVisible();
  await expect(sample).toHaveAttribute("loading", "lazy");
  await expect(sample).toHaveJSProperty("complete", true);

  const fallback = page.locator('[data-requested-asset-id="system.unknown.fixture"]');
  await expect(fallback).toHaveAttribute("data-asset-id", "system.placeholder");
  await expect(fallback).toHaveAttribute("loading", "eager");
  await expect(fallback).toBeVisible();
});

test("versioned assets and the mutable manifest receive different cache policies", async ({ request }) => {
  const asset = await request.get("/assets/versioned/system-sample-tile-v1.svg");
  expect(asset.ok()).toBeTruthy();
  expect(asset.headers()["cache-control"]).toContain("max-age=31536000");
  expect(asset.headers()["cache-control"]).toContain("immutable");

  const manifest = await request.get("/assets/manifest.v1.json");
  expect(manifest.ok()).toBeTruthy();
  expect(manifest.headers()["cache-control"]).toContain("must-revalidate");
  expect(manifest.headers()["cache-control"]).not.toContain("immutable");
});
