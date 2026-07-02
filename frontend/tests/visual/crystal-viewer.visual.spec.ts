import { expect, test } from "@playwright/test";

test.describe("晶体与空隙 Viewer 模式摘要", () => {
  test("NaCl 配位与计数结论位于 Viewer 外壳", async ({ page }) => {
    await page.goto("/module/nacl-crystal");
    const viewer = page.getByTestId("nacl-viewer");

    await page.getByRole("button", { exact: true, name: "六配位" }).click();
    await expect(viewer.getByText("NaCl｜最近邻配位关系", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "粒子计数" }).click();
    await expect(viewer.getByText("NaCl｜均摊法计数", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText("突出顶点、面心、棱心、体心位置，配合右侧公式理解 4 : 4。", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("石墨层间作用说明不覆盖 Canvas", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "层间作用力" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜较弱的范德华力", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText(
        "层间虚线只表示较弱的范德华力，不是普通 C-C 共价键。层与层之间容易相对滑动，可解释石墨较软、有润滑性。",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("石墨离域 π 电子云有独立视觉快照", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "离域 π 电子" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜层内离域 π 电子", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "每个 C 原子还有未参与 sp² 杂化的 p 轨道，形成层内离域 π 电子体系。电子可沿碳层移动，因此石墨能导电。",
        { exact: true },
      ),
    ).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("graphite-pi-electron-cloud-viewer.png");
  });

  test("Zn 分层模式和四面体空隙计数使用底部信息区", async ({ page }) => {
    await page.goto("/module/zinc-metal-crystal");
    await page.getByRole("button", { exact: true, name: "分层堆积" }).click();
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("Zn｜A-B-A 层状堆积", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { exact: true, name: "堆积模型" }).click();
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("堆积模型 · 拖拽旋转", { exact: true }),
    ).toBeVisible();

    await page.goto("/module/tetrahedral-voids");
    await page.getByRole("button", { exact: true, name: "计数" }).click();
    const viewer = page.getByTestId("tetrahedral-voids-viewer");
    await expect(viewer.getByText("四面体空隙：2N", { exact: true })).toBeVisible();
    await expect(
      page.getByTestId("tetrahedral-voids-canvas").getByText("四面体空隙：2N", {
        exact: true,
      }),
    ).toHaveCount(0);
  });
});
