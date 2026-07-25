# PROJECT_STATUS.md

> 项目当前状态快照。供 Claude Code / Codex 每次开工前快速了解全局。
> 最后更新：2026-07-25（Claude Code，T-006 模块卡片按意图预取 3D 资源）

## 一句话定位

Chem3D Learn / 结构化学 3D 学习站 —— 面向中国高中生和化学教师课堂演示的前端优先 3D 结构化学学习网站。详见 `docs/PROJECT_BRIEF.md`。

## 技术栈（已核实）

- **frontend/**（主产品）：Vite 6 + React 18 + TypeScript 5（strict）+ Tailwind CSS 3 + shadcn/ui + React Three Fiber 8 + Drei 9 + three 0.170 + react-router-dom 7。测试使用 Playwright。
- **backend/**：纯 `node:http`，零运行时依赖，只读 GET API；要求 Node.js `>=20`，测试使用内置 `node:test`。
- **video/**：独立的 Remotion 4 演示视频子项目，使用 React 19，依赖树与前端隔离。

## 已核实的产品与代码现状

- 前端路由包含 Home / Modules / ModuleDetail / Paths / Exam / ExamTopicDetail / About / OrganicBuilder。
- `frontend/src/components/three/` 当前有 44 个源码文件（37 个 `.tsx` + 7 个 `.ts`），其中 24 个 `.tsx` 是直接包含 R3F `Canvas` 的主 Viewer。
- 真实 3D 内容覆盖 VSEPR 核心分子、多个晶胞与空隙模型、σ/π 键和杂化轨道、有机共面/乙烯/苯/乙炔、有机拼装实验室等专题。
- `frontend/src/data/manual/` 下有 23 个已跟踪 JSON，并全部在 `mockMolecules.ts` 注册。模块目录、考试专题和专项教学数据还分布在 `frontend/src/data/*.ts`。
- `organicBuilderNomenclature.ts` 为 1894 行；`organicBuilderChemistry.ts` 中 `knownOrganicMolecules` 当前是 **17 个**。
- `ModuleDetailPage.tsx` 的专题控制状态已按组下沉到 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls` 三个 typed hook（各自管理默认值与切模块重置）；页面只保留讲解步骤、VSEPR 开关、有机拼装过渡与 `viewerLoading` 等自留状态，并继续通过 `deriveViewerKind` / `viewerRegistry` 统一分发 viewer、toolbar、panel。
- 后端提供 `/health`、`/api/molecules`、`/api/molecules/:id` 及 `/api/structures` 别名，共 6 条独立手写结构数据；前端当前没有调用后端 API。
- `video/` 配置为 1950 帧、30 fps，即 65 秒演示视频。

## 当前工作区状态（重要）

2026-07-25 T-001 测试提交 `e15d592` 完成后，工作区仍有以下前序改动没有收口：

- `frontend/package-lock.json` 有 39 行 npm 平台元数据删除，是否保留为**待确认**。
- `.tmp-npm-cache/` 未跟踪、约 10.8 MB，且当前未被 `.gitignore` 覆盖；不得提交。

`CLAUDE.md` 与 `docs/DECISIONS.md` 已在 T-000 提交 `6a5361e` 中交付；Windows 环境治理补充已在 `0bd9b58` 中交付。T-001 没有混入 lockfile、缓存或业务引擎改动。

## 独立验证结果（2026-07-25）

- `frontend npm run build`：**通过**；Vite 转换 2313 个模块。T-008 后 `/module/:id` 改为路由级 lazy，`index` 主包由约 496 KB 降至约 209 KB（gzip 137 KB → 67 KB），页面与 23 个 JSON 移入独立 `ModuleDetailPage` chunk（约 286 KB）。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**51 / 51 通过**；其中 T-001 新文件 28 项，原有文件 23 项。
- `backend npm test`：**15 / 15 通过**（原 5 项纯函数 + T-BE-001 新增 10 项真实 HTTP 集成）。
- `frontend npm run test:visual -- --list`：发现 **16 个文件、117 个用例**（含 T-002 无截图复位回归 5 项、T-006 无截图预取回归 `prefetch-viewer-chunks.visual.spec.ts` 3 项）。
- T-002 复位回归（系统 Chrome 通道，无截图）：**5 / 5 通过**，覆盖晶体 / 普通分子 VSEPR / 杂化 / 有机平面 / σ 键。
- T-006 预取回归（系统 Chrome 通道，无截图）：**3 / 3 通过**，覆盖首页初始不下载 3D chunk、hover 卡片后预取页面与 viewer chunk、预取后点击仍正常进入并渲染。
- 视觉基线：共 **80 张，全部为 `*-darwin.png`**；Windows/Linux 基线为 0。
- 默认 Playwright 冒烟测试：**失败**，缺少 `chromium_headless_shell-1228`。
- 设置 `PLAYWRIGHT_CHANNEL=chrome` 后，同一无截图冒烟测试：**1 / 1 通过**。
- T-ERR 自定义故障注入（系统 Chrome）：
  - 正常 CH₄ 模块：Canvas 1、fallback 0。
  - 首次中断 `MoleculeViewer` lazy 请求：显示 `role="alert"` fallback，并记录边界错误。
  - 键盘 Enter 触发“重新加载页面”：同一路由重新加载后 Canvas 1、fallback 0。
  - 错误态下通过 SPA 切换到 NaCl：Canvas 1、fallback 0，证明 `resetKey` 路由复位有效。
- 完整视觉回归：**未运行**，因为当前只有 macOS 基线。
- `video/`：`node_modules` 未安装，本轮未运行 lint、构建或渲染。

T-008 路由级 lazy 后，`index` 首屏主包从约 496 KB 降到约 209 KB（gzip 137 KB → 67 KB）；`ModuleDetailPage` 连同 23 个 JSON 移入约 286 KB 的独立页面 chunk，仅访问 `/module/:id` 时下载。构建仍存在 Vite 非阻断警告：`three` chunk 约 688 KB，超过默认 500 KB 提示阈值。其在课堂弱网/旧设备上的实际影响为**待确认**。

## 正在进行

（暂无。）

## 最近完成

- **T-006 模块卡片按意图预取 3D 资源**（2026-07-25）
  - `lib/prefetch.ts` 的 `prefetchViewerChunks` 在原有 `MoleculeViewer`（three/r3f）预热外，新增 `import("@/pages/ModuleDetailPage")`，与 T-008 lazy 路由指向同一页面 chunk；保留 `warmed` 单次守卫，未改 `ModuleCard`（hover/focus）与 `ModulesPage`（idle）调用点。
  - 补齐 T-008 后「hover 只预热 three/r3f、页面 chunk 仍等点击」的预取缺口：hover/focus/idle 现在把进入模块所需的全部按需资源一次预热到位。
  - 新增无截图回归 `tests/visual/prefetch-viewer-chunks.visual.spec.ts`（chrome 通道 3 / 3）：首页初始不下载 three/r3f 或页面 chunk、hover 后预取页面与 viewer chunk、预取后点击仍正常进入并渲染。
- **T-008 ModuleDetailPage 及 23 个 JSON 移出首屏主包**（2026-07-25）
  - `router.tsx` 把 `/module/:id` 从静态 `element` 改为 React Router 数据路由的 `lazy` 属性（与 `OrganicBuilderPage` 同款），删除静态 `import`。
  - `ModuleDetailPage` 连同它唯一消费的 `mockMolecules.ts` 与 23 个手写 JSON 从 `index` 主包移入独立页面 chunk：首屏主包 496 KB → 209 KB，页面 chunk 约 286 KB，仅访问 `/module/:id` 时下载。
  - 构建产物核对：`index` 已不含 JSON 教学文案（如「甲烷以碳原子为中心」「钙钛矿」），页面 chunk 承载它们。数据消费逻辑、viewer 分发与教学文案零变化；reset 回归在 chrome 通道仍 5 / 5 通过。
- **T-002 拆解 ModuleDetailPage 专题状态**（2026-07-25）
  - 新增 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls` 三个 typed hook，各自持有专题状态、setter、派生 handler 与 `useEffect([moduleId])` 切模块重置。
  - `ModuleDetailPage` 不再逐项维护全部专题状态的长重置列表；两处 id 依赖初始值（ren3 → `pressure`、`getDefaultBondingBasicsMode`）随 hook 迁移。`deriveViewerKind` / `viewerRegistry` 分发语义与教学文案零变化。
  - 新增无截图回归 `tests/visual/module-state-reset.visual.spec.ts`：用页面底部相关卡片做 SPA 跳转（页面保持挂载、只变 `:id`），抽查晶体 / 普通分子 / 杂化 / 有机平面 / σ 键各一条切模块复位，chrome 通道 **5 / 5 通过**。
- **T-003 后端启动失效与畸形 URL 崩溃修复**（2026-07-25）
  - `npm start` 启动守卫改用 `pathToFileURL(process.argv[1]).href` 比较，修复 Windows 下 `import.meta.url` 与拼接 `file://` 永不相等导致的“进程立即退出、端口无监听”P0。
  - 新增 `parseRequestPathname`，把 `decodeURIComponent`（`/%`、`/%zz`）与 `new URL`（`//`、`///`）两类由 `request.url` 触发的异常收敛为 400 `MALFORMED_REQUEST_URL`，不再冒泡成未捕获异常终止进程。
  - `server.listen` 增加 `error` 监听（如端口占用），失败时打印信息并置非零 exitCode，而非抛未捕获异常。
  - 新增 `test/server.integration.test.js`：用 `createServer()` 起真实 HTTP 服务，覆盖真实监听、三类畸形 URL 返 400 且进程存活、CORS 头、OPTIONS 204 与非 GET 405。
- **T-001 已知有机分子全量回归测试**（2026-07-25，commit `e15d592`）
  - 新增独立表驱动测试，直接遍历 `knownOrganicMolecules`；词典新增或删除条目时用例数量自动同步。
  - 用独立中文名期望表校验全部当前词典 ID，并逐项断言 `findKnownMolecule` 返回精确 `id` / `nameZh`。
  - 补充词典顺序、原子/键数组顺序、图 ID、坐标和键端点顺序不变性。
  - 新增丙炔/丙二烯同分异构、编号方向、官能团优先级、醚母体选择和卤素最低位次五类未覆盖边界。
- **T-000 AI 协作规范交付收口**（2026-07-25，commit `6a5361e`）
  - `CLAUDE.md` 与 `docs/DECISIONS.md` 已纳入版本控制，治理交付未混入 lockfile 或 npm 缓存。
- **T-ERR ViewerErrorBoundary 收口与行为验收**（2026-07-25，commit `bade1aa`）
  - 3D viewer 的 `Suspense` 已由错误边界保护。
  - `resetKey={id}` 已验证可在 SPA 切换到其他 Viewer 时清除错误态。
  - 重试从“只清 React state”改为明确的整页重新加载，能为 `React.lazy` 创建新的模块加载上下文。
  - fallback 增加 `role="alert"`，按钮支持键盘 Enter，视觉检查符合浅色课堂风格。

## 下一步（按优先级，见 docs/TASKS.md）

1. 拆解 `ModuleDetailPage` 的 33 个状态，并补跨模块切换的状态重置回归测试。
2. 评估 `ZnSPolytypeCell.tsx` / `ZincMetalCell.tsx` 的纯几何计算下沉。
3. 设计前后端结构数据去重方案，保持前端手写数据为真源。

## 已知风险

- `ViewerErrorBoundary` 的重试会重新加载整个页面，而不是只重建 3D Canvas；这是为绕开 `React.lazy` 缓存拒绝 Promise 的可靠最小方案。
- React Error Boundary 只能捕获后代组件的渲染、构造和生命周期错误；不能覆盖事件处理、普通异步回调、服务端渲染、边界自身错误，以及所有 R3F 动画帧故障。
- 23 个 JSON 通过 `as unknown as MoleculeRecord` 接入，绕过了静态结构核验，当前没有运行时 schema / 引用完整性测试。
- `backend/src/molecules.js` 与前端 6 个核心 JSON 重复，存在数据漂移风险。
- `createBrowserRouter` 的生产静态托管需要 SPA history fallback；当前仓库没有正式部署配置。
- 当前有两处显式化学待核实项：
  - `mockMolecules.ts` 的 BF₃ 缺电子表述。
  - `caf2.json` 的约 5.46 Å 晶胞参数。
- HANDOFF 曾记录 npm 安装报告 4 个漏洞（1 中危、3 高危），本轮未联网重跑 `npm audit`，所以该数字仍为**待确认**。

## 其他待确认

- 是否需要创建根 README；当前根目录和 `frontend/` 均无 README。
- `docs/ROADMAP.md` 的 v1.0 RC 计划与实际实现如何对应。
- 前端与视频未声明 Node `engines`，最低支持版本待确认。
- 正式部署平台、缓存策略和 SPA fallback 配置待确认。
