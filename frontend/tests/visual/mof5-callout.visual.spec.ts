import { expect, test, type Locator, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-011 冒烟：MOF-5 的恒显场景标签改为「引线 + 外围标签」后仍然可读，且不再
// 压在晶胞正中。
//
// 可观测性说明：引线本身是 drei `<Line>`，渲染在 WebGL canvas 内部，DOM 里没有
// 对应节点，无法直接断言。因此这里断言两件真正可观测的事：
//   1. 每个 viewMode 下原有的教学文案仍然可见（替换没有丢标签、没有改文案）；
//   2. 标签中心相对 stage 中心有明显偏移——这正是「外推到结构外围」的效果，
//      也是替换前后唯一能从 DOM 侧稳定观测到的位置差异。
//
// 标签由 `<Html>` 渲染成 canvas 上方的绝对定位 DOM，所以 boundingBox 可用。
//
// 本文件不含任何 toMatchSnapshot / toHaveScreenshot，不触碰 Darwin 视觉基线，
// 可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const MOF5_ROUTE = "/module/mof-metal-organic-framework";
const STAGE = "mof5-canvas";

// 每个 viewMode 下应当仍然可见的恒显标签文案（改造后由 CalloutLabel 承载）。
const MODE_LABELS: { mode: string; labels: string[] }[] = [
  { mode: "构筑单元", labels: ["金属簇节点｜Zn₄O SBU", "有机连接体｜BDC"] },
  { mode: "Zn₄O 节点", labels: ["Zn₄O 核心｜4 个 Zn", "单个 Zn：O 四配位", "整个 SBU：六连接方向"] },
  { mode: "BDC 连接体", labels: ["BDC²⁻｜线性二连接体", "苯环提供刚性间隔", "羧酸根接入节点"] },
  { mode: "立方拓扑", labels: ["pcu｜每个节点沿 ±x、±y、±z 六方向连接", "虚线末端｜跨晶胞继续连接"] },
  { mode: "组成计数", labels: ["8×1/8 = 1 SBU", "12×1/4 = 3 BDC"] },
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
  test(`MOF-5「${mode}」的引线标签仍可见且偏离结构中心`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(MOF5_ROUTE);

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

test("MOF-5「孔隙与客体」逐阶段的引线标签可见", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(MOF5_ROUTE);

  const stage = page.getByTestId(STAGE);
  await expect(stage).toBeVisible();
  await switchMode(page, "孔隙与客体");

  // 孔隙体积阶段：孔隙标签由 PoreVolume 的 CalloutLabel 渲染。
  await switchMode(page, "孔隙体积");
  await expect(stage.getByText("孔隙体积（教学示意）", { exact: true })).toBeVisible();

  // 加入客体阶段：孔隙 + 客体两条引线标签同时在场。
  await switchMode(page, "加入客体");
  await expect(stage.getByText("孔隙体积（教学示意）", { exact: true })).toBeVisible();
  await expect(stage.getByText("客体分子（示意）", { exact: true })).toBeVisible();
});

// ---------------------------------------------------------------------------
// T-042 守卫：极窄视口下钳制 + 分离必须把所有引线标签 pill 留在画布内
// （修复前 390px 下 MOF-5「虚线末端」标签被画布边缘裁切、与 pcu 标签叠印）。
// ---------------------------------------------------------------------------
test("360px 极窄视口下所有引线标签 pill 不越出画布", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(MOF5_ROUTE);
  // ±2px 级别的几何断言按 D-049 惯例等页面稳定：字体交换 + 懒加载容器挂载 +
  // 页面进入动画结束。
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForSelector(".motion-page-enter", { state: "attached", timeout: 10_000 })
    .catch(() => undefined);
  await page.evaluate(async () => {
    const pageEnter = document.querySelector(".motion-page-enter");
    if (!pageEnter) return;
    await Promise.all(
      pageEnter
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });

  const stage = page.getByTestId(STAGE);
  await expect(
    stage.getByText("pcu｜每个节点沿 ±x、±y、±z 六方向连接", { exact: true }),
  ).toBeVisible();

  const stageBox = await stage.boundingBox();
  if (!stageBox) throw new Error("360px 下 MOF-5 stage 未获得可测量边界");

  const pills = await page
    .locator("[data-callout-label]")
    .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().toJSON()));
  expect(pills.length).toBeGreaterThanOrEqual(2);

  const outside = pills.filter(
    (box) =>
      box.x < stageBox.x - 1 ||
      box.y < stageBox.y - 1 ||
      box.x + box.width > stageBox.x + stageBox.width + 1 ||
      box.y + box.height > stageBox.y + stageBox.height + 1,
  );
  expect(outside, `引线标签 pill 越出画布：${JSON.stringify(outside)}`).toEqual([]);
});

