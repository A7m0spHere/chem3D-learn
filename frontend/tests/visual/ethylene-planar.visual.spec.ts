import { expect, test } from "@playwright/test";

test.describe("乙烯平面结构模块视觉回归", () => {
  test("5 个教学模式基础可见", async ({ page }) => {
    test.setTimeout(120_000);
    // The visual suite runs files in parallel; let the existing WebGL-heavy
    // organic snapshot finish before opening a second Three.js canvas.
    await page.waitForTimeout(10_000);

    await page.goto("/module/ethylene-planar");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("ethylene-planar-viewer");
    const canvasArea = page.getByTestId("ethylene-planar-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(page.getByText("3D 交互容器")).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "整体结构" }).click();
    await expect(
      viewer.getByText("乙烯 C₂H₄｜所有原子近似共面", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "每个碳原子采用 sp² 杂化，乙烯的 2 个 C 和 4 个 H 位于同一平面内。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(viewer.getByTestId("ethylene-sp2-label")).toHaveCount(2);
    await expect(page.getByRole("complementary")).toHaveCount(0);
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.getByRole("button", { exact: true, name: "共面验证" }).click();
    await expect(
      viewer.getByText("乙烯 C₂H₄｜六个原子位于同一平面", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "两个 sp² 碳和四个 H 原子位于同一分子平面，侧视时可以直接验证。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(viewer.getByTestId("ethylene-sp2-label")).toHaveCount(0);
    await expect(page.getByText("所有原子 z = 0", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { exact: true, name: "侧视" }).click();
    await expect(
      page.getByRole("button", { exact: true, name: "侧视" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { exact: true, name: "键角" }).click();
    await expect(
      viewer.getByText("sp² 碳｜平面三角结构｜键角约 120°", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "每个 C 周围有 3 个 σ 键电子域，采用 sp² 杂化，因此局部近似平面三角形。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(canvasArea.getByText("≈120°", { exact: true })).toHaveCount(2);
    await expect(viewer.getByTestId("ethylene-sp2-label")).toHaveCount(2);
    await expect(page.getByText("sp² 碳：近似平面三角形", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("structure-info-disclosure")).toContainText(
      "代表性键角约 120°",
    );

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("ethylene-planar-angle-viewer.png", {
      timeout: 20_000,
    });

    await page.getByRole("button", { exact: true, name: "π 键" }).click();
    await expect(
      viewer.getByText("C=C 双键｜1 个 σ 键 + 1 个 π 键", { exact: true }),
    ).toBeVisible();
    await expect(
      viewer.getByText(
        "两个未杂化 p 轨道保持平行并侧向重叠，在分子平面上下形成 π 键。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(viewer.getByTestId("ethylene-sp2-label")).toHaveCount(0);
    await expect(page.getByText("C=C = σ 键 + π 键", { exact: true })).toHaveCount(0);
    await expect(page.getByText("π 电子云（上方）", { exact: true })).toHaveCount(0);
    await expect(page.getByText("π 电子云（下方）", { exact: true })).toHaveCount(0);

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("ethylene-planar-pi-bond-viewer.png", {
      timeout: 20_000,
    });

    await page.getByRole("button", { exact: true, name: "旋转限制" }).click();
    await expect(viewer.getByText("C=C 双键｜不能自由旋转", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "绕 C=C 扭转会破坏 p 轨道的平行侧向重叠，因此双键不能像单键一样自由旋转。",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(viewer.getByTestId("ethylene-sp2-label")).toHaveCount(0);
    await expect(page.getByText("禁止自由旋转", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("若强行扭转，p 轨道不再平行，π 键会被破坏", { exact: true }),
    ).toHaveCount(0);
    await expect(page.getByTestId("structure-info-disclosure")).toContainText("双键扭转受限");
  });

  test("移动端三段式布局不覆盖 Canvas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/ethylene-planar");
    await page.addStyleTag({ content: "header { display: none !important; }" });

    const viewer = page.getByTestId("ethylene-planar-viewer");
    const topbar = page.getByTestId("ethylene-planar-viewer-topbar");
    const canvasArea = page.getByTestId("ethylene-planar-canvas");
    const summary = page.getByTestId("ethylene-planar-viewer-summary");

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
