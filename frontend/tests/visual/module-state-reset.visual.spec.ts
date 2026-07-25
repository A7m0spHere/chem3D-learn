import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-002 回归：SPA 跨模块切换后专题控制状态复位。
//
// 关键点：只有页面底部「相关模块推荐」里的 <Link to="/module/:id"> 才是
// /module/:id → /module/:id 的客户端跳转，ModuleDetailPage 保持挂载、仅路由
// 参数变化——这正是各 use*Controls 的 useEffect([moduleId]) 复位逻辑生效的路径。
// 若改用 page.goto()，页面会整棵卸载重挂，走的是 useState 初始化器而非复位 effect，
// 反而测不到本次重构关心的「切模块漏重置」缺陷。因此下面一律用相关卡片的
// `a[href="/module/..."]` 做 SPA 跳转。
//
// 本文件不含任何 toMatchSnapshot / toHaveScreenshot，只用 DOM / 文本 / aria 断言，
// 因此不触碰 Darwin 视觉基线，可在 Windows 的系统 Chrome 通道下运行。
// ---------------------------------------------------------------------------

// 通过相关卡片的唯一 href 做客户端跳转，并等待 URL 落到目标模块。
async function navigateViaRelatedCard(
  page: import("@playwright/test").Page,
  targetModuleId: string,
) {
  const link = page.locator(`a[href="/module/${targetModuleId}"]`).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`/module/${targetModuleId}$`));
}

test.describe("跨模块 SPA 切换后专题状态复位", () => {
  test("晶体：切到同类晶体后标签开关与视图模式回默认（共享状态直接可观测）", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/module/nacl-crystal");

    // 在 NaCl 上把「标签」打开（showCrystalLabels）并切到「粒子计数」（crystalViewMode）。
    const labelToggle = page.getByRole("button", { exact: true, name: "标签" });
    await expect(labelToggle).toHaveAttribute("aria-pressed", "false");
    await labelToggle.click();
    await expect(labelToggle).toHaveAttribute("aria-pressed", "true");

    const countingMode = page.getByRole("button", { exact: true, name: "粒子计数" });
    await countingMode.click();
    await expect(countingMode).toHaveAttribute("aria-pressed", "true");

    // SPA 切到金属钠晶体（同为晶体，共用 useCrystalControls 的状态）。
    await navigateViaRelatedCard(page, "sodium-metal-crystal");

    // 标签开关必须回到关闭：证明 useCrystalControls 的 [moduleId] 复位 effect 生效。
    await expect(page.getByRole("button", { exact: true, name: "标签" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    // 且不应把 NaCl 的「粒子计数」选中态带过来（金属钠默认进入晶胞视图）。
    await expect(
      page.getByRole("button", { exact: true, name: "晶胞结构" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("普通分子（VSEPR）：切到另一分子后退出引导讲解态（页面自留状态复位）", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/module/tetrahedral-ch4");

    // 点一个讲解步骤进入引导模式（isGuidedMode / activeStepIndex，属页面自留状态）。
    // 步骤文案来自合并后的真实 JSON（ch4.json 首步为「识别中心原子」，覆盖 mock 文案），
    // 且按钮可及名含序号前缀，故用子串匹配而非 exact。
    await page.getByRole("button", { name: "识别中心原子" }).click();
    await expect(page.getByText("当前观察", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "下一步" })).toBeVisible();

    // SPA 切到 NH₃（同为 molecular-geometry 分子）。
    await navigateViaRelatedCard(page, "pyramidal-nh3");

    // 引导态必须清空：页面 [id] 复位 effect 仍要把 isGuidedMode 归位。
    await expect(page.getByText("当前观察", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "下一步" })).toHaveCount(0);
  });

  test("杂化轨道：改成 sp³ 后往返，默认模式按模块特判恢复为 sp", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/module/hybrid-orbitals-sp");

    // 默认应为该模块首个模式 sp（getDefaultBondingBasicsMode）。
    await expect(
      page.getByText("sp 杂化｜两个杂化轨道沿 X 轴反向排布", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "sp³" }).click();
    await expect(
      page.getByText("sp³ 杂化｜四个轨道指向四面体", { exact: true }),
    ).toBeVisible();

    // bondingBasicsMode 是各模块独立状态，需往返才能观测复位是否发生：
    // 若切模块不复位，返回后仍会停留在 sp³。
    await navigateViaRelatedCard(page, "ionic-bond-formation");
    await navigateViaRelatedCard(page, "hybrid-orbitals-sp");

    await expect(
      page.getByText("sp 杂化｜两个杂化轨道沿 X 轴反向排布", { exact: true }),
    ).toBeVisible();
  });

  test("有机平面：改成 π 键后往返，乙烯模式恢复为整体结构", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/module/ethylene-planar");

    await expect(
      page.getByText("乙烯 C₂H₄｜所有原子近似共面", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "π 键" }).click();
    await expect(
      page.getByText("C=C 双键｜1 个 σ 键 + 1 个 π 键", { exact: true }),
    ).toBeVisible();

    await navigateViaRelatedCard(page, "benzene-planar");
    await navigateViaRelatedCard(page, "ethylene-planar");

    await expect(
      page.getByText("乙烯 C₂H₄｜所有原子近似共面", { exact: true }),
    ).toBeVisible();
  });

  test("σ 键：改成 s-p 后往返，模式恢复为 s-s", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/module/sigma-bond-orbitals");

    await expect(
      page.getByText("s-s σ 键｜球形轨道沿 X 轴正面重叠", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "s-p σ 键" }).click();
    await expect(
      page.getByText("s-p σ 键｜s 轨道与 p 轨道头碰头重叠", { exact: true }),
    ).toBeVisible();

    await navigateViaRelatedCard(page, "pi-bond-orbitals");
    await navigateViaRelatedCard(page, "sigma-bond-orbitals");

    await expect(
      page.getByText("s-s σ 键｜球形轨道沿 X 轴正面重叠", { exact: true }),
    ).toBeVisible();
  });
});
