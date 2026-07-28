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

## D-015 晶体 viewer 共享「原子球对照图例」，先铺 4 个数据驱动核心晶体

- **日期**：2026-07-25（Claude Code，T-010）
- **决定**：
  - 新增共享组件 `src/components/three/CrystalAtomLegend.tsx`：从 `molecule.atoms` 按元素去重，取每种元素的代表颜色（`atom.color`）与代表半径（同元素多位点取最大 `radius`），渲染成「按真实相对大小 + 颜色缩放的球 + 离子名称」，挂在 `ThreeViewerFrame` 的 `footerMeta` 槽位常驻显示。
  - 先接入 4 个**数据驱动**核心晶体：NaCl、CsCl、BaTiO₃、CaF₂（均基于 manual JSON 的 `atom.color`/`radius`）。BaTiO₃ 原有的私有 `AtomLegend`/`LegendItem`（等大色点）被共享组件替换并删除。
  - 浮动原子标签保持 `showCrystalLabels` 默认 `false`（默认关），图例常驻——达成「默认关闭浮动标签 + 图例常驻」而不改标签开关逻辑。
- **理由**：原先贴在 3D 原子上的浮动标签会遮挡视图；6 个 viewer 各自私有定义的图例是重复代码且都用等大色点、不体现真实球大小。共享组件把「元素→颜色/相对大小/名称」收敛为单一真源，圆点按 JSON 真实 radius 线性映射到 10–20px，与画布观感一致。
- **边界**：本批只覆盖 4 个数据驱动 viewer；几何生成型（Mof5/MetalClosePacking/Ren3/Mxene/ZnS 等）的颜色/半径来自组件常量而非 `molecule.atoms`，需单独适配，留待用户验证首批效果后再扩展。counting/polyhedron 等模式专属教学标注不属浮动位点标签，保持不动。
- **验证**：新增 `tests/visual/crystal-atom-legend.visual.spec.ts`（无截图，chrome 通道）：4 个 viewer 的 `footerMeta` 图例常驻可见、列出全部离子名称、图例项数=元素种类数，4/4 通过。`npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。

## D-016 晶体 viewer 恒显场景标签改为「3D 引线 + 外围标签」，先做 MOF-5 样板

- **日期**：2026-07-26（Claude Code，T-011）
- **决定**：
  - 新增共享组件 `src/components/three/CalloutLabel.tsx`：`<Line points={[anchor, lineEnd]}>` 引线 + `<Html center position={anchor+offset}>` 标签。把恒显标签从「锚点上直接浮 `<Html>`」改为「锚点在结构上、标签沿 `offset` 外推到结构外围、引线连接二者」。引线终点从标签中心回退 12%（或 0.12，取较小）留白，不戳进文字。
  - 先把 `Mof5Cell.tsx` 15 处**指向具体结构**的恒显 `<Html>` 场景标签替换为 `CalloutLabel`，作为样板。保留 4 处不指向单一结构的全局说明（对比图总结、化学式、`Fm-3m` 计数说明）与 `showLabels` 门控原子标签为原 `<Html>`。
  - 采用「3D 外推锚点」而非「屏幕边缘绝对固定 + 每帧手动投影」：引线两端都是 3D 世界坐标，R3F 每帧自动重投影，与现有 `demand` frameloop 天然兼容，旋转时端点自洽，无需额外逐帧 JS 投影代码。代价是标签随视角变化而非死锁屏幕边缘——对课堂展示足够。
- **理由**：这些恒显标签硬编码 3D 坐标、多落在结构中央，模型一旋转就压住晶胞遮挡视野。drei `<Line>` 已在 `AngleArc`/`MolecularPolarity` 多处使用（`AngleArc` 就是现成的 `<Line>` + `<Html>` 引线范式），复用它零新依赖。先做 MOF-5 一个样板、diff 可控可回退，与 D-015「先 4 个核心晶体图例、验证后扩展」的分步策略一致。
- **边界**：本批只改 MOF-5；其余 8 个 viewer（Mxene/Ren3/MetalClosePacking/Pba/Graphite/ZnS/ZincMetal/BaTiO3）待验证满意后用同一组件分别扩展、各自单独提交。不改原子级 `showLabels` 系统、不改图例、不改教学文案文字。引线极端角度可能穿过结构，本轮不追求完美避让。
- **验证**：新增 `tests/visual/mof5-callout.visual.spec.ts`（无截图，chrome 通道）：各 viewMode 标签文案仍可见、标签中心相对 stage 中心归一化偏移 > 0.15、孔隙/客体阶段引线标签在场，6/6 通过。`npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
- **锚点精修（2026-07-26，同会话，用户反馈标签指向不明/有误后）**：首版有几处 anchor 落在空气或指错对象，经三个只读 subagent 分组审计 + 主 Agent 几何脚本独立核对后修正 5 处（教学文案文字均未改）：
  - `cell` 视图 `pcu｜每个节点沿 ±x/±y/±z 六方向连接`：anchor `[0,-0.62,0]`（晶胞内空气、无节点）→ 真实角节点 `[0.88,0.88,0.88]`，六条连接臂正从此 pcu 节点辐射。
  - `cell` 视图 `虚线末端｜跨晶胞继续连接`：anchor `[0.5,0.86,0]`（悬空）→ 该角节点 +y 周期虚线的真实末端 `[0.88,1.20,0.88]`。
  - `covalentNetwork` 视图 `BDC²⁻｜线性二连接体`：anchor `[0,0.36,0]`（误落苯环上沿、与「苯环刚性间隔」语义重叠）→ 连接体几何中心 `[0,0,0]`（两端 node 连线对称轴），引线沿主轴外推体现整体线性跨度。
  - `covalentNetwork` 视图 `羧酸根接入节点`：anchor `[-0.79,0,0]`（仅在羧酸氧上、未触节点）→ 羧酸氧 `[-0.79]` 与节点 `[-1.04]` 连线中点 `[-0.91,0,0]`，正压在 O→node 半透明衔接键上。
  - `coordination` 视图 `整个 SBU：六连接方向`：anchor `[0,-0.76,0]`（仅 −y 单一连接末端、不足以代表六方向）→ 近核连接臂 `[0,-0.30,0]`，引线由辐射源附近出发暗示六方向。
  - 其余锚点（`金属簇节点`/`有机连接体`/`Zn₄O 核心`/`单个 Zn：O 四配位`/`苯环刚性间隔`/`孔隙体积`/`客体分子`/`counting` 两处）经审计确认已准确落在文案所述对象上，保持不变。build/lint/冒烟 6/6 复跑通过。
