import { expect, test, type Locator } from "@playwright/test";

const viewers = [
  { route: "/module/tetrahedral-ch4", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/pyramidal-nh3", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/v-shape-h2o", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/linear-co2", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/planar-bf3", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/polarity-judgment", viewer: "molecular-polarity-viewer", stage: "molecular-polarity-canvas" },
  { route: "/module/sigma-bond-orbitals", viewer: "sigma-bond-orbitals-viewer", stage: "sigma-bond-orbitals-canvas" },
  { route: "/module/pi-bond-orbitals", viewer: "pi-bond-orbitals-viewer", stage: "pi-bond-orbitals-canvas" },
  { route: "/module/hybrid-orbitals-sp", viewer: "hybrid-orbitals-sp-viewer", stage: "hybrid-orbitals-sp-canvas" },
  { route: "/module/ionic-bond-formation", viewer: "ionic-bond-formation-viewer", stage: "ionic-bond-formation-canvas" },
  { route: "/module/coordinate-bond-formation", viewer: "coordinate-bond-formation-viewer", stage: "coordinate-bond-formation-canvas" },
  { route: "/module/organic-coplanar", viewer: "organic-coplanar-viewer", stage: "organic-coplanar-canvas" },
  { route: "/module/ethylene-planar", viewer: "ethylene-planar-viewer", stage: "ethylene-planar-canvas" },
  { route: "/module/benzene-planar", viewer: "benzene-planar-viewer", stage: "benzene-planar-canvas" },
  { route: "/module/acetylene-linear", viewer: "acetylene-linear-viewer", stage: "acetylene-linear-canvas" },
  { route: "/module/nacl-crystal", viewer: "nacl-viewer", stage: "nacl-canvas" },
  { route: "/module/cscl-crystal", viewer: "cscl-viewer", stage: "cscl-canvas" },
  { route: "/module/sodium-metal-crystal", viewer: "sodium-metal-viewer", stage: "sodium-metal-canvas" },
  { route: "/module/diamond-crystal", viewer: "diamond-viewer", stage: "diamond-canvas" },
  { route: "/module/graphite-structure", viewer: "graphite-viewer", stage: "graphite-canvas" },
  { route: "/module/zinc-metal-crystal", viewer: "zinc-metal-viewer", stage: "zinc-metal-canvas" },
  { route: "/module/tetrahedral-voids", viewer: "tetrahedral-voids-viewer", stage: "tetrahedral-voids-canvas" },
  { route: "/module/octahedral-voids", viewer: "octahedral-voids-viewer", stage: "octahedral-voids-canvas" },
] as const;

const bondingBasicsMobileViewers = [
  {
    route: "/module/hybrid-orbitals-sp",
    viewer: "hybrid-orbitals-sp-viewer",
    stage: "hybrid-orbitals-sp-canvas",
    modes: [
      { testId: "bonding-basics-mode-sp", labels: ["中心原子", "sp 杂化轨道方向"] },
      { testId: "bonding-basics-mode-sp2", labels: ["中心原子", "sp2 杂化轨道方向"] },
      { testId: "bonding-basics-mode-sp3", labels: ["中心原子", "sp3 杂化轨道方向"] },
    ],
  },
  {
    route: "/module/ionic-bond-formation",
    viewer: "ionic-bond-formation-viewer",
    stage: "ionic-bond-formation-canvas",
    modes: [
      { testId: "bonding-basics-mode-transfer", labels: ["金属原子", "非金属原子", "电子转移形成离子"] },
      { testId: "bonding-basics-mode-attraction", labels: ["阳离子", "阴离子", "异号电荷静电吸引"] },
      { testId: "bonding-basics-mode-lattice", labels: ["阳离子", "阴离子", "阴阳离子交替排列"] },
    ],
  },
  {
    route: "/module/coordinate-bond-formation",
    viewer: "coordinate-bond-formation-viewer",
    stage: "coordinate-bond-formation-canvas",
    modes: [
      { testId: "bonding-basics-mode-donor", labels: ["提供体", "接受体", "孤对电子", "指向空轨道"] },
      { testId: "bonding-basics-mode-overlap", labels: ["提供体", "接受体", "孤对电子", "指向空轨道"] },
      { testId: "bonding-basics-mode-formed", labels: ["提供体", "接受体", "孤对电子", "形成配位键"] },
    ],
  },
] as const;

async function expectVisibleStageLabel(stage: Locator, label: string) {
  const labelLocator = stage.getByText(label, { exact: true });
  await expect(labelLocator.first()).toBeVisible();
}

test.describe("真实 3D Viewer 三段式布局", () => {
  for (const item of viewers) {
    test(`${item.route} 顶部、Canvas、底部按文档流排列`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(item.route);

      const viewer = page.getByTestId(item.viewer);
      const topbar = page.getByTestId(`${item.viewer}-topbar`);
      const stage = page.getByTestId(item.stage);
      const summary = page.getByTestId(`${item.viewer}-summary`);

      await expect(viewer).toBeVisible();
      await expect(stage).toBeVisible();
      await expect(topbar).toBeVisible();
      await expect(summary).toBeVisible();

      const [topbarBox, stageBox, summaryBox] = await Promise.all([
        topbar.boundingBox(),
        stage.boundingBox(),
        summary.boundingBox(),
      ]);

      expect(topbarBox).not.toBeNull();
      expect(stageBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(stageBox!.y + 1);
      expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
      expect(stageBox!.height).toBeGreaterThan(200);

      const hasHorizontalOverflow = await viewer.evaluate(
        (element) => element.scrollWidth > element.clientWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test("390px 下普通分子、专题和晶体 Viewer 不覆盖 Canvas", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });

    for (const item of [viewers[2], viewers[5], viewers[9]]) {
      await page.goto(item.route);
      const viewer = page.getByTestId(item.viewer);
      const stage = page.getByTestId(item.stage);
      const summary = page.getByTestId(`${item.viewer}-summary`);

      await expect(viewer).toBeVisible();
      await expect(stage).toBeVisible();
      await expect(summary).toBeVisible();

      const [stageBox, summaryBox] = await Promise.all([
        stage.boundingBox(),
        summary.boundingBox(),
      ]);
      expect(stageBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
      expect(stageBox!.height).toBeGreaterThan(200);
    }
  });

  test.describe("新增成键基础模块 390px 手机宽度", () => {
    for (const item of bondingBasicsMobileViewers) {
      test(`${item.route} viewer 与 3D 标注保持可读`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(item.route);

        const viewer = page.getByTestId(item.viewer);
        const topbar = page.getByTestId(`${item.viewer}-topbar`);
        const stage = page.getByTestId(item.stage);
        const summary = page.getByTestId(`${item.viewer}-summary`);

        await expect(viewer).toBeVisible();
        await expect(topbar).toBeVisible();
        await expect(stage).toBeVisible();
        await expect(stage.locator("canvas")).toBeVisible();
        await expect(summary).toBeVisible();

        const [topbarBox, stageBox, summaryBox] = await Promise.all([
          topbar.boundingBox(),
          stage.boundingBox(),
          summary.boundingBox(),
        ]);

        expect(topbarBox).not.toBeNull();
        expect(stageBox).not.toBeNull();
        expect(summaryBox).not.toBeNull();
        expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(stageBox!.y + 1);
        expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
        expect(stageBox!.height).toBeGreaterThan(320);

        const hasPageHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        const hasViewerHorizontalOverflow = await viewer.evaluate(
          (element) => element.scrollWidth > element.clientWidth + 1,
        );
        expect(hasPageHorizontalOverflow).toBe(false);
        expect(hasViewerHorizontalOverflow).toBe(false);

        for (const mode of item.modes) {
          const modeButton = page.getByTestId(mode.testId);
          await expect(modeButton).toBeVisible();
          await modeButton.click();
          await page.evaluate(() => window.scrollTo(0, 0));

          for (const label of mode.labels) {
            await expectVisibleStageLabel(stage, label);
          }
        }
      });
    }
  });
});
