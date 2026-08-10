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

  test("NH₃ 默认全宽自由探索，结构信息默认折叠且可用键盘展开", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/module/pyramidal-nh3");

    const stage = page.getByTestId("module-builder-transition-stage");
    const viewer = page.getByTestId("molecule-viewer");
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
    const disclosureBox = await disclosure.boundingBox();
    if (!stageBox || !disclosureBox) throw new Error("普通分子主区域未获得可测量布局");
    expect(stageBox.width).toBeGreaterThan(1100);
    expect(disclosureBox.y).toBeGreaterThan(stageBox.y + stageBox.height);

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(disclosure.getByText("名称 / 分子式", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("空间构型", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("典型键角", { exact: true })).toBeVisible();
    await expect(disclosure.getByText("模型边界：", { exact: true })).toBeVisible();
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
    const toolbar = page.locator("[data-floating-toolbar]");
    const disclosure = page.getByTestId("structure-info-disclosure");
    const boxes = await Promise.all([stage, toolbar, disclosure].map((locator) => locator.boundingBox()));
    if (boxes.some((box) => !box)) throw new Error("移动端主区域未获得可测量布局");
    const [stageBox, toolbarBox, disclosureBox] = boxes as NonNullable<(typeof boxes)[number]>[];

    expect(toolbarBox.y).toBeGreaterThanOrEqual(stageBox.y + stageBox.height);
    expect(disclosureBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height);

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