- **扩展进度**：
  - **Mxene（T-012，2026-07-26，commit `2c5615a`）**：`MxeneCell.tsx` 7 处**指向具体结构**的恒显 `<Html>` 换为 `CalloutLabel`——comparison 视图 3（MAX 前驱体 / 二维片层 / Al 层）、coordination 2（C 中心 / Ti₆ 八面体）、covalentNetwork 1（混合端基）、interlayerForce 1（层间水）。保留 5 处不指向单一结构的全局说明（工艺流程「选择性移除 Al + 剥离」、辅助线说明、堆叠标题、剖面推导、通式）与整个 `counting`（`FormulaScene` 全是化学式推导）为原 `<Html>`。`Al 层` 因所在块在场景左侧且 `scale=0.72`，`offset` 朝远离场景中心方向放大补偿。新增 `tests/visual/mxene-callout.visual.spec.ts`（chrome 通道 4/4，覆盖上述 4 个 viewMode 的 7 处标签）。build/lint/test:logic(56/56) 通过。
  - **Ren3（T-013，2026-07-26，commit `9e3e464`）**：`Ren3Cell.tsx` 3 处**指向具体结构**的恒显 `<Html>` 换为 `CalloutLabel`——covalentNetwork 2（`N₃ 单元｜N1–N2–N1` 锚点落折线中心原点、`两条短 N–N 距离 ≈ 1.36 Å` 锚点落原点→端基 N1 的键中点）、coordination 1（`Re 中心｜7 个 N 最近邻` 锚点落中心 Re 原点）。其余标签经逐 scene 核对均为「全局说明/场景标题/门控」，保留 `<Html>`：pressure 全部（`Imm2-ReN₃` 标题、压力窗口 widget、免责）、cell 全部（晶胞标题、晶格参数、a/b/c 轴标签、门控位点）、covalentNetwork 折线单元免责 + 门控位点、coordination 七配位澄清 + 门控计数、polyhedron 全部（`ReN₇ 多面体` 场景标题、网络总结、门控色注）、counting 全部（计数 widget、化学式单位、力学总结、Wyckoff 免责）。HANDOFF 曾粗估「~14」把门控/全局全算进去；按 MOF-5/MXene「只转指向具体结构的恒显标签」标准，实际符合的是 3 处。新增 `tests/visual/ren3-callout.visual.spec.ts`（chrome 通道 2/2，覆盖 covalentNetwork/coordination 的 3 处标签）。build/lint/test:logic(56/56) 通过。
  - **MetalClosePacking（T-014，2026-07-26，commit `547482b`）**：与前三个 viewer 不同，本 viewer 的标签是**彩色徽章 `LayerBadge`**（5 种 tone 配色呼应层色、固定屏幕字号、多数已放在结构旁），不是裸 `<Html distanceFactor>`。经用户确认「只转真正指向结构的少数几个」，只把 4 个**压在结构上**的徽章换为 `CalloutLabel`：layer 视图 1（`A 层｜同层 6 个最近邻` 锚点落层中心原点）、coordination 视图 3（`同层 6`/`上层 3`/`下层 3` 各自锚点落对应配位原子组的代表位置 `sameLayer[0]`/`upperLayer[0]`/`lowerLayer[0]`）。把徽章 span 抽成共享 `BadgeSpan`，让引线标签**保留 tone 配色**（这是本 viewer 的教学语言）。保留为徽章的：所有标题（`FCC｜4 个 M`/`HCP｜6 个 M`/`HCP｜ABAB`/`FCC｜ABCABC`）、总结（`合计配位数 12`/`共同：配位数 12｜η≈74%`）、StackingScene 的 `A/B/C 层`（算下来在 `[-1.55,y,-0.88]`、xz 距原点 ≈1.78 > 层半径 1.58，已在层外侧不遮挡）、门控 `FocusLabel`。新增 `tests/visual/metal-close-packing-callout.visual.spec.ts`（chrome 通道 2/2，覆盖 layer/coordination 的 4 处标签）。build/lint/test:logic(56/56) 通过。
  - **Pba（T-015，2026-07-26，commit `f3f4984`）**：`PbaCell.tsx` 2 处**指向具体结构**的恒显 `<Html>` 换为 `CalloutLabel`——coordination 视图 1（`六配位方向` 锚点落 `OctahedralGuide` 八面体中心原点，即六配位辐射源）、voids 视图 1（`□ 空位`/`空位/水合` 锚点落 `VacancyMarker` group 局部原点，即空位中心）。其余标签经逐 scene 核对保留 `<Html>`：`节点-桥-节点`（comparison 视图 `FrameworkComparisonGuide`，描述整个「节点-桥-节点」连接概念的总结、非单一锚点结构，且已在晶胞底面下方，与 MOF-5 保留「两类构筑单元周期连接 → 开放框架」同判据）、`PbaAtom` 的 `showLabels` 门控原子标签（走原逻辑）。新增 `tests/visual/pba-callout.visual.spec.ts`（chrome 通道 2/2，覆盖 coordination/voids 的 2 处标签；voids 需切到「六氰空位」阶段才渲染空位标记）。build/lint/test:logic(56/56) 通过。
  - **Graphite（T-016，2026-07-26，无代码改动）**：逐 scene 核对 `GraphiteCell.tsx`，其唯一 3D `<Html>` 是 `LayeredHexAtom` 里受 `showLabel` 门控的原子标签（`中心 C·sp²`/`相邻 C`/`C·上层` 等，默认关，按既定标准保留原逻辑）；所有恒显说明（原子/键/层间弱作用/π 电子云图例）都在 `LayeredHexLegend` 这一 **DOM 图例**里、不遮挡 3D 结构。无恒显、压在结构上的场景标签，因此**无需转换**。这与 MetalClosePacking「按标准逐条判定、别被粗估带跑」一致。
  - **ZnS（T-017，2026-07-26，无代码改动）**：`ZnSPolytypeCell.tsx` 与 MetalClosePacking 同为**彩色徽章 `LayerBadge`** 系统。逐 scene 核对全部恒显徽章：所有场景标题（`闪锌矿｜ABCABC`/`纤锌矿｜ABAB`/`闪锌矿｜ABC`/`ZnS₄｜Zn 配位数 4` 等，位于 `[0,±1.1~1.36,0]`，晶胞/堆叠结构 y 半高 ≈0.5~0.79，标题本就在结构上方）、所有总结（`Zn 占一半四面体空隙`/`共同：Zn 4 配位｜S 4 配位`/`都化简为 ZnS`/空位阶段徽章，位于底部 `[0,-1.x,0]`）、以及 StackingScene 的 `${layer}层` 徽章（`[-1.5,y,-0.9]`、xz 距原点 ≈1.75 > 层半径 1.58，已在层外侧）均不遮挡；指向具体结构的 `FocusLabel`（`Zn`/`S`/`${center}中心`/位点元素）全部受 `showLabels` 门控。无恒显、压在结构上的场景标签，**无需转换**。
  - **ZincMetal（T-018，2026-07-26，commit `cac0e90`）**：`ZincMetalCell.tsx` 亦为 `LayerBadge` 系统。逐条核对 `CountingLabels` 4 个恒显计数徽章：`顶角：12×1/6=2`（`[1.18,0.78,0]` 六方半径 0.95 外）、`面心：2×1/2=1`（`[0.2,1.02,0.42]` 半高 0.75 上方）、`合计：6`（`[0,-1.05,0]` 底部总结）均不遮挡，保留徽章；只有 `内部：3×1=3`（原 `[0.12,0.2,-0.82]`：xz 距原点 0.83 < 六方半径 0.95、y 0.2 在半高 0.75 内）正压在 3 个内部 B 层 Zn 上——换为 `CalloutLabel`，锚点落真实内部原子 `unit-inner-3 [0,0,-0.548]`、沿 −z 上方外推。徽章 span 抽成共享 `BadgeSpan`（`LayerBadge` 与引线标签共用）保留 tone 配色。`CoordinationCluster`/`LayerPlane` 的层标签本就放在平面边缘 `[radius+0.12,...]`（外围）、`HcpPackingPatch` 的 A/B 层标签在 `[1.x,...]`（外围）、原子标签受 `showLabels` 门控，均保留。新增 `tests/visual/zinc-metal-callout.visual.spec.ts`（chrome 通道 1/1）。build/lint/test:logic(56/56) 通过。
  - **BaTiO3（T-019，2026-07-26，commit `a52cf62`）**：`BaTiO3Cell.tsx` 用裸 `<Html distanceFactor>`。逐 scene 核对，把 2 处**指向具体结构、压在结构上**的恒显场景导引标签换为 `CalloutLabel`：`polyhedron` 视图的 `O—O 轮廓·非化学键`（`OctahedronGuide`，原 `[0.42,-0.46,0.34]` 落在八面体内，顶点 ±0.5；锚点落八面体中心原点、外推到右下前方）、`aSiteCoordination` 视图的 `Ba²⁺·中心`（`BaCoordinationCluster`，原 `[0,0.21,0]` 正压在中心 Ba 球上，radius 0.115；锚点落中心原点、外推到左上方越过 ±0.5 的近邻壳）。保留为 `<Html>`：`12 个最近邻 O²⁻`（cluster 底部 `[0.42,-0.58,0.42]` 的总结）、`originShift` 的原点平移全局说明、以及受 `(showLabels || counting)` 门控的代表原子标签（`CrystalAtom` 的原子标签系统，走原逻辑）。新增 `tests/visual/batio3-callout.visual.spec.ts`（chrome 通道 2/2，覆盖 polyhedron/aSiteCoordination 各 1 处）。build/lint/test:logic(56/56) 通过。
  - **全部 9 个 viewer 处理完毕**：转换 6 个（MOF-5/MXene/ReN₃/MetalClosePacking/Pba/ZincMetal 各转部分标签、BaTiO3 转 2 处），评估无需转换 2 个（Graphite/ZnS——标签本就受门控或已在结构外围）。引线标签系列收口。

