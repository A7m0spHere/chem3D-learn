# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Codex
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-001 已知有机分子全量回归测试
- **测试提交**：`e15d592 test: cover all known organic molecules`

### 本次改动

只新增一个测试文件：`frontend/tests/logic/organic-builder-known-molecules.logic.spec.ts`。

- 直接遍历 `knownOrganicMolecules` 动态生成每个候选的精确识别用例；词典条目增删时测试数量会自动同步。
- 独立维护当前中文名期望表，并校验其 ID 集合与生产词典一一对应，避免用生产值断言生产值。
- 对全部词典结构验证原子/键数组重排、图 ID 改名、坐标变化和键端点反转不影响识别。
- 在 `try/finally` 中临时反转词典数组并恢复，验证 `findKnownMolecule` 不依赖词典顺序。
- 新增五个原测试未覆盖的命名边界：
  - 丙炔与丙二烯同分异构区分，丙二烯期望 `丙-1,2-二烯`。
  - 多键位次优先，期望 `4-甲基己-2-烯`。
  - 羧酸优先于羟基，期望 `3-羟基丁酸`。
  - 不对称简单醚选择较长母体，期望 `甲氧基乙烷`。
  - 卤素从较近端编号，期望 `2-溴丁烷`。

没有修改 `organicBuilderChemistry.ts`、`organicBuilderNomenclature.ts` 或其他业务代码。

### 验证结果

- 新文件定向：28 / 28 通过。
- 完整 `npm run test:logic`：51 / 51 通过。
- `npm run build`：通过，2313 个模块；保留既有 three chunk 大于 500 KB 警告。
- `npm run lint`：通过，最终无 warning。
- `git diff --check`：通过。
- 未运行 visual 测试；本任务只涉及纯逻辑测试，且当前只有 Darwin 截图基线。

### 当前仍未收口的前序改动

- `frontend/package-lock.json`：39 行 npm 平台 `libc` 元数据删除，未暂存、未提交。
- `.tmp-npm-cache/`：未跟踪、未被当前 `.gitignore` 覆盖，未暂存、未提交。

### 给下一个 Agent 的唯一建议

领取 T-002：拆解 `ModuleDetailPage` 的专题状态，并先补跨模块 SPA 切换后的状态复位回归。

---

## 往期

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
