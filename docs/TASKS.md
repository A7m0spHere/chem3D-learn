# TASKS.md

> 待办任务清单。供 Claude Code / Codex 领取任务、同步状态。
> 状态取值：`待办` / `进行中` / `已完成` / `搁置`。
> 领取任务前请先读 `docs/PROJECT_STATUS.md` 和 `docs/HANDOFF.md`。

---

## 进行中

（暂无。）

---

## 待办（按优先级）

（暂无。）

---

## 搁置 / 低优先级

### T-004 大晶胞几何计算下沉

- **优先级**：低
- **状态**：搁置
- **范围**：优先处理 `ZnSPolytypeCell.tsx`（816 行）和 `ZincMetalCell.tsx`（723 行），沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 模式，只抽离无 React/R3F 副作用的纯几何计算。
- **验收标准**：
  - [ ] 新 `*Geometry.ts` 函数有明确输入输出类型和代表性单测。
  - [ ] Viewer JSX、交互和相机行为不变。
  - [ ] build、lint、logic 测试通过，相关浏览器布局断言无回归。

### T-005 前后端结构数据去重方案

- **优先级**：低
- **状态**：搁置
- **范围**：先设计后实现；前端 23 个 manual JSON 继续为真源，后端只映射所需的 6 条记录，不引入数据库或运行时大依赖。
- **验收标准**：
  - [ ] 文档明确 Node 如何安全读取/生成共享数据及发布边界。
  - [ ] 前端无需依赖后端即可构建和运行。
  - [ ] 后端 API 响应兼容现有 5 项测试，并增加防漂移断言。

### T-006 模块卡片按意图预取 3D 资源

- **优先级**：低
- **状态**：搁置
- **范围**：复用 `lib/prefetch.ts`，在 Modules 卡片 hover / focus 时预取；触屏设备不得因普通渲染自动下载全部 3D chunk。
- **验收标准**：
  - [ ] 首页和模块列表初始加载不新增 three/R3F 请求。
  - [ ] hover / keyboard focus 后只预取目标所需共享 chunk，点击路由仍正常。
  - [ ] build、lint 和针对性浏览器测试通过。

### T-007 依赖安全与 lockfile 评估

- **优先级**：低
- **状态**：搁置
- **背景**：前序 npm 安装记录称有 4 个漏洞和 `three-mesh-bvh@0.7.8` 弃用警告，但本轮未联网复核；`frontend/package-lock.json` 另有 39 行 npm 平台元数据删除。
- **验收标准**：
  - [ ] 重新运行并保存 `npm audit` / 依赖树证据，区分生产与开发依赖、直接与传递依赖。
  - [ ] 不使用盲目的 `npm audit fix --force`，不跨 React 18/19 子项目升级。
  - [ ] lockfile 只包含明确批准的依赖变化，不混入无关平台元数据改写。
  - [ ] 升级后执行对应子项目的完整 build、lint 和测试。

---

## 已完成

### T-008 把 ModuleDetailPage 及其 23 个分子 JSON 移出首屏主包

- **完成**：2026-07-25（Claude Code）
- **背景**：`router.tsx` 静态导入 `ModuleDetailPage`，导致它唯一消费的 `mockMolecules.ts` 与 23 个手写 JSON（约 224 KB 源码）被并入 `index` 主包。首页、Modules、Paths、Exam、About 首屏都在下载这 23 条结构数据。
- **内容**：
  - 只改 `router.tsx`：`/module/:id` 从静态 `element: <ModuleDetailPage />` 改为 React Router 数据路由的 `lazy: async () => ...` 属性，与现有 `OrganicBuilderPage` 同款；删除静态 `import`。复用现有 `hydrateFallbackElement` 承接加载态，未新增 UI。
  - 未改 `mockMolecules.ts`、数据消费逻辑、`deriveViewerKind`/`viewerRegistry`、`vite.config.ts` 或教学文案。
