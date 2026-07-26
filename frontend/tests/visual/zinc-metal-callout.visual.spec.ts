import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-018 扩展冒烟：锌金属（zinc-metal）晶胞计数视图里唯一「压在结构上」的恒显
// 徽章「内部：3 × 1 = 3」改为「引线 + 外围标签」（CalloutLabel）后仍可读，且
// 不再压在结构正中。
//
// 与 mof5-callout / metal-close-packing-callout 同款可观测性策略：引线是 drei
// `<Line>`（WebGL canvas 内、DOM 无对应节点），因此只断言两件可观测的事：
//   1. counting 视图下被转换的徽章文案仍然可见（替换没丢标签、没改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 本 viewer 只转了 counting 视图里 1 个真正遮挡内部 Zn 的徽章；顶角 / 面心徽章本
// 就在晶胞上方或外侧，合计是底部总结，层平面标签在平面边缘，都不在本断言范围。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/zinc-metal-crystal";
const STAGE = "zinc-metal-canvas";

const MODE = "晶胞计数";
const LABEL = "内部：3 × 1 = 3";

async function switchMode(page: Page, mode: string) {
  const button = page.getByRole("button", { exact: true, name: mode });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
}

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

test("锌金属「晶胞计数」的内部计数引线标签仍可见且偏离结构中心", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(ROUTE);

  const stage = page.getByTestId(STAGE);
  await expect(stage).toBeVisible();

  await switchMode(page, MODE);

  const label = stage.getByText(LABEL, { exact: true });
  await expect(label).toBeVisible();

  const offset = await offsetFromStageCenter(stage, label);
  expect(
    Math.max(offset.x, offset.y),
    `「${LABEL}」应偏离 stage 中心，实测 x=${offset.x.toFixed(2)} y=${offset.y.toFixed(2)}`,
  ).toBeGreaterThan(0.15);
});
