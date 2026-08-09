import { expect, test } from "@playwright/test";

test.describe("普通分子 Viewer 自由探索与按需讲解", () => {
  test("NH3 默认自由探索，选择讲解后显示孤电子对步骤", async ({ page }) => {
    await page.goto("/module/pyramidal-nh3");

    const viewer = page.getByTestId("molecule-viewer");
    await expect(viewer.getByText("NH3｜自由探索", { exact: true })).toBeVisible();
    await expect(page.getByText("先旋转模型，观察原子在空间中的相对位置；需要提示时再打开下方讲解。", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /显示并识别孤电子对/ }).click();
    await expect(viewer.getByText("NH3｜显示并识别孤电子对", { exact: true })).toBeVisible();
    await expect(
      viewer.getByTestId("molecule-viewer-summary").getByText(
        "显示 N 上方的孤电子对：电子对空间排布为四面体形；只按原子核判断时，分子构型仍是三角锥形。",
        { exact: true },
      ),
    ).toBeVisible();
    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("molecule-viewer-nh3-lone-pair.png");
  });

  test("H2O 键角步骤保留角弧但解释不进入 Canvas", async ({ page }) => {
    await page.goto("/module/v-shape-h2o");
    await page.getByRole("button", { name: /观察键角进一步减小/ }).click();
    // 到达 bond-angle 步骤后，goToStep 依据 step.showAngles 自动显示角弧，
    // 因此无需再点“键角”toggle（那会把已显示的角弧关掉，与“保留角弧”的用意相悖）。

    const viewer = page.getByTestId("molecule-viewer");
    const canvasArea = page.getByTestId("molecule-viewer-canvas");
    await expect(viewer.getByText("H2O｜观察键角进一步减小", { exact: true })).toBeVisible();
    await expect(canvasArea.getByText("约 104.5°", { exact: true })).toBeVisible();
    // 两个相同的孤电子对轨道共用一个说明标签，避免投影时文字互相遮挡。
    await expect(canvasArea.getByText("孤电子对", { exact: true })).toHaveCount(1);
    await expect(
      canvasArea.getByText(
        "显示 H-O-H 键角后，可以看到水分子的典型键角约为 104.5°，比 NH3 的键角更小。",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("BF3 平面三角形步骤显示模式摘要", async ({ page }) => {
    await page.goto("/module/planar-bf3");
    await page.getByRole("button", { name: /观察平面三角形/ }).click();

    const viewer = page.getByTestId("molecule-viewer");
    await expect(viewer.getByText("BF3｜观察平面三角形", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "三个 B-F 键位于同一平面内，三个氟原子围绕硼原子均匀展开，形成平面三角形。",
        { exact: true },
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: /观察 120° 键角/ }).click();
    await expect(
      viewer.getByText(/中心 B 周围计入 6 个价层电子，未满足八隅体；它可以接受电子对，因此 BF₃ 表现为路易斯酸/),
    ).toBeVisible();
    await expect(page.getByText("缺电子分子", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/TODO-CHEM-VERIFY/)).toHaveCount(0);
  });
});
