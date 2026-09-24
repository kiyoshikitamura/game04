import { expect, test } from "@playwright/test";

const routes = ["terms", "privacy", "tokusho", "payments", "cookies", "age-rating", "rights", "contact"];

for (const width of [320, 390, 768]) {
  test(`GAME04 legal pages scroll and preserve return context at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    for (const route of routes) {
      await page.goto(`/legal/${route}?from=settings`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveTitle(/戦国姫艶武/);
      const root = page.locator(".legal-page");
      await expect(root).toContainText("草案");
      const bounds = await root.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
        return { width: node.clientWidth, scrollWidth: node.scrollWidth, top: node.scrollTop, height: node.clientHeight, total: node.scrollHeight };
      });
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
      expect(bounds.top + bounds.height).toBeGreaterThanOrEqual(bounds.total - 1);
      await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeVisible();
      for (const href of await page.locator('a[href^="/legal/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute("href")))) {
        expect(href).toContain("from=settings");
      }
    }
  });
}

test("VIP terms and existing contact match GAME04 authority", async ({ page }) => {
  await page.goto("/legal/payments");
  await expect(page.locator("main")).toContainText("税込480円");
  await expect(page.locator("main")).toContainText("720時間");
  await expect(page.locator("main")).toContainText("696時間");
  await expect(page.locator("main")).toContainText("自動更新はありません");
  await expect(page.locator("main")).toContainText("無償分から先");
  await page.goto("/legal/contact");
  await expect(page.getByRole("link", { name: "original.title.support@gmail.com", exact: true })).toHaveAttribute("href", /^mailto:original.title.support@gmail.com\?subject=/);
});
