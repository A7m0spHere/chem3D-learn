import { expect, test } from "@playwright/test";

test.describe("有机共面模块视觉回归", () => {
  test("精简信息保留综合模型与 45° 构象边界", async ({ page }) => {
    await page.goto("/module/organic-coplanar");

    await expect(page.getByText(/这是理想化综合模型，不是单纯苯乙烯/)).toBeVisible();
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await page.getByTestId("structure-info-toggle").click();
    await expect(page.getByText(/默认 45° 与“对齐平面”是几何示意/)).toBeVisible();

    await page.getByRole("button", { exact: true, name: "sp² 片段" }).click();
    await expect(page.getByText(/当前 45° 是理想化代表姿态，不是所有苯乙烯类结构的唯一构象/)).toBeVisible();
    await expect(page.getByText(/TODO-CHEM-VERIFY/)).toHaveCount(0);
  });

  test("胺基标签避让孤电子对", async ({ page }) => {
    await page.goto("/module/organic-coplanar");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    await page.getByRole("button", { exact: true, name: "胺基" }).click();

    const viewer = page.getByTestId("organic-coplanar-viewer");
    const canvasArea = page.getByTestId("organic-coplanar-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(canvasArea.getByText("NH2 · 空间示意", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);

    await expect(canvasArea).toHaveScreenshot("organic-coplanar-amine-viewer.png");
  });
});
