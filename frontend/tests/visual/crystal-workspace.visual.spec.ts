import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-028B—T-028D：NaCl 周期探索工作台浏览器交互测试（无截图）。
//
// 只用 DOM / 文本 / aria / testid 断言，不触碰 Darwin 视觉基线，可在 Windows 系统
// Chrome 通道下运行（设置 $env:PLAYWRIGHT_CHANNEL='chrome'）。
//
// 覆盖：
//   1. 默认仍是旧教学模式；2. 旧按钮仍可用；3. 入口进入周期 Viewer；
//   4-6. N=2/1/3 的晶胞数/化学式单位/独立位点/显示实例；
//   7. 边框三态可切换；8. 返回恢复；9. 切模块重置；10. 无 pageerror；
//   11. 边界显示副本可点击且 OrbitControls 拖拽不清选择；12. 四档断点无横向溢出。
// ---------------------------------------------------------------------------

// 等待 3D Canvas 与控制台就绪，避免在 chunk 加载前断言。
async function waitForViewerReady(page: import("@playwright/test").Page, testid: string) {
  const viewer = page.getByTestId(testid);
  await expect(viewer).toBeVisible({ timeout: 30_000 });
  await expect(viewer.locator("canvas")).toBeVisible({ timeout: 30_000 });
}

async function clickBoundaryDisplayCopy(page: import("@playwright/test").Page) {
  const stage = page.getByTestId("nacl-periodic-2-canvas");
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();

  // WebGL 实例没有 DOM locator。按稳定的归一化网格寻找边界副本；相机或响应式尺寸
  // 小幅调整时不依赖单个绝对像素坐标，仍然验证的是浏览器里的真实 pointer click。
  for (let row = 2; row <= 18; row += 1) {
    for (let column = 2; column <= 18; column += 1) {
      const position = {
        x: (box!.width * column) / 20,
        y: (box!.height * row) / 20,
      };
      await stage.click({ force: true, position });
      const identity = page.getByTestId("selection-identity");
      if ((await identity.count()) > 0 && (await identity.textContent())?.includes("边界显示副本")) {
        return position;
      }
    }
  }

  throw new Error("未能在 NaCl 周期 Viewer 中点击到边界显示副本");
}