## D-017 ZnS / ZincMetal viewer 纯几何计算下沉到 `*Geometry.ts`（T-004）

- **日期**：2026-07-26（Claude Code，commit `4f5d707`）
- **决定**：沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 的既定范式，把 `ZnSPolytypeCell.tsx`（816 行）与 `ZincMetalCell.tsx`（744 行）里**无 React / R3F 副作用**的纯几何计算抽到两个新模块：
  - `znsPolytypeGeometry.ts`：`createCubeEdges(half)`（立方晶胞 12 棱）、`createWurtziteCellEdges()`（纤锌矿六方胞 12 棱）、`tetrahedronNeighborPositions`（四面体 4 近邻）、`tetrahedronEdgeIndices`（6 棱索引对）。
  - `zincMetalGeometry.ts`：`ZnSiteKind` / `ZnVisualAtom` / `HcpLayer` / `HcpPackingAtom` 类型，六方晶胞尺寸与堆积基矢常量，`bottomCorners`/`topCorners`/`unitCellAtoms`（17 个 Zn 位点）、`sameLayerNeighbors`/`coordinationCluster`（1 中心 + 12 近邻）、`cellEdges`（六方棱柱 18 棱）、`electronPoints`、`generateHexLayer()`、`hcpLayerPatch`（ABAB 三层）。
