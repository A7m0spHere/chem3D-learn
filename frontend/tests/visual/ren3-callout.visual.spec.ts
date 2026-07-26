import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-012 扩展冒烟：ReN₃（Imm2 高压预测相）的「指向具体结构」恒显场景标签改为
// 「引线 + 外围标签」（CalloutLabel）后仍可读，且不再压在结构正中。
//
// 与 mof5-callout / mxene-callout 同款可观测性策略：引线是 drei `<Line>`（WebGL
// canvas 内，DOM 无对应节点，无法直接断言），因此这里断言两件真正可观测的事：
//   1. 每个 viewMode 下被转换的教学文案仍然可见（替换没有丢标签、没有改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 只覆盖本次转成引线的 3 处标签所在的 2 个 viewMode（covalentNetwork / coordination）。
// 保持 <Html> 的全局说明、压力窗口 widget、计数 widget、场景标题和 showLabels 门控
// 位点标签不在断言范围内。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const REN3_ROUTE = "/module/ren3-high-pressure-nitride";
const STAGE = "ren3-canvas";

// 每个 viewMode 下应当仍然可见的、已转为 CalloutLabel 的恒显标签文案。
const MODE_LABELS: { mode: string; labels: string[] }[] = [
  { mode: "N₃ 单元", labels: ["N₃ 单元｜N1–N2–N1", "两条短 N–N 距离 ≈ 1.36 Å"] },
  { mode: "Re 七配位", labels: ["Re 中心｜7 个 N 最近邻"] },
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
  test(`ReN₃「${mode}」的引线标签仍可见且偏离结构中心`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(REN3_ROUTE);

    const stage = page.getByTestId(STAGE);
    await expect(stage).toBeVisible();

    await switchMode(page, mode);

    for (const text of labels) {
      const label = stage.getByText(text, { exact: true });
      await expect(label).toBeVisible();

      // 标签被外推到结构外围：至少在一个方向上明显离开 stage 正中。
      const offset = await offsetFromStageCenter(stage, label);
      expect(
        Math.max(offset.x, offset.y),
        `「${text}」应偏离 stage 中心，实测 x=${offset.x.toFixed(2)} y=${offset.y.toFixed(2)}`,
      ).toBeGreaterThan(0.15);
    }
  });
}
