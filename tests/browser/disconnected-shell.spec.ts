import { expect, test } from "@playwright/test";

test("disconnected title and home shell remain usable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "GAME04", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "認証設定を読み込んでいます。" })).toBeVisible();

  await page.getByRole("link", { name: "開発用ホームへ" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ゲーム接続を準備しています。" })).toBeVisible();
});

test("known session reasons are clear and unknown reasons stay hidden", async ({ page }) => {
  await page.goto("/?reason=session-expired&next=https://example.invalid");
  await expect(page.getByRole("heading", { name: "ログイン状態のお知らせ" })).toBeVisible();
  await expect(page.getByText("ログインの有効期限が切れました。もう一度ログインしてください。")).toBeVisible();

  await page.goto("/?reason=untrusted-message");
  await expect(page.getByRole("heading", { name: "ログイン状態のお知らせ" })).toHaveCount(0);
});
