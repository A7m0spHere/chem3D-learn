import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-010 冒烟：4 个核心晶体 viewer 的「原子球对照图例」常驻渲染。
//
// 图例挂在 ThreeViewerFrame 的 footerMeta 槽位（DOM，非 canvas），带
// aria-label="原子对照图例"。这里只断言图例存在且列出正确的离子名称，
// 不含任何 toMatchSnapshot / toHaveScreenshot，故不碰 Darwin 基线，可在
// Windows 系统 Chrome 通道运行。
// ---------------------------------------------------------------------------

const CASES: { route: string; viewer: string; labels: string[] }[] = [
  {
    route: "/module/nacl-crystal",
    viewer: "nacl-viewer",
    labels: ["Cl- 顶点", "Na+ 棱心"],
  },
  {
    route: "/module/cscl-crystal",
    viewer: "cscl-viewer",
    labels: ["Cl- 顶点", "Cs+ 体心"],
  },
  { route: "/module/batio3-perovskite", viewer: "batio3-viewer", labels: ["Ba²⁺", "Ti⁴⁺", "O²⁻"] },
  { route: "/module/caf2-fluorite", viewer: "caf2-viewer", labels: ["Ca²⁺", "F⁻"] },
];

for (const { route, viewer, labels } of CASES) {
  test(`${viewer} 常驻原子对照图例列出全部离子`, async ({ page }) => {
    await page.goto(route);
    const legend = page.getByTestId(viewer).getByRole("list", { name: "原子对照图例" });

    // 图例默认常驻（无需开启标签）。
    await expect(legend).toBeVisible();

    // 每种离子名称都出现在图例里。
    for (const label of labels) {
      await expect(legend.getByText(label, { exact: true })).toBeVisible();
    }
    // 图例项数 = 元素种类数。
    await expect(legend.locator("li")).toHaveCount(labels.length);
  });
}
