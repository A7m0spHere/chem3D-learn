import { expect, test } from "@playwright/test";

type GuidedStepExpectation = {
  id: string;
  title: string;
  goal: string;
  operation: string;
  change: string;
  reason: string;
};

const nh3GuidedSteps: GuidedStepExpectation[] = [
  {
    id: "trigonal-pyramidal",
    title: "旋转确认三角锥",
    goal: "确认三个氢原子与氮原子构成的是三角锥形，而非平面三角形。",
    operation: "拖拽旋转模型，从侧面比较三个 H 原子的前后位置。",
    change: "N—H 骨架被突出；旋转后可看见至少一个 H 不与其余原子落在同一平面。",
    reason: "三个 N—H 键在空间中指向不同方向，因此分子构型是三角锥形。",
  },
  {
    id: "lone-pair",
    title: "显示并识别孤电子对",
    goal: "找到氮原子上方没有原子占据的第四个方向。",
    operation: "点击“孤电子对”，再观察氮原子上方出现的标记。",
    change: "氮原子上方出现一对孤电子对；它不作为一个原子计入分子构型。",
    reason: "三个成键电子对和一对孤电子对共同占据四个空间方向；分子构型只统计原子核位置。",
  },
  {
    id: "bond-angle",
    title: "显示约 107° 键角",
    goal: "读出 H—N—H 键角约为 107°，并判断它比正四面体角小。",
    operation: "点击“键角”，保持孤电子对可见，再查看 H—N—H 的角弧标签。",
    change: "H—N—H 角弧和“约 107°”出现；孤电子对仍在 N 上方可见。",
    reason: "孤电子对占据的空间较大、排斥较强，会把三个 N—H 成键电子对挤近。",
  },
  {
    id: "compare-bond-angles",
    title: "总结键角递变",
    goal: "用 CH4、NH3、H2O 的键角变化总结孤电子对的影响。",
    operation: "阅读轻量对比条；可按需跳转到 CH4 或 H2O 模块复看模型。",
    change: "同一条对比数据列出 CH4 109.5° → NH3 约 107° → H2O 104.5°，无需同时打开三个画布。",
    reason: "中心原子的孤电子对数增加时，对成键电子对的排斥总体增强，键角总体减小。",
  },
];

