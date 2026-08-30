import { expect, test } from "@playwright/test";

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
}

test.describe("普通分子 3D-first 页面", () => {
  test("五个普通分子均进入真实 Viewer，默认折叠且无旧步骤入口", async ({ page }) => {
    const modules = [
      ["tetrahedral-ch4", "CH4"],
      ["pyramidal-nh3", "NH3"],
      ["v-shape-h2o", "H2O"],
      ["linear-co2", "CO2"],
      ["planar-bf3", "BF3"],
    ] as const;

    for (const [moduleId, formula] of modules) {
      await page.goto(`/module/${moduleId}`);
      await expect(page.getByTestId("molecule-viewer")).toBeVisible();
      await expect(page.getByTestId("structure-info-toggle")).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByTestId("structure-info-disclosure")).toContainText(formula);
      await expect(page.locator('[data-testid^="lesson-step-"]')).toHaveCount(0);
      await expect(page.getByTestId("guided-exit")).toHaveCount(0);
    }
  });

  test("NH₃ 桌面自由探索采用大 Viewer 与右侧控制栏，结构信息默认折叠", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/module/pyramidal-nh3");

    const stage = page.getByTestId("module-builder-transition-stage");
    const viewer = page.getByTestId("molecule-viewer");
    const rail = page.getByTestId("molecule-control-rail");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const toggle = page.getByTestId("structure-info-toggle");

    await expect(viewer.getByText("NH3｜自由探索", { exact: true })).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(disclosure).toContainText("NH3");
    await expect(disclosure).toContainText("氨气");
    await expect(disclosure).toContainText("三角锥形");
    await expect(disclosure).toContainText("约 107°");
    await expect(page.getByText("回到自由探索", { exact: true })).toHaveCount(0);
    await expect(page.getByText("按需跟随讲解", { exact: true })).toHaveCount(0);

    const stageBox = await stage.boundingBox();
    const railBox = await rail.boundingBox();
    const toolbarBox = await toolbar.boundingBox();
    const disclosureBox = await disclosure.boundingBox();
    if (!stageBox || !railBox || !toolbarBox || !disclosureBox) {
      throw new Error("普通分子主区域未获得可测量布局");
    }
    expect(stageBox.width).toBeGreaterThan(900);
    expect(Math.abs(railBox.y - stageBox.y)).toBeLessThanOrEqual(2);
    expect(railBox.x).toBeGreaterThanOrEqual(stageBox.x + stageBox.width);
    expect(Math.abs(railBox.width - 272)).toBeLessThanOrEqual(2);
    expect(Math.abs(toolbarBox.width - railBox.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(disclosureBox.x - railBox.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(disclosureBox.width - railBox.width)).toBeLessThanOrEqual(2);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height);
    expect(disclosureBox.y + disclosureBox.height).toBeLessThanOrEqual(stageBox.y + stageBox.height);

    const summary = toggle.locator(":scope > span").first().locator(":scope > span").nth(1);
    const summaryBox = await summary.boundingBox();
    if (!summaryBox) throw new Error("结构信息摘要未获得可测量布局");
    expect(summaryBox.height).toBeLessThanOrEqual(44);

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(disclosure.getByText("名称 / 分子式", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("空间构型", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("典型键角", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("模型边界：", { exact: true })).toBeVisible();
    const expandedDisclosureBox = await disclosure.boundingBox();
    if (!expandedDisclosureBox) throw new Error("展开后的结构信息未获得可测量布局");
    expect(Math.abs(expandedDisclosureBox.x - railBox.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(expandedDisclosureBox.width - railBox.width)).toBeLessThanOrEqual(2);

    const factBoxes = await disclosure.getByTestId("structure-info-facts").locator(":scope > div").all();
    const measuredFacts = await Promise.all(factBoxes.map((fact) => fact.boundingBox()));
    if (measuredFacts.some((box) => !box)) throw new Error("结构信息事实卡未获得可测量布局");
    const facts = measuredFacts as NonNullable<(typeof measuredFacts)[number]>[];
    for (const [index, box] of facts.entries()) {
      expect(box.width).toBeGreaterThan(180);
      if (index > 0) expect(box.y).toBeGreaterThan(facts[index - 1].y);
    }
    const disclosureWidths = await disclosure.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(disclosureWidths.scrollWidth).toBeLessThanOrEqual(disclosureWidths.clientWidth);
    await assertNoHorizontalOverflow(page);
  });

  test("NH₃ 在 xl 桌面端以大 Viewer 配合右侧 272px 纵向控制栏", async ({ page }) => {
    const viewports = [
      { width: 1280, height: 720 },
      { width: 1552, height: 926 },
    ] as const;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/module/pyramidal-nh3");

      const stage = page.getByTestId("module-builder-transition-stage");
      const rail = page.getByTestId("molecule-control-rail");
      const toolbar = page.getByTestId("module-toolbar");
      const disclosure = page.getByTestId("structure-info-disclosure");
      await expect(stage).toBeVisible();
      await expect(rail).toBeVisible();
      await expect(toolbar).toBeVisible();

      const stageBox = await stage.boundingBox();
      const railBox = await rail.boundingBox();
      const toolbarBox = await toolbar.boundingBox();
      const disclosureBox = await disclosure.boundingBox();
      if (!stageBox || !railBox || !toolbarBox || !disclosureBox) {
        throw new Error("Viewer、右栏、工具栏或结构信息未获得可测量布局");
      }

      const expectedStageHeight = Math.max(640, viewport.height - 205);
      expect(Math.abs(stageBox.height - expectedStageHeight)).toBeLessThanOrEqual(2);
      expect(Math.abs(railBox.y - stageBox.y)).toBeLessThanOrEqual(2);
      expect(railBox.x).toBeGreaterThanOrEqual(stageBox.x + stageBox.width);
      expect(Math.abs(railBox.width - 272)).toBeLessThanOrEqual(2);
      expect(Math.abs(toolbarBox.width - railBox.width)).toBeLessThanOrEqual(2);
      expect(Math.abs(disclosureBox.width - railBox.width)).toBeLessThanOrEqual(2);
      expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height);
      expect(disclosureBox.y + disclosureBox.height).toBeLessThanOrEqual(stageBox.y + stageBox.height);

      const buttonBoxes = await Promise.all([
        page.getByTestId("molecule-toggle-auto-rotate"),
        page.getByTestId("molecule-toggle-angles"),
        page.getByTestId("molecule-toggle-lone-pairs"),
        page.getByTestId("molecule-toggle-atom-labels"),
      ].map((button) => button.boundingBox()));
      if (buttonBoxes.some((box) => !box)) throw new Error("桌面端控制按钮未获得可测量布局");
      const measuredButtons = buttonBoxes as NonNullable<(typeof buttonBoxes)[number]>[];
      for (const [index, box] of measuredButtons.entries()) {
        expect(box.width).toBeGreaterThan(220);
        expect(box.height).toBeGreaterThanOrEqual(44);
        if (index > 0) expect(box.y).toBeGreaterThan(measuredButtons[index - 1].y);
      }
      await assertNoHorizontalOverflow(page);
    }
  });

  test("NH₃ 在 1024px 下保持 Viewer、工具栏与结构信息纵向排列", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/module/pyramidal-nh3");
    // ±2px 级别的布局等式断言必须等字体交换完成：回退字体更宽会把
    // 工具栏与控制栏的宽度差推到 4.95px（run 33078407631 即此因）。
    await page.evaluate(() => document.fonts.ready);

    const stage = page.getByTestId("module-builder-transition-stage");
    const rail = page.getByTestId("molecule-control-rail");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const boxes = await Promise.all([stage, rail, toolbar, disclosure].map((locator) => locator.boundingBox()));
    if (boxes.some((box) => !box)) throw new Error("1024px 普通分子布局未获得可测量边界");
    const [stageBox, railBox, toolbarBox, disclosureBox] = boxes as NonNullable<(typeof boxes)[number]>[];

    // 临时诊断（run 33315699503 的 ±2px 抖动定位用，收口后移除）。
    // eslint-disable-next-line no-console
    console.log(
      `[diag-molecule] ${JSON.stringify({
        stageBox,
        railBox,
        toolbarBox,
        disclosureBox,
        transforms: await page.evaluate(() =>
          [
            ".chem-viewer-stage",
            "[data-testid=molecule-control-rail]",
            "[data-testid=module-toolbar]",
            "[data-testid=structure-info-disclosure]",
          ].map((selector) => getComputedStyle(document.querySelector(selector)!).transform),
        ),
      })}`,
    );

    expect(Math.abs(railBox.x - stageBox.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(railBox.width - stageBox.width)).toBeLessThanOrEqual(2);
    expect(railBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height);
    expect(Math.abs(toolbarBox.width - railBox.width)).toBeLessThanOrEqual(2);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height);
    expect(Math.abs(disclosureBox.width - railBox.width)).toBeLessThanOrEqual(2);

    const buttonBoxes = await Promise.all([
      page.getByTestId("molecule-toggle-auto-rotate"),
      page.getByTestId("molecule-toggle-angles"),
      page.getByTestId("molecule-toggle-lone-pairs"),
      page.getByTestId("molecule-toggle-atom-labels"),
    ].map((button) => button.boundingBox()));
    if (buttonBoxes.some((box) => !box)) throw new Error("1024px 工具栏按钮未获得可测量边界");
    const measuredButtons = buttonBoxes as NonNullable<(typeof buttonBoxes)[number]>[];
    for (const box of measuredButtons) expect(box.height).toBeGreaterThanOrEqual(44);
    expect(Math.max(...measuredButtons.map((box) => box.y)) - Math.min(...measuredButtons.map((box) => box.y)))
      .toBeLessThanOrEqual(2);

    await assertNoHorizontalOverflow(page);
  });

  test("NH₃ 工具栏独立控制键角、孤电子对和标记", async ({ page }) => {
    await page.goto("/module/pyramidal-nh3");

    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    const angleToggle = page.getByTestId("molecule-toggle-angles");
    const lonePairToggle = page.getByTestId("molecule-toggle-lone-pairs");
    const labelToggle = page.getByTestId("molecule-toggle-atom-labels");

    await expect(angleToggle).toHaveAttribute("aria-pressed", "false");
    await expect(lonePairToggle).toHaveAttribute("aria-pressed", "false");
    await expect(labelToggle).toHaveAttribute("aria-pressed", "false");

    await lonePairToggle.click();
    await angleToggle.click();
    await labelToggle.click();

    await expect(lonePairToggle).toHaveAttribute("aria-pressed", "true");
    await expect(angleToggle).toHaveAttribute("aria-pressed", "true");
    await expect(labelToggle).toHaveAttribute("aria-pressed", "true");
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("约 107°", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("N", { exact: true })).toBeVisible();
  });

  test("手机端 Viewer、工具栏和折叠信息连续排列且控件满足触控边界", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/pyramidal-nh3", { waitUntil: "networkidle" });

    const stage = page.getByTestId("module-builder-transition-stage");
    const toolbar = page.getByTestId("module-toolbar");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const boxes = await Promise.all([stage, toolbar, disclosure].map((locator) => locator.boundingBox()));
    if (boxes.some((box) => !box)) throw new Error("移动端主区域未获得可测量布局");
    const [stageBox, toolbarBox, disclosureBox] = boxes as NonNullable<(typeof boxes)[number]>[];

    expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height);

    const autoRotateBox = await page.getByTestId("molecule-toggle-auto-rotate").boundingBox();
    const angleBox = await page.getByTestId("molecule-toggle-angles").boundingBox();
    const lonePairBox = await page.getByTestId("molecule-toggle-lone-pairs").boundingBox();
    const labelBox = await page.getByTestId("molecule-toggle-atom-labels").boundingBox();
    if (!autoRotateBox || !angleBox || !lonePairBox || !labelBox) throw new Error("移动端控制按钮未获得可测量布局");
    expect(Math.abs(autoRotateBox.y - angleBox.y)).toBeLessThanOrEqual(2);
    expect(lonePairBox.y).toBeGreaterThan(autoRotateBox.y);
    expect(Math.abs(lonePairBox.y - labelBox.y)).toBeLessThanOrEqual(2);

    for (const button of [
      page.getByTestId("molecule-toggle-auto-rotate"),
      page.getByTestId("molecule-toggle-angles"),
      page.getByTestId("molecule-toggle-lone-pairs"),
      page.getByTestId("molecule-toggle-atom-labels"),
      page.getByTestId("structure-info-toggle"),
    ]) {
      const box = await button.boundingBox();
      if (!box) throw new Error("触控按钮未获得可测量布局");
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    await assertNoHorizontalOverflow(page);
  });
});
