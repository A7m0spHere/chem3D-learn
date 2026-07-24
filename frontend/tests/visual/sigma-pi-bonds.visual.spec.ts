import { expect, test } from "@playwright/test";

const orbitalScreenshotOptions = { maxDiffPixelRatio: 0.005 } as const;

test.describe("σ 键 / π 键轨道模块", () => {
  test("σ 键模块展示 XYZ 坐标系并可切换 s-s 与 s-p", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/sigma-bond-orbitals");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("sigma-bond-orbitals-viewer");
    const canvasArea = page.getByTestId("sigma-bond-orbitals-canvas");

    await expect(viewer.getByText("s-s σ 键｜球形轨道沿 X 轴正面重叠", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(canvasArea.getByText("X", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Y", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Z", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "标注" }).click();
    const xLabel = canvasArea.getByText("X", { exact: true });
    const axisExplanation = canvasArea.getByText("X 轴：键轴 / 两核连线", { exact: true });
    await expect(axisExplanation).toBeVisible();
    const [xLabelBox, axisExplanationBox] = await Promise.all([
      xLabel.boundingBox(),
      axisExplanation.boundingBox(),
    ]);
    expect(xLabelBox).not.toBeNull();
    expect(axisExplanationBox).not.toBeNull();
    expect(rectanglesOverlap(xLabelBox!, axisExplanationBox!)).toBe(false);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("sigma-bond-ss-overlap-viewer.png", orbitalScreenshotOptions);

    await page.getByRole("button", { exact: true, name: "s-p σ 键" }).click();
    await expect(viewer.getByText("s-p σ 键｜s 轨道与 p 轨道头碰头重叠", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("s-p 头碰头重叠", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("sigma-bond-sp-overlap-viewer.png", orbitalScreenshotOptions);
  });

  test("π 键模块展示 p-p 成键阶段和播放状态", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/pi-bond-orbitals");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("pi-bond-orbitals-viewer");
    const canvasArea = page.getByTestId("pi-bond-orbitals-canvas");

    await expect(viewer.getByText("p-p π 键｜成键前的平行 p 轨道", { exact: true })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { exact: true, name: "标注" }).click();
    await expect(canvasArea.getByText("尚未有效重叠", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("p-p 肩并肩重叠", { exact: true })).toHaveCount(0);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("pi-bond-before-overlap-viewer.png", orbitalScreenshotOptions);

    await page.getByRole("button", { exact: true, name: "成键中" }).click();
    await expect(viewer.getByText("p-p π 键｜肩并肩重叠正在形成", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("p-p 肩并肩重叠", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("pi-bond-forming-overlap-viewer.png", orbitalScreenshotOptions);

    await page.getByRole("button", { exact: true, name: "成键后" }).click();

    await expect(viewer.getByText("p-p π 键｜键轴上下两侧的 π 电子云", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("π 电子云", { exact: true })).toHaveCount(1);
    await expect(canvasArea.getByText("p-p 肩并肩重叠", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("pi-bond-electron-cloud-viewer.png", orbitalScreenshotOptions);

    await page.getByRole("button", { exact: true, name: "播放" }).click();
    await expect(page.getByRole("button", { exact: true, name: "暂停" })).toBeVisible();
  });

  test("旧合并模块不再出现在模块列表", async ({ page }) => {
    await page.goto("/modules");

    await expect(page.getByText("σ 键与 π 键", { exact: true })).toHaveCount(0);
    await expect(page.getByText("从乙烯双键看 1σ + 1π", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { exact: true, name: "σ 键" })).toBeVisible();
    await expect(page.getByRole("heading", { exact: true, name: "π 键" })).toBeVisible();
  });
});

function rectanglesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}
