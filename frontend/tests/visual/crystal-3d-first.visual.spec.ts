import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
}

// .motion-page-enter（ModuleDetailPage 整页容器）带 350ms scale(0.98→1)
// 页面进入动画：动画进行中测得的按钮 rect 会被等比例缩小（run 33308780225
// 实测 44×0.98 = 43.12，此前误诊为 CJK 字体度量）。测量触控目标前先等字体
// 交换与该容器的有限动画结束；reduced-motion 下动画被压到 0.01ms，立即通过。
//
// 必须先等元素挂载：page.reload() 后懒加载 chunk 可能晚于 fonts.ready 才挂载
// 整页容器，提前 querySelector 拿到 null 会让动画等待整段跳过（run 33314825061
// 实测动画 98.4% 进度时测量，43.986px）。
async function waitForTouchTargetSettled(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForSelector(".motion-page-enter", { state: "attached", timeout: 10_000 })
    .catch(() => undefined);
  await page.evaluate(async () => {
    const pageEnter = document.querySelector(".motion-page-enter");
    if (!pageEnter) return;
    const finite = pageEnter.getAnimations().filter((animation) => {
      const timing = animation.effect?.getTiming();
      return !!timing && timing.iterations !== Infinity;
    });
    await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
  });
}

test.describe("T-039C 普通晶体 3D-first 契约", () => {
  test("代表性晶体使用真实 Viewer、短控制与默认折叠 CrystalInfo", async ({ page }) => {
    test.setTimeout(120_000);
    const modules = [
      ["nacl-crystal", "nacl-viewer"],
      ["caf2-fluorite", "caf2-viewer"],
      ["graphite-structure", "graphite-viewer"],
      ["mof-metal-organic-framework", "mof5-viewer"],
    ] as const;

    for (const [moduleId, viewerId] of modules) {
      await page.goto(`/module/${moduleId}`);
      await expect(page.locator("main[data-crystal-viewer='true']")).toBeVisible();
      await expect(page.getByTestId(viewerId).locator("canvas")).toBeVisible();
      await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(page.getByRole("complementary")).toHaveCount(0);
      await expect(page.getByText("自学观察顺序", { exact: true })).toHaveCount(0);
      await expect(page.getByText("课堂观察顺序", { exact: true })).toHaveCount(0);
    }
  });

  test("1440、1366 与 1024 宽度保持全宽 Viewer → 控制 → 折叠信息", async ({ page }) => {
    test.setTimeout(120_000);

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/module/caf2-fluorite");
      // 三档宽度的 ±2px 等式在加载未稳定窗口会漂移（run 33314825061 / 33315699503
      // 两轮分别漂 6.45 / 3.22px，诊断轮实测稳定值逐像素相等）：测量前等字体交换
      // 与页面进入动画结束。
      await waitForTouchTargetSettled(page);

      const stage = page.getByTestId("module-builder-transition-stage");
      const toolbar = page.getByTestId("module-toolbar");
      const disclosure = page.getByTestId("structure-info-disclosure");
      const [stageBox, toolbarBox, disclosureBox] = await Promise.all([
        stage.boundingBox(),
        toolbar.boundingBox(),
        disclosure.boundingBox(),
      ]);
      if (!stageBox || !toolbarBox || !disclosureBox) {
        throw new Error(`${viewport.width}px 晶体主区域未获得可测量布局`);
      }

      expect(stageBox.width).toBeGreaterThanOrEqual(viewport.width === 1024 ? 950 : 1200);
      expect(Math.abs(toolbarBox.x - stageBox.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(toolbarBox.width - stageBox.width)).toBeLessThanOrEqual(2);
      expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 1);
      expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);
      expect(Math.abs(disclosureBox.width - stageBox.width)).toBeLessThanOrEqual(2);
      expect(disclosureBox.height).toBeLessThanOrEqual(110);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("空隙阶段保留在首层控制，晶体信息可键盘展开", async ({ page }) => {
    await page.goto("/module/caf2-fluorite");

    await page.getByRole("button", { exact: true, name: "四面体空隙" }).click();
    const framework = page.getByTestId("crystal-void-stage-framework");
    const voids = page.getByTestId("crystal-void-stage-voids");
    const filled = page.getByTestId("crystal-void-stage-filled");
    await expect(framework).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("CaF₂｜四面体空隙｜Ca²⁺ 骨架", { exact: true })).toBeVisible();
    await voids.click();
    await expect(voids).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("CaF₂｜四面体空隙｜显示空隙", { exact: true })).toBeVisible();

    for (const button of [framework, voids, filled]) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    const toggle = page.getByTestId("structure-info-toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const disclosure = page.getByTestId("structure-info-disclosure");
    await expect(disclosure).toContainText("晶体类型");
    await expect(disclosure).toContainText("晶格 / 模型");
    await expect(disclosure).toContainText("配位关系");
    await expect(disclosure).toContainText("晶胞计数");
    await expect(disclosure).toContainText("组成 / 计数说明");
  });

  test("390px 手机端保持全宽 Viewer、两列控制、折叠信息与 44px 触控", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/caf2-fluorite");

    const stage = page.getByTestId("module-builder-transition-stage");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const [stageBox, toolbarBox, disclosureBox] = await Promise.all([
      stage.boundingBox(),
      toolbar.boundingBox(),
      disclosure.boundingBox(),
    ]);
    if (!stageBox || !toolbarBox || !disclosureBox) {
      throw new Error("390px 晶体主区域未获得可测量布局");
    }
    expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 1);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);
    expect(disclosureBox.height).toBeLessThanOrEqual(130);

    // 触控尺寸测量同样需要等页面进入动画与字体交换完成。
    await waitForTouchTargetSettled(page);
    const buttonBoxes = await toolbar.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().toJSON()),
    );
    const undersizedButtons = buttonBoxes.filter((box) => box.width < 44 || box.height < 44);
    expect(
      undersizedButtons,
      `触控目标须 ≥44×44，实测过小：${JSON.stringify(undersizedButtons)}`,
    ).toEqual([]);
    expect(new Set(buttonBoxes.slice(0, 2).map((box) => Math.round(box.y))).size).toBe(1);
    await expectNoHorizontalOverflow(page);
  });
});