- **验证**：
  - [x] 构建后 `index` 主包 **496 KB → 209 KB**（gzip 137 → 67 KB）；新增 `ModuleDetailPage` chunk（285 KB）承载页面 + 23 个 JSON。grep 确认 `甲烷以碳原子为中心` / `钙钛矿` 等文案已从 `index` 移入页面 chunk。
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过。
  - [x] 系统 Chrome 通道无截图冒烟：`module-state-reset.visual.spec.ts` 5/5 通过，`/module/:id` 懒加载渲染与 SPA 切换均无回归。
  - [x] 未改数据消费/viewer 分发/文案；未动 lockfile、缓存或 Darwin 快照。

### T-002 拆解 ModuleDetailPage 状态

- **完成**：2026-07-25（Claude Code）
- **背景**：`ModuleDetailPage.tsx` 有 33 个 `useState`，并由一个约 40 行的 `useEffect([id])` 手动逐项重置大量专题状态，每新增一个专题模块都可能漏掉重置项。
- **内容**：
  - 新增 3 个 typed hook，把专题控制状态、setter、派生 handler 与「切模块重置」收敛为唯一真源：
    - `useCrystalControls(moduleId)` —— 晶体视图模式 / 模型风格 / 空隙阶段 / 标签，含 `handleCrystalModeChange` 与 ren3 默认 `pressure` 特判。
    - `useOrganicPlanarControls(moduleId)` —— 共面 / 乙烯 / 苯 / 乙炔的 mode 与视角。
    - `useBondingControls(moduleId)` —— σ / π / 杂化 / 极性，含 `bondingBasicsMode` 的 `getDefaultBondingBasicsMode` 特判。
  - 页面 `useEffect([id])` 精简为只重置页面自留状态（讲解步骤、VSEPR 开关、有机拼装过渡、`viewerLoading` 定时器）；专题重置下沉到各 hook。
  - `deriveViewerKind` / `viewerRegistry` 分发语义与优先级不变，未改任何 viewer / toolbar / panel 组件与教学文案。原 `useEffect` 不重置 `autoRotate` 的行为被完整保留。
  - 新增 `tests/visual/module-state-reset.visual.spec.ts`（无截图）：经底部相关卡片做真实 SPA 跳转（页面保持挂载、只变路由参数），覆盖晶体、普通分子、杂化轨道、有机平面、σ 键 5 类模块的切换复位。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过。
  - [x] `PLAYWRIGHT_CHANNEL=chrome` 运行新增 spec：5/5 通过，未更新任何 Darwin 快照。
  - [x] `git status` 确认只改动页面 + 3 个 hook + 1 个新 spec，无 lockfile / 缓存 / 快照被改写。

### T-003 修复后端两个 P0 缺陷并补集成测试

- **完成**：2026-07-25（Claude Code）
- **背景**：`backend/src/server.js` 有两类"当前功能实际不可用"的缺陷，且 5/5 单测因只调用纯函数 `resolveApiRequest` 完全没有覆盖到。
- **内容**：
  - **P0-1 启动守卫**：`import.meta.url === \`file://${process.argv[1]}\`` 在 Windows 永不相等（`file://D:\...` vs `file:///D:/...`），`npm start` 从不监听端口。改用 `import.meta.url === pathToFileURL(process.argv[1]).href`，由 Node 统一处理盘符、分隔符和百分号编码；含空格/中文路径同样可靠。
  - **P0-2 畸形 URL 崩溃**：`decodeURIComponent(url.pathname)` 对 `/%`、`/%zz` 抛 `URIError`，`new URL(requestUrl, base)` 对 `//`、`///` 抛 `TypeError`；两者都无人捕获，一条请求即可终止进程。新增纯函数 `parseRequestPathname`，把三类异常收敛为 `{ malformed: true }`，`handleRequest` 返回 400 `MALFORMED_REQUEST_URL`。
  - **启动错误处理**：为直接执行分支补 `server.on("error")`，端口占用等失败给出明确信息并以非零码退出，而非抛未捕获异常。
  - **集成测试**：新增 `backend/test/server.integration.test.js`，用 `createServer()` 起真实 HTTP 服务并经真实请求断言：启动即监听 `/health`、三类畸形 URL 各返 400 且进程存活、连发畸形请求后仍正常服务、CORS 响应头与 OPTIONS 204 预检、非 GET 返 405。