test.describe("NH₃ 引导观察样板", () => {
  test("四步依次呈现目标、操作、变化、原因与轻量对比，并保持手动显示开关", async ({ page }) => {
    await page.goto("/module/pyramidal-nh3");

    const viewer = page.getByTestId("molecule-viewer");
    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    await expect(viewer.getByText("NH3｜自由探索", { exact: true })).toBeVisible();
    await expect(page.getByTestId("guided-observation-panel")).toHaveCount(0);

    for (const step of nh3GuidedSteps) {
      const stepButton = page.getByTestId(`lesson-step-${step.id}`);
      await stepButton.click();

      const panel = page.getByTestId("guided-observation-panel");
      await expect(stepButton).toHaveAttribute("aria-current", "step");
      await expect(viewer.getByText(`NH3｜${step.title}`, { exact: true })).toBeVisible();
      await expect(panel.getByTestId("guided-observation-goal")).toContainText(step.goal);
      await expect(panel.getByTestId("guided-observation-operation")).toContainText(step.operation);
      await expect(panel.getByTestId("guided-observation-change")).toContainText(step.change);
      await expect(panel.getByTestId("guided-observation-reason")).toContainText(step.reason);
    }

    await expect(canvasArea.getByText("约 107°", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toBeVisible();

    const comparison = page.getByTestId("guided-observation-comparison");
    const comparisonRows = comparison.locator("tbody tr");
    await expect(comparison).toContainText("孤电子对与键角");
    await expect(comparisonRows).toHaveCount(3);
    await expect(comparisonRows.nth(0)).toContainText("CH₄");
    await expect(comparisonRows.nth(0)).toContainText("0 对");
    await expect(comparisonRows.nth(0)).toContainText("109.5°");
    await expect(comparisonRows.nth(1)).toContainText("NH₃");
    await expect(comparisonRows.nth(1)).toContainText("1 对");
    await expect(comparisonRows.nth(1)).toContainText("107°");
    await expect(comparisonRows.nth(2)).toContainText("H₂O");
    await expect(comparisonRows.nth(2)).toContainText("2 对");
    await expect(comparisonRows.nth(2)).toContainText("104.5°");

    const angleToggle = page.getByTestId("molecule-toggle-angles");
    const lonePairToggle = page.getByTestId("molecule-toggle-lone-pairs");
    await expect(angleToggle).toHaveAttribute("aria-pressed", "true");
    await expect(lonePairToggle).toHaveAttribute("aria-pressed", "true");

    await angleToggle.click();
    await expect(angleToggle).toHaveAttribute("aria-pressed", "false");
    await expect(canvasArea.getByText("约 107°", { exact: true })).toHaveCount(0);
    await angleToggle.click();
    await expect(angleToggle).toHaveAttribute("aria-pressed", "true");

    await lonePairToggle.click();
    await expect(lonePairToggle).toHaveAttribute("aria-pressed", "false");
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toHaveCount(0);
    await lonePairToggle.click();
    await expect(lonePairToggle).toHaveAttribute("aria-pressed", "true");
  });

  test("键盘可进入、前后切换，并可退出后再次进入自由探索", async ({ page }) => {
    await page.goto("/module/pyramidal-nh3");

    const viewer = page.getByTestId("molecule-viewer");
    const firstStep = page.getByTestId("lesson-step-trigonal-pyramidal");
    await firstStep.focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜旋转确认三角锥", { exact: true })).toBeVisible();

    const nextButton = page.getByRole("button", { name: "下一步" });
    await nextButton.focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜显示并识别孤电子对", { exact: true })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜显示约 107° 键角", { exact: true })).toBeVisible();

    const previousButton = page.getByRole("button", { name: "上一步" });
    await previousButton.focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜显示并识别孤电子对", { exact: true })).toBeVisible();

    const exitButton = page.getByTestId("guided-exit");
    await exitButton.focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜自由探索", { exact: true })).toBeVisible();
    await expect(page.getByTestId("guided-observation-panel")).toHaveCount(0);
    await expect(firstStep).not.toHaveAttribute("aria-current");

    const comparisonStep = page.getByTestId("lesson-step-compare-bond-angles");
    await comparisonStep.focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("NH3｜总结键角递变", { exact: true })).toBeVisible();
    await expect(page.getByTestId("guided-observation-comparison")).toBeVisible();
  });

  test("未迁移的普通分子保持正文回退，窄屏步骤与导航按钮维持 44px 触控高度", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/v-shape-h2o");

    const h2oAngleStep = page.getByRole("button", { name: /观察键角进一步减小/ });
    await h2oAngleStep.click();
    await expect(page.getByTestId("guided-observation-panel")).toHaveCount(0);
    await expect(
      page.getByRole("complementary").getByText(
        "显示 H-O-H 键角后，可以看到水分子的典型键角约为 104.5°，比 NH3 的键角更小。",
        { exact: true },
      ),
    ).toBeVisible();

    const h2oStepBox = await h2oAngleStep.boundingBox();
    const nextButtonBox = await page.getByRole("button", { name: "下一步" }).boundingBox();
    const exitButtonBox = await page.getByTestId("guided-exit").boundingBox();
    if (!h2oStepBox || !nextButtonBox || !exitButtonBox) {
      throw new Error("窄屏引导观察控件未获得可测量布局");
    }

    expect(h2oStepBox.height).toBeGreaterThanOrEqual(44);
    expect(nextButtonBox.height).toBeGreaterThanOrEqual(44);
    expect(exitButtonBox.height).toBeGreaterThanOrEqual(44);
    const hasNoHorizontalOverflow = await page.locator("html").evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    );
    expect(hasNoHorizontalOverflow).toBe(true);

    await page.goto("/module/planar-bf3");
    await page.getByRole("button", { name: /观察平面三角形/ }).click();
    await expect(page.getByTestId("guided-observation-panel")).toHaveCount(0);
    await expect(
      page.getByRole("complementary").getByText(
        "三个 B-F 键位于同一平面内，三个氟原子围绕硼原子均匀展开，形成平面三角形。",
        { exact: true },
      ),
    ).toBeVisible();
  });

  test("1280×720 与 390×844 均无横向溢出且关键控件至少 44×44", async ({ page }) => {
    const viewports = [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ];
    const stepIds = [
      "trigonal-pyramidal",
      "lone-pair",
      "bond-angle",
      "compare-bond-angles",
    ];
    const toolbarIds = [
      "auto-rotate",
      "angles",
      "lone-pairs",
      "atom-labels",
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/module/pyramidal-nh3", { waitUntil: "networkidle" });
      await expect(page.getByTestId("molecule-viewer")).toBeVisible();

      const overflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      await page.getByTestId("lesson-step-trigonal-pyramidal").click();
      const targetIds = [
        ...stepIds.map((id) => `lesson-step-${id}`),
        "guided-exit",
        ...toolbarIds.map((id) => `molecule-toggle-${id}`),
      ];

      for (const testId of targetIds) {
        const box = await page.getByTestId(testId).boundingBox();
        if (!box) throw new Error(`${testId} 未获得可测量布局`);
        expect(box.width, `${testId} 宽度`).toBeGreaterThanOrEqual(44);
        expect(box.height, `${testId} 高度`).toBeGreaterThanOrEqual(44);
      }

      for (const label of ["上一步", "下一步"]) {
        const box = await page.getByRole("button", { name: label }).boundingBox();
        if (!box) throw new Error(`${label} 未获得可测量布局`);
        expect(box.width, `${label} 宽度`).toBeGreaterThanOrEqual(44);
        expect(box.height, `${label} 高度`).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("prefers-reduced-motion 下四步引导与比较结论无需等待动画即可理解", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/module/pyramidal-nh3", { waitUntil: "networkidle" });

    await expect.poll(() => page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    )).toBe(true);

    await page.getByTestId("lesson-step-compare-bond-angles").click();
    const panel = page.getByTestId("guided-observation-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId("guided-observation-goal")).toContainText("CH4、NH3、H2O");
    await expect(panel.getByTestId("guided-observation-operation")).toContainText("轻量对比条");
    await expect(panel.getByTestId("guided-observation-change")).toContainText("109.5° → NH3 约 107° → H2O 104.5°");
    await expect(panel.getByTestId("guided-observation-reason")).toContainText("孤电子对数增加");
    await expect(panel.getByTestId("guided-observation-comparison")).toContainText("孤电子对与键角");
    await expect(panel.getByTestId("guided-observation-comparison")).toContainText("NH₃");

    const panelState = await panel.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return { opacity: style.opacity, visibility: style.visibility };
    });
    expect(panelState).toEqual({ opacity: "1", visibility: "visible" });
  });
});
