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

## D-009 后端启动守卫用 `pathToFileURL`，请求 URL 解析集中收敛异常

- **日期**：2026-07-25（Claude Code）
- **决定**：
  - `server.js` 的"被直接执行才监听"守卫从 `import.meta.url === \`file://${process.argv[1]}\`` 改为 `import.meta.url === pathToFileURL(process.argv[1]).href`。
  - 新增纯函数 `parseRequestPathname(requestUrl)`，把 `new URL` 与 `decodeURIComponent` 的解析集中在一处 `try/catch` 内，任一异常都返回 `{ malformed: true }`，由 `handleRequest` 统一回 `400 MALFORMED_REQUEST_URL`。
  - `createServer` 启动块补 `server.on("error")`，监听失败以非零 `exitCode` 退出而非抛未捕获异常。
- **理由**：
  - 旧守卫在 Windows 上永不相等（`argv[1]` 是 `D:\...\server.js`，拼出的 `file://D:\...` 与 `import.meta.url` 的 `file:///D:/...` 不同），`npm start` 从不监听端口；路径含空格/中文时也因缺少百分号编码失配。`pathToFileURL` 负责盘符、分隔符与编码，是唯一可靠的比较方式。
  - `request.url` 完全由客户端控制。`/%`、`/%zz` 让 `decodeURIComponent` 抛 `URIError`；`//`、`///` 让 `new URL` 抛 `TypeError`。两类异常都会冒泡成未捕获异常并终止进程 —— 任何人一条请求就能打掉课堂后端。集中收敛后，畸形请求只得到 400 且进程存活。
- **边界**：`parseRequestPathname` 只保证解析阶段不抛；不改变既有路由、状态码或 CORS 语义。HEAD 仍按现状落入 405（未在本次扩大范围）。
- **验证**：新增 `test/server.integration.test.js` 用 `createServer()` 起真实服务器并经真实 HTTP 断言：`/health` 可达、`/%` 与 `//` 各返回 400、连续畸形请求后服务仍存活、CORS 头与 OPTIONS 204、非 GET 405。手动 `PORT=4123 node src/server.js` 实测端口监听、畸形请求返回 400 后 `/health` 仍 200。

## D-010 ModuleDetailPage 专题控制状态按组下沉到 typed hook

- **日期**：2026-07-25（Claude Code，T-002）
- **决定**：
  - `ModuleDetailPage.tsx` 原本 33 个 `useState` 里的专题控制状态，按组抽成三个 typed hook：`useCrystalControls(moduleId)`、`useOrganicPlanarControls(moduleId)`、`useBondingControls(moduleId)`（均在 `frontend/src/hooks/`）。
  - 每个 hook 自管默认值、setter、切模块重置（各自一个 `useEffect([moduleId])`），并把该组派生 handler 一并收进（如晶体的 `handleCrystalModeChange`）。
  - 两处 id 依赖初始值搬进对应 hook：晶体 `crystalViewMode` 的 `ren3-high-pressure-nitride → "pressure"` 特判；`bondingBasicsMode` 的 `getDefaultBondingBasicsMode` 特判（其余回退 `"sp"`）。
  - 页面只保留跨专题 / 普通分子自身状态（讲解步骤、VSEPR 开关、有机拼装过渡、`viewerLoading` 定时器），其 `useEffect([id])` 从 40 行缩到只重置页面自留项。
