# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-009 有机拼装实验室「常用基团」片段库扩充
- **提交**：`e2e...`（T-009，见本次；T-007 已先行提交 `e9b3c32`）

### 本次改动

改 2 个源码文件 + 2 个新测试 + 5 份 docs，未改后端、`package.json` 或 Darwin 快照。

**`src/types/organicBuilder.ts` + `src/lib/organicBuilderChemistry.ts`**

- `BuilderFragmentId` 联合类型新增 `vinyl` / `ethynyl` / `methoxy` / `cyano` 四个 id。
- `builderFragmentTemplates` 在原 6 个片段后新增 4 个模板：乙烯基 `–CH=CH₂`、乙炔基 `–C≡CH`、甲氧基 `–OCH₃`、氰基 `–C≡N`，均在现有 8 元素中性价模型内。
- **未改** `OrganicBuilderToolbox`——它遍历 `builderFragmentTemplates` 渲染按钮，新片段自动出现;也未改 3D 拖拽、命名引擎或页面结构。详见 D-014。

**新增测试（均无截图）**

- `tests/logic/organic-builder-fragments.logic.spec.ts`（5 项）：4 个片段接碳后价态完整、补氢正常、命名/官能团符合预期；氰基 C≡N 命名返回 `unsupported` 属既有引擎边界，测试如实断言。
- `tests/visual/organic-builder-fragments.visual.spec.ts`（chrome 通道 2 项）：新片段按钮在工具箱可见、可拼接（乙烯基→丙烯）、氰基价态完整。

### 验证结果

- `frontend npm run build`：**通过**。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**56 / 56 通过**（原 51 + T-009 新增 5）。
- 新增 `organic-builder-fragments.visual.spec.ts`（`PLAYWRIGHT_CHANNEL=chrome`）：**2 / 2 通过**。

### 事故记录（本会话工具输出伪影）

本会话多次出现工具输出/文件读取伪影（损坏的 Read 返回占位 `return null`、以及一条**虚假的 T-007 提交哈希 `8f9c9d5`**）。核查发现 T-007 **实际从未提交**，真实 HEAD 曾停在 `36024af`(T-006)。已用真实提交 `e9b3c32` 补上 T-007（仅 lockfile）。下一个 Agent 若见文档引用 `8f9c9d5`，那是伪影，以 `e9b3c32` 为准。

### 给下一个 Agent 的建议

本会话 `/goal` 授权的 T-006 → T-007 → T-009 已全部完成并分别提交（未推送远程，遵从「不上传库」）。剩余 2 个 react-router high 待上游干净修复版本；氰基命名的 `unsupported` 若要转为 generated 需扩命名引擎（腈类），属独立任务。

---

## 往期

### 2026-07-25 Claude Code：T-007 依赖安全与 lockfile 评估

- 联网 `npm audit` 复核，非 `--force` 升级 5 个包（brace-expansion/nanoid/postcss/react-router(dom)），漏洞 4→2；剩余 2 个 react-router high 为 SSR/RSC 场景不适用纯客户端 SPA。手动还原 13 处 rollup `libc` 元数据，lockfile 只含版本升级。详见 D-013。
- 提交：`e9b3c32 fix(deps): patch 2 of 4 audit findings without breaking changes`。

### 2026-07-25 Claude Code：T-006 模块卡片按意图预取 ModuleDetailPage chunk

- `lib/prefetch.ts` 的 `prefetchViewerChunks` 新增 `import("@/pages/ModuleDetailPage")`，与 lazy 路由指向同一 chunk；保留 `warmed` 守卫，未改 ModuleCard/ModulesPage 调用点。新增无截图 `prefetch-viewer-chunks.visual.spec.ts`（3/3）。详见 D-012。
- 提交：`36024af perf: prefetch module detail page chunk on card intent`。

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
