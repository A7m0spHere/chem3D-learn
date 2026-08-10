import { expect, test } from "@playwright/test";

test.describe("乙炔直线结构模块视觉回归", () => {
  test("5 个教学模式基础可见", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/module/acetylene-linear");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("acetylene-linear-viewer");
    const canvasArea = page.getByTestId("acetylene-linear-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(page.getByText("3D 交互容器")).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "整体结构" }).click();
    await expect(
      viewer.getByText("乙炔 C₂H₂｜H–C≡C–H 四原子共线", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "乙炔中两个 sp 碳和两个 H 位于同一直线，是判断共线与共面的基础直线母体。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.getByRole("button", { exact: true, name: "共线验证" }).click();
    await expect(
      viewer.getByText("共线参考线｜四个原子位于同一轴线", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByTestId("acetylene-line-label")).toHaveCount(1);
    await page.getByRole("button", { exact: true, name: "侧视" }).click();
    await expect(page.getByText("侧视验证同轴", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "键角" }).click();
    await expect(viewer.getByText("sp 碳｜直线形结构｜键角 180°", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("180°", { exact: true })).toHaveCount(1);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("acetylene-linear-angle-viewer.png", {
      timeout: 20_000,
    });

    await page.getByRole("button", { exact: true, name: "π 键" }).click();
    await expect(
      viewer.getByText("C≡C 三键｜两组互相垂直的 π 键", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("这里只做高中课堂示意。", { exact: true }),
    ).toHaveCount(0);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("acetylene-linear-pi-bond-viewer.png", {
      timeout: 20_000,
    });

    await page.getByRole("button", { exact: true, name: "三键组成" }).click();
    await expect(viewer.getByText("C≡C 三键｜1 个 σ 键 + 2 个 π 键", { exact: true })).toBeVisible();
    await expect(canvasArea.getByTestId("acetylene-triple-label")).toHaveCount(1);
    await expect(
      page.getByText("三键不是三根完全相同的单键", { exact: true }),
    ).toHaveCount(0);
  });

  test("移动端三段式布局不覆盖 Canvas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/acetylene-linear");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("acetylene-linear-viewer");
    const topbar = page.getByTestId("acetylene-linear-viewer-topbar");
    const canvasArea = page.getByTestId("acetylene-linear-canvas");
    const summary = page.getByTestId("acetylene-linear-viewer-summary");

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
