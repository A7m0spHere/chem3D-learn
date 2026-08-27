import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-011 扩展冒烟：MXene（Ti₃C₂Tₓ）的「指向具体结构」恒显场景标签改为
// 「引线 + 外围标签」（CalloutLabel）后仍可读，且不再压在结构正中。
//
// 与 mof5-callout 同款可观测性策略：引线是 drei `<Line>`（WebGL canvas 内，
// DOM 无对应节点，无法直接断言），因此这里断言两件真正可观测的事：
//   1. 每个 viewMode 下被转换的教学文案仍然可见（替换没有丢标签、没有改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 只覆盖本次转成引线的 7 处标签所在的 4 个 viewMode（comparison / coordination
// / covalentNetwork / interlayerForce）。保持 <Html> 的全局说明、化学式推导和
// showLabels 门控标签不在断言范围内。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const MXENE_ROUTE = "/module/mxene-2d-material";
const STAGE = "mxene-canvas";

// 每个 viewMode 下应当仍然可见的、已转为 CalloutLabel 的恒显标签文案。
const MODE_LABELS: { mode: string; labels: string[] }[] = [
  { mode: "MAX → MXene", labels: ["MAX 前驱体｜Ti₃AlC₂", "二维片层｜Ti₃C₂Tₓ", "Al 层"] },
  { mode: "C 六配位", labels: ["C 中心｜6 个 Ti 最近邻", "Ti₆ 八面体轮廓"] },
  { mode: "表面端基", labels: ["O / OH / F 混合端基示意"] },
  { mode: "重新堆叠", labels: ["层间水 / 离子（示意）"] },
];

// 切换晶体视图模式（CrystalModeToolbar 用 mode.labelZh 作为按钮可见文本）。
async function switchMode(page: Page, mode: string) {
  const button = page.getByRole("button", { exact: true, name: mode });
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

for (const { mode, labels } of MODE_LABELS) {
  test(`MXene「${mode}」的引线标签仍可见且偏离结构中心`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(MXENE_ROUTE);

    const stage = page.getByTestId(STAGE);
    await expect(stage).toBeVisible();

    await switchMode(page, mode);

    // 标签是 HTML overlay，boundingBox 受 CJK 字体度量影响（T-040 勘误：
    // 「重新堆叠」用的是静态 offsets，此处并没有补间动画）。仍用固定等待而
    // 非 fonts.ready，是因为无法在 Windows 复现 CI 时序；改为事件驱动前
    // 需先在 CI 上验证，见 TASKS.md T-041。
    await page.waitForTimeout(1000);

    for (const text of labels) {
      const label = stage.getByText(text, { exact: true });
      await expect(label).toBeVisible();

      // 标签被外推到结构外围：至少在一个方向上明显离开 stage 正中。
      // 0.10 仍保证明显偏移（跨平台投影取整下实测最低 ≈0.13）。
      const offset = await offsetFromStageCenter(stage, label);
      expect(
        Math.max(offset.x, offset.y),
        `「${text}」应偏离 stage 中心，实测 x=${offset.x.toFixed(2)} y=${offset.y.toFixed(2)}`,
      ).toBeGreaterThan(0.10);
    }
  });
}
