import { expect, test, type Page } from "@playwright/test";

async function dragFirstBuilderAtom(page: Page) {
  const marker = page.getByTestId(/^atom-pull-handle-/).first();
  await expect(marker).toBeAttached();
  await page.waitForTimeout(350);
  const box = await marker.boundingBox();
  if (!box) throw new Error("有机模块原子投影标记不可见");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 54, startY - 18, { steps: 8 });
  await page.mouse.up();
}

test("拼装实验室识别乙烯并支持从空白补成甲烷", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();
  await expect(page.getByTestId("builder-formula")).toHaveText("C₂H₄");
  await expect(page.getByTestId("builder-known-name")).toHaveText("乙烯");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("平面三角形 · sp²");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("≈120°");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("C 中心 · 2 处");
  await expect(
    page.getByTestId("organic-builder-viewer").getByText("≈120°", { exact: true }).first(),
  ).toBeAttached();
  await expect(page.getByTestId("organic-builder-page")).toHaveAttribute("data-canvas-ready", "true");
  const pageBox = await page.getByTestId("organic-builder-page").boundingBox();
  const stageBox = await page.getByTestId("organic-builder-viewer").boundingBox();
  expect(pageBox).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(Math.abs((stageBox?.width ?? 0) - (pageBox?.width ?? 0))).toBeLessThanOrEqual(1);
  expect(Math.abs((stageBox?.height ?? 0) - (pageBox?.height ?? 0))).toBeLessThanOrEqual(1);
  await expect(page.getByTestId("organic-builder-toolbox")).toBeVisible();
  await expect(page.getByTestId("organic-builder-info")).toBeVisible();
  await expect(page.getByTestId("organic-builder-viewer")).toHaveScreenshot("organic-builder-ethylene.png");

  await page.getByRole("button", { name: "新建空白模型" }).click();
  await page.getByRole("button", { name: "清空并新建" }).click();
  await page.getByTestId("builder-add-c").click();
  await expect(page.getByTestId("builder-bond-angle-matches")).toHaveCount(0);
  await page.getByRole("button", { name: "一键补氢" }).click();
  await expect(page.getByTestId("builder-formula")).toHaveText("CH₄");
  await expect(page.getByTestId("builder-known-name")).toHaveText("甲烷");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("四面体 · sp³");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("≈109.5°");
});

test("未收录的氯甲烷由本地规则生成双语系统名称", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await page.getByRole("button", { name: "新建空白模型" }).click();
  await page.getByRole("button", { name: "清空并新建" }).click();
  await page.getByTestId("builder-add-c").click();
  const carbonHandle = page.getByTestId("builder-atom-handle-c-1");
  await expect(carbonHandle).toBeAttached();
  await carbonHandle.click({ force: true });
  await expect(page.getByTestId("organic-builder-toolbox")).toContainText("已选原子：C");
  await page.getByTestId("builder-add-cl").click();
  await page.getByRole("button", { name: "一键补氢" }).click();

  await expect(page.getByTestId("builder-formula")).toHaveText("CH₃Cl");
  await expect(page.getByTestId("builder-systematic-name")).toHaveText("氯甲烷");
  await expect(page.getByTestId("organic-builder-info")).toContainText("chloromethane · 卤代烃");
  await expect(page.getByTestId("organic-builder-info")).toContainText("不包含 E/Z、R/S 等立体化学信息");
});

test("从空白模型拼出甲酰胺后同步显示名称、片段和酰胺氮几何", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await page.getByRole("button", { name: "新建空白模型" }).click();
  await page.getByRole("button", { name: "清空并新建" }).click();
  await page.getByTestId("builder-add-c").click();

  const carbonHandle = page.getByTestId("builder-atom-handle-c-1");
  await carbonHandle.click({ force: true });
  await page.getByRole("button", { name: "双键", exact: true }).click();
  await page.getByTestId("builder-add-o").click();

  await carbonHandle.click({ force: true });
  await page.getByRole("button", { name: "单键", exact: true }).click();
  await page.getByTestId("builder-add-n").click();
  await page.getByRole("button", { name: "一键补氢" }).click();

  await expect(page.getByTestId("builder-formula")).toHaveText("CH₃NO");
  await expect(page.getByTestId("builder-systematic-name")).toHaveText("甲酰胺");
  await expect(page.getByTestId("organic-builder-info")).toContainText("methanamide · 酰胺");
  await expect(page.getByTestId("organic-builder-info")).toContainText("酰胺基");
  await expect(page.getByTestId("organic-builder-info")).not.toContainText("氨基/胺键片段");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("平面型酰胺氮 · sp²");
  await expect(page.getByTestId("builder-bond-angle-matches")).toContainText("≈120°");
});