- **留在 viewer 的**：颜色常量、相机预设（`getCameraPreset`）、教学文案（`getDisplaySummary`/`getVoidStageBadge`）、标签/高亮逻辑（`getAtomLabel`/`getHighlightColor`）——这些是表现层，不属于几何。
- **理由**：把可单测的坐标/边/位点生成与渲染分离，降低两个大 viewer 的体积，并给几何逻辑加回归护栏。是「大晶胞几何计算下沉」搁置项的落地，不改任何 JSX、交互或相机行为。
- **验证**：新增 `tests/logic/crystal-geometry.logic.spec.ts` 8 项（棱数/端点/对称/位点计数/层错位等，输入输出类型明确）；`npm run test:logic` 由 56 → **64** 通过；build / lint 通过；ZincMetal 浏览器冒烟（chrome 通道）仍 1/1，证明渲染行为不变。
- **约束/后续**：本次只搬「纯几何」，未动 viewer 结构与教学语义。若后续要进一步瘦身，可考虑把 `SulfurPackingLayer` 等仍在 viewer 内的几何辅助也下沉，但需同样保持零 React 副作用。

## D-018 前后端结构数据去重：先立防漂移契约，锁结构核心、保留教学文案各自演进（T-005）

- **日期**：2026-07-26（Claude Code，commit `fd67aca`）
- **决定**：不引入数据库、构建期代码生成或运行时读取，先落地**最低风险的防漂移契约测试**（方案 A），并写设计文档 `docs/BACKEND_DATA_SYNC.md` 记录真源边界与后续方案。前端 23 个手写 JSON 仍是唯一真源，后端 `molecules.js` 只读映射其中 6 条。
- **调研依据**：逐字段比对确认，5 个 VSEPR 分子（ch4/nh3/h2o/co2/bf3）的结构核心 `id/kind/formula/names/nameZh/category/atoms/bonds/lonePairs` 前后端**逐字一致**，仅教学文案（`summaryZh`/`lessonSteps`/`keyAngles`/`rendering`）漂移；`nacl` 是**有意的教学简化**（后端 15 原子简化胞、无 `crystalTeaching`；前端 27 原子完整胞）。
- **契约范围**：`data-parity.test.js` 在测试期用 `readFileSync` 相对读取前端 JSON（方向单一：后端测试读前端，前端不依赖后端），逐字断言 5 个分子的结构核心；nacl 只断言「双方都存在且为 crystal」，注释说明其为有意简化、不参与相等契约。教学文案**不**纳入契约——允许后端文案与前端各自演进。
- **理由**：符合 AGENTS.md「后端保持简单只读、先设计后实现」；用可执行护栏把「结构漂移」变成会红的测试，而不改动任何已服务的数据、不加依赖、不牵动前端构建。
- **后续**：若将来要彻底单源，按 `docs/BACKEND_DATA_SYNC.md` 的方案 B（构建期从前端 JSON 生成后端数据）推进；本条只锁结构核心不动文案。

