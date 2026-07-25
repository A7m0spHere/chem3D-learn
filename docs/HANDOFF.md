# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-002 拆解 `ModuleDetailPage` 专题状态到 typed hook
- **提交**：尚未提交（等待用户确认后再 commit）

### 本次改动

改动集中在 `frontend/`，未触碰后端、lockfile、npm 缓存或任何 Darwin 快照。

**新增 3 个 typed hook（`frontend/src/hooks/`）**

- `useCrystalControls(moduleId)`：晶体控制组（`crystalViewMode`/`crystalModelStyle`/`voidStage`/`showCrystalLabels` + `handleCrystalModeChange`）。含 ren3 `pressure` 默认特判。
- `useOrganicPlanarControls(moduleId)`：有机平面 / 直线专题（共面 / 乙烯 / 苯 / 乙炔）的 mode 与视角状态。
- `useBondingControls(moduleId)`：σ / π / 杂化 / 极性专题状态。含 `bondingBasicsMode` 按 `getDefaultBondingBasicsMode` 的模块特判。
- 每个 hook 用一个 `useEffect([moduleId])` 自管「切模块复位回该模块默认值」，默认值只此一处真源。

**改 `ModuleDetailPage.tsx`**

- 用三个 hook 调用替换对应 `useState` 群（33 → 页面自留 9 个），删除页面内重复的 `handleCrystalModeChange`，精简超长 `useEffect([id])`：只保留页面自留状态（讲解步骤、VSEPR 开关、有机拼装过渡、`viewerLoading` 定时器）的重置，专题重置全部下沉到 hook。
- `deriveViewerKind` / `viewerRegistry` 分发语义、JSX、教学文案零改动。刻意保留原行为：`autoRotate` 原本不在切模块重置列表中，维持不重置。

**新增 `frontend/tests/visual/module-state-reset.visual.spec.ts`（无截图）**

用相关模块卡片的 `<Link to="/module/:id">` 做 SPA 跳转（页面保持挂载、只变路由参数，才真正触发复位 effect；`page.goto` 会整棵重挂而测不到），覆盖晶体 / 普通分子 VSEPR / 杂化 / 有机平面 / σ 键五类。只用 DOM/文本/aria 断言，不碰 Darwin 基线。

### 验证结果

- `frontend npm run build`：**通过**（tsc --noEmit + vite build；仅保留既有 three chunk 警告）。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**51 / 51 通过**（本任务未增删 logic 用例）。
- 新增复位回归（`PLAYWRIGHT_CHANNEL=chrome`，仅跑该文件）：**5 / 5 通过**。
- `git status --short`：仅本任务文件变动，无快照 / lockfile / 缓存改写。
- 未运行完整 `test:visual`：只有 Darwin 基线，Windows 不得更新。

### 当前仍未收口的前序改动（非本任务引入）

- `frontend/package-lock.json` 的 39 行 `libc` 元数据删除与 `.tmp-npm-cache/`：均已在前一批 Git 收尾中处理（lockfile 已还原、`.tmp-npm-cache/` 已加入 `.gitignore`）。开工时工作区应为干净。

### 给下一个 Agent 的建议

提交本次前端重构（建议信息 `refactor: extract ModuleDetailPage topic state into typed hooks`，只暂存 3 个 hook + 页面 + 新 spec + 4 份 docs，勿混入 lockfile/缓存）。之后可领取 review 中记录的下一批高优先级项：前端 23 个 JSON 移出主包（改善模块详情 chunk 体积）、移动端导航缺失，或 T-004/T-006 等搁置项。

---

## 往期

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
