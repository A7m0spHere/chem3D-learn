import { expect, test } from "@playwright/test";

test.describe("苯环平面结构模块视觉回归", () => {
  test("5 个教学模式基础可见", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/module/benzene-planar");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("benzene-planar-viewer");
    const canvasArea = page.getByTestId("benzene-planar-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(page.getByText("3D 交互容器")).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "整体结构" }).click();
    await expect(viewer.getByText("苯 C₆H₆｜12 个原子大共面", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "苯环是判断有机物共面问题的基础母体：6 个 C 和 6 个 H 可视为同一平面内的 12 个原子。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.getByRole("button", { exact: true, name: "共面验证" }).click();
    await expect(
      viewer.getByText("苯环平面｜12 个原子位于同一参考平面", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "苯环本身提供一个稳定的共面参考面，复杂有机物共面判断通常先从这个平面出发。",
        { exact: true },
      ),
    ).toBeVisible();
    await page.getByRole("button", { exact: true, name: "侧视" }).click();
    await expect(page.getByText("侧视验证 12 原子共面", { exact: true })).toHaveCount(2);

    await page.getByRole("button", { exact: true, name: "键角" }).click();
    await expect(
      viewer.getByText("苯环碳｜sp² 平面三角｜键角约 120°", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("≈120°", { exact: true })).toHaveCount(2);
    await expect(page.getByText("固定单双键交替", { exact: true })).toHaveCount(0);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("benzene-planar-angle-viewer.png", {
      timeout: 20_000,
    });

    await page.getByRole("button", { exact: true, name: "对位共线" }).click();
    await expect(viewer.getByText("对位方向｜H–C–C–H 四原子共线", { exact: true })).toBeVisible();
    await expect(canvasArea.getByTestId("benzene-diagonal-label")).toHaveCount(1);

    await page.getByRole("button", { exact: true, name: "大 π 键" }).click();
    await expect(
      viewer.getByText("苯环大 π 键｜平面上下的离域电子云", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByTestId("benzene-pi-label")).toHaveCount(1);
    await expect(page.getByText("这里使用高中课堂示意图表达，不代表精确轨道计算。", { exact: true })).toHaveCount(0);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("benzene-planar-pi-cloud-viewer.png", {
      timeout: 20_000,
    });
  });

  test("移动端三段式布局不覆盖 Canvas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/benzene-planar");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("benzene-planar-viewer");
    const topbar = page.getByTestId("benzene-planar-viewer-topbar");
    const canvasArea = page.getByTestId("benzene-planar-canvas");
    const summary = page.getByTestId("benzene-planar-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();

    const [topbarBox, canvasBox, summaryBox] = await Promise.all([
      topbar.boundingBox(),
      canvasArea.boundingBox(),
      summary.boundingBox(),
    ]);

    expect(topbarBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(canvasBox!.y + 1);
    expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
    expect(canvasBox!.height).toBeGreaterThan(260);

    const hasHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