## D-019 有机拼装实验室教学正确性修复：渲染角度与标注一致、官能团按优先级单遍判定（T-021）

- **日期**：2026-07-27（Claude Code）
- **提交**：`d6ea076` 化学/几何、`c940c33` 命名、`45485b8` 状态与交互、`e8169cb` 视觉与测试（2026-07-28 按本条分组拆分提交）
- **背景**：用户要求全面检查 `/lab/organic-builder/:seedId` 页面的过渡动画、美观性与功能问题。三路只读审查（主 Agent 负责 UI/交互层，两个子 Agent 分别审查化学状态逻辑与命名/键角逻辑）共发现 7 项会向学生展示**错误化学事实**的 P0 缺陷，全部经主 Agent 逐行核对源码确认。
- **决定**：本轮只修「教学正确性 + 关键交互可用性」，把纯视觉打磨与 3D 动画补间留作后续任务（见 TASKS T-022/T-023）。

**修复的教学正确性问题（各自的取舍）**：

1. **`BENT_DIRECTIONS` 分量写反**（`organicBuilderChemistry.ts`）：原 `[0.79,±0.61,0]` 点积 +0.252 → 实际夹角 75.4°，而键角标签写 ≈104.5°。改为 `[0.61,±0.79,0]`（≈104.7°）。**判据**：以键角标注为准反推方向向量，因为标注值是教材值。
2. **双双键碳（CO₂ 型）摆成 120°**：`getSuggestedPosition` 原来只判断"有没有双键"。改为数双键个数，`hasTriple || doubleBondCount >= 2 → LINEAR_DIRECTIONS`。与 `organicBuilderGeometry.ts` 已有的「两邻居 + 2 个双键 → 180° sp」判定对齐。
3. **不饱和醇/酮/胺中文名丢失烯/炔**（`organicBuilderNomenclature.ts`）：中文分支原来只用 `rootZh`，英文分支却用含不饱和词干的 `stemEn`，导致丙烯醇中文显示"丙-1-醇"（另一个真实分子的名字）。新增 `stemZh = hasUnsaturation ? unsaturated.zh : rootZh` 与英文对齐。
4. **不饱和多元醛中英文都错**：`butane-1,4-dial` 这类。按 acid 分支既有的守卫风格，改为 `hasUnsaturation` 时返回 undefined 走 unsupported 兜底。**取舍**：宁可拒绝命名也不给错名，符合 `ORGANIC_BUILDER_NAMING_SCOPE.md` 总则。
5. **最长链解析失败时静默降级**：原来较短母链能在长路径全失败时胜出，输出违反"最长碳链"规则的名称。改为比较成功候选的 `parentLength` 与过滤后路径集合的最长长度，短于则返回 unsupported。**注意**：基准必须是**按 `requiredCarbonIds` 过滤后**的集合，否则会误伤「2-丙基戊-1-醇」这类主官能团优先的正确降链（该用例有既有测试锁定）。
6. **官能团检测重构为带优先级的单遍判定**：原实现无条件对每个 C=O 加"羰基"、对每个含 H 与 C 的 O 加"羟基"，导致乙酸同时报"羰基+羟基+羧基"（"乙酸含羟基"是高考典型错误表述）。改为先认领羧基/酯基/醛基，再让羰基/羟基/醚键跳过已认领的原子；并补 C≡N→氰基、C–O–C→醚键、C(=O)–O–C→酯基。卤代结构增加"另一端必须是 C"的要求（HCl 不再报卤代）。
7. **凯库勒式苯环报"碳碳双键"**：与同屏"π 电子离域、六键等价"文案冲突，且会强化"苯能因加成使溴水褪色"的错误概念。新增 `findAromaticRingBondKeys` 识别六元全碳环 + 环内交替单双键，命中时整体报"苯环（芳香环）"并抑制环内 C=C。**边界**：稠环/桥环不识别为苯环，环内 C=C 仍按普通碳碳双键报告。
8. **小环键角标注**：`organicBuilderGeometry.ts` 原来对环丙烷的 C–C–C 标 ≈109.5°（真实约 60°），而 `chooseRepresentativeNeighborPair` 恰好优先选中环内两个 C。改为检测代表邻居对之间是否存在直接键或同处 3–5 元小环，命中则跳过该中心的标注。**取舍**：跳过而非改标实际角度——本模块的定位是"按局部成键环境匹配典型教学值"，不是量化计算。

