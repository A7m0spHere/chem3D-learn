import { expect, test } from "@playwright/test";

// Claude Code 的全站滑入改动给结构分类 section 增加了一层 ScrollReveal。
// 区块间距必须放在这个新外层上：若仍留在 section 的 `last:` 选择器里，
// 每个 section 都会是各自 wrapper 的唯一子元素而被当成 last child，
// 最终把分类间距全部清零。
//
// 间距阈值按现行设计重新定标（2026-08-27）：T-039D 目录收缩后分类间距为
// `mb-10` = 40px（旧设计 56px）；阈值 35 只防「间距被清零」的原始回归，
// 不锁定精确值。本文件只检查 DOM / 计算布局，不含截图断言。
test("结构分类滑入完成后仍保留区块间距", async ({ page }) => {
  await page.goto("/modules", { waitUntil: "networkidle" });

  const sections = page.locator("section[aria-labelledby]");
  const sectionCount = await sections.count();
  expect(sectionCount).toBeGreaterThan(1);

  for (const section of await sections.all()) {
    await section.scrollIntoViewIfNeeded();
    const reveal = section.locator("..");
    await expect(reveal).toHaveCSS("opacity", "1");
    // 还要等滑入位移真正落位（transform 归位），否则测量的 rect 含未完成的
    // 位移，相邻间距会被读小（CI 软渲染下尤其明显）。
    await expect(reveal).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  }

  const gaps = await sections.evaluateAll((elements) =>
    elements.slice(0, -1).map((section, index) => {
      const currentBox = section.getBoundingClientRect();
      const nextBox = elements[index + 1].getBoundingClientRect();
      return nextBox.top - currentBox.bottom;
    })
  );

  expect(gaps).toHaveLength(sectionCount - 1);
  for (const gap of gaps) {
    expect(gap).toBeGreaterThanOrEqual(35);
  }
});
