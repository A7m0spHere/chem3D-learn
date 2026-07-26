import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-014 扩展冒烟：金属密堆积（metal-close-packing）里少数「真正压在结构上、
// 指向具体原子组」的恒显徽章改为「引线 + 外围标签」（CalloutLabel）后仍可读，
// 且不再压在结构正中。
//
// 与 mof5-callout / mxene-callout 同款可观测性策略：引线是 drei `<Line>`
// （WebGL canvas 内、DOM 无对应节点），因此只断言两件可观测的事：
//   1. 每个 viewMode 下被转换的徽章文案仍然可见（替换没丢标签、没改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——即「外推到结构外围」的效果。
//
// 本 viewer 只转了 2 个 viewMode 里真正遮挡的少数徽章（layer 单层密排 1 处、
// coordination 12 配位 3 处）；标题徽章（FCC/HCP 计数、ABAB/ABCABC）、总结徽章
// （合计配位数 12、共同 η≈74%）与已在结构外侧的 StackingScene A/B/C 层徽章
// 保持原 <Html> 徽章，不在本断言范围内。
//
// 本文件不含 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/metal-close-packing";
const STAGE = "metal-close-packing-canvas";

// 每个 viewMode 下应当仍然可见的、已转为 CalloutLabel 的恒显徽章文案。
const MODE_LABELS: { mode: string; labels: string[] }[] = [
  { mode: "单层密排", labels: ["A 层｜同层 6 个最近邻"] },
  { mode: "12 配位", labels: ["同层 6", "上层 3", "下层 3"] },
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
  test(`金属密堆积「${mode}」的引线标签仍可见且偏离结构中心`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(ROUTE);

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