- **理由**：原页面用单个 40 行 `useEffect([id])` 手动逐项重置全部专题状态，每新增一个专题模块都可能漏掉某项重置，是明确的可维护性隐患。把「某组默认值 + 切模块重置」收敛到唯一真源后，新增专题的默认值由对应 hook 负责，不再依赖页面记得补重置。
- **边界**：不改 `deriveViewerKind` / `viewerRegistry` 分发语义与优先级；不改任何 viewer / toolbar / panel 组件与教学文案；行为零变化。原 `useEffect([id])` 本就未重置 `autoRotate`，重构后继续保持不重置以等价。
- **验证**：新增 `tests/visual/module-state-reset.visual.spec.ts`（无截图，系统 Chrome 通道）抽查晶体 / 普通分子 VSEPR / 杂化 / 有机平面 / σ 键五类模块，经底部「相关模块推荐」的 `<Link>` 做 SPA 跳转（页面保持挂载、仅路由参数变化，正是复位 effect 生效路径），断言切模块后回默认态，5 / 5 通过。`npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过。

## D-011 ModuleDetailPage 用路由级 lazy 移出首屏主包，而非组件内数据异步化

- **日期**：2026-07-25（Claude Code，T-008）
- **决定**：
  - `router.tsx` 的 `/module/:id` 从静态 `element: <ModuleDetailPage />` 改为 React Router 数据路由的 `lazy: async () => { const { ModuleDetailPage } = await import(...); return { Component: ModuleDetailPage }; }`，与既有 `OrganicBuilderPage` 同款；删除顶部静态 `import`。
  - `mockMolecules.ts` 的 23 个静态 JSON `import` 与页面内同步数据消费（`getMockMolecule`/`getRealMoleculeData`/`mergeMoleculeData` 的 `useMemo`）保持不变。
- **理由**：`ModuleDetailPage` 是全库唯一消费这 23 条结构数据（值）的地方，且原先被 `router.tsx` 静态导入，导致数据被并入 `index` 主包——首页、Modules、Paths、Exam、About 首屏都在下载。把页面改为路由级 lazy 后，页面连同 23 个 JSON 一起移入独立页面 chunk，只有访问 `/module/:id` 才下载。相比「把 23 个 JSON 改成组件内动态 `import()`」，路由级 lazy 改动面仅一个文件、无首屏闪烁、无异步 plumbing，且同样达成主包瘦身。
- **边界**：进入 `/module/:id` 会经历一次 chunk 加载态（由既有 `hydrateFallbackElement` 承接，与 OrganicBuilderPage 一致，非回归）。组件内仍一次性加载全部 23 个 JSON；「进入模块只下载当前 1 个 JSON」属另一独立优化，未纳入本任务。
- **验证**：`npm run build` 后 `index` 主包从 496 KB 降到 209 KB（gzip 137 → 67 KB），新增 285 KB `ModuleDetailPage` chunk；grep 确认 JSON 教学文案（「甲烷以碳原子为中心」「钙钛矿」）已从 `index` 移入页面 chunk。`npm run lint`、`npm run test:logic`（51/51）、`module-state-reset.visual.spec.ts`（chrome 通道 5/5）通过。

## D-012 模块卡片按意图预取扩展到 ModuleDetailPage 页面 chunk

- **日期**：2026-07-25（Claude Code，T-006）
- **决定**：
  - `lib/prefetch.ts` 的 `prefetchViewerChunks` 在原有 `import("@/components/three/MoleculeViewer")`（预热 three/r3f 共享 vendor）之外，新增 `import("@/pages/ModuleDetailPage")`，与 `router.tsx` 中 lazy 路由的 import 指向同一 chunk。
  - 保留原 `warmed` 单次守卫；不改 `ModuleCard`（hover/focus）与 `ModulesPage`（idle）的既有调用点。
- **理由**：T-008 把 `/module/:id` 改为路由级 lazy 后，页面连同 23 个 JSON 成了独立 chunk。原预取只预热 three/r3f，点击卡片后仍要等页面 chunk 下载才能渲染，预取意图不完整。补上页面 chunk 预取后，hover/focus/idle 已把「进入模块所需的全部按需资源」预热到位。
- **边界**：仍由 `warmed` 守卫保证首页/列表初始渲染不触发任何预取，触屏设备的普通渲染不会自动下载 3D chunk；只在用户表现出进入意图（hover/focus）或列表页空闲时预取一次。
- **验证**：新增 `tests/visual/prefetch-viewer-chunks.visual.spec.ts`（无截图，chrome 通道）：首页初始加载不请求 three/r3f 或页面 chunk；hover 首页模块卡后 `ModuleDetailPage` 与 `MoleculeViewer` chunk 均被请求；预取后点击卡片仍正常进入模块并渲染 viewer。3/3 通过。`npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过。

