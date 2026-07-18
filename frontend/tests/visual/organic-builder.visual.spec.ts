import { expect, test } from "@playwright/test";

test("拼装实验室识别乙烯并支持从空白补成甲烷", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();
  await expect(page.getByTestId("builder-formula")).toHaveText("C2H4");
  await expect(page.getByTestId("builder-known-name")).toHaveText("乙烯");
  await expect(page.getByTestId("organic-builder-viewer")).toHaveScreenshot("organic-builder-ethylene.png");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "新建空白模型" }).click();
  await page.getByTestId("builder-add-c").click();
  await page.getByRole("button", { name: "一键补氢" }).click();
  await expect(page.getByTestId("builder-formula")).toHaveText("CH4");
  await expect(page.getByTestId("builder-known-name")).toHaveText("甲烷");
});

test("未保存草稿离开时显示确认层", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  await page.getByTestId("builder-add-o").click();
  await page.getByRole("link", { name: "探索全部" }).click();
  await expect(page.getByRole("heading", { name: "要离开当前拼装吗？" })).toBeVisible();
  await page.getByRole("button", { name: "继续拼装" }).click();
  await expect(page).toHaveURL(/organic-builder/);
});

test("实验室内可把已连接原子整体拔下并撤销", async ({ page }) => {
  await page.goto("/lab/organic-builder/ethylene-planar");
  const marker = page.getByTestId("builder-atom-handle-h1");
  await expect(marker).toBeAttached();
  await page.waitForTimeout(500);
  const box = await marker.boundingBox();
  if (!box) throw new Error("拼装区原子投影标记不可见");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 110, startY - 40, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByTestId("builder-feedback")).toContainText("整体拔下");
  await expect(page.getByTestId("organic-builder-info")).toContainText("独立片段2");
  await page.getByRole("button", { name: "撤销" }).click();
  await expect(page.getByTestId("builder-known-name")).toHaveText("乙烯");
});

test("所有现有有机模块都公开抓取入口", async ({ page }) => {
  const cases = [
    ["/module/ethylene-planar", "ethylene-planar-viewer"],
    ["/module/acetylene-linear", "acetylene-linear-viewer"],
    ["/module/benzene-planar", "benzene-planar-viewer"],
    ["/module/organic-coplanar", "organic-coplanar-viewer"],
  ] as const;
  for (const [route, testId] of cases) {
    await page.goto(route);
    await expect(page.getByTestId(testId)).toContainText("抓住原子进入拼装");
  }
});

test("乙烯原子拖动进入拼装实验室并保持拔下状态", async ({ page }) => {
  await page.goto("/module/ethylene-planar");
  const marker = page.getByTestId("atom-pull-handle-c1");
  await expect(marker).toBeAttached();
  await page.waitForTimeout(500);
  const box = await marker.boundingBox();
  if (!box) throw new Error("乙烯原子投影标记不可见");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 54, startY - 18, { steps: 8 });
  await page.mouse.up();
  await expect(page).toHaveURL(/\/lab\/organic-builder\/ethylene-planar/, { timeout: 5_000 });
  await expect(page.getByTestId("builder-feedback")).toContainText("整体拔下");
  await expect(page.getByTestId("organic-builder-info")).toContainText("独立片段4");
});

test("移动端保持画布优先且无水平溢出", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab/organic-builder/benzene-planar");
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByTestId("organic-builder-page")).toHaveScreenshot("organic-builder-mobile.png", { fullPage: true });
});
