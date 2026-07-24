import { expect, test } from "@playwright/test";

test.describe("核心学习入口页面", () => {
  test("首页突出交互示例和知识入口", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "结构化学 3D 学习站" })).toBeVisible();
    await expect(page.getByText("从 CH₄ 认识正四面体", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "开始探索" })).toHaveAttribute("href", "/modules");
    await expect(page.locator("main > section").first()).toHaveScreenshot("home-learning-entry.png", { timeout: 15_000 });
  });

  test("模块页筛选后保留清晰的学习主题", async ({ page }) => {
    await page.goto("/modules");

    await page.getByRole("button", { name: "分子空间构型" }).click();
    await expect(page.getByRole("button", { name: "分子空间构型" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { level: 2, name: "分子空间构型" })).toBeVisible();
    await expect(page.getByText("可交互 3D").first()).toBeVisible();
    await expect(page.locator("main")).toHaveScreenshot("modules-molecular-geometry-filter.png", { timeout: 15_000 });
  });

  test("专题 Viewer 模块在结构库中标记为可交互 3D", async ({ page }) => {
    await page.goto("/modules");

    const customViewerModules = [
      "离子键形成",
      "σ 键",
      "π 键",
      "sp / sp² / sp³ 杂化轨道",
      "配位键形成",
      "分子极性判断",
      "乙炔直线结构",
      "苯环平面结构",
      "有机物原子共线共面分析",
    ];

    for (const title of customViewerModules) {
      const moduleCard = page.locator("article").filter({
        has: page.getByRole("heading", { level: 3, name: title, exact: true }),
      });
      await expect(moduleCard).toBeVisible();
      await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    }
  });
});
