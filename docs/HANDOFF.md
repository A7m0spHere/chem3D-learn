# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-006 模块卡片按意图预取 3D 资源（把 T-008 拆出的 `ModuleDetailPage` chunk 一并预取）
- **提交**：尚未提交（等待用户确认后再 commit）

### 本次改动

只改一个源码文件 `frontend/src/lib/prefetch.ts` + 新增一个无截图测试，未触碰后端、lockfile、npm 缓存或任何 Darwin 快照。

**`lib/prefetch.ts`（唯一代码改动）**

- `prefetchViewerChunks` 在原有 `import("@/components/three/MoleculeViewer")`（预热 three/r3f 共享 vendor）之外，新增 `import("@/pages/ModuleDetailPage")`，与 `router.tsx` lazy 路由的 import 指向同一 chunk。
- 保留原 `warmed` 单次守卫；**未改** `ModuleCard`（hover/focus）与 `ModulesPage`（idle）的既有调用点——它们已在调用 `prefetchViewerChunks`，新增的页面 chunk 预取自动随现有触发点生效。

**为什么这样改**：T-008 把 `/module/:id` 改为路由级 lazy 后，页面连同 23 个 JSON 成了独立 chunk。原预取只预热 three/r3f，点击卡片后仍要等页面 chunk 下载才能渲染。补上页面 chunk 预取后，hover/focus/idle 已把「进入模块所需的全部按需资源」预热到位。详见 D-012。

**`tests/visual/prefetch-viewer-chunks.visual.spec.ts`（新增，无截图）**

用网络请求监听断言预取时机：首页初始加载不请求 three/r3f（`.vite/deps/@react-three_*` 或产物 `three-*`/`r3f-*`）或页面 chunk；hover 首页模块卡后 `ModuleDetailPage` 与 `MoleculeViewer` chunk 均被请求；预取后点击卡片仍正常进入模块并渲染 viewer。注意：hover 用例放在**首页**（`/modules` 的 idle 预取会在 hover 前触发 `warmed` 守卫，掩盖 hover 行为）。

### 验证结果

- `frontend npm run build`：**通过**（保留既有 three chunk 警告）。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**51 / 51 通过**（本任务未增删 logic 用例）。
- 新增 `prefetch-viewer-chunks.visual.spec.ts`（`PLAYWRIGHT_CHANNEL=chrome`）：**3 / 3 通过**。
- `git status --short`：仅 `prefetch.ts` + 新 spec + 4 份 docs 变动，无快照 / lockfile / 缓存改写。
- 未运行完整 `test:visual`：只有 Darwin 基线，Windows 不得更新。

### 当前仍未收口的前序改动（非本任务引入）

- `frontend/package-lock.json` 的 `libc` 元数据与 `.tmp-npm-cache/`：均已在更早的 Git 收尾中处理（lockfile 已还原、`.tmp-npm-cache/` 已进 `.gitignore`）。开工时工作区应为干净。

### 给下一个 Agent 的建议

提交本次改动（建议信息 `perf: prefetch module detail chunk on card intent`，只暂存 `prefetch.ts` + 新 spec + 4 份 docs，勿混入 lockfile/缓存）。本会话授权序列的下一项是 T-007（依赖安全与 lockfile 评估）。

---

## 往期

### 2026-07-25 Claude Code：T-008 ModuleDetailPage 路由级 lazy 主包瘦身

- `router.tsx` 的 `/module/:id` 改为 lazy 路由（同 `OrganicBuilderPage` 范式），页面连同 23 个 JSON 移出 `index` 主包（496→209 KB）。详见 D-011。
- 提交：`232e4ea perf: lazy-load ModuleDetailPage to drop molecule data from main bundle`。

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