**其他修复**：片段 ID 前缀唯一性（原 `nextBuilderId` 只查 `fragment-1` 是否被占用，但入库的是 `fragment-1-c`，导致第二个片段必然冲突、"两片段拼乙酸"直接不可用）、`reset` 保留撤销历史、seedId 变化时路由层 `key` 强制重挂载、暂存槽位避让已占用位置、无碳分子 H 优先（NH₃ 不再显示 "H3N"）、吸附预览接入 `canSetBond` 预检、旋转视角不再清空选中、`isDirty` 加廉价短路避免每次渲染跑指数级图同构。

- **验证**：`npm run build` 通过（含 `tsc --noEmit`）；`npm run lint` 通过；`npm run test:logic` **80 / 80 通过**（原 64 + 新增 `organic-builder-fixes.logic.spec.ts` 16 项）。新增甲苯词典条目时同步更新了 T-001 表驱动测试的独立中文名期望表（该表有"与词典 ID 一一对应"的断言，漏改会红 7 项）。
- **一并落地（原属 T-022）**：本批实际还完成了片段拼接的旋转对齐与模板内部键角重写——10 个模板坐标按各自杂化重写并统一到 `getStylizedBondLength` 标尺，`addFragment` 用新增的 `rotateVectorBetween`（`anchorDirection` → 真实母体方向）替代纯平移。此前本条与 TASKS 记为「未做」是文档滞后于代码，已于 2026-07-28 核对修正。详见 D-020。
- **未做**：3D 场景补间动画、双键圆柱朝向相机、视觉 token 化收尾。见 TASKS T-023。

## D-020 键长标尺统一：改摆位来源沿用局部键长，而非重写种子坐标（T-022 收尾）

- **日期**：2026-07-28（Claude Code，commit `b06c653`）
- **背景**：T-022 剩余项是「统一样式化键长标尺」。核实后发现问题范围比原记录（只提苯种子 C–H）更广：**四个种子分子的键长各自都偏离 `getStylizedBondLength` 标尺**——苯 C–H 0.66、乙烯 1.09、乙炔 1.10、共面综合模型约 0.45，重原子间键也各不相同。共同症状是把任一 H 拔下再吸附回去，`getSuggestedPosition` 按常数 0.92 摆放，它会比同分子其余同类键明显长/短一截。
- **决定**：**不改任何种子坐标**，改在 `getSuggestedPosition` 的落点来源——新增 `resolveBondLength`，优先沿用分子里同类键（先看同一中心原子上的同类键，再退回全分子同类键的中位数）的现有长度，都没有才用样式化常数。
- **取舍与理由**：
  - 三个种子（苯 / 乙烯 / 乙炔）同时被模块 viewer（`BenzenePlanarCell` / `EthylenePlanarCell` / `AcetyleneLinearCell`）复用，改种子坐标会牵动 `benzene-planar-*` / `acetylene-linear-*` / `organic-builder-ethylene` 等 Darwin 快照。Windows 无基线、不得更新，改坐标属于「本机无法验证的破坏性改动」。改摆位来源则**零快照暴露**。
  - 从零拼装（分子内无同类键）时 `resolveBondLength` 回退到样式化常数，行为与改动前完全一致；因此只影响「拔下再接」这一路径，不影响新建。
  - 加了退化值防御：参考键长被夹在 `[0.35, 2]`，避免手工构造的重叠/超长原子把摆位带偏。
- **验证**：新增 2 项 logic 回归（`organic-builder-fixes.logic.spec.ts`：拔下的 H 吸附回去沿用分子键长标尺、从零拼装仍用样式化标尺）；`test:logic` 80 → **82 通过**；build / lint 通过；浏览器行为回归（`PLAYWRIGHT_CHANNEL=chrome`）跑了拼装页 10 个无截图用例（含拔下 / 撤销流程）全绿，未触碰 3 个带快照的用例。
- **约束**：这是「样式化教学标尺」下的一致性修复，不是真实键长（真实 C–H≈1.09 Å、C–C≈1.54 Å 的相对比例并未建模）。键长匹配仍服务于视觉一致，不代表定量正确。

