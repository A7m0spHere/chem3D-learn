import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-015 扩展冒烟：普鲁士蓝类似物（PBA）里「真正压在结构上、指向具体结构」的
// 恒显场景标签改为「引线 + 外围标签」（CalloutLabel）后仍可读，且不再压在结构正中。
//
// 与 mof5-callout / mxene-callout / ren3-callout / metal-close-packing-callout
// 同款可观测性策略：引线是 drei `<Line>`（WebGL canvas 内、DOM 无对应节点），
// 因此只断言两件可观测的事：
//   1. 每个场景下被转换的标签文案仍然可见（替换没丢标签、没改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 本 viewer 只转了 2 处真正遮挡、指向单一结构的恒显标签：
//   - coordination（配位骨架）的「六配位方向」（原压在 M′(CN)₆ 八面体中心上方）；
//   - voids（空位水合）非 framework 阶段的空位标记「□ 空位」（指向空位中心）。
// 保留为原 <Html> 的有：showLabels 门控的原子位点标签、comparison 视图的
// 「节点-桥-节点」整体概念说明（不指向单一锚点结构、且已在晶胞外侧下方）。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/pba-prussian-blue-analogues";
const STAGE = "pba-canvas";

// 切换晶体视图模式（CrystalModeToolbar 用 mode.labelZh 作为按钮可见文本）。
async function switchMode(page: Page, mode: string) {
  const button = page.getByRole("button", { exact: true, name: mode });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
}

// 切换空隙阶段（VoidModeCard 用 stage.labelZh 作为按钮可见文本）。
async function switchVoidStage(page: Page, stage: string) {
  const button = page.getByRole("button", { exact: true, name: stage });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
}

// 标签中心与 stage 中心的归一化偏移（0 = 正中，1 = 贴边）。
async function offsetFromStageCenter(stage: Locator, label: Locator) {
  const stageBox = await stage.boundingBox();
  const labelBox = await label.boundingBox();
  if (!stageBox || !labelBox) throw new Error("stage 或标签没有 boundingBox");

  const stageCenter = { x: stageBox.x + stageBox.width / 2, y: stageBox.y + stageBox.height / 2 };
  const labelCenter = { x: labelBox.x + labelBox.width / 2, y: labelBox.y + labelBox.height / 2 };

  return {
    x: Math.abs(labelCenter.x - stageCenter.x) / (stageBox.width / 2),
    y: Math.abs(labelCenter.y - stageCenter.y) / (stageBox.height / 2),
  };
}

async function assertCalloutOffset(stage: Locator, text: string) {
  const label = stage.getByText(text, { exact: true });
  await expect(label).toBeVisible();

  const offset = await offsetFromStageCenter(stage, label);
  expect(
    Math.max(offset.x, offset.y),
    `「${text}」应偏离 stage 中心，实测 x=${offset.x.toFixed(2)} y=${offset.y.toFixed(2)}`,
  ).toBeGreaterThan(0.15);
}

test("PBA「配位骨架」的六配位方向引线标签仍可见且偏离结构中心", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(ROUTE);

  const stage = page.getByTestId(STAGE);
  await expect(stage).toBeVisible();

  await switchMode(page, "配位骨架");
  await assertCalloutOffset(stage, "六配位方向");
});

test("PBA「空位水合」的空位标记引线标签仍可见且偏离结构中心", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(ROUTE);

  const stage = page.getByTestId(STAGE);
  await expect(stage).toBeVisible();

  await switchMode(page, "空位水合");
  // 空位标记只在非 framework 阶段渲染；切到「六氰空位」阶段以显示「□ 空位」。
  await switchVoidStage(page, "六氰空位");
  await assertCalloutOffset(stage, "□ 空位");
});
