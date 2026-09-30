import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-043 Phase 2 守卫（台账缺陷 3，LABEL_AUDIT_20260930）：极性页全部 Html
// 标签（TinyAtomLabel / ChargeMarker / TinyDipoleLabel）接入
// useClampedHtmlPosition（collisionGroup "polarity-callout"）后，任意视口下
// 不出画布、两两重叠 ≤5%。修复前「电子云偏向 F」×「F」45-61%、
// 「B」×「F 更吸电子」27-31%（360/390/768）；阈值取 5% 而非 25%——极性页
// 全是白底 pill，白叠白时 25% 的面积重叠就足以盖断文字。
//
// 本文件不含 toHaveScreenshot，可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/polarity-judgment";
const VIEWPORTS = [
  { height: 740, width: 360 },
  { height: 844, width: 390 },
  { height: 900, width: 768 },
];

async function settle(page: Page) {
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
}

for (const viewport of VIEWPORTS) {
  test(`${viewport.width}px：极性页场景标签不出界且互叠 ≤25%`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.goto(ROUTE);
    await settle(page);
    // 默认电负性视图即台账缺陷现场（「电子云偏向 F」×「F」），等待标签
    // 分离收敛（scheduleSettle 的 3 帧 invalidate 在挂载后自动完成）。
    await page.waitForTimeout(800);

    const scan = await page.evaluate(() => {
      const stage = document.querySelector('[data-testid="molecular-polarity-canvas"]');
      if (!stage) throw new Error("极性 stage 未找到");
      const s = stage.getBoundingClientRect();
      const rects = [...document.querySelectorAll("[data-polarity-label]")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      const outside = rects.filter(
        (r) => r.x < s.x - 2 || r.y < s.y - 2 || r.right > s.right + 2 || r.bottom > s.bottom + 2,
      ).length;
      let worst = 0;
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          const ox = Math.min(rects[i].right, rects[j].right) - Math.max(rects[i].x, rects[j].x);
          const oy = Math.min(rects[i].bottom, rects[j].bottom) - Math.max(rects[i].y, rects[j].y);
          if (ox <= 0 || oy <= 0) continue;
          const smaller = Math.min(rects[i].width * rects[i].height, rects[j].width * rects[j].height);
          worst = Math.max(worst, (ox * oy) / smaller);
        }
      }
      return { count: rects.length, outside, worst: Math.round(worst * 100) };
    });

    expect(scan.count, `极性标签数量（${viewport.width}px）`).toBeGreaterThanOrEqual(3);
    expect(scan.outside, `出界标签数（${viewport.width}px）`).toBe(0);
    expect(scan.worst, `最大互叠比例 %（${viewport.width}px）`).toBeLessThanOrEqual(5);
  });
}
