import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-028B：NaCl 周期探索工作台浏览器交互测试（无截图）。
//
// 只用 DOM / 文本 / aria / testid 断言，不触碰 Darwin 视觉基线，可在 Windows 系统
// Chrome 通道下运行（设置 $env:PLAYWRIGHT_CHANNEL='chrome'）。
//
// 覆盖：
//   1. 默认仍是旧教学模式；2. 旧按钮仍可用；3. 入口进入周期 Viewer；
//   4-6. N=2/1/3 的晶胞数/化学式单位/独立位点/显示实例；
//   7. 边框三态可切换；8. 返回恢复；9. 切模块重置；10. 无 pageerror。
// ---------------------------------------------------------------------------

// 等待 3D Canvas 与控制台就绪，避免在 chunk 加载前断言。
async function waitForViewerReady(page: import("@playwright/test").Page, testid: string) {
  await expect(page.getByTestId(testid)).toBeVisible({ timeout: 30_000 });
}

test.describe("NaCl 周期探索工作台", () => {
  test("默认教学模式、入口与周期数量、边框三态、返回恢复、切模块重置", async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/module/nacl-crystal");

    // 1. 默认仍是旧教学模式：教学 Viewer testid 为 nacl-viewer。
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByTestId("nacl-viewer")).toBeVisible();

    // 2. 现有「六配位」「粒子计数」按钮仍可用。
    await page.getByRole("button", { exact: true, name: "六配位" }).click();
    await expect(page.getByText("NaCl｜最近邻配位关系", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "粒子计数" }).click();
    await expect(page.getByText("NaCl｜均摊法计数", { exact: true })).toBeVisible();

    // 教学模式下右侧是 CrystalKnowledgePanel（含「晶胞组成」）。
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();

    // 3. 点击「周期探索」进入新 Viewer（默认 2×2×2）。
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");
    await expect(page.getByTestId("nacl-periodic-2-viewer")).toBeVisible();

    // 周期模式下右侧是 NaClPeriodicPanel（含「当前模型状态」）。
    await expect(page.getByText("当前模型状态", { exact: true })).toBeVisible();

    // 4. 默认 2×2×2：晶胞 8 / 化学式单位 32 / 独立位点 64 / 显示实例 125。
    await expect(page.getByTestId("periodic-fact-cells")).toContainText("8");
    await expect(page.getByTestId("periodic-fact-formula-units")).toContainText("32");
    await expect(page.getByTestId("periodic-fact-independent")).toContainText("64");
    await expect(page.getByTestId("periodic-fact-display")).toContainText("125");
    // 2×2×2 按钮选中。
    await expect(page.getByTestId("workspace-size-2")).toHaveAttribute("aria-pressed", "true");

    // 5. 切换 1×1×1：晶胞 1 / 化学式单位 4 / 独立位点 8 / 显示实例 27。
    await page.getByTestId("workspace-size-1").click();
    await waitForViewerReady(page, "nacl-periodic-1-viewer");
    await expect(page.getByTestId("periodic-fact-cells")).toContainText("1");
    await expect(page.getByTestId("periodic-fact-formula-units")).toContainText("4");
    await expect(page.getByTestId("periodic-fact-independent")).toContainText("8");
    await expect(page.getByTestId("periodic-fact-display")).toContainText("27");
    await expect(page.getByTestId("workspace-size-1")).toHaveAttribute("aria-pressed", "true");

    // 6. 切换 3×3×3：晶胞 27 / 化学式单位 108 / 独立位点 216 / 显示实例 343。
    await page.getByTestId("workspace-size-3").click();
    await waitForViewerReady(page, "nacl-periodic-3-viewer");
    await expect(page.getByTestId("periodic-fact-cells")).toContainText("27");
    await expect(page.getByTestId("periodic-fact-formula-units")).toContainText("108");
    await expect(page.getByTestId("periodic-fact-independent")).toContainText("216");
    await expect(page.getByTestId("periodic-fact-display")).toContainText("343");
    await expect(page.getByTestId("workspace-size-3")).toHaveAttribute("aria-pressed", "true");

    // 7. 边框三态可切换，且有稳定 testid 与 aria-pressed。
    await expect(page.getByTestId("workspace-frame-outer")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("workspace-frame-all").click();
    await expect(page.getByTestId("workspace-frame-all")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("workspace-frame-outer")).toHaveAttribute("aria-pressed", "false");
    await page.getByTestId("workspace-frame-hidden").click();
    await expect(page.getByTestId("workspace-frame-hidden")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("workspace-frame-all")).toHaveAttribute("aria-pressed", "false");
    // 切回 outer，确认可循环切换。
    await page.getByTestId("workspace-frame-outer").click();
    await expect(page.getByTestId("workspace-frame-outer")).toHaveAttribute("aria-pressed", "true");

    // 8. 返回教学视图后，原 NaClCell 与原知识面板恢复。
    await page.getByRole("button", { exact: true, name: "返回教学" }).click();
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByTestId("nacl-viewer")).toBeVisible();
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();
    // 返回后不应再有周期面板。
    await expect(page.getByText("当前模型状态", { exact: true })).toHaveCount(0);

    // 9. 从 NaCl 进入周期探索，再切到其他晶体再返回，工作台状态重置到教学。
    //    用 page.goto 切到金属钠晶体（同晶体类、不同模块），验证不会出现周期面板；
    //    再切回 NaCl，验证恢复默认教学模式（useCrystalWorkspaceControls 的重置）。
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");
    // 切到金属钠晶体：该模块不应出现周期探索入口或周期面板。
    await page.goto("/module/sodium-metal-crystal");
    await expect(page.getByTestId("sodium-metal-viewer")).toBeVisible();
    await expect(page.getByText("当前模型状态", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("workspace-enter-periodic")).toHaveCount(0);

    // 切回 NaCl：应恢复默认教学模式（教学 Viewer + 知识面板）。
    await page.goto("/module/nacl-crystal");
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByTestId("nacl-viewer")).toBeVisible();
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();
    await expect(page.getByText("当前模型状态", { exact: true })).toHaveCount(0);

    // 10. 无 pageerror 与非预期 console error。
    expect(errors).toEqual([]);
  });

  // T-028C：粒子选择与第一配位层隔离。
  // WebGL 实例无法用 DOM locator 定位，故读取 Canvas boundingBox 后点击其中心比例点；
  // N=2 模型中心恰有一个可见离子（Cl⁻ 位于 [0,0,0]），是稳定的交互目标。
  // 配位几何正确性由 logic tests 保证，这里只验证 UI 状态流转。
  test("周期模式粒子选择、仅看配位层、退出选择与切尺寸/切模块自动清除", async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/module/nacl-crystal");
    await waitForViewerReady(page, "nacl-viewer");

    // 进入周期探索（默认 2×2×2）。
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");

    // 3. 未选择时面板显示提示区（periodic-selection-hint），且无选择区域。
    await expect(page.getByTestId("periodic-selection-hint")).toBeVisible();
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);
    // 未选择时不显示配位层控件。
    await expect(page.getByTestId("workspace-isolate")).toHaveCount(0);
    await expect(page.getByTestId("workspace-clear-selection")).toHaveCount(0);

    // 4. 点击 Canvas 中心的可见离子。相机 target=[0,0,0]，世界原点恒投影到 Canvas 中心；
    //    N=2 时 nacl-1-1-1-0（Cl⁻）恰在原点，是稳定的交互目标。用 locator.click() 让
    //    Playwright 自动滚动入视口并点击元素真实中心，避免手算 boundingBox 忽略页面滚动。
    const stage = page.getByTestId("nacl-periodic-2-canvas");
    await expect(stage).toBeVisible();
    await stage.click();

    // 出现当前选择区域，配位数 6、最近邻为异号离子。
    await expect(page.getByTestId("periodic-selection")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("selection-coordination")).toContainText("6");
    // 最近邻为异号离子：中心是 Cl⁻（原点）时最近邻显示「6 个 Na⁺」，反之「6 个 Cl⁻」。
    await expect(page.getByTestId("selection-neighbors")).toContainText("6 个");
    // 出现「仅看配位层」与「退出选择」。
    await expect(page.getByTestId("workspace-isolate")).toBeVisible();
    await expect(page.getByTestId("workspace-clear-selection")).toBeVisible();

    // 5. 打开「仅看配位层」→ aria-pressed=true，面板隔离状态显示「已开启」。
    await page.getByTestId("workspace-isolate").click();
    await expect(page.getByTestId("workspace-isolate")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("selection-isolate-state")).toContainText("已开启");

    // 6. 退出选择 → 恢复无选择状态。
    await page.getByTestId("workspace-clear-selection").click();
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);
    await expect(page.getByTestId("workspace-isolate")).toHaveCount(0);
    await expect(page.getByTestId("periodic-selection-hint")).toBeVisible();

    // 7. 再次选择后切换超晶胞尺寸 → 选择自动清除。
    await stage.click();
    await expect(page.getByTestId("periodic-selection")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("workspace-size-3").click();
    await waitForViewerReady(page, "nacl-periodic-3-viewer");
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);
    await expect(page.getByTestId("workspace-isolate")).toHaveCount(0);

    // 8. 选择后退出周期模式 → 回到教学模式（选择随之清除）。
    //    N=3 时 nacl-1-1-1-5（Na⁺）在原点，同样投影到 Canvas 中心。
    await page.getByTestId("nacl-periodic-3-canvas").click();
    await page.getByRole("button", { exact: true, name: "返回教学" }).click();
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();

    // 9. 再进入周期探索并选择，切到其他模块再回 NaCl → 选择与隔离重置为无选择/教学。
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");
    await page.getByTestId("nacl-periodic-2-canvas").click();
    await expect(page.getByTestId("periodic-selection")).toBeVisible({ timeout: 15_000 });
    await page.goto("/module/sodium-metal-crystal");
    await expect(page.getByTestId("sodium-metal-viewer")).toBeVisible();
    await page.goto("/module/nacl-crystal");
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);

    // 10. 无 pageerror 与非预期 console error。
    expect(errors).toEqual([]);
  });
});
