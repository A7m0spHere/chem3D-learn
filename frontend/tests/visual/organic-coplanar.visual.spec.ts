import { expect, test } from "@playwright/test";

test.describe("有机共面模块视觉回归", () => {
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
