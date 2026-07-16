import { expect, test } from "@playwright/test";

test.describe("能力扩展专题接线", () => {
  test("金属晶体密堆积卡片已开放并直达 FCC/HCP 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const packingCard = page.locator("article").filter({ hasText: "金属晶体密堆积" });
    const moduleLink = packingCard.getByRole("link", { name: /进入专题/ });

    await expect(packingCard).toBeVisible();
    await expect(packingCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/metal-close-packing");

    await moduleLink.click();

    await expect(page).toHaveURL(/\/module\/metal-close-packing$/);
    await expect(page.getByTestId("metal-close-packing-viewer")).toBeVisible();
    await expect(
      page.getByText("FCC 与 HCP 的层序、配位和晶胞计数", { exact: true }),
    ).toBeVisible();
  });

  test("BaTiO₃ 卡片已开放并直达完整 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const perovskiteCard = page.locator("article").filter({ hasText: "BaTiO₃ 钙钛矿结构" });
    const moduleLink = perovskiteCard.getByRole("link", { name: /进入专题/ });

    await expect(perovskiteCard).toBeVisible();
    await expect(perovskiteCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/batio3-perovskite");

    await moduleLink.click();

    await expect(page).toHaveURL(/\/module\/batio3-perovskite$/);
    await expect(page.getByTestId("batio3-viewer")).toBeVisible();
    await expect(page.getByText("理想立方晶胞、双配位与等价原点", { exact: true })).toBeVisible();
  });

  test("ZnS 卡片已开放并直达闪锌矿 / 纤锌矿 3D 对比模块", async ({ page }) => {
    await page.goto("/exam");

    const znsCard = page.locator("article").filter({ hasText: "ZnS 闪锌矿 / 纤锌矿" });
    const moduleLink = znsCard.getByRole("link", { name: /进入专题/ });

    await expect(znsCard).toBeVisible();
    await expect(znsCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/zns-polytypes");

    await moduleLink.click();

    await expect(page).toHaveURL(/\/module\/zns-polytypes$/);
    await expect(page.getByTestId("zns-viewer")).toBeVisible();
    await expect(
      page.getByText("ABC / AB 层序、半填四面体空隙与 4:4 配位", { exact: true }),
    ).toBeVisible();
  });

  test("MOF 卡片已开放并直达 MOF-5 完整 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const mofCard = page.locator("article").filter({ hasText: "MOF 多孔晶体" });
    const moduleLink = mofCard.getByRole("link", { name: /进入专题/ });
    await expect(mofCard).toBeVisible();
    await expect(mofCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/mof-metal-organic-framework");

    await moduleLink.click();
    await expect(page).toHaveURL(/\/module\/mof-metal-organic-framework$/);
    await expect(page.getByTestId("mof5-viewer")).toBeVisible();
    await expect(
      page.getByText("以 MOF-5 理解节点、连接体、pcu 拓扑与孔隙", { exact: true }),
    ).toBeVisible();
  });

  test("MXene 卡片已开放并直达 Ti₃C₂Tₓ 完整 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const mxeneCard = page.locator("article").filter({ hasText: "MXene 二维层状材料" });
    const moduleLink = mxeneCard.getByRole("link", { name: /进入专题/ });
    await expect(mxeneCard).toBeVisible();
    await expect(mxeneCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(moduleLink).toHaveAttribute("href", "/module/mxene-2d-material");

    await moduleLink.click();
    await expect(page).toHaveURL(/\/module\/mxene-2d-material$/);
    await expect(page.getByTestId("mxene-viewer")).toBeVisible();
    await expect(
      page.getByText("以 Ti₃C₂Tₓ 理解 MAX 来源、五层骨架与表面端基", { exact: true }),
    ).toBeVisible();
  });

  test("exam-diamond-si 从考试卡片进入详情页并连到金刚石 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const diamondCard = page.locator("article").filter({ hasText: "金刚石与单晶硅" });
    const detailLink = diamondCard.getByRole("link", { name: /进入专题/ });

    await expect(diamondCard).toBeVisible();
    await expect(diamondCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(detailLink).toHaveAttribute("href", "/exam/exam-diamond-si");

    await detailLink.click();

    await expect(page).toHaveURL(/\/exam\/exam-diamond-si$/);
    await expect(page.getByRole("heading", { level: 1, name: "金刚石与单晶硅" })).toBeVisible();
    await expect(page.getByText("配位数 = 4 · 键角约 109.5°", { exact: true })).toBeVisible();
    await expect(page.getByText("N 个原子 → 4N / 2 = 2N 条共价键", { exact: true })).toBeVisible();

    const relatedModuleLink = page.getByRole("link", { name: /金刚石晶体结构/ });
    await expect(relatedModuleLink).toBeVisible();
    await expect(relatedModuleLink).toHaveAttribute("href", "/module/diamond-crystal");

    await relatedModuleLink.click();

    await expect(page).toHaveURL(/\/module\/diamond-crystal$/);
    await expect(page.getByText("正四面体配位的共价晶体", { exact: true })).toBeVisible();
  });
});