## D-021 T-023 范围修正与 3D 补间收尾：共享位置表 + 退场残影 + 显示层分子式（T-023）

- **日期**：2026-07-28（Claude Code，commits `f42f076` / `4d698ed`）
- **背景**：接手 T-023 时逐项 git 考古发现，TASKS 待办描述已过时——`e8169cb`（T-021 第 4 个提交）实际已包含 7 个子项中的 4 个半（原子入场缩放与位置补间、双/三键偏移面旋向相机、toast 退出延迟卸载、浮层错峰入场、自定义确认弹窗，且两个浏览器 spec 已改用自定义弹窗按钮），当时的 docs 提交没有意识到工作区里混入了这批实现。真正缺失的是：删除退场、键角弧过渡、3D 补间的 reduced-motion、信息面板高度过渡、分子式排版统一，以及一个伴生缺陷——原子补间途中键先跳到最终几何、约 200ms 与原子脱开。
- **决定与取舍**：
  1. **键跟随用共享位置表，而不是把键改成 state 驱动重渲染**：原子 useFrame（优先级 **-1**）每帧把实际显示位置写入 `Map<atomId, Vector3>`，键 useFrame（默认 0）读端点、每帧更新 group 变换（圆柱改单位长度 + `scale.y` 表达键长）。-1 优先级是关键：R3F 按订阅顺序执行 useFrame，后挂载的键会排在原子后面，若不显式排序，拖拽时键会滞后原子一帧。表条目不清理——按 id 覆盖写、体量极小，删除后的残值还作为退场残影的位置来源。
  2. **退场残影不用透明材质**：被删原子「缩没」、被删键「向轴并拢变细」（scale 归零后卸载），避免 transparent 材质的深度排序伪影；残影禁用 raycast，不挡背后可点部件；撤销把同 id 部件加回来时立即清掉对应残影，防实体与残影同屏。
  3. **键角弧过渡靠给共享 `AngleArc` 加可选 `opacity` prop**（默认 1，未传时渲染与原来逐位一致），而不是复制一份拼装页专用的弧组件。淡入淡出由拼装页本地的 presence 管理器驱动，退场淡到 0 才卸载。其余 3 个调用点（Benzene/Ethylene/MoleculeViewer）不传该 prop，Darwin 快照零暴露。
  4. **reduced-motion 在 3D 侧必须 JS 显式处理**：motion.css 的全局 `prefers-reduced-motion` 兜底只作用于 DOM（toast/浮层/弹窗/信息面板已被覆盖），R3F 画布内补间不吃 CSS，需在 useFrame 内直接落位并跳过残影/淡入淡出。
  5. **信息面板条件区块「退场动画结束后才真正卸载」**：`CollapsibleSection`（grid-rows 0fr↔1fr + 透明度）在收拢期间保留最后一份非空内容，340ms 后置 closed 卸载——既有浏览器断言 `toHaveCount(0)` 依靠 Playwright 自动重试保持成立，无需改测试语义；区块间距（pt-4）放进收拢内容内部，折叠不留双倍空隙；首挂载即打开不播动画，避免与整页浮层入场叠加。
  6. **分子式只在显示层转下标**：新增纯函数 `formatFormulaSubscripts`（ASCII 数字 → Unicode 下标，无数字输入原样返回、幂等），`getFormula` 保持 "C2H4" 式 ASCII 输出——教学词典比较、既有 8 处 `getFormula` logic 断言都依赖 ASCII，动它属于高风险零收益。
- **验证**：`npm run build`（含 `tsc --noEmit`）、`npm run lint` 通过；`npm run test:logic` **83 / 83**（原 82 + formatter 回归 1 项）；`PLAYWRIGHT_CHANNEL=chrome` 拼装页无截图用例 **10 / 10**（含分子式下标断言、键角区块收拢/展开、拔下+撤销、确认弹窗、reduced-motion 入场）。
- **已知暴露**：InfoPanel 分子式改下标会让 `organic-builder-ethylene` / `organic-builder-mobile-info` 两张 Darwin 快照在 macOS 漂移（预期内，接手前 HANDOFF 已预告）；键圆柱单位长度 + scale.y 数学上与原渲染等价，macOS 回归时一并目检。
- **教训（补进流程）**：TASKS 的范围描述可能滞后于代码——本轮与上轮（T-022「只有苯不一致」实为四个种子全不一致）连续两次出现同类漂移，方向相反（这次是「记为未做、实际已做」）。接手任何任务先 `git log -S` 核对关键符号的落地情况，再定范围。

## D-022 生产 3D 分包交回 Rollup 自动处理，并用生产预览锁定首页边界（T-024）

