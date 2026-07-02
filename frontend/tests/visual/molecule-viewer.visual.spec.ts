import { expect, test } from "@playwright/test";

test.describe("普通分子 Viewer 三段式教学信息", () => {
  test("NH3 孤电子对步骤使用顶部结论和底部原因", async ({ page }) => {
    await page.goto("/module/pyramidal-nh3");

    const viewer = page.getByTestId("molecule-viewer");
    await expect(viewer.getByText("NH3｜识别孤电子对", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "氮原子上方有一对孤电子对。它参与电子对空间排布，但不是一个原子。",
        { exact: true },
      ),
    ).toBeVisible();
    await page.getByRole("button", { exact: true, name: "孤电子对" }).click();
    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("molecule-viewer-nh3-lone-pair.png");
  });

  test("H2O 键角步骤保留角弧但解释不进入 Canvas", async ({ page }) => {
    await page.goto("/module/v-shape-h2o");
    await page.getByRole("button", { exact: true, name: "下一步" }).click();
    await page.getByRole("button", { exact: true, name: "下一步" }).click();
    // 到达 bond-angle 步骤后，goToStep 依据 step.showAngles 自动显示角弧，
    // 因此无需再点“键角”toggle（那会把已显示的角弧关掉，与“保留角弧”的用意相悖）。

    const viewer = page.getByTestId("molecule-viewer");
    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    await expect(viewer.getByText("H2O｜观察键角进一步减小", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("约 104.5°", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toHaveCount(2);
    await expect(
      canvasArea.getByText(
        "显示 H-O-H 键角后，可以看到水分子的典型键角约为 104.5°，比 NH3 的键角更小。",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("BF3 平面三角形步骤显示模式摘要", async ({ page }) => {
    await page.goto("/module/planar-bf3");
    await page.getByRole("button", { exact: true, name: "下一步" }).click();

    const viewer = page.getByTestId("molecule-viewer");
    await expect(viewer.getByText("BF3｜观察平面三角形", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "三个 B-F 键位于同一平面内，三个氟原子围绕硼原子均匀展开，形成平面三角形。",
        { exact: true },
      ),
    ).toBeVisible();
  });
});
