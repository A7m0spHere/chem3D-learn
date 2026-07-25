# DECISIONS.md

> 重要技术选择及理由（ADR 轻量版）。供后续 Agent 理解"为什么这样做"，避免推翻已有决定。
> 新增决定追加到末尾，不改旧条目（如需推翻，新增一条说明取代关系）。

---

## D-001 前端优先，后端只作为后续只读配套层

- **日期**：项目既有决定（见 `docs/PROJECT_BRIEF.md` / `AGENTS.md`）
- **决定**：以已实现的前端为产品基准；后端保持极简、只读，跟随前端数据与页面需求。
- **理由**：产品是课堂教学工具，不是 SaaS/数据库/题库。手写前端教学数据是"真源"。
- **约束**：未经明确批准，不引入登录、用户账户、数据库用户状态、教师后台、付费、SMILES 动态解析、RDKit runtime、Gemini API、AI chat。

## D-002 技术栈锁定 Vite + React + TS + Tailwind + shadcn/ui + R3F + Drei

- **日期**：项目既有决定
- **决定**：使用上述栈；**禁止** Next.js、Vue、Angular、Unity WebGL、Firebase，以及未经批准的数据库/大型后端框架。
- **理由**：轻量、教育场景、课堂投影友好；R3F 承担核心 3D 教学可视化。

## D-003 backend 采用零依赖 node:http

- **日期**：项目既有决定（见 `backend/`）
- **决定**：后端不用 Express 等框架，纯 `node:http` 实现只读 API；路由决策拆成纯函数 `resolveApiRequest`，与 `handleRequest` 分离。
- **理由**：仅 6 条只读数据，零依赖降低维护与安全面；纯函数便于用 `node:test` 直接断言，无需起真实服务器。

## D-004 3D viewer 一律懒加载

- **日期**：项目既有决定（见 `ModuleDetailPage.tsx` 顶部 `React.lazy`）
- **决定**：所有 3D viewer 组件用 `React.lazy` + `Suspense` 按需加载。
- **理由**：让 three.js / R3F 不进入首页、考试页等非 3D 页面的初始包，改善老旧课堂设备的首屏。

## D-005 ModuleDetailPage 用 viewerRegistry 注册表分发

- **日期**：项目既有决定（见 `ModuleDetailPage.tsx` 的 `ViewerKind` / `viewerRegistry`）
- **决定**：以单一 `viewerKind` 判别 + 注册表，取代散落在 viewer/toolbar/panel 三处的十多个布尔 ternary。新增 3D 模块只需加一行。
- **理由**：收敛分发逻辑，降低新增模块出错概率。函数体与重构前逐字一致。

## D-006 用 class 组件实现 ViewerErrorBoundary

- **日期**：2026-07-25（Claude Code）
- **决定**：错误边界用 class 组件（`ViewerErrorBoundary`），是全项目唯一的 class 组件，刻意保留。
- **理由**：React 只在 class 上暴露 `getDerivedStateFromError` / `componentDidCatch`，函数组件无法实现错误边界。这是 React 的固有约束，不是过时写法，勿"现代化"改写。
- **补充**：错误边界只能捕获渲染期错误（含 WebGL 初始化失败、懒加载分包失败），捕获不到异步回调/动画帧内的错误。用 `resetKey={id}` 在切模块时重置错误态。

## D-007 AI 协作文档治理结构

- **日期**：2026-07-25（Claude Code）
- **决定**：AGENTS.md 为 Claude Code 与 Codex 共享的唯一规则源；CLAUDE.md 首行 `@AGENTS.md` 导入后只加 Claude 专用规则；`docs/` 下用 PROJECT_STATUS / TASKS / DECISIONS / HANDOFF 承载状态与交接。
- **理由**：避免规则重复与漂移；让两个 Agent 有一致的上下文与交接机制。

## D-008 ViewerErrorBoundary 的重试使用整页重新加载

- **日期**：2026-07-25（补充并收窄 D-006）
- **决定**：错误回退按钮明确为“重新加载页面”，调用 `window.location.reload()`；`resetKey={id}` 只负责在 SPA 切换目标模块时清除当前边界错误态。
- **理由**：`React.lazy` 会缓存已拒绝的加载 Promise。仅将错误边界的 `hasError` 设回 `false` 会立即再次抛出同一错误，不能形成真实重试；整页刷新会创建新的 JavaScript 模块加载上下文，是不重构所有懒加载 Viewer 的最小可靠方案。
- **边界**：错误边界可捕获后代组件渲染、构造、生命周期中的错误，以及由 React 处理的懒加载拒绝；不承诺捕获所有 WebGL 初始化错误，也不能捕获事件处理、普通异步回调、服务端渲染、边界自身或 React Three Fiber 动画帧中的错误。
- **验证**：一次性拦截 `MoleculeViewer` 首次懒加载请求后，错误回退可见；键盘聚焦按钮并按 Enter 会重新加载同一路由且恢复 Canvas；错误态下通过 SPA 切换到 NaCl 后，`resetKey` 会清除旧错误回退。
