# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-008 把 `ModuleDetailPage` 及其 23 个分子 JSON 移出首屏主包（路由级 lazy）
- **提交**：尚未提交（等待用户确认后再 commit）

### 本次改动

只改一个源码文件 `frontend/src/router.tsx`，未触碰后端、lockfile、npm 缓存或任何 Darwin 快照。

**`router.tsx`（唯一代码改动）**

- 删除顶部 `import { ModuleDetailPage } from "@/pages/ModuleDetailPage"` 静态导入。
- `/module/:id` 路由从 `element: <ModuleDetailPage />` 改为 React Router 数据路由的 `lazy: async () => { const { ModuleDetailPage } = await import("@/pages/ModuleDetailPage"); return { Component: ModuleDetailPage }; }`，与既有 `OrganicBuilderPage` 逐字同款。加载态复用已有 `hydrateFallbackElement`（`RouteHydrateFallback`），未新增 UI。

**为什么是路由级 lazy 而非组件内 JSON 动态 import**：`ModuleDetailPage` 是全库唯一消费这 23 条数据（值）的地方，且原先被静态导入，数据才被并入 `index` 主包。把页面变 lazy 即让页面连同 23 个 JSON 一起移出主包，改动面仅一个文件、无首屏闪烁、无异步 plumbing。详见 D-011。`mockMolecules.ts` 与页面内同步 `useMemo` 数据消费保持不变。

### 验证结果

- `frontend npm run build`：**通过**。`index` 主包 **496 KB → 209 KB**（gzip 137 → 67 KB）；新增 285 KB `ModuleDetailPage` chunk。grep 确认 JSON 教学文案（「甲烷以碳原子为中心」「钙钛矿」）已从 `index` 移入页面 chunk。保留既有 three chunk 警告。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**51 / 51 通过**（本任务未增删 logic 用例）。
- 现有 `module-state-reset.visual.spec.ts`（`PLAYWRIGHT_CHANNEL=chrome`）：**5 / 5 通过**，证明页面变 lazy 后懒加载渲染与 SPA 切换行为无回归。
- `git status --short`：仅 `router.tsx` + 4 份 docs 变动，无快照 / lockfile / 缓存改写。
- 未运行完整 `test:visual`：只有 Darwin 基线，Windows 不得更新。

### 当前仍未收口的前序改动（非本任务引入）

- `frontend/package-lock.json` 的 `libc` 元数据与 `.tmp-npm-cache/`：均已在更早的 Git 收尾中处理（lockfile 已还原、`.tmp-npm-cache/` 已进 `.gitignore`）。开工时工作区应为干净。

### 给下一个 Agent 的建议

提交本次改动（建议信息 `perf: lazy-load module detail route to shrink main bundle`，只暂存 `router.tsx` + 4 份 docs，勿混入 lockfile/缓存）。之后可考虑 T-006（模块卡片按意图预取，把新的 `ModuleDetailPage` chunk 一并预取以抵消首访加载态）；或「进入模块只下载当前 1 个 JSON」的组件内数据动态化（属 D-011 边界外的独立优化，需另立任务并权衡首屏闪烁）。

---

## 往期

### 2026-07-25 Claude Code：T-002 拆解 ModuleDetailPage 专题状态到 typed hook

- 新增 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls`，各自 `useEffect([moduleId])` 自管切模块复位；页面 `useState` 从 33 降到自留 9 个，`deriveViewerKind`/`viewerRegistry` 与教学文案零改动。新增无截图 `module-state-reset.visual.spec.ts`（5/5）。
- 提交：`cf121d3 refactor: split ModuleDetailPage topic state into typed hooks`。

### 2026-07-25 Claude Code：T-003 后端两个 P0 修复 + 真实 HTTP 集成测试

- `server.js` 启动守卫改用 `pathToFileURL`、新增 `parseRequestPathname` 收敛畸形 URL、补 `server.on("error")`；新增 `test/server.integration.test.js`（真实 HTTP，15/15）。
- 提交：`c4ed156 fix: make backend actually start and survive malformed urls`。

### 2026-07-25 Codex：T-001 已知有机分子全量回归测试

- 新增 `frontend/tests/logic/organic-builder-known-molecules.logic.spec.ts`，表驱动遍历 `knownOrganicMolecules` 并补 5 个命名边界。
- 提交：`e15d592 test: cover all known organic molecules`。

### 2026-07-25 Codex：Windows 开发环境治理

- 为 AGENTS / CLAUDE 补充原生 Windows、PowerShell、Git Bash、npm 缓存与测试矩阵说明。
- 提交：`0bd9b58 docs: add Windows development guidance`。

### 2026-07-25 Codex：T-000 AI 协作规范交付

- 交付并跟踪 CLAUDE / DECISIONS，不混入 lockfile 或 npm 缓存。
- 提交：`6a5361e docs: deliver AI collaboration governance`。

### 2026-07-25 Codex：T-ERR ViewerErrorBoundary 收口

- 修复真实重试语义，验证路由复位、键盘操作和错误边界。
- 提交：`bade1aa fix: make 3d viewer error recovery reliable`。

### 2026-07-25 Codex：独立复核与文档事实校正

- 校正 AGENTS、PROJECT_STATUS、TASKS、HANDOFF。
- 明确实际入口、环境变量、测试平台条件和未提交改动。
- 提交：`f1a444e docs: reconcile governance with repository state`。

### 2026-07-25 Claude Code

- 初步实现 ViewerErrorBoundary 并初始化共享治理文档。
- 安装 `frontend/node_modules`，记录 build 与 lint 通过。
