import { expect, test } from "@playwright/test";

// Claude Code 的全站滑入改动给结构分类 section 增加了一层 ScrollReveal。
// 区块间距必须放在这个新外层上：若仍留在 section 的 `last:` 选择器里，
// 每个 section 都会因为是各自 wrapper 的唯一子元素而被当成 last child，
// 最终把原有 56px 分类间距全部清零。
//
// 本文件只检查 DOM / 计算布局，不含截图断言，可在 Windows 系统 Chrome 通道运行。
test("结构分类滑入完成后仍保留区块间距", async ({ page }) => {
  await page.goto("/modules", { waitUntil: "networkidle" });

  const sections = page.locator("section[aria-labelledby]");
  const sectionCount = await sections.count();
  expect(sectionCount).toBeGreaterThan(1);

  for (const section of await sections.all()) {
    await section.scrollIntoViewIfNeeded();
    const reveal = section.locator("..");
    await expect(reveal).toHaveCSS("opacity", "1");
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
    expect(gap).toBeGreaterThanOrEqual(55);
  }
});