## D-013 依赖漏洞按 `audit fix`（非 force）修复，剩余 react-router CVE 评估为不适用

- **日期**：2026-07-25（Claude Code，T-007）
- **决定**：
  - 用 `npm audit fix`（**不带 `--force`**）修复 4 个漏洞中的 3 类：`brace-expansion` 5.0.7→5.0.8、`nanoid` 3.3.12→3.3.16、`postcss` 8.5.15→8.5.23、`react-router`/`react-router-dom` 7.17.0→7.18.1，全部在现有 caret range 内，`package.json` 未改动。
  - 手动还原 npm 在 Windows 上剥离的 13 处 rollup linux 平台包 `libc` 元数据，使 `frontend/package-lock.json` 只保留明确批准的版本升级，无平台元数据改写。
  - 剩余 2 个 react-router 高危 **不修**：其完整修复只能靠 `--force` 降级到 7.11.0（SemVer 倒退且破坏 `^7.17.0` caret），当前无更高稳定版可修。
- **理由**：剩余 CVE（deserializeErrors 构造注入、RSCErrorHandler XSS、RSC CSRF、SSR 相关）前提是 SSR / RSC / 服务端 hydration；本应用用 `createBrowserRouter` 纯客户端 SPA、无 SSR/RSC，不触及这些路径。盲目 `--force` 降级既不修漏洞又引入 breaking，违背 T-007 验收。
- **边界**：本次只处理 `frontend/`，不跨 React 18/19 升级到 `video/`。剩余 2 个高危保持记录待上游发布干净修复版本后再评估。`three-mesh-bvh@0.7.8` 弃用警告本轮未复现（当前依赖树未见该包直接依赖）。
- **验证**：`npm audit` 从 4 个（1 moderate + 3 high）降到 2 个（2 high，均为不适用的 react-router SSR/RSC CVE）。`npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过；`module-state-reset` 与 `prefetch-viewer-chunks`（chrome 通道 8/8）确认 react-router minor 升级不破坏路由。lockfile diff 仅 5 处版本升级，零 libc / 零格式噪声。

## D-014 有机拼装实验室「常用片段」库扩充（乙烯基/乙炔基/甲氧基/氰基）

- **日期**：2026-07-25（Claude Code，T-009）
- **决定**：
  - 在 `builderFragmentTemplates`（`organicBuilderChemistry.ts`）原有 6 个片段（甲基/羟基/氨基/醛基/羰基/羧基）之外，新增 4 个高中常见基团：乙烯基 `–CH=CH₂`、乙炔基 `–C≡CH`、甲氧基 `–OCH₃`、氰基 `–C≡N`；`BuilderFragmentId` 联合类型同步扩为 10 个。
  - 工具箱 `OrganicBuilderToolbox` 遍历 `builderFragmentTemplates` 渲染按钮，新片段自动出现，UI 无需改动。
- **理由**：拼装模块已成熟（无 TODO/占位），合理的完善是低风险增量。扩充片段库直接提升课堂拼装能力，且是纯数据/引擎层改动，不碰 3D 拖拽数学、命名引擎或 UI 结构，可被 logic 测试完整覆盖。
- **边界**：
  - 只选落在现有 8 元素中性价模型内的基团。**明确排除**硝基、磺酸基等需形式电荷的基团——它们会触发 over-valence，超出引擎能力。实施前用一次性探针脚本验证候选，剔除引擎处理不了的。
  - 氰基 `–C≡N` 价态完整、可正常拼装，但命名引擎把 C≡N 归入「复杂含氮」返回 `unsupported`——这是**既有引擎边界，非本次回归引入**。InfoPanel 已能如实显示「无法命名 + 原因」。乙烯基/乙炔基/甲氧基补氢后分别命中丙烯（词典已知）/丙-1-炔/甲氧基甲烷。
- **验证**：新增 `tests/logic/organic-builder-fragments.logic.spec.ts`（5 项：注册自洽 + 4 片段的价态/补氢/命名，含氰基 unsupported 断言）与 `tests/visual/organic-builder-fragments.visual.spec.ts`（chrome 通道 2/2：按钮出现且可拼接、氰基价态完整）。`npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
