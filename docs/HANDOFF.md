# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Codex
- **日期**：2026-07-25
- **分支**：`main`
- **任务**：T-ERR ViewerErrorBoundary 收口与行为验收
- **业务提交**：`bade1aa fix: make 3d viewer error recovery reliable`

### 本次业务改动

只处理两个业务文件：

1. `frontend/src/components/common/ViewerErrorBoundary.tsx`
   - 新增 class Error Boundary；React 目前仍只通过 class 生命周期提供错误边界能力。
   - 捕获后代组件渲染/生命周期错误，显示浅色课堂风 fallback，并保留控制台错误线索。
   - fallback 增加 `role="alert"`，按钮可通过键盘聚焦和 Enter 触发。
   - 将无效的“清 state 重试”改为 `window.location.reload()`，按钮改名“重新加载页面”。
   - 原因：`React.lazy` 会缓存拒绝的加载 Promise，只清 Error Boundary state 会立即再次抛错；整页刷新会创建新的模块加载上下文。
2. `frontend/src/pages/ModuleDetailPage.tsx`
   - 导入 `ViewerErrorBoundary`。
   - 用 `<ViewerErrorBoundary resetKey={id}>` 包裹原有 3D viewer `Suspense`。
   - 模块 ID 变化时清除当前边界错误态，使目标 Viewer 可以重新渲染。

没有修改或提交 `frontend/package-lock.json`、`.tmp-npm-cache/`、`CLAUDE.md`、`docs/DECISIONS.md`。

### 行为验证

使用一次性网络拦截中断 `MoleculeViewer.tsx` 的首次 Vite lazy 请求：

1. **正常路径**
   - `/module/tetrahedral-ch4`：Canvas 1、fallback 0。
2. **故障边界**
   - lazy 请求被中断后：出现 `role="alert"` fallback。
   - 浏览器控制台包含 `[ViewerErrorBoundary]` 错误记录。
3. **真实重试**
   - “重新加载页面”按钮可以获得焦点并由 Enter 激活。
   - 重新加载同一路由后：Canvas 1、fallback 0。
4. **路由复位**
   - 在错误态下通过 History API 触发 SPA 切换到 `/module/nacl-crystal`。
   - 切换后：Canvas 1、fallback 0，证明 `resetKey` 生效。
5. **视觉**
   - 1280×720 Viewer 截图已人工检查：提示卡居中、文字清晰、未遮挡 Viewer 外操作区，符合浅色教育风。

`webapp-testing` 技能要求 Python Playwright，但当前 Python 环境没有 `playwright` 包。为避免安装依赖和改动 lockfile，改用项目现有 Node Playwright + 系统 Chrome；服务器生命周期仍由该技能的 `with_server.py` 管理。

### 命令与结果

- `npm run build`：通过，2313 个模块；保留既有 three chunk 体积警告。
- `npm run lint`：通过。
- 自定义 Node Playwright 故障注入：全部断言通过。
- `git diff --check`：通过。
- 完整视觉回归未运行，也未更新快照；当前只有 Darwin 基线。

### 明确的故障边界

React Error Boundary 不捕获：

- 事件处理函数中的错误。
- 普通异步回调（如 `setTimeout`、未被 React 接管的 Promise）。
- 服务端渲染错误。
- Error Boundary 自身抛出的错误。
- 所有可能发生在 R3F 动画帧/底层 WebGL 驱动中的错误。

因此交付能力是“防止后代 Viewer 的渲染错误和 lazy 分包拒绝直接造成整页白屏”，不是“捕获所有 WebGL 故障”。

### 当前仍未收口的前序改动

- `frontend/package-lock.json`：39 行 npm 平台 `libc` 元数据删除。
- `.tmp-npm-cache/`：未跟踪、约 10.8 MB、未被当前 `.gitignore` 覆盖。
- `CLAUDE.md`：未跟踪。
- `docs/DECISIONS.md`：未跟踪。

### 给下一个 Agent 的唯一建议

领取 `T-000 AI 协作规范交付收口`：只确认并交付 `CLAUDE.md` / `docs/DECISIONS.md` 的治理范围，不要混入 lockfile 或 npm 缓存。

---

## 往期

### 2026-07-25 Codex：独立复核与文档事实校正

- 校正 AGENTS、PROJECT_STATUS、TASKS、HANDOFF。
- 明确实际入口、环境变量、测试平台条件和未提交改动。
- 提交：`f1a444e docs: reconcile governance with repository state`。

### 2026-07-25 Claude Code

- 在工作区初步新增 `ViewerErrorBoundary.tsx`，并在 `ModuleDetailPage.tsx` 包裹 3D viewer 的 `Suspense`。
- 初始化/扩充 AGENTS、CLAUDE、PROJECT_STATUS、TASKS、DECISIONS、HANDOFF。
- 安装 `frontend/node_modules`，记录 build 与 lint 通过。
- 遗留：ErrorBoundary 未做真实故障视觉验收；lockfile、npm 缓存和多份治理文件未收口。
