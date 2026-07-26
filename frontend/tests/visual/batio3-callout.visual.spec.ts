import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-019 扩展冒烟：钛酸钡（batio3）两处「压在结构上」的恒显场景导引标签改为
// 「引线 + 外围标签」（CalloutLabel）后仍可读，且不再压在结构正中：
//   - polyhedron（TiO₆ 八面体）视图：`O—O 轮廓 · 非化学键`（原落在八面体内部）。
//   - aSiteCoordination（Ba²⁺ 12 配位）视图：`Ba²⁺ · 中心`（原贴在中心 Ba 上）。
//
// 与既有 callout 冒烟同款可观测性策略：引线是 drei `<Line>`（WebGL canvas 内、
// DOM 无对应节点），因此只断言两件可观测的事：
//   1. 对应视图下被转换的标签文案仍然可见（替换没丢标签、没改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 本 viewer 保留为原 <Html> 的：`12 个最近邻 O²⁻` 总结、`原点平移`/`新原点` 全局
// 说明、以及 showLabels / counting 门控的代表原子标签，都不在本断言范围。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/batio3-perovskite";
const STAGE = "batio3-canvas";

const MODE_LABELS: { mode: string; label: string }[] = [
  { mode: "TiO₆ 八面体", label: "O—O 轮廓 · 非化学键" },
  { mode: "Ba²⁺ 12配位", label: "Ba²⁺ · 中心" },
];

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

for (const { mode, label } of MODE_LABELS) {
  test(`钛酸钡「${mode}」的引线标签仍可见且偏离结构中心`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(ROUTE);

    const stage = page.getByTestId(STAGE);
    await expect(stage).toBeVisible();

    await switchMode(page, mode);

    const target = stage.getByText(label, { exact: true });
    await expect(target).toBeVisible();

    const offset = await offsetFromStageCenter(stage, target);
    expect(
      Math.max(offset.x, offset.y),
      `「${label}」应偏离 stage 中心，实测 x=${offset.x.toFixed(2)} y=${offset.y.toFixed(2)}`,
    ).toBeGreaterThan(0.15);
  });
}