- **验证**：
  - [x] `backend npm test`：15 / 15 通过（原 5 条纯函数 + 新 10 条真实 HTTP）。
  - [x] 实跑 `npm start`：进程监听端口，`/health` 返 200。
  - [x] 实跑发送 `/%`、`//`：各返 400，之后 `/health` 仍返 200（进程未崩溃）。
  - [x] 未改动前端、lockfile 或 npm 缓存。

### T-001 已知有机分子全量回归测试

- **完成**：2026-07-25（Codex，commit `e15d592`）
- **内容**：
  - 新建 `frontend/tests/logic/organic-builder-known-molecules.logic.spec.ts`，直接遍历 `knownOrganicMolecules` 动态生成全量精确识别用例。
  - 独立维护中文名期望表，并校验期望表 ID 与生产词典一一对应；当前全部词典结构均断言精确 `id` / `nameZh`。
  - 新增 5 个图同构不变性边界：词典顺序、原子/键数组顺序、图 ID、空间坐标和键端点顺序。
  - 新增 5 个命名边界：丙炔/丙二烯同分异构、4-甲基己-2-烯编号、3-羟基丁酸官能团优先级、甲氧基乙烷母体选择、2-溴丁烷最低位次。
- **验证**：
  - [x] 新文件定向测试 28 / 28 通过。
  - [x] 完整 `npm run test:logic` 51 / 51 通过。
  - [x] `npm run build`、`npm run lint`、`git diff --check` 通过。
  - [x] 未修改命名引擎、业务代码、lockfile 或 npm 缓存。

### T-000 AI 协作规范交付收口

- **完成**：2026-07-25（Codex，commit `6a5361e`）
- **内容**：
  - `CLAUDE.md` 第一行保留 `@AGENTS.md`，只承载 Claude Code 专用补充。
  - `docs/DECISIONS.md` 纳入版本控制，并追加 ViewerErrorBoundary 的真实重试与故障边界决策。
  - 治理提交未混入业务代码、lockfile 或 npm 缓存。
- **验证**：
  - [x] 两份目标文件已由 Git 跟踪。
  - [x] `git diff --check` 通过。

### T-ERR ViewerErrorBoundary 收口与行为验收

- **完成**：2026-07-25（Codex，commit `bade1aa`）
- **内容**：
  - 新增 `ViewerErrorBoundary.tsx`，并在 `ModuleDetailPage.tsx` 包裹 3D viewer 的 `Suspense`。
  - `resetKey={id}` 负责模块路由变化后的错误态复位。
  - 重试按钮改为“重新加载页面”，调用 `window.location.reload()`，真实重试被 `React.lazy` 缓存为拒绝状态的分包加载。
  - fallback 增加 `role="alert"`，修正中文标点和故障边界文案。
- **验证**：
  - [x] 正常 CH₄ 模块 Canvas 可见。
  - [x] 中断一次 `MoleculeViewer` lazy 请求后，fallback 可见且边界记录错误。
  - [x] 按钮可聚焦并由键盘 Enter 触发；同一路由重新加载后 Canvas 恢复。
  - [x] 错误态下 SPA 切换到 NaCl 后 fallback 消失、Canvas 恢复。
  - [x] `npm run build`、`npm run lint`、`git diff --check` 通过。
  - [x] 未更新 Darwin 快照，未提交 lockfile、缓存或未跟踪治理文件。
- **已知边界**：不能捕获事件处理、普通异步回调、服务端渲染、边界自身错误，也不保证覆盖所有 R3F 动画帧故障。

### T-DOC-001 独立复核与治理文档事实校正

- **完成**：2026-07-25（Codex）
- **内容**：只校正 `AGENTS.md`、PROJECT_STATUS、TASKS、HANDOFF；未修改业务代码、lockfile、缓存或 DECISIONS。
- **验证**：
  - [x] 对照实际入口、依赖、环境变量、数据注册、测试配置和 Git 状态。
  - [x] 修正 17 个已知有机分子、33 个页面 state、24 个 Canvas Viewer、80 张 Darwin 基线等可复核事实。
  - [x] 记录默认 Playwright 无头浏览器缺失与 Chrome 通道冒烟通过的差异。
  - [x] 前端 build / lint / 23 项 logic 测试、后端 5 项测试均通过。
  - [x] 未运行完整视觉回归，原因是只有 macOS 基线。
