import { expect, test, type Locator } from "@playwright/test";
import { inflateSync } from "node:zlib";
import {
  REN3_CELL_COUNTS,
  getRepresentativeRen3Coordination,
  getRepresentativeTriNitrogenUnit,
} from "../../src/components/three/ren3Geometry";

test.use({ viewport: { width: 1280, height: 1100 } });

test.describe("晶体与空隙 Viewer 模式摘要", () => {
  test("NaCl 配位与计数结论位于 Viewer 外壳", async ({ page }) => {
    await page.goto("/module/nacl-crystal");
    const viewer = page.getByTestId("nacl-viewer");

    await page.getByRole("button", { exact: true, name: "六配位" }).click();
    await expect(viewer.getByText("NaCl｜六配位", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "粒子计数" }).click();
    await expect(viewer.getByText("NaCl｜粒子计数", { exact: true })).toBeVisible();
  });

  test("石墨层间作用说明不覆盖 Canvas", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "层间作用力" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜层间作用力", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText(
        "层间虚线只表示较弱的范德华力，不是普通 C-C 共价键。层与层之间容易相对滑动，可解释石墨较软、有润滑性。",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("石墨离域 π 电子云有独立视觉快照", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "离域 π 电子" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜离域 π 电子", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "graphite-pi-electron-cloud-viewer.png");
  });

  test("h-BN 支持 B/N 交替、层间作用力和对比石墨模式", async ({ page }) => {
    await page.goto("/module/hbn-structure");

    const viewer = page.getByTestId("hbn-viewer");
    const canvasArea = page.getByTestId("hbn-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("BN｜层状结构", { exact: true })).toBeVisible();
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page.getByTestId("observation-guide-card")).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "B-N 共价键" }).click();
    await expect(viewer.getByText("BN｜B-N 共价键", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "层间作用力" }).click();
    await expect(viewer.getByText("BN｜层间作用力", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText(
        "层间虚线表示较弱相互作用。与石墨一样，层与层之间不是普通共价键，但 B/N 交替会带来不同的上下层对应方式。",
        { exact: true },
      ),
    ).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "对比石墨" }).click();
    await expect(viewer.getByText("BN｜对比石墨", { exact: true })).toBeVisible();
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("h-BN 在 390px 手机宽度下 viewer 非空且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/hbn-structure");

    const viewer = page.getByTestId("hbn-viewer");
    const topbar = page.getByTestId("hbn-viewer-topbar");
    const canvasArea = page.getByTestId("hbn-canvas");
    const summary = page.getByTestId("hbn-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("Zn 分层模式和四面体空隙计数使用底部信息区", async ({ page }) => {
    await page.goto("/module/zinc-metal-crystal");
    const layerModeButton = page.getByRole("button", { exact: true, name: "分层堆积" });
    const ballStickButton = page.getByRole("button", { exact: true, name: "球棍模型" });
    const packingButton = page.getByRole("button", { exact: true, name: "堆积模型" });
    await expect(ballStickButton).toHaveAttribute("aria-pressed", "true");
    await expect(packingButton).toHaveAttribute("aria-pressed", "false");
    await layerModeButton.click();
    await expect(layerModeButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("Zn｜分层堆积", { exact: true }),
    ).toBeVisible();
    await packingButton.click();
    await expect(ballStickButton).toHaveAttribute("aria-pressed", "false");
    await expect(packingButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("堆积模型 · 拖拽旋转", { exact: true }),
    ).toBeVisible();

    await page.goto("/module/tetrahedral-voids");
    await page.getByRole("button", { exact: true, name: "计数" }).click();
    const viewer = page.getByTestId("tetrahedral-voids-viewer");
    await expect(viewer.getByText("四面体空隙：2N", { exact: true })).toBeVisible();
    await expect(
      page.getByTestId("tetrahedral-voids-canvas").getByText("四面体空隙：2N", {
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("PBA 模块支持框架、配位、空位水合和结构类比模式", async ({ page }) => {
    await page.goto("/module/pba-prussian-blue-analogues");

    const viewer = page.getByTestId("pba-viewer");
    const canvasArea = page.getByTestId("pba-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("PBA｜框架晶胞", { exact: true })).toBeVisible();
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.getByRole("button", { exact: true, name: "配位骨架" }).click();
    await expect(viewer.getByText("PBA｜配位骨架", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "空位水合" }).click();
    await expect(viewer.getByText("PBA｜空位水合｜完整框架", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "六氰空位" }).click();
    await expect(viewer.getByText("PBA｜空位水合｜六氰空位", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "水合/A位" }).click();
    await expect(viewer.getByText("PBA｜空位水合｜水合/A位", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "结构类比" }).click();
    await expect(viewer.getByText("PBA｜结构类比", { exact: true })).toBeVisible();
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("PBA 在 390px 手机宽度下 viewer 非空且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/pba-prussian-blue-analogues");

    const viewer = page.getByTestId("pba-viewer");
    const topbar = page.getByTestId("pba-viewer-topbar");
    const canvasArea = page.getByTestId("pba-canvas");
    const summary = page.getByTestId("pba-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("CaF₂ 页面公开晶胞计数、双配位与晶格模型说明", async ({ page }) => {
    await page.goto("/module/caf2-fluorite");

    const viewer = page.getByTestId("caf2-viewer");
    await page.getByTestId("structure-info-toggle").click();
    const crystalInfo = page.getByTestId("structure-info-disclosure");
    await expect(crystalInfo).toContainText(/立方 Fm-3m；Ca²⁺ 构成面心立方子晶格/);

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(crystalInfo).toContainText(/4 × 8 = 8 × 4/);

    await page.getByRole("button", { exact: true, name: "Ca²⁺ 8配位" }).click();
    await expect(viewer.getByText("CaF₂｜Ca²⁺ 8配位", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "F⁻ 4配位" }).click();
    await expect(viewer.getByText("CaF₂｜F⁻ 4配位", { exact: true })).toBeVisible();
    await expect(page.getByText(/TODO-CHEM-VERIFY/)).toHaveCount(0);
  });

  test("CaF₂ 支持双配位、四面体空隙三阶段和反萤石对比模式", async ({ page }) => {
    await page.goto("/module/caf2-fluorite");

    const viewer = page.getByTestId("caf2-viewer");
    const canvasArea = page.getByTestId("caf2-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("CaF₂｜晶胞结构", { exact: true })).toBeVisible();
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "caf2-cell-viewer.png");

    await page.getByRole("button", { exact: true, name: "Ca²⁺ 8配位" }).click();
    await expect(viewer.getByText("CaF₂｜Ca²⁺ 8配位", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "caf2-ca-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "F⁻ 4配位" }).click();
    await expect(viewer.getByText("CaF₂｜F⁻ 4配位", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(viewer.getByText("CaF₂｜晶胞计数", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "四面体空隙" }).click();
    await expect(viewer.getByText("CaF₂｜四面体空隙｜Ca²⁺ 骨架", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "显示空隙" }).click();
    await expect(viewer.getByText("CaF₂｜四面体空隙｜显示空隙", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "F⁻ 全部填入" }).click();
    await expect(viewer.getByText("CaF₂｜四面体空隙｜F⁻ 全部填入", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "caf2-voids-filled-viewer.png");

    await page.getByRole("button", { exact: true, name: "反萤石对比" }).click();
    await expect(viewer.getByText("CaF₂｜反萤石对比", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "caf2-antifluorite-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("BaTiO₃ 支持 TiO₆、双配位、晶胞计数和等价原点", async ({ page }) => {
    await page.goto("/module/batio3-perovskite");

    const viewer = page.getByTestId("batio3-viewer");
    const canvasArea = page.getByTestId("batio3-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("BaTiO₃｜晶胞结构", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { exact: true, name: "晶胞结构" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-cell-viewer.png");

    const tiOctahedronButton = page.getByRole("button", { exact: true, name: "TiO₆ 八面体" });
    await tiOctahedronButton.click();
    await expect(tiOctahedronButton).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { exact: true, name: "晶胞结构" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(viewer.getByText("BaTiO₃｜TiO₆ 八面体", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-ti-octahedron-viewer.png");

    await page.getByRole("button", { exact: true, name: "Ti⁴⁺ 6配位" }).click();
    await expect(viewer.getByText("BaTiO₃｜Ti⁴⁺ 6配位", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-ti-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "Ba²⁺ 12配位" }).click();
    await expect(viewer.getByText("BaTiO₃｜Ba²⁺ 12配位", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("12 个最近邻 O²⁻", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-ba-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(
      viewer.getByText("BaTiO₃｜晶胞计数", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "等价原点" }).click();
    await expect(
      viewer.getByText("BaTiO₃｜等价原点｜Ba 顶点画法", { exact: true }),
    ).toBeVisible();
    const baOriginButton = viewer.getByRole("button", { exact: true, name: "Ba 顶点画法" });
    const tiOriginButton = viewer.getByRole("button", { exact: true, name: "Ti 顶点画法" });
    await expect(baOriginButton).toHaveAttribute("aria-pressed", "true");
    await expect(tiOriginButton).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-alternate-drawing-viewer.png");

    await tiOriginButton.click();
    await expect(baOriginButton).toHaveAttribute("aria-pressed", "false");
    await expect(tiOriginButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      viewer.getByText("BaTiO₃｜等价原点｜Ti 顶点画法", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "batio3-alt-origin-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("BaTiO₃ 在 390px 手机宽度下可操作且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/batio3-perovskite");

    const viewer = page.getByTestId("batio3-viewer");
    const topbar = page.getByTestId("batio3-viewer-topbar");
    const canvasArea = page.getByTestId("batio3-canvas");
    const summary = page.getByTestId("batio3-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();
    await page.getByRole("button", { exact: true, name: "等价原点" }).click();
    await expect(viewer.getByRole("button", { exact: true, name: "Ti 顶点画法" })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("FCC/HCP 密堆积支持层序、十二配位、晶胞计数和对比总结", async ({ page }) => {
    await page.goto("/modules?category=crystal-structure");

    const moduleCard = page.locator("article").filter({ hasText: "金属晶体密堆积" });
    const moduleLink = moduleCard.getByRole("link", { name: /进入模块/ });
    await expect(moduleCard).toBeVisible();
    await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/metal-close-packing");
    await page.goto("/module/metal-close-packing");

    const viewer = page.getByTestId("metal-close-packing-viewer");
    const canvasArea = page.getByTestId("metal-close-packing-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("M｜单层密排", { exact: true })).toBeVisible();
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-layer-viewer.png");

    await page.getByRole("button", { exact: true, name: "HCP｜ABAB" }).click();
    await expect(viewer.getByText("M｜HCP｜ABAB", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-hcp-viewer.png");

    await page.getByRole("button", { exact: true, name: "FCC｜ABCABC" }).click();
    await expect(viewer.getByText("M｜FCC｜ABCABC", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-fcc-viewer.png");

    await page.getByRole("button", { exact: true, name: "12 配位" }).click();
    await expect(viewer.getByText("M｜12 配位", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("合计配位数 12", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(viewer.getByText("M｜晶胞计数", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-counting-viewer.png");

    await page.getByRole("button", { exact: true, name: "对比总结" }).click();
    await expect(
      viewer.getByText("M｜对比总结", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "metal-close-packing-comparison-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("FCC/HCP 密堆积在 390px 手机宽度下可操作且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/metal-close-packing");

    const viewer = page.getByTestId("metal-close-packing-viewer");
    const topbar = page.getByTestId("metal-close-packing-viewer-topbar");
    const canvasArea = page.getByTestId("metal-close-packing-canvas");
    const summary = page.getByTestId("metal-close-packing-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();
    await page.getByRole("button", { exact: true, name: "对比总结" }).click();
    await expect(canvasArea.getByText("共同：配位数 12｜η ≈ 74%", { exact: true })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("ZnS 支持晶型总览、层序、半填空隙、4:4 配位和晶胞计数", async ({ page }) => {
    await page.goto("/modules?category=crystal-structure");

    const moduleCard = page.locator("article").filter({ hasText: "ZnS 闪锌矿 / 纤锌矿" });
    const moduleLink = moduleCard.getByRole("link", { name: /进入模块/ });
    await expect(moduleCard).toBeVisible();
    await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/zns-polytypes");
    await page.goto("/module/zns-polytypes");

    const viewer = page.getByTestId("zns-viewer");
    const canvasArea = page.getByTestId("zns-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("ZnS｜晶型总览", { exact: true }),
    ).toBeVisible();
    const overviewButton = page.getByRole("button", { exact: true, name: "晶型总览" });
    const zincBlendeStackingButton = page.getByRole("button", {
      exact: true,
      name: "闪锌矿｜ABC",
    });
    await expect(overviewButton).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-comparison-viewer.png");

    await zincBlendeStackingButton.click();
    await expect(overviewButton).toHaveAttribute("aria-pressed", "false");
    await expect(zincBlendeStackingButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      viewer.getByText("ZnS｜闪锌矿｜ABC", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("闪锌矿｜ABCABC", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-zinc-blende-stacking-viewer.png");

    await page.getByRole("button", { exact: true, name: "纤锌矿｜AB" }).click();
    await expect(
      viewer.getByText("ZnS｜纤锌矿｜AB", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("纤锌矿｜ABAB", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-wurtzite-stacking-viewer.png");

    await page.getByRole("button", { exact: true, name: "半填空隙" }).click();
    await expect(
      viewer.getByText("ZnS｜半填空隙｜S 骨架｜闪锌矿", { exact: true }),
    ).toBeVisible();
    const frameworkStageButton = page.getByRole("button", { exact: true, name: "S 骨架" });
    const allVoidsStageButton = page.getByRole("button", { exact: true, name: "全部空隙" });
    await expect(frameworkStageButton).toHaveAttribute("aria-pressed", "true");
    await allVoidsStageButton.click();
    await expect(frameworkStageButton).toHaveAttribute("aria-pressed", "false");
    await expect(allVoidsStageButton).toHaveAttribute("aria-pressed", "true");
    await expect(canvasArea.getByText("N 个 S → 2N 个四面体空隙", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-zinc-blende-voids-viewer.png");

    await page.getByRole("button", { exact: true, name: "Zn 占一半" }).click();
    await expect(canvasArea.getByText("Zn 占 N 个｜恰好 1/2", { exact: true })).toBeVisible();
    const zincBlendeButton = viewer.getByRole("button", { exact: true, name: "闪锌矿" });
    const wurtziteButton = viewer.getByRole("button", { exact: true, name: "纤锌矿" });
    await expect(zincBlendeButton).toHaveAttribute("aria-pressed", "true");
    await wurtziteButton.click();
    await expect(zincBlendeButton).toHaveAttribute("aria-pressed", "false");
    await expect(wurtziteButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      viewer.getByText("ZnS｜半填空隙｜Zn 占一半｜纤锌矿", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-wurtzite-half-filled-viewer.png");

    await page.getByRole("button", { exact: true, name: "4:4 配位" }).click();
    await expect(
      viewer.getByText("ZnS｜4:4 配位｜Zn 中心", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("ZnS₄｜Zn 配位数 4", { exact: true })).toBeVisible();
    const znCenterButton = viewer.getByRole("button", { exact: true, name: "Zn 中心" });
    const sCenterButton = viewer.getByRole("button", { exact: true, name: "S 中心" });
    await expect(znCenterButton).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-zn-coordination-viewer.png");

    await sCenterButton.click();
    await expect(znCenterButton).toHaveAttribute("aria-pressed", "false");
    await expect(sCenterButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      viewer.getByText("ZnS｜4:4 配位｜S 中心", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("SZn₄｜S 配位数 4", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-s-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(viewer.getByText("ZnS｜晶胞计数", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("都化简为 ZnS", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "zns-counting-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("ZnS 在 390px 手机宽度下可切换空隙晶型且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/zns-polytypes");

    const viewer = page.getByTestId("zns-viewer");
    const topbar = page.getByTestId("zns-viewer-topbar");
    const canvasArea = page.getByTestId("zns-canvas");
    const summary = page.getByTestId("zns-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();
    await page.getByRole("button", { exact: true, name: "半填空隙" }).click();
    await page.getByRole("button", { exact: true, name: "Zn 占一半" }).click();
    await page.getByRole("button", { exact: true, name: "纤锌矿" }).click();
    await expect(canvasArea.getByText("纤锌矿｜ABA", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Zn 占 N 个｜恰好 1/2", { exact: true })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("MOF-5 支持构筑单元、局部配位、pcu 拓扑、孔隙客体和组成计数", async ({ page }) => {
    await page.goto("/modules?category=crystal-structure");

    const moduleCard = page.locator("article").filter({ hasText: "MOF 金属有机框架" });
    const moduleLink = moduleCard.getByRole("link", { name: /进入模块/ });
    await expect(moduleCard).toBeVisible();
    await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/mof-metal-organic-framework");

    await page.goto("/module/mof-metal-organic-framework");
    const viewer = page.getByTestId("mof5-viewer");
    const canvasArea = page.getByTestId("mof5-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("MOF-5｜立方拓扑", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { exact: true, name: "立方拓扑" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      canvasArea.getByText("虚线末端｜跨晶胞继续连接", { exact: true }),
    ).toBeVisible();

    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    const labelButton = page.getByRole("button", { exact: true, name: "标签" });
    await expect(labelButton).toHaveAttribute("aria-pressed", "false");
    await labelButton.click();
    await expect(labelButton).toHaveAttribute("aria-pressed", "true");
    await expect(canvasArea.getByText("Zn₄O SBU 节点", { exact: true })).toBeVisible();
    await labelButton.click();
    await expect(labelButton).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-cell-viewer.png");

    await page.getByRole("button", { exact: true, name: "构筑单元" }).click();
    await expect(
      viewer.getByText("MOF-5｜构筑单元", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("金属簇节点｜Zn₄O SBU", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("有机连接体｜BDC", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-building-units-viewer.png");

    await page.getByRole("button", { exact: true, name: "Zn₄O 节点" }).click();
    await expect(
      viewer.getByText("MOF-5｜Zn₄O 节点", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("Zn₄O 核心｜4 个 Zn", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("单个 Zn：O 四配位", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("整个 SBU：六连接方向", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-node-viewer.png");

    await page.getByRole("button", { exact: true, name: "BDC 连接体" }).click();
    await expect(viewer.getByText("MOF-5｜BDC 连接体", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("BDC²⁻｜线性二连接体", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("羧酸根接入节点", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-bdc-linker-viewer.png");

    await page.getByRole("button", { exact: true, name: "孔隙与客体" }).click();
    await expect(
      viewer.getByText("MOF-5｜孔隙与客体｜裸框架", { exact: true }),
    ).toBeVisible();
    const bareFrameworkButton = page.getByRole("button", { exact: true, name: "裸框架" });
    const poreVolumeButton = page.getByRole("button", { exact: true, name: "孔隙体积" });
    await expect(bareFrameworkButton).toHaveAttribute("aria-pressed", "true");
    await expect(poreVolumeButton).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-bare-framework-viewer.png");

    await poreVolumeButton.click();
    await expect(bareFrameworkButton).toHaveAttribute("aria-pressed", "false");
    await expect(poreVolumeButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      viewer.getByText("MOF-5｜孔隙与客体｜孔隙体积", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("孔隙体积（教学示意）", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-pore-volume-viewer.png");

    await page.getByRole("button", { exact: true, name: "加入客体" }).click();
    await expect(
      viewer.getByText("MOF-5｜孔隙与客体｜加入客体", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("客体分子（示意）", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-guest-filled-viewer.png");

    await page.getByRole("button", { exact: true, name: "组成计数" }).click();
    await expect(
      viewer.getByText("MOF-5｜组成计数", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("8×1/8 = 1 SBU", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("12×1/4 = 3 BDC", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Zn₄O(BDC)₃", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Fm-3m 常规晶胞：Z = 8", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mof5-counting-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("MOF-5 在 390px 手机宽度下可切换孔隙阶段且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/mof-metal-organic-framework");

    const viewer = page.getByTestId("mof5-viewer");
    const topbar = page.getByTestId("mof5-viewer-topbar");
    const canvasArea = page.getByTestId("mof5-canvas");
    const summary = page.getByTestId("mof5-viewer-summary");
    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

    await page.getByRole("button", { exact: true, name: "孔隙与客体" }).click();
    await page.getByRole("button", { exact: true, name: "孔隙体积" }).click();
    await expect(canvasArea.getByText("孔隙体积（教学示意）", { exact: true })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("MXene 支持 MAX 来源、五层片层、六配位、混合端基、重新堆叠和组成表达", async ({ page }) => {
    await page.goto("/modules?category=crystal-structure");

    const moduleCard = page.locator("article").filter({ hasText: "MXene 二维层状材料" });
    const moduleLink = moduleCard.getByRole("link", { name: /进入模块/ });
    await expect(moduleCard).toBeVisible();
    await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/mxene-2d-material");

    await page.goto("/module/mxene-2d-material");
    const viewer = page.getByTestId("mxene-viewer");
    const canvasArea = page.getByTestId("mxene-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜MAX → MXene", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await expect(canvasArea.getByText("MAX 前驱体｜Ti₃AlC₂", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Al 层", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("二维片层｜Ti₃C₂Tₓ", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-max-to-mxene-viewer.png");

    await page.getByRole("button", { exact: true, name: "五层片层" }).click();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜五层片层", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("厚度方向：Ti–C–Ti–C–Ti", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "标签" }).click();
    await expect(canvasArea.getByText("内部 Ti", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "标签" }).click();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-five-layer-viewer.png");

    await page.getByRole("button", { exact: true, name: "C 六配位" }).click();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜C 六配位", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("C 中心｜6 个 Ti 最近邻", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Ti₆ 八面体轮廓", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-carbon-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "表面端基" }).click();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜表面端基", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("O / OH / F 混合端基示意", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("O", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("OH", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("F", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-mixed-terminations-viewer.png");

    await page.getByRole("button", { exact: true, name: "重新堆叠" }).click();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜重新堆叠", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("端基化片层重新堆叠", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("层间水 / 离子（示意）", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-restacking-viewer.png");

    await page.getByRole("button", { exact: true, name: "组成表达" }).click();
    await expect(
      viewer.getByText("Ti₃C₂Tₓ｜组成表达", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("通式：Mₙ₊₁XₙTₓ", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Ti₃AlC₂", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Ti₃C₂", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("Ti₃C₂Tₓ", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText("Ti:C = 3:2 固定；Tₓ 的种类与数量可变", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "mxene-formula-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("MXene 在 390px 手机宽度下可观察混合端基且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/mxene-2d-material");

    const viewer = page.getByTestId("mxene-viewer");
    const topbar = page.getByTestId("mxene-viewer-topbar");
    const canvasArea = page.getByTestId("mxene-canvas");
    const summary = page.getByTestId("mxene-viewer-summary");
    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

    await page.getByRole("button", { exact: true, name: "表面端基" }).click();
    await expect(canvasArea.getByText("O / OH / F 混合端基示意", { exact: true })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("ReN₃ 支持压力窗口、N₃ 单元、Re 七配位、周期网络和组成计数", async ({ page }) => {
    test.setTimeout(120_000);
    expect(REN3_CELL_COUNTS).toEqual({ Re: 2, N: 6 });
    const coordination = getRepresentativeRen3Coordination();
    const triNitrogen = getRepresentativeTriNitrogenUnit();
    expect(coordination.neighbors).toHaveLength(7);
    expect(triNitrogen.terminals).toHaveLength(2);
    for (const terminal of triNitrogen.terminals) {
      expect(terminal.distance).toBeCloseTo(1.36, 2);
    }

    await page.goto("/modules");
    const moduleCard = page.locator("article").filter({ hasText: "ReN₃ 高压氮化物" });
    await expect(moduleCard).toBeVisible();
    await expect(moduleCard.getByText("可交互 3D", { exact: true })).toBeVisible();
    await moduleCard.getByRole("link", { name: /进入模块/ }).click();
    await expect(page).toHaveURL(/\/module\/ren3-high-pressure-nitride$/);

    const viewer = page.getByTestId("ren3-viewer");
    const canvasArea = page.getByTestId("ren3-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(
      viewer.getByText("ReN₃｜高压窗口", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("Imm2-ReN₃｜理论预测相", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("38.3 GPa", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText("预测稳定 ≠ 已实验确认；晶格不按压力条比例形变", { exact: true }),
    ).toBeVisible();

    await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-pressure-window-viewer.png");

    await page.getByRole("button", { exact: true, name: "正交晶胞" }).click();
    await expect(
      viewer.getByText("ReN₃｜正交晶胞", { exact: true }),
    ).toBeVisible();
    await expect(
      canvasArea.getByText("a = 5.25 Å｜b = 2.81 Å｜c = 4.75 Å（0 GPa 松弛参考）", {
        exact: true,
      }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-orthorhombic-cell-viewer.png");

    await page.getByRole("button", { exact: true, name: "N₃ 单元" }).click();
    await expect(
      viewer.getByText("ReN₃｜N₃ 单元", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("N₃ 单元｜N1–N2–N1", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText("两条短 N–N 距离 ≈ 1.36 Å", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-trinitrogen-unit-viewer.png");

    await page.getByRole("button", { exact: true, name: "Re 七配位" }).click();
    await expect(
      viewer.getByText("ReN₃｜Re 七配位", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("Re 中心｜7 个 N 最近邻", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText("ReN₇ 是局部七配位，不是化学式", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-seven-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "多面体网络" }).click();
    await expect(
      viewer.getByText("ReN₃｜多面体网络", { exact: true }),
    ).toBeVisible();
    await expect(
      canvasArea.getByText("ReN₇ 多面体｜三维周期延展", { exact: true }),
    ).toBeVisible();
    await expect(
      canvasArea.getByText("共享 N 位点 + N₃ 连接单元 → 延展晶体网络", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-polyhedral-network-viewer.png");

    await page.getByRole("button", { exact: true, name: "组成与性质" }).click();
    await expect(
      viewer.getByText("ReN₃｜组成与性质", { exact: true }),
    ).toBeVisible();
    await expect(canvasArea.getByText("Re 2b → 2", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("N 4c + 2b → 4 + 2 = 6", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("2 Re + 6 N = 2 ReN₃", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expectCanvasAreaToHaveScreenshot(canvasArea, "ren3-counting-property-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("ReN₃ 在 390px 手机宽度下可切换局部配位且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/ren3-high-pressure-nitride");

    const viewer = page.getByTestId("ren3-viewer");
    const topbar = page.getByTestId("ren3-viewer-topbar");
    const canvasArea = page.getByTestId("ren3-canvas");
    const summary = page.getByTestId("ren3-viewer-summary");
    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

    await page.getByRole("button", { exact: true, name: "Re 七配位" }).click();
    await expect(canvasArea.getByText("Re 中心｜7 个 N 最近邻", { exact: true })).toBeVisible();

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
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });
});

async function expectCanvasAreaHasDetail(canvasArea: Locator) {
  const screenshot = await canvasArea.screenshot();
  const image = decodePng(screenshot);
  const [baseR, baseG, baseB] = image.pixels;
  let detailedPixels = 0;

  for (let i = 0; i < image.pixels.length; i += 4) {
    const diff =
      Math.abs(image.pixels[i] - baseR) +
      Math.abs(image.pixels[i + 1] - baseG) +
      Math.abs(image.pixels[i + 2] - baseB);
    if (diff > 35) {
      detailedPixels += 1;
    }
  }

  expect(detailedPixels).toBeGreaterThan(image.width * image.height * 0.01);
}

async function positionCanvasForSnapshot(canvasArea: Locator) {
  await canvasArea.evaluate(async (element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      left: 0,
      top: Math.max(0, window.scrollY + rect.top - 72),
    });
    window.dispatchEvent(new Event("resize"));
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });

  // 工具栏位于 Viewer 下方，点击模式按钮会把 demand-frame Canvas 滚到部分离屏处。
  // 在截图前轻微重置视口尺寸，强制 R3F 在完整可见的画布上重新计算并绘制一帧。
  const page = canvasArea.page();
  const viewport = page.viewportSize();
  if (viewport) {
    await page.setViewportSize({ ...viewport, height: viewport.height - 1 });
    await page.waitForTimeout(150);
    await page.setViewportSize(viewport);
  }
  await page.waitForTimeout(300);
}

async function expectCanvasAreaToHaveScreenshot(canvasArea: Locator, name: string) {
  await positionCanvasForSnapshot(canvasArea);
  const box = await canvasArea.boundingBox();
  const viewport = canvasArea.page().viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(60);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);

  const screenshot = await canvasArea.screenshot({ animations: "disabled" });
  expectLightSnapshotCorners(screenshot);
  expect(screenshot).toMatchSnapshot(name, {
    maxDiffPixelRatio: 0.01,
    threshold: 0.2,
  });
}

function expectLightSnapshotCorners(screenshot: Buffer) {
  const image = decodePng(screenshot);
  const cornerIndexes = [
    0,
    (image.width - 1) * 4,
    (image.height - 1) * image.width * 4,
    (image.height * image.width - 1) * 4,
  ];

  for (const index of cornerIndexes) {
    const luminance = image.pixels[index] + image.pixels[index + 1] + image.pixels[index + 2];
    expect(luminance).toBeGreaterThan(660);
  }
}

function decodePng(buffer: Buffer) {
  const signature = buffer.subarray(0, 8);
  expect(signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  expect(bitDepth).toBe(8);
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  expect(bytesPerPixel).toBeGreaterThan(0);

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const stride = width * bytesPerPixel;
  const raw = new Uint8Array(height * stride);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset];
    readOffset += 1;

    const rowStart = y * stride;
    const previousRowStart = rowStart - stride;
    for (let x = 0; x < stride; x += 1) {
      const rawValue = inflated[readOffset + x];
      const left = x >= bytesPerPixel ? raw[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? raw[previousRowStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? raw[previousRowStart + x - bytesPerPixel] : 0;

      let value = rawValue;
      if (filter === 1) {
        value += left;
      } else if (filter === 2) {
        value += up;
      } else if (filter === 3) {
        value += Math.floor((left + up) / 2);
      } else if (filter === 4) {
        value += paethPredictor(left, up, upperLeft);
      }
      raw[rowStart + x] = value & 0xff;
    }

    readOffset += stride;
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let source = 0, target = 0; source < raw.length; source += bytesPerPixel, target += 4) {
    pixels[target] = raw[source];
    pixels[target + 1] = raw[source + 1];
    pixels[target + 2] = raw[source + 2];
    pixels[target + 3] = bytesPerPixel === 4 ? raw[source + 3] : 255;
  }

  return { height, pixels, width };
}

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}