test("苯依次接入三个氯后生成单取代、邻位二取代及三取代名称", async ({ page }) => {
  await page.goto("/lab/organic-builder/benzene-planar");
  await expect(page.getByTestId("builder-known-name")).toHaveText("苯");

  const hydrogenHandle = page.getByTestId("builder-atom-handle-h1");
  await expect(hydrogenHandle).toBeAttached();
  await hydrogenHandle.click({ force: true });
  await page.getByRole("button", { name: "删除所选" }).click();

  const carbonHandle = page.getByTestId("builder-atom-handle-c1");
  await expect(carbonHandle).toBeAttached();
  await carbonHandle.click({ force: true });
  await page.getByTestId("builder-add-cl").click();

  await expect(page.getByTestId("builder-formula")).toHaveText("C₆H₅Cl");
  await expect(page.getByTestId("builder-systematic-name")).toHaveText("氯苯");
  await expect(page.getByTestId("organic-builder-info")).toContainText("chlorobenzene · 卤代芳烃");

  await page.getByTestId("builder-atom-handle-h2").click({ force: true });
  await page.getByRole("button", { name: "删除所选" }).click();
  await page.getByTestId("builder-atom-handle-c2").click({ force: true });
  await page.getByTestId("builder-add-cl").click();

  await expect(page.getByTestId("builder-formula")).toHaveText("C₆H₄Cl₂");
  await expect(page.getByTestId("builder-systematic-name")).toHaveText("1,2-二氯苯");
  await expect(page.getByTestId("organic-builder-info")).toContainText("1,2-dichlorobenzene · 卤代芳烃");
  await expect(page.getByTestId("builder-position-alias")).toContainText("邻位（1,2-） · ortho (o-)");
  await expect(page.getByTestId("builder-position-alias")).toContainText("邻二氯苯");
  await expect(page.getByTestId("builder-position-alias")).toContainText("o-dichlorobenzene");

  await page.getByTestId("builder-atom-handle-h3").click({ force: true });
  await page.getByRole("button", { name: "删除所选" }).click();
  await page.getByTestId("builder-atom-handle-c3").click({ force: true });
  await page.getByTestId("builder-add-cl").click();

  await expect(page.getByTestId("builder-formula")).toHaveText("C₆H₃Cl₃");
  await expect(page.getByTestId("builder-systematic-name")).toHaveText("1,2,3-三氯苯");
  await expect(page.getByTestId("organic-builder-info")).toContainText("1,2,3-trichlorobenzene · 卤代芳烃");
  await expect(page.getByTestId("builder-position-alias")).toHaveCount(0);
});

test("未保存草稿离开时显示确认层", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await page.getByTestId("builder-add-o").click();
  await page.getByRole("link", { name: "探索全部" }).click();
  await expect(page.getByRole("heading", { name: "要离开当前拼装吗？" })).toBeVisible();
  await page.getByRole("button", { name: "继续拼装" }).click();
  await expect(page).toHaveURL(/organic-builder/);
});

test("实验室内可把已连接原子整体拔下并撤销", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  const marker = page.getByTestId("builder-atom-handle-h1");
  await expect(marker).toBeAttached();
  await page.waitForTimeout(500);
  const box = await marker.boundingBox();
  if (!box) throw new Error("拼装区原子投影标记不可见");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 110, startY - 40, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByTestId("builder-feedback")).toContainText("整体拔下");
  await expect(page.getByTestId("organic-builder-info")).toContainText("独立片段2");
  await page.getByRole("button", { name: "撤销" }).click();
  await expect(page.getByTestId("builder-known-name")).toHaveText("乙烯");
});

test("所有现有有机模块都公开抓取入口", async ({ page }) => {
  const cases = [
    ["/module/ethylene-planar", "ethylene-planar-viewer"],
    ["/module/acetylene-linear", "acetylene-linear-viewer"],
    ["/module/benzene-planar", "benzene-planar-viewer"],
    ["/module/organic-coplanar", "organic-coplanar-viewer"],
  ] as const;
  for (const [route, testId] of cases) {
    await page.goto(route);
    await expect(page.getByTestId(testId)).toContainText("抓住原子进入拼装");
  }
});