// ---------------------------------------------------------------------------
// T-042 评审守卫：碰撞分离不得与自己的上一帧矩形反馈。若分离把自己 registry 里
// 的上一帧矩形当作他人，固定相机下标签会每帧自推 pill高+2 px 并以帧频振荡
// （评审实测 26px 交替）。
//
// 方法：viewport 宽度在 lg 断点内取 5 个值各访问两次。同宽度 ⇒ 同画布尺寸 ⇒
// 同相机 aspect ⇒ 投影基准完全确定，两次访问的 y 必须相等；存在自反馈时两次
// 访问会落在振荡的不同相位（相差约 pill 高度）。跨宽度比较 y 是无效的——
// aspect 变化会带来 1~6px 的合法重投影位移，因此只在同宽度内比较。
// x 随宽度变化则证明每一轮确实发生了重渲染。
// ---------------------------------------------------------------------------
test("固定相机位姿连续重渲染时引线标签 y 稳定（自反馈振荡守卫）", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1240, height: 800 });
  await page.goto(MOF5_ROUTE);
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForSelector(".motion-page-enter", { state: "attached", timeout: 10_000 })
    .catch(() => undefined);
  await page.evaluate(async () => {
    const pageEnter = document.querySelector(".motion-page-enter");
    if (!pageEnter) return;
    await Promise.all(
      pageEnter
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });

  await expect(
    page.getByTestId(STAGE).getByText("pcu｜每个节点沿 ±x、±y、±z 六方向连接", { exact: true }),
  ).toBeVisible();

  const WIDTHS = [1210, 1240, 1270, 1225, 1255, 1210, 1240, 1270, 1225, 1255];
  const sample = () =>
    page.locator("[data-callout-label]").evaluateAll((elements) =>
      elements.map((el) => {
        const box = el.getBoundingClientRect();
        return { x: Math.round(box.x), y: Math.round(box.y * 10) / 10 };
      }),
    );

  const rounds: { x: number; y: number }[][] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(120);
    rounds.push(await sample());
  }

  const labelCount = rounds[0].length;
  expect(labelCount).toBeGreaterThanOrEqual(2);
  for (let i = 1; i < rounds.length; i++) {
    expect(rounds[i].length, `宽度 ${WIDTHS[i]} 下标签数量变化`).toBe(labelCount);
  }

  for (let j = 0; j < labelCount; j++) {
    // 渲染确实发生的证明：宽度跨度 60px，x 必须随之变化
    const xSpread = Math.max(...rounds.map((r) => r[j].x)) - Math.min(...rounds.map((r) => r[j].x));
    expect(xSpread, `标签 ${j} 的 x 应随宽度变化（证明渲染发生）`).toBeGreaterThan(3);

    // 同宽度两次访问（相隔 5 轮）：y 必须一致；自反馈振荡会差出约一个 pill 高
    // （实测 ~26px）。阈值 8px 为定标值：dev 环境下同宽访问的良性漂移实测
    // 0.8~1.6px（aspect 重投影 + 缓慢时间漂移），距振荡特征值有 3 倍以上余量。
    for (let k = 0; k < 5; k++) {
      const dy = Math.abs(rounds[k + 5][j].y - rounds[k][j].y);
      expect(
        dy,
        `宽度 ${WIDTHS[k]} 下标签 ${j} 两次访问 y 不一致（自反馈振荡）：dy=${dy}，全部采样 ${JSON.stringify(rounds.map((r) => r[j]?.y))}`,
      ).toBeLessThanOrEqual(8);
    }
  }
});
