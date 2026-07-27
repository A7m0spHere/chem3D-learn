import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-009 浏览器冒烟：拼装实验室新增的「常用片段」按钮在真实 UI 可用。
//
// 只验证「按钮存在 + 点击后能接上并影响分子式」这条端到端路径，不含任何
// toMatchSnapshot / toHaveScreenshot，因此不触碰 Darwin 视觉基线，可在 Windows
// 系统 Chrome 通道运行。片段按钮以 template.label 作为可见文本渲染
//（OrganicBuilderToolbox 遍历 builderFragmentTemplates）。
// ---------------------------------------------------------------------------

test("新增片段按钮出现在工具箱且可拼接（乙烯基 → 丙-1-烯）", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/lab/organic-builder/ethylene-planar");
  await expect(page.getByTestId("organic-builder-page")).toBeVisible();

  // 新建空白，从单个碳开始（自定义确认弹窗替代了原生 confirm）。
  await page.getByRole("button", { name: "新建空白模型" }).click();
  await page.getByRole("button", { name: "清空并新建" }).click();
  await page.getByTestId("builder-add-c").click();

  // 四个新片段按钮都应出现在工具箱。
  const toolbox = page.getByTestId("organic-builder-toolbox");
  for (const label of ["–CH=CH₂", "–C≡CH", "–OCH₃", "–C≡N"]) {
    await expect(toolbox.getByRole("button", { name: label })).toBeVisible();
  }

  // 选中起始碳，接乙烯基，再补氢 → 丙-1-烯（C3H6）。
  await page.getByTestId("builder-atom-handle-c-1").click({ force: true });
  await expect(toolbox).toContainText("已选原子：C");
  await toolbox.getByRole("button", { name: "–CH=CH₂" }).click();
  await page.getByRole("button", { name: "一键补氢" }).click();

  await expect(page.getByTestId("builder-formula")).toHaveText("C3H6");
  // 丙烯在 knownOrganicMolecules 词典中，命中精确识别走 builder-known-name 分支
  //（而非本地系统命名 builder-systematic-name）。
  await expect(page.getByTestId("builder-known-name")).toHaveText("丙烯");
});
