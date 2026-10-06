import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-043 Phase 2 + 遗留缺陷④守卫（LABEL_AUDIT_20260930）：杂化专题场景标签 =
// SharedAxisTriad 轴标签（X/Y/Z）+ SceneBadge 轨道/键角徽章（p1/p2/180° 等），
// 均接入 useClampedHtmlPosition（collisionGroup "hybrid-scene"）。
// 修复前任意视口下 Y×p1 43-67%、p1×180° 26-67%、Z×p2 33% 叠印；覆盖卡避让
// 修复前 Y/Z 轴标签与徽章被顶部信息卡遮盖 22-100%（全视口，含桌面 1280）。
//
// 守卫：sp / sp² / sp³ 三种模式（进度固定 80，保证徽章全部在场）下，
// 所有场景标签不出画布、两两重叠面积 ≤ 25%（台账的缺陷定义阈值）、
// 被信息卡/图例卡遮盖 ≤ 5%（躲进半透明卡片即内容不可达）。
// 本文件不含 toHaveScreenshot，可在 Windows 系统 Chrome 通道运行。
// ---------------------------------------------------------------------------

const ROUTE = "/module/hybrid-orbitals-sp";
const STAGE = "hybrid-orbitals-sp-canvas";
const VIEWPORTS = [
  { height: 740, width: 360 },
  { height: 844, width: 390 },
  { height: 800, width: 1280 },
];
const MODES = ["sp", "sp2", "sp3"] as const;

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
  test(`${viewport.width}px：三种杂化模式的场景标签不出界且互叠 ≤25%`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.goto(ROUTE);
    await settle(page);

    const stage = page.getByTestId(STAGE);
    await expect(stage).toBeVisible();

    for (const mode of MODES) {
      if (mode !== "sp") {
        await page.getByTestId(`bonding-basics-mode-${mode}`).click();
      }
      // 进度固定 80：>0.55 显示键角徽章、>0.34 显示未杂化 p 徽章，模式切换
      // 若重置进度也在此恢复，保证三种模式下徽章全部在场。
      await page.getByTestId("hybrid-progress-slider").fill("80");
      await page.waitForTimeout(500);

      const scan = await page.evaluate(() => {
        const stage = document.querySelector('[data-testid="hybrid-orbitals-sp-canvas"]');
        if (!stage) throw new Error("杂化 stage 未找到");
        const s = stage.getBoundingClientRect();
        const rects = [...document.querySelectorAll("[data-scene-label]")]
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
        // 台账遗留缺陷④（LABEL_AUDIT_20260930）：场景标签被顶部覆盖卡遮盖——
        // 修复前 Y/Z 轴标签与徽章在全部视口被信息卡遮住 22-100%，桌面 1280 也不可见。
        const cardRects = [
          ...document.querySelectorAll(
            '[data-testid="hybrid-scene-info-card"], [data-testid="hybrid-scene-legend-card"]',
          ),
        ]
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        let worstCard = 0;
        for (const label of rects) {
          for (const card of cardRects) {
            const ox = Math.min(label.right, card.right) - Math.max(label.x, card.x);
            const oy = Math.min(label.bottom, card.bottom) - Math.max(label.y, card.y);
            if (ox <= 0 || oy <= 0) continue;
            worstCard = Math.max(
              worstCard,
              (ox * oy) / (label.width * label.height),
            );
          }
        }
        return {
          count: rects.length,
          outside,
          worst: Math.round(worst * 100),
          worstCard: Math.round(worstCard * 100),
        };
      });

      expect(scan.count, `${mode} 场景标签数量（${viewport.width}px）`).toBeGreaterThanOrEqual(4);
      expect(scan.outside, `${mode} 出界标签数（${viewport.width}px）`).toBe(0);
      expect(
        scan.worst,
        `${mode} 最大互叠比例 %（${viewport.width}px）`,
      ).toBeLessThanOrEqual(25);
      expect(
        scan.worstCard,
        `${mode} 标签被覆盖卡遮盖比例 %（${viewport.width}px）`,
      ).toBeLessThanOrEqual(5);
    }
  });
}
