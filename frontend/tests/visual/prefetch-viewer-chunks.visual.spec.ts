import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// T-006 回归：模块卡片按意图预取 3D 资源。
//
// 现状（T-024 之后）：Rollup 自动分包把 three/r3f 依赖图放入
// ThreeViewerFrame chunk，ModuleDetailPage 是独立页面 chunk（含 23 个分子
// JSON）。两者都只应在用户"表现出进入 3D 模块的意图"时预取——hover/focus
// 模块卡，或在模块列表页空闲时——而不是在首页或列表页的初始渲染里下载。
// lib/prefetch.ts 的 `warmed` 单次守卫负责这一点。
//
// 本文件用网络请求监听断言"何时下载了哪些 chunk"，只用 URL 断言，不含任何
// toMatchSnapshot / toHaveScreenshot，因此不触碰 Darwin 视觉基线，可在 Windows
// 系统 Chrome 通道运行。
//
// chunk 命名（vite 产物，带 hash）：
//   - ThreeViewerFrame-*.js       —— 当前自动分包的重型 3D 依赖图
//   - three-*.js / r3f-*.js       —— T-024 前对象式 manualChunks 的历史产物
//   - ModuleDetailPage-*.js       —— lazy 页面 chunk
//   - MoleculeViewer-*.js         —— 预取入口组件（拉起 three/r3f）
// ---------------------------------------------------------------------------

/** 收集页面发起的所有脚本请求 URL。 */
function trackScriptRequests(page: import("@playwright/test").Page): string[] {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") {
      urls.push(request.url());
    }
  });
  return urls;
}

// dev（Vite）与 production 的 chunk URL 形态不同，两者都要能匹配：
//   - 重型 3D 依赖：dev 是 /node_modules/.vite/deps/@react-three_fiber|drei.js
//     （依赖预构建；three 本身作为传递依赖被打进这两个包），production 当前是
//     /ThreeViewerFrame-[hash].js；同时保留历史 /three-* /r3f-* 匹配，以便对象式
//     manualChunks 回归时立即变红。
//   - ModuleDetailPage 页面 chunk：dev 是 /src/pages/ModuleDetailPage.tsx（可能带
//     ?t= 时间戳），production 是 /ModuleDetailPage-[hash].js。
//   - MoleculeViewer 预取入口：dev 是 /src/components/three/MoleculeViewer.tsx，
//     production 是 /MoleculeViewer-[hash].js。
// 注意：不能用宽松的 /(three)/ 匹配——首页会静态加载 three/ 目录下的轻量占位组件
// ModulePlaceholderViewer.tsx（不含 three.js/R3F），路径含 "three" 但不是 vendor，
// 宽松匹配会把它误判成重型依赖而让"首页不下载 three"的断言假失败。
const isHeavy3dChunk = (url: string) =>
  /\/(ThreeViewerFrame|three|r3f)-[^/]+\.js(\?|$)/.test(url) ||
  /\/\.vite\/deps\/@react-three_(fiber|drei)\.js/.test(url);
const isModuleDetailPage = (url: string) =>
  /\/ModuleDetailPage-[^/]+\.js(\?|$)/.test(url) || /\/pages\/ModuleDetailPage\.tsx/.test(url);
const isMoleculeViewer = (url: string) =>
  /\/MoleculeViewer-[^/]+\.js(\?|$)/.test(url) || /\/three\/MoleculeViewer\.tsx/.test(url);

test.describe("T-006 模块卡片按意图预取 3D 资源", () => {
  test("首页初始加载不下载 three/r3f 或页面 chunk", async ({ page }) => {
    const scripts = trackScriptRequests(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // 首页是非 3D 页面：初始渲染不应下载任何重型 3D vendor 或模块详情页 chunk。
    expect(scripts.some(isHeavy3dChunk)).toBe(false);
    expect(scripts.some(isModuleDetailPage)).toBe(false);
  });

  test("hover 模块卡片后预取 ModuleDetailPage 与 MoleculeViewer", async ({ page }) => {
    // 用首页而非 /modules：/modules 的 requestIdleCallback 会在 hover 前就触发
    // prefetchViewerChunks，`warmed` 守卫会让 hover 时不再发请求，从而无法观测
    // 到"hover 引发预取"这一因果。首页有 featured ModuleCard 但没有 idle 自动
    // 预取，是观察 hover 因果的干净场所。
    await page.goto("/", { waitUntil: "networkidle" });

    // hover 前：确认页面 chunk / viewer 尚未被请求（首页初始不预取）。
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });
    expect(scripts.some(isModuleDetailPage)).toBe(false);
    expect(scripts.some(isMoleculeViewer)).toBe(false);

    // hover 首个模块卡片，触发 prefetchViewerChunks 的两个直接 import。
    const firstCard = page.locator("article").first();
    await expect(firstCard).toBeVisible();
    await firstCard.hover();

    // 预取是后台 import()，给它一点时间落地网络请求。
    // 断言 prefetch.ts 的两个直接 import：MoleculeViewer（拉起 three/r3f）与
    // ModuleDetailPage 页面 chunk。three/r3f 作为传递依赖不在此直接断言，避免
    // 与源码目录名 `three/` 的路径歧义。
    await expect
      .poll(() => scripts.some(isMoleculeViewer), { timeout: 10_000 })
      .toBe(true);
    await expect
      .poll(() => scripts.some(isModuleDetailPage), { timeout: 10_000 })
      .toBe(true);
  });

  test("预取后点击卡片仍能正常进入模块并渲染 viewer", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/modules", { waitUntil: "domcontentloaded" });

    const ch4Link = page.locator('a[href="/module/tetrahedral-ch4"]').first();
    await expect(ch4Link).toBeVisible();
    // 先 hover 预取，再点击——验证预取不破坏正常路由。
    await ch4Link.hover();
    await ch4Link.click();

    await expect(page).toHaveURL(/\/module\/tetrahedral-ch4$/);
    // 页面 chunk 正常加载并渲染：真正的普通分子 Viewer 容器出现。
    await expect(page.getByTestId("molecule-viewer")).toBeVisible({ timeout: 20_000 });
  });
});