test("四个有机模块都通过共享舞台转场进入实验室并保持拔下状态", async ({ page }) => {
  await page.addInitScript(() => {
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    const transitionWindow = window as typeof window & { __builderViewTransitionCalls?: number };
    transitionWindow.__builderViewTransitionCalls = 0;
    const original = transitionDocument.startViewTransition?.bind(document);
    if (!original) return;
    transitionDocument.startViewTransition = (callback) => {
      transitionWindow.__builderViewTransitionCalls = (transitionWindow.__builderViewTransitionCalls ?? 0) + 1;
      return original(callback);
    };
  });

  const cases = [
    ["/module/ethylene-planar", /\/lab\/organic-builder\/ethylene-planar/],
    ["/module/acetylene-linear", /\/lab\/organic-builder\/acetylene-linear/],
    ["/module/benzene-planar", /\/lab\/organic-builder\/benzene-planar/],
    ["/module/organic-coplanar", /\/lab\/organic-builder\/organic-coplanar/],
  ] as const;

  for (const [route, expectedRoute] of cases) {
    await page.goto(route);
    const callsBefore = await page.evaluate(() => (window as typeof window & { __builderViewTransitionCalls?: number }).__builderViewTransitionCalls ?? 0);
    await dragFirstBuilderAtom(page);
    await expect(page).toHaveURL(expectedRoute, { timeout: 5_000 });
    await expect(page.getByTestId("organic-builder-page")).toHaveAttribute("data-entry-transition", "viewer-expand");
    await expect(page.getByTestId("organic-builder-page")).toHaveAttribute("data-canvas-ready", "true");
    await expect(page.getByTestId("builder-feedback")).toContainText("整体拔下");
    const callsAfter = await page.evaluate(() => (window as typeof window & { __builderViewTransitionCalls?: number }).__builderViewTransitionCalls ?? 0);
    expect(callsAfter).toBe(callsBefore + 1);
  }
});

test("减少动态效果时跳过空间放大但仍正确进入实验室", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    const transitionWindow = window as typeof window & { __builderViewTransitionCalls?: number };
    transitionWindow.__builderViewTransitionCalls = 0;
    const original = transitionDocument.startViewTransition?.bind(document);
    if (!original) return;
    transitionDocument.startViewTransition = (callback) => {
      transitionWindow.__builderViewTransitionCalls = (transitionWindow.__builderViewTransitionCalls ?? 0) + 1;
      return original(callback);
    };
  });
  await page.goto("/module/ethylene-planar");
  await dragFirstBuilderAtom(page);
  await expect(page).toHaveURL(/\/lab\/organic-builder\/ethylene-planar/, { timeout: 5_000 });
  const calls = await page.evaluate(() => (window as typeof window & { __builderViewTransitionCalls?: number }).__builderViewTransitionCalls ?? 0);
  expect(calls).toBe(0);
});

test("无 View Transition API 时退化为可用的短淡入", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: undefined });
  });
  await page.goto("/module/ethylene-planar");
  await dragFirstBuilderAtom(page);
  await expect(page).toHaveURL(/\/lab\/organic-builder\/ethylene-planar/, { timeout: 5_000 });
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();
  await expect(page.getByTestId("organic-builder-overlay-header")).toBeVisible();
});

test("移动端保持画布优先且无水平溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/organic-builder/benzene-planar");
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();
  await expect(page.getByTestId("organic-builder-toolbox")).not.toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByTestId("organic-builder-page")).toHaveScreenshot("organic-builder-mobile.png", { fullPage: true });
  await page.getByRole("button", { name: "模型盒", exact: true }).click();
  await expect(page.getByTestId("organic-builder-toolbox")).toBeVisible();
  await page.getByRole("button", { name: "收起模型盒" }).click();
  await page.getByRole("button", { name: "结构信息", exact: true }).click();
  await expect(page.getByTestId("organic-builder-info")).toBeVisible();
  await expect(page.getByTestId("organic-builder-page")).toHaveScreenshot("organic-builder-mobile-info.png", { fullPage: true });
});
