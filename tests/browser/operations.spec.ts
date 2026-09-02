import { expect, test } from "@playwright/test";

test("operations page exposes current state without a browser-side mutation control", async ({ page }) => {
  await page.goto("/engineering/operations");
  await expect(page.getByRole("heading", { name: "運用状態" })).toBeVisible();
  await expect(page.locator("[data-current-operational-state]")) .toHaveAttribute("data-current-operational-state", "enabled");
  await expect(page.getByText("この画面には管理用の秘密情報や変更操作を置きません。")).toBeVisible();
  await expect(page.getByRole("button", { name: /有効|無効|変更/ })).toHaveCount(0);
});

test("maintenance presentation gives a bounded status and retry path", async ({ page }) => {
  await page.goto("/engineering/operations");
  const preview = page.locator(".availability-preview");
  await expect(preview.locator("[data-operational-state=maintenance]")).toBeVisible();
  await expect(preview.getByRole("heading", { name: "メンテナンス中です" })).toBeVisible();
  await expect(preview.getByRole("button", { name: "状態を再確認" })).toBeVisible();
  await expect(preview.getByText("状態コード: system.maintenance")).toBeVisible();
});
