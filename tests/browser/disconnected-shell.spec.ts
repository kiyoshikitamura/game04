import { expect, test } from "@playwright/test";

test("disconnected title and home shell remain usable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "GAME04", exact: true })).toBeVisible();
  await expect(page.getByText("認証設定を読み込んでいます。Vercel環境値を確認してください。")).toBeVisible();

  await page.getByRole("link", { name: "開発用ホームへ" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByText("ゲーム接続を準備しています。")).toBeVisible();
});
