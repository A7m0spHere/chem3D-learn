import { expect, test, type Page } from "@playwright/test";

const publicSpecialtyModules = [
  { id: "polarity-judgment", viewer: "molecular-polarity-viewer" },
  { id: "sigma-bond-orbitals", viewer: "sigma-bond-orbitals-viewer" },
  { id: "pi-bond-orbitals", viewer: "pi-bond-orbitals-viewer" },
  { id: "hybrid-orbitals-sp", viewer: "hybrid-orbitals-sp-viewer" },
  { id: "ionic-bond-formation", viewer: "ionic-bond-formation-viewer" },
  { id: "coordinate-bond-formation", viewer: "coordinate-bond-formation-viewer" },
  { id: "ethylene-planar", viewer: "ethylene-planar-viewer" },
  { id: "benzene-planar", viewer: "benzene-planar-viewer" },
  { id: "acetylene-linear", viewer: "acetylene-linear-viewer" },
  { id: "organic-coplanar", viewer: "organic-coplanar-viewer" },
] as const;

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

test.describe("T-039B 专题展示 Viewer 3D-first 契约", () => {
  test("10 个公开专题均进入真实 Viewer，旧教学 Panel 不再出现", async ({ page }) => {
    test.setTimeout(180_000);

    for (const module of publicSpecialtyModules) {
      await page.goto(`/module/${module.id}`);
      await expect(page.locator("main[data-specialty-viewer='true']")).toBeVisible();
      await expect(page.getByTestId(module.viewer).locator("canvas")).toBeVisible();
      await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(page.getByRole("complementary")).toHaveCount(0);
    }
  });

  test("极性、σ 与 π 模式仍改变真实 3D 状态", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/module/polarity-judgment");
    await page.getByRole("button", { exact: true, name: "BF₃" }).click();
    await expect(
      page.getByTestId("molecular-polarity-viewer").getByText(
        "BF₃：非极性分子｜合偶极矩 = 0",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId("molecular-polarity-canvas").getByText("约120°", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("structure-info-disclosure")).toContainText(
      "平面三角形，合偶极矩 = 0",
    );

    await page.goto("/module/sigma-bond-orbitals");
    await page.getByRole("button", { exact: true, name: "标注" }).click();
    await page.getByRole("button", { exact: true, name: "s-p σ 键" }).click();
    await expect(
      page.getByTestId("sigma-bond-orbitals-viewer").getByText(
        "s-p σ 键｜s 轨道与 p 轨道头碰头重叠",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId("sigma-bond-orbitals-canvas").getByText("s-p 头碰头重叠", {
        exact: true,
      }),
    ).toBeVisible();

    await page.goto("/module/pi-bond-orbitals");
    await page.getByRole("button", { exact: true, name: "标注" }).click();
    await page.getByRole("button", { exact: true, name: "成键后" }).click();
    await expect(
      page.getByTestId("pi-bond-orbitals-viewer").getByText(
        "p-p π 键｜键轴上下两侧的 π 电子云",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId("pi-bond-orbitals-canvas").getByText("π 电子云", { exact: true }),
    ).toBeVisible();
  });

  test("杂化轨道模式与电子云渲染控制继续驱动 Viewer", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/module/hybrid-orbitals-sp");

    await page.getByRole("button", { exact: true, name: "sp²" }).click();
    await expect(
      page.getByTestId("hybrid-orbitals-sp-viewer").getByText(
        "sp² 杂化｜三个轨道平面三角分布",
        { exact: true },
      ),
    ).toBeVisible();
    await page.getByTestId("hybrid-render-cloud").click();
    await expect(page.getByTestId("hybrid-cloud-density-legend")).toBeVisible();
    await expect(page.getByTestId("hybrid-footer-meta")).toContainText("电子云");
    await expect(page.getByTestId("structure-info-disclosure")).toContainText(
      "3 个共面杂化轨道",
    );
  });

  test("乙烯、苯与乙炔的参考几何辅助仍存在", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/module/ethylene-planar");
    await page.getByRole("button", { exact: true, name: "键角" }).click();
    await expect(
      page.getByTestId("ethylene-planar-canvas").getByText("≈120°", { exact: true }),
    ).toHaveCount(2);

    await page.goto("/module/benzene-planar");
    await page.getByRole("button", { exact: true, name: "对位共线" }).click();
    await expect(page.getByTestId("benzene-diagonal-label")).toBeVisible();

    await page.goto("/module/acetylene-linear");
    await page.getByRole("button", { exact: true, name: "三键组成" }).click();
    await expect(page.getByTestId("acetylene-triple-label")).toBeVisible();
  });

  test("有机共面综合的单键旋转仍改变 Viewer 与实时状态", async ({ page }) => {
    await page.goto("/module/organic-coplanar");
    await page.getByRole("button", { exact: true, name: "单键旋转" }).click();
    await expect(page.getByTestId("organic-coplanar-viewer-topbar")).toContainText(
      "乙烯基保持默认夹角",
    );
    await expect(page.getByTestId("structure-info-disclosure")).toContainText(
      "乙烯基与苯环约成 45°",
    );
    await page.getByRole("button", { exact: true, name: "对齐平面" }).click();
    await expect(page.getByTestId("organic-coplanar-viewer-topbar")).toContainText("乙烯基已对齐");
    await expect(page.getByRole("button", { exact: true, name: "恢复 45°" })).toBeVisible();
    await expect(page.getByTestId("structure-info-disclosure")).toContainText(
      "乙烯基已与苯环平面对齐",
    );
  });

  test("1280px 使用 304px Inspector rail，1024px 回到纵向", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/module/benzene-planar");

    const stage = page.getByTestId("module-builder-transition-stage");
    const rail = page.getByTestId("specialty-control-rail");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const [stageBox, railBox, toolbarBox, disclosureBox] = await Promise.all([
      stage.boundingBox(),
      rail.boundingBox(),
      toolbar.boundingBox(),
      disclosure.boundingBox(),
    ]);
    if (!stageBox || !railBox || !toolbarBox || !disclosureBox) {
      throw new Error("专题 Viewer 或 Inspector 未获得可测量布局");
    }
    expect(railBox.x).toBeGreaterThanOrEqual(stageBox.x + stageBox.width - 1);
    expect(railBox.width).toBeGreaterThanOrEqual(302);
    expect(railBox.width).toBeLessThanOrEqual(306);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();
    const [mediumStageBox, mediumToolbarBox, mediumDisclosureBox] = await Promise.all([
      stage.boundingBox(),
      toolbar.boundingBox(),
      disclosure.boundingBox(),
    ]);
    if (!mediumStageBox || !mediumToolbarBox || !mediumDisclosureBox) {
      throw new Error("1024px 专题纵向布局未获得可测量位置");
    }
    expect(mediumToolbarBox.y).toBeGreaterThanOrEqual(
      mediumStageBox.y + mediumStageBox.height - 1,
    );
    expect(mediumDisclosureBox.y).toBeGreaterThanOrEqual(
      mediumToolbarBox.y + mediumToolbarBox.height - 1,
    );
    await expectNoHorizontalOverflow(page);
  });

  test("杂化专题在桌面使用 360px 高密度 Inspector，窄屏恢复纵向", async ({ page }) => {
    test.setTimeout(120_000);

    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1552, height: 926 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/module/hybrid-orbitals-sp");
      // load 事件不保证字体交换完成：回退字体更宽会让工具栏在测量瞬间
      // 表现为横向溢出（run 33088804177 的偶发失败即此因）。
      await page.evaluate(() => document.fonts.ready);

      const stage = page.getByTestId("module-builder-transition-stage");
      const rail = page.getByTestId("specialty-control-rail");
      const toolbar = page.getByTestId("module-toolbar");
      const disclosure = page.getByTestId("structure-info-disclosure");
      const [stageBox, railBox, toolbarBox, disclosureBox] = await Promise.all([
        stage.boundingBox(),
        rail.boundingBox(),
        toolbar.boundingBox(),
        disclosure.boundingBox(),
      ]);
      if (!stageBox || !railBox || !toolbarBox || !disclosureBox) {
        throw new Error("杂化专题 Viewer 或 Inspector 未获得可测量布局");
      }
      expect(railBox.x).toBeGreaterThanOrEqual(stageBox.x + stageBox.width - 1);
      // 360px 高密度 Inspector：容差 ±5 吸收滚动条参与布局后的亚像素差
      // （CI Linux 实测 357.32，仍是高密度栏而非 304 常规栏或纵向布局）。
      expect(railBox.width).toBeGreaterThanOrEqual(355);
      expect(railBox.width).toBeLessThanOrEqual(365);
      expect(stageBox.width).toBeGreaterThan(railBox.width * 2);
      expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);
      expect(await toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
        true,
      );
      await expectNoHorizontalOverflow(page);
    }

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/module/hybrid-orbitals-sp");
    const stage = page.getByTestId("module-builder-transition-stage");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const [stageBox, toolbarBox, disclosureBox] = await Promise.all([
      stage.boundingBox(),
      toolbar.boundingBox(),
      disclosure.boundingBox(),
    ]);
    if (!stageBox || !toolbarBox || !disclosureBox) {
      throw new Error("1024px 杂化专题纵向布局未获得可测量位置");
    }
    expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 1);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await waitForTouchTargetSettled(page);
    const mobileButtons = await toolbar.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().toJSON()),
    );
    const undersizedMobileButtons = mobileButtons.filter(
      (box) => box.width < 44 || box.height < 44,
    );
    expect(
      undersizedMobileButtons,
      `触控目标须 ≥44×44，实测过小：${JSON.stringify(undersizedMobileButtons)}`,
    ).toEqual([]);
    await expectNoHorizontalOverflow(page);
  });

  test("390px 纵向布局、两列控制、键盘 Disclosure 与 44px 触控边界", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/polarity-judgment");

    const stage = page.getByTestId("module-builder-transition-stage");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const toggle = page.getByTestId("structure-info-toggle");
    const [stageBox, toolbarBox, disclosureBox] = await Promise.all([
      stage.boundingBox(),
      toolbar.boundingBox(),
      disclosure.boundingBox(),
    ]);
    if (!stageBox || !toolbarBox || !disclosureBox) {
      throw new Error("移动端专题纵向布局未获得可测量位置");
    }
    expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height - 1);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);

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

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(disclosure).toContainText("模型边界");
    await expectNoHorizontalOverflow(page);
  });
});
