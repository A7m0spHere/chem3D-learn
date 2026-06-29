import { expect, test } from "@playwright/test";

test.describe("σ/π 键模块视觉回归", () => {
  test("π 键模式只保留轻量空间标签", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/sigma-pi-bonds");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    await page.getByRole("button", { exact: true, name: "π 键" }).click();
    await page.getByRole("button", { exact: true, name: "标注" }).click();

    const viewer = page.getByTestId("sigma-pi-bonds-viewer");
    const canvasArea = page.getByTestId("sigma-pi-bonds-canvas");
    await expect(viewer.getByText("π 键｜两个 p 轨道侧向重叠", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "两个未杂化 p 轨道保持平行，在键轴上下两侧形成 π 电子云。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(canvasArea.getByText("π 电子云", { exact: true })).toHaveCount(1);
    await expect(
      canvasArea.getByText("p 轨道肩并肩重叠形成 π 键", { exact: true }),
    ).toHaveCount(0);

    await page.waitForTimeout(700);
    await expect(canvasArea).toHaveScreenshot("sigma-pi-bonds-pi-viewer.png", {
      timeout: 20_000,
    });
  });
});
