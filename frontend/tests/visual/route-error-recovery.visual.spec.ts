import { expect, test } from "@playwright/test";
import { PRELOAD_RECOVERY_STORAGE_KEY } from "../../src/lib/preloadRecovery";

test("动态路由 chunk 持续失败时显示自定义恢复页", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(
    ({ key, timestamp }) => window.sessionStorage.setItem(key, String(timestamp)),
    { key: PRELOAD_RECOVERY_STORAGE_KEY, timestamp: Date.now() },
  );
  await page.route(/\/assets\/ModuleDetailPage-[^/]+\.js(?:\?.*)?$/, async (route) => {
    await route.abort("failed");
  });

  await page.goto("/module/tetrahedral-ch4", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/module\/tetrahedral-ch4$/);
  await expect(page.getByRole("heading", { name: "学习页面需要重新加载" })).toBeFocused();
  await expect(page.getByText("网站可能刚刚更新，请刷新后重试。", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "刷新并重试" })).toBeVisible();
  await expect(page.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
  await expect(page.getByText(/You can provide a way better UX/i)).toHaveCount(0);
  await expect(page.getByText("开发调试信息")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});
