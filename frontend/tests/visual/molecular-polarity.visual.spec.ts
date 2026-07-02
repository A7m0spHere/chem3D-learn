import { expect, test } from "@playwright/test";

test.describe("分子极性判断模块视觉回归", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/module/polarity-judgment");
    await page.addStyleTag({ content: "header { display: none !important; }" });
  });

  test("电负性示意显示偏移电子云", async ({ page }) => {
    test.setTimeout(45_000);

    await page.getByRole("button", { exact: true, name: "电负性" }).click();

    const viewer = page.getByTestId("molecular-polarity-viewer");
    const canvasArea = page.getByTestId("molecular-polarity-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("电负性：F > O > Cl > B > H｜先判断电子偏移方向", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(canvasArea.getByText("电子云偏向 F", { exact: true })).toBeVisible();

    await page.waitForTimeout(800);

    await expect(canvasArea).toHaveScreenshot("molecular-polarity-electronegativity-viewer.png");
  });

  test("HClO 弯曲结构与轻量标签布局稳定", async ({ page }) => {
    test.setTimeout(45_000);

    await page.getByRole("button", { exact: true, name: "HClO" }).click();

    const viewer = page.getByTestId("molecular-polarity-viewer");
    const canvasArea = page.getByTestId("molecular-polarity-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("HClO：极性分子｜合偶极矩 ≠ 0", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "结构是 H–O–Cl，弯曲且不对称；O–H：H→O · O–Cl：Cl→O",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(canvasArea.getByText("HClO：极性分子", { exact: true })).toHaveCount(0);
    await expect(
      canvasArea.getByText("结构是 H–O–Cl，弯曲且不对称", { exact: true }),
    ).toHaveCount(0);

    await page.waitForTimeout(800);

    await expect(canvasArea).toHaveScreenshot("molecular-polarity-hclo-viewer.png");
  });

  test("BF3 平面三角形反例与对称抵消标注稳定", async ({ page }) => {
    test.setTimeout(45_000);

    await page.getByRole("button", { exact: true, name: "BF₃" }).click();

    const viewer = page.getByTestId("molecular-polarity-viewer");
    const canvasArea = page.getByTestId("molecular-polarity-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("BF₃：非极性分子｜合偶极矩 = 0", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "平面三角形，三个键偶极对称抵消；3 个 B–F 键偶极对称抵消",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(canvasArea.getByText("BF₃：非极性分子", { exact: true })).toHaveCount(0);
    await expect(canvasArea.getByText("约120°", { exact: true })).toBeVisible();

    await page.waitForTimeout(800);

    await expect(canvasArea).toHaveScreenshot("molecular-polarity-bf3-viewer.png");
  });
});
