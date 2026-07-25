# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-003 修复后端两个 P0 并补真实 HTTP 集成测试
- **提交**：尚未提交（等待用户确认后再 commit）

### 本次改动

改动集中在 `backend/`，未触碰前端、lockfile 或 npm 缓存。

**`backend/src/server.js`（修复 + 加固）**

1. **启动守卫**（P0-1）：`import.meta.url === \`file://${process.argv[1]}\`` 改为 `import.meta.url === pathToFileURL(process.argv[1]).href`。原写法在 Windows 上 `argv[1]` 是 `D:\...\server.js`，拼出的 `file://D:\...` 与 `import.meta.url` 的 `file:///D:/...` 永不相等，`npm start` 从不监听端口。路径含空格/中文时同样失配。
2. **URL 解析收敛**（P0-2）：抽出 `parseRequestPathname(requestUrl)`，用 try/catch 同时兜住两类客户端可触发的异常 —— `decodeURIComponent` 对 `/%`、`/%zz` 抛 `URIError`，`new URL` 对 `//`、`///` 抛 `TypeError`。任一异常返回 `{ malformed: true }`，`handleRequest` 据此回 400 `MALFORMED_REQUEST_URL`，不再冒泡成未捕获异常终止进程。
3. **监听错误兜底**：`server.on("error", ...)` 打印明确信息并置 `process.exitCode = 1`，端口占用等不再抛未捕获异常。

**`backend/test/server.integration.test.js`（新增）**

用 `createServer()` 起真实 HTTP 服务器 + `fetch` 覆盖原纯函数测试完全没碰的启动/解码/CORS/写出四层：真实监听、结构列表与详情、三类畸形 URL 各返回 400、连发畸形请求后进程仍存活、CORS 响应头、OPTIONS 预检 204、非 GET 405。

### 验证结果

- `cd backend && npm test`：**15 / 15 通过**（原 5 条纯函数 + 新 10 条真实 HTTP）。
- 独立端到端脚本实测：`npm start` 现在真实监听并返回 `/health` 200；连发 `/%`、`//` 各返回 400 后进程仍存活、`/health` 仍 200。
- 未运行前端 build/lint/测试：本任务未改动任何前端代码。
- `git diff --check`：通过。

### 当前仍未收口的前序改动（沿用上一次交接，非本任务引入）

- `frontend/package-lock.json`：39 行 npm 平台 `libc` 元数据删除，未暂存、未提交。
- `.tmp-npm-cache/`：未跟踪、未被当前 `.gitignore` 覆盖，未暂存、未提交。

### 给下一个 Agent 的建议

提交本次后端修复（建议信息 `fix: make backend actually start and survive malformed urls`，只暂存 `backend/` 与相关 docs，勿混入 lockfile/缓存）。之后可领取 review 中记录的下一批高优先级项：前端 23 个 JSON 移出主包、移动端导航缺失、或 T-002 拆解 `ModuleDetailPage` 状态。

---

## 往期

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
