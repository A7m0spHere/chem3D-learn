import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

test.describe("T-039D Builder 与目录页 3D-first 收口", () => {
  test("六档视口保持 Builder 全屏画布、精简摘要与可达诊断", async ({ page }) => {
    test.setTimeout(180_000);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/lab/organic-builder/ethylene-planar");

      const builder = page.getByTestId("organic-builder-page");
      const viewer = page.getByTestId("organic-builder-viewer");
      const builderBox = await builder.boundingBox();
      const viewerBox = await viewer.boundingBox();
      if (!builderBox || !viewerBox) throw new Error(`${viewport.width}px Builder 未获得可测量布局`);

      expect(Math.abs(viewerBox.width - builderBox.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(viewerBox.height - builderBox.height)).toBeLessThanOrEqual(1);
      await expectNoHorizontalOverflow(page);

      if (viewport.width >= 1280) {
        const info = page.getByTestId("organic-builder-info");
        await expect(info).toBeVisible();
        await expect(page.getByTestId("builder-diagnostics-toggle")).toHaveAttribute("aria-expanded", "false");
        const infoBox = await info.boundingBox();
        if (!infoBox) throw new Error(`${viewport.width}px 结构摘要未获得可测量布局`);
        expect(infoBox.height).toBeLessThanOrEqual(540);
      } else {
        await expect(page.getByTestId("organic-builder-info")).not.toBeVisible();
        const trigger = page.getByRole("button", { name: "结构信息", exact: true });
        const triggerBox = await trigger.boundingBox();
        if (!triggerBox) throw new Error(`${viewport.width}px 结构信息入口未获得可测量布局`);
        expect(triggerBox.height).toBeGreaterThanOrEqual(44);
        await trigger.click();
        await expect(page.getByTestId("organic-builder-info")).toBeVisible();
      }

      const diagnostics = page.getByTestId("builder-diagnostics-toggle");
      const diagnosticsBox = await diagnostics.boundingBox();
      if (!diagnosticsBox) throw new Error(`${viewport.width}px 诊断入口未获得可测量布局`);
      expect(diagnosticsBox.height).toBeGreaterThanOrEqual(44);
      await diagnostics.click();
      await expect(diagnostics).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByTestId("builder-bond-angle-matches")).toBeVisible();
    }
  });

  test("六档视口下 Modules 与 Paths 保持短目录、清晰入口且无横向溢出", async ({ page }) => {
    test.setTimeout(180_000);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      await page.goto("/modules");
      await expect(page.getByRole("heading", { level: 1, name: "找到你要观察的空间结构" })).toBeVisible();
      await expect(page.locator("main article").first()).toContainText(/看什么|学习方式/);
      await expect(page.locator("main article").first().getByRole("link", { name: "进入模块" })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto("/paths");
      await expect(page.getByRole("heading", { level: 1, name: "按理解顺序观察结构" })).toBeVisible();
      await expect(page.getByText("3 条参考顺序 · 可随时跳步", { exact: true })).toBeVisible();
      await expect(page.getByText("理解顺序", { exact: true }).first()).toBeVisible();
      await expect(page.locator("main article").first().getByRole("link", { name: "打开这个结构" })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});

test("普通分子、专题 Viewer 与 NaCl 晶体保留真实 3D 入口", async ({ page }) => {
  test.setTimeout(120_000);
  const cases = [
    ["/module/pyramidal-nh3", "molecule-viewer"],
    ["/module/benzene-planar", "benzene-planar-viewer"],
    ["/module/nacl-crystal", "nacl-viewer"],
  ] as const;

  for (const [route, testId] of cases) {
    await page.goto(route);
    await expect(page.getByTestId(testId)).toBeVisible();
    await expect(page.locator("canvas").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});