async function clickAnyDisplayInstance(
  page: import("@playwright/test").Page,
  stageTestId: string,
) {
  const stage = page.getByTestId(stageTestId);
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();

  // 透视投影与离子遮挡会让「世界原点 = 可点击球心」的假设随浏览器 / GPU 变化。
  // 沿用边界副本用例的归一化网格，命中任意真实 WebGL 实例后以面板状态确认选择成功。
  for (let row = 2; row <= 18; row += 1) {
    for (let column = 2; column <= 18; column += 1) {
      await stage.click({
        force: true,
        position: {
          x: (box!.width * column) / 20,
          y: (box!.height * row) / 20,
        },
      });
      if ((await page.getByTestId("periodic-selection").count()) > 0) return;
    }
  }

  throw new Error(`未能在 ${stageTestId} 中点击到可选择的 NaCl 显示实例`);
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
    await expect(page.getByTestId("workspace-size-group")).toContainText("观察范围");
    await expect(page.getByTestId("workspace-frame-group")).toContainText("晶胞边框");
    await expect(
      page.getByTestId("nacl-periodic-2-canvas").getByRole("img"),
    ).toHaveAttribute("aria-label", /NaCl 2×2×2 周期超晶胞三维视图/);

    // 4. 默认 2×2×2：晶胞 8 / 化学式单位 32 / 独立位点 64 / 显示实例 125。
    await expect(page.getByTestId("periodic-fact-cells")).toContainText("8");
    await expect(page.getByTestId("periodic-fact-formula-units")).toContainText("32");
    await expect(page.getByTestId("periodic-fact-independent")).toContainText(
      "周期模型中的独立离子位点",
    );
    await expect(page.getByTestId("periodic-fact-independent")).toContainText("64");
    await expect(page.getByTestId("periodic-fact-display")).toContainText("125");
    await expect(page.getByTestId("nacl-periodic-summary-copy")).toContainText(
      "不重复计入化学组成",
    );
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

  test("T-028D：边界副本可真实点击，隔离配位层后拖拽不误清选择", async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.setViewportSize({ height: 900, width: 1440 });
    await page.goto("/module/nacl-crystal");
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");

    const stage = page.getByTestId("nacl-periodic-2-canvas");
    const boundaryPosition = await clickBoundaryDisplayCopy(page);
    await expect(page.getByTestId("selection-identity")).toContainText("边界显示副本");
    await expect(page.getByTestId("selection-ghosts")).not.toContainText("0 个");
    await expect(page.getByTestId("periodic-selection-announcement")).toContainText(
      /已选择(Na⁺|Cl⁻)，第一配位数 6/,
    );
    await expect(page.getByTestId("workspace-selection-group")).toContainText("当前选择");

    // 清除后回到同一显示副本，验证 hover 命中反馈。
    await page.getByTestId("workspace-clear-selection").click();
    await stage.hover({ force: true, position: boundaryPosition });
    await expect.poll(() => page.evaluate(() => document.body.style.cursor)).toBe("pointer");
    await stage.click({ force: true, position: boundaryPosition });

    const selectedIdentity = await page.getByTestId("selection-identity").textContent();
    await page.getByTestId("workspace-isolate").click();
    await expect(page.getByTestId("workspace-isolate")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("selection-isolate-state")).toContainText("已开启");

    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.42, box!.y + box!.height * 0.42);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.58, box!.y + box!.height * 0.51, {
      steps: 8,
    });
    await page.mouse.up();
    await expect(page.getByTestId("selection-identity")).toHaveText(selectedIdentity ?? "");

    // 显式按钮是可靠的清除主路径。
    await page.getByTestId("workspace-clear-selection").click();
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("T-028D：1440/1280/768/390 四档布局无横向溢出且工具栏可键盘操作", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    for (const viewport of [
      { height: 900, width: 1440 },
      { height: 720, width: 1280 },
      { height: 900, width: 768 },
      { height: 844, width: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/module/nacl-crystal");
      await page.getByTestId("workspace-enter-periodic").click();
      const viewer = page.getByTestId("nacl-periodic-2-viewer");
      await waitForViewerReady(page, "nacl-periodic-2-viewer");

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        ),
      ).toBe(false);
      expect(
        await viewer.evaluate((element) => element.scrollWidth > element.clientWidth + 1),
      ).toBe(false);

      for (const buttonId of [
        "workspace-size-1",
        "workspace-size-2",
        "workspace-size-3",
        "workspace-frame-outer",
        "workspace-frame-all",
        "workspace-frame-hidden",
      ]) {
        const box = await page.getByTestId(buttonId).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }

      if (viewport.width === 390) {
        const summary = await page
          .getByTestId("nacl-periodic-2-viewer-summary")
          .boundingBox();
        const summaryCopy = await page.getByTestId("nacl-periodic-summary-copy").boundingBox();
        expect(summary).not.toBeNull();
        expect(summaryCopy).not.toBeNull();
        expect(summaryCopy!.width).toBeGreaterThan(summary!.width * 0.75);
      }
    }

    // 在最窄断点通过键盘激活切换，确认 focus 与 pressed 状态正常流转。
    const sizeOne = page.getByTestId("workspace-size-1");
    await sizeOne.focus();
    await expect(sizeOne).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(sizeOne).toHaveAttribute("aria-pressed", "true");
    const sizeTwo = page.getByTestId("workspace-size-2");
    await sizeTwo.focus();
    await page.keyboard.press("Enter");
    await expect(sizeTwo).toHaveAttribute("aria-pressed", "true");

    expect(errors).toEqual([]);
  });

  // T-028C：粒子选择与第一配位层隔离。
  // WebGL 实例无法用 DOM locator 定位，因此按 Canvas 归一化网格点击任意真实离子；
  // 不假设世界原点的离子在透视投影与遮挡后仍是最上层命中目标。
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

    // 4. 在 Canvas 的归一化网格中点击任意真实显示实例。
    const stage = page.getByTestId("nacl-periodic-2-canvas");
    await expect(stage).toBeVisible();
    await clickAnyDisplayInstance(page, "nacl-periodic-2-canvas");

    // 出现当前选择区域，配位数 6、最近邻为异号离子。
    await expect(page.getByTestId("periodic-selection")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("selection-coordination")).toContainText("6");
    await expect(page.getByTestId("selection-distance")).toContainText("无量纲显示尺度");
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
    await clickAnyDisplayInstance(page, "nacl-periodic-2-canvas");
    await expect(page.getByTestId("periodic-selection")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("workspace-size-3").click();
    await waitForViewerReady(page, "nacl-periodic-3-viewer");
    await expect(page.getByTestId("periodic-selection")).toHaveCount(0);
    await expect(page.getByTestId("workspace-isolate")).toHaveCount(0);

    // 8. 选择后退出周期模式 → 回到教学模式（选择随之清除）。
    await clickAnyDisplayInstance(page, "nacl-periodic-3-canvas");
    await page.getByRole("button", { exact: true, name: "返回教学" }).click();
    await waitForViewerReady(page, "nacl-viewer");
    await expect(page.getByText("晶胞组成", { exact: true })).toBeVisible();

    // 9. 再进入周期探索并选择，切到其他模块再回 NaCl → 选择与隔离重置为无选择/教学。
    await page.getByTestId("workspace-enter-periodic").click();
    await waitForViewerReady(page, "nacl-periodic-2-viewer");
    await clickAnyDisplayInstance(page, "nacl-periodic-2-canvas");
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