- **日期**：2026-07-28（Codex，commit `f151bfb`）
- **决定**：
  - 删除 `vite.config.ts` 中对象式 `manualChunks: { three, r3f }`，不立刻改成更复杂的函数式分包或引入新依赖。
  - 保留 `modulePreload: false`、React Router 路由 lazy、`prefetchViewerChunks` 的 hover/focus/idle 入口；这些机制分别控制加载时机，本轮不混在一起重写。
  - 新增 `playwright.production.config.ts` 与 `npm run test:production`，用真实 `vite preview` 运行既有无截图预取回归；开发态 Vite 测试继续保留，分别覆盖源码模块图与生产 bundle 图。
- **理由**：对象式 `manualChunks` 会把指定包的依赖一并吸入 chunk。实际构建中共享 React/JSX 运行时进入 `r3f`，导致入口 `index` 静态导入 `r3f`，继而静态导入 `three`；首页因此下载 1223.80 KB JS（gzip 349.10 KB）。删除该规则后，首页只请求 356.80 KB 的 `index`（gzip 114.66 KB），重型依赖图移到按需的 `ThreeViewerFrame` chunk。旧配置下生产回归 1/3 失败、修复后 3/3 通过，证明这是依赖图问题，不是仅凭警告推测。
- **取舍**：自动分包后的 `ThreeViewerFrame` 为 845.42 KB（gzip 227.97 KB），单文件警告比原 `three` 688 KB 更大，但首页不再请求它。当前优化目标是课堂首屏的真实加载边界，不是让 Vite 控制台零警告。若未来有证据证明 3D 直达仍不可接受，再单独评估函数式 chunks / `onlyExplicitManualChunks`；不要恢复会吸收共享运行时的对象式规则。
- **验证与边界**：1.6 Mbps、150 ms、4× CPU 下 5 次冷启动，首页中位 2825 → 1491 ms，CH₄ 直达 Canvas 5124 → 4377 ms；预取后点击到 Canvas 1300 ms，比直达快 70.3%，无运行时错误。直达仍略高于 4 秒门槛，因此下一步候选是加载反馈或预取时机，不在本条继续拆 Viewer、改路由或改公共 API。

## D-023 根 README 采用项目原生 SVG + 真实界面证明，不用无依据的仓库徽章（T-025）

- **日期**：2026-07-29（Codex）
- **提交**：`5350ef2 docs: add project readme and visual showcase`
- **决定**：
  - 根 README 的首屏使用可维护的静态 SVG：色彩直接取 `DESIGN_SYSTEM.md` token，视觉主体取 CH₄ 正四面体、109.5° 键角与“观察—切换—讲解”流程，不使用通用网格、AI 光效或与化学无关的装饰。
  - hero 后立即放真实产品截图；首页和 NH₃ 复用现有 UI 重构截图，有机拼装页从当前代码重新采集，确保 `C₂H₄` 下标与片段库和现状一致。
  - README 只放可核实的静态技术栈徽章。仓库没有 CI workflow、正式部署地址和 `LICENSE` 文件，因此不展示“build passing”、在线演示或开源许可证徽章，并在正文明确许可证现状。
  - 命令、路径、产品边界和测试说明保留为 Markdown；SVG 只承担身份、层级和空间结构示意，图片失效时 README 仍可理解和使用。
- **理由**：公开仓库首页首先需要让学生、教师和开发者看懂“这是做什么的”并看到真实成果。项目原生几何比模板化 banner 更可信；把易变命令和范围写在 Markdown 中，也比写死在图片里更易维护。
- **验证**：skill 自带 README audit 通过；4 个本地图片引用与 SVG 基础结构有效；hero 用系统 Chrome 在 900px / 360px 两种 GitHub 宽度渲染，无裁切；全部本地链接存在。

## D-024 仓库采用标准 MIT License，版权持有人使用 GitHub 仓库所有者名称（T-026）

- **日期**：2026-07-29（Codex）
- **提交**：`84a504e docs: license project under MIT`
- **决定**：
  - 根 `LICENSE` 使用 SPDX 标识 `MIT` 的标准许可证文本，仅把可替换版权行填写为 `Copyright (c) 2026 A7m0spHere`。
  - README 使用静态 MIT 徽章并链接到本地 `./LICENSE`；正文只提示保留版权与许可声明，不添加超出许可证文本的额外限制。
  - 不改 `frontend/`、`backend/`、`video/` 的 `private` package metadata，也不为许可证任务触碰各自 lockfile。
- **理由**：用户已明确选择 MIT。仓库所有者名称是当前可核实、可公开对应的版权主体标识；根许可证足以声明整个仓库的默认授权范围，子项目 metadata 可在未来发布 npm package 时再单独规划。
- **验证**：许可证标题、版权行、授权条款与免责声明完整，无占位符；README 的 MIT 徽章唯一且本地许可证链接有效；`git diff --check` 通过。
