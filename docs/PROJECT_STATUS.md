# PROJECT_STATUS.md

> 项目当前状态快照。供 Claude Code / Codex 每次开工前快速了解全局。
> 最后更新：2026-07-26（Claude Code，T-014 用 CalloutLabel 扩展金属密堆积 viewer 徽章）

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

- 工作区干净，与 `origin/main` 同步。引线标签扩展逐 viewer 提交：T-011 MOF-5（`fb6ceec`）、T-012 MXene（`2c5615a`）、T-013 ReN₃（`9e3e464`）、T-014 金属密堆积（`547482b`）；T-010 原子图例（`d18b785`）亦已提交。此前 HANDOFF/STATUS 记录的「T-010/T-011 尚未提交、等用户确认」已过时，实际已按当时建议分 commit 落地。
- `frontend/package-lock.json` 的 npm 平台元数据（rollup linux 包的 `libc` 字段）问题已在 T-007 收口：升级只保留 5 个包的版本变化，13 处被 npm 剥离的 `libc` 元数据已按 HEAD 原值还原，lockfile diff 无平台元数据噪声。
- `.tmp-npm-cache/` 已加入根 `.gitignore`（`d759f94`），不再出现在 `git status`；仍不得提交。
- `CLAUDE.md` 与 `docs/DECISIONS.md` 已在 T-000 提交 `6a5361e` 中交付；Windows 环境治理补充已在 `0bd9b58` 中交付。

## 独立验证结果（2026-07-25）

- `frontend npm run build`：**通过**；Vite 转换 2313 个模块。T-008 后 `/module/:id` 改为路由级 lazy，`index` 主包由约 496 KB 降至约 209 KB（gzip 137 KB → 67 KB），页面与 23 个 JSON 移入独立 `ModuleDetailPage` chunk（约 286 KB）。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**56 / 56 通过**；含 T-009 新增有机片段测试 5 项（`organic-builder-fragments.logic.spec.ts`）。
- `backend npm test`：**15 / 15 通过**（原 5 项纯函数 + T-BE-001 新增 10 项真实 HTTP 集成）。
- `frontend npm audit`（T-007，联网复核）：修复前 **4 个漏洞**（1 moderate + 3 high）；非 `--force` 的 `npm audit fix` 后降至 **2 个 high**。已修：`brace-expansion` 5.0.7→5.0.8、`nanoid` 3.3.12→3.3.16、`postcss` 8.5.15→8.5.23、`react-router`(dom) 7.17.0→7.18.1，全在现有 caret range 内、不 breaking、不跨 React 18/19。剩余 2 个 react-router high 均为 SSR/RSC/CSRF 场景，本应用用 `createBrowserRouter`（纯客户端 SPA）不适用，且无更高稳定版可修（`--force` 只会降级到 7.11.0，倒退且破坏 caret，故不采用）。
- `frontend npm run test:visual -- --list`：发现多个文件（含 T-002 无截图复位回归 5 项、T-006 无截图预取回归 3 项、T-009 无截图片段冒烟 `organic-builder-fragments.visual.spec.ts` 2 项）。
- T-009 有机片段冒烟（系统 Chrome 通道，无截图）：**2 / 2 通过**，覆盖新片段按钮出现在工具箱、乙烯基拼接补氢成丙烯、氰基拼接价态完整。
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

- **T-014 用 `CalloutLabel` 扩展金属密堆积 viewer 徽章（第二批，扩展第 3 个）**（2026-07-26，commit `547482b`）
  - 与前两个 viewer 不同：`MetalClosePackingCell.tsx` 用的是带 tone 配色的徽章 `LayerBadge`（非裸 `<Html distanceFactor>`），配色是这个 viewer 的教学语言。按用户选择「只转真正指向结构的少数几个」，只把 4 个**压在结构上、指向单一结构**的徽章改为引线标签：layer（`A 层｜同层 6 个最近邻` 锚点落层中心）1、coordination（`同层 6`/`上层 3`/`下层 3` 锚点各落对应配位原子组代表位置）3。
  - 保留标题（`FCC｜4 个 M`/`HCP｜6 个 M`/`HCP｜ABAB`/`FCC｜ABCABC`）、总结（`合计配位数 12`/`共同：配位数 12｜η≈74%`）及 StackingScene 已在层外侧的 `A/B/C 层` 徽章为原 `LayerBadge`。徽章 span 抽成共享 `BadgeSpan`，引线标签复用它以**保留 tone 配色**。未改几何、相机、门控 `FocusLabel`，未引新依赖。
  - 新增无截图回归 `tests/visual/metal-close-packing-callout.visual.spec.ts`（chrome 通道 2 / 2）：layer / coordination 两个 viewMode 下 4 处引线标签文案仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。build / lint / test:logic（56 / 56）通过。详见 D-016 扩展记录。
  - **待扩展**：其余 5 个 viewer（Pba/Graphite/ZnS/ZincMetal + BaTiO3 counting 徽章）待续，同一组件、各自单独提交。
- **T-013 用 `CalloutLabel` 扩展 ReN₃ viewer 引线标签（第二批，扩展第 2 个）**（2026-07-26，commit `9e3e464`）
  - 沿用同一 `CalloutLabel` 组件，把 `Ren3Cell.tsx` 中 3 处「指向具体结构」的恒显 `<Html>` 标签改为引线 + 外围标签：covalentNetwork（`N₃ 单元｜N1–N2–N1` 锚点落折线中心、`两条短 N–N 距离≈1.36 Å` 锚点落真实 N–N 键中点）2、coordination（`Re 中心｜7 个 N 最近邻` 锚点落中心 Re）1。
  - 保留其余「不指向单一结构」的全局说明、场景标题、`showLabels` 门控位点标签与 pressure/cell/polyhedron/counting 视图的标题·参数·免责·widget 为原 `<Html>`（与 MOF-5/MXene 同判据）。未改几何、图例、相机、教学文案文字，未引新依赖。
  - 新增无截图回归 `tests/visual/ren3-callout.visual.spec.ts`（chrome 通道 2 / 2）：covalentNetwork / coordination 两个 viewMode 下 3 处引线标签文案仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。build / lint / test:logic（56 / 56）通过。详见 D-016 扩展记录。
  - **待扩展**：其余 5 个 viewer（MetalClosePacking/Pba/Graphite/ZnS/ZincMetal + BaTiO3 counting 徽章）待续，同一组件、各自单独提交。
- **T-012 用 `CalloutLabel` 扩展 MXene viewer 引线标签（第二批，接 T-011）**（2026-07-26，commit `2c5615a`）
  - 沿用 T-011 的 `CalloutLabel` 组件，把 `MxeneCell.tsx` 中 7 处「指向具体结构」的恒显 `<Html>` 标签改为引线 + 外围标签：comparison（MAX 前驱体 / 二维片层 / Al 层）3、coordination（C 中心 / Ti₆ 八面体）2、covalentNetwork（端基示意）1、interlayerForce（层间水）1。
  - 保留 5 处「不指向单一结构」的全局说明为原 `<Html>`（工艺流程 →、辅助线说明、堆叠标题、剖面推导、层间距说明）；`FormulaScene`（counting）的化学式推导整块不动。未改几何、图例、教学文案文字，未引新依赖。
  - 新增无截图回归 `tests/visual/mxene-callout.visual.spec.ts`（chrome 通道 4 / 4）：4 个 viewMode 下引线标签文案仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。build / lint / test:logic（56 / 56）通过。详见 D-016 扩展记录。
  - **待扩展**：其余 6 个 viewer（Ren3/MetalClosePacking/Pba/Graphite/ZnS/ZincMetal + BaTiO3 counting 徽章）待 MXene 验证满意后用同一组件继续分 viewer 扩展、各自单独提交。
- **T-011 晶体 viewer 恒显场景标签改为「引线 + 外围标签」（第一批 MOF-5）**（2026-07-26，commit `fb6ceec`）
  - 新增共享组件 `components/three/CalloutLabel.tsx`：从锚点 `anchor` 沿 `offset` 外推出标签位置，用 drei `<Line>` 从锚点连一条 3D 引线到标签（与 `AngleArc` 同范式，端点随相机每帧重投影，不引新依赖），标签用 `<Html center distanceFactor>` 承载，引线末端留白避免戳进文字。
  - `Mof5Cell.tsx` 的 15 处指向具体结构的恒显 `<Html>` 标签改为 `CalloutLabel`（锚点落在其原本指向的结构中心，标签外推到结构外围留白），不再压在晶胞正中；保留 4 处「不指向单一结构的总结/化学式说明」与 1 处 `showLabels` 门控原子标签走原 `<Html>`。viewMode 分场景显示与教学文案文字零变化。
  - 附带修复：T-010 的 `NaClCell` 只落地了 `<CrystalAtomLegend>` 使用、漏了 import（Edit 伪影），build 在合并工作树里实际不通过；本轮补齐 import 后 build 恢复通过。
  - 新增无截图回归 `tests/visual/mof5-callout.visual.spec.ts`（chrome 通道 6 / 6）：各 viewMode 下引线标签文案仍可见，且标签中心相对 stage 中心明显偏移（验证「外推到外围」）；孔隙/客体逐阶段标签在场。详见 D-016。
  - **待扩展**：其余 8 个恒显标签密集的 viewer（Mxene/Ren3/MetalClosePacking/Pba/Graphite/ZnS/ZincMetal/BaTiO3 counting 徽章，合计 ~55 处）待 MOF-5 样板验证满意后用同一组件分 viewer 扩展、各自单独提交。
- **T-010 晶体 viewer 共享「原子球对照图例」（第一批 4 个核心晶体）**（2026-07-25）
  - 新增共享组件 `components/three/CrystalAtomLegend.tsx`：从 `molecule.atoms` 按元素去重取代表 label/颜色/半径，按真实相对大小 + 颜色渲染常驻脚注图例，挂 `ThreeViewerFrame` 的 `footerMeta`。铺到 `NaClCell`/`CsClCell`/`CaF2Cell`（新增）与 `BaTiO3Cell`（替换旧私有等大色点图例）。
  - 浮动原子标签维持 `showCrystalLabels` 默认关，图例常驻，二者互补。新增 `tests/visual/crystal-atom-legend.visual.spec.ts`（chrome 通道 4 / 4）。详见 D-015。
- **T-007 依赖安全与 lockfile 评估**（2026-07-25）
  - 联网复核 `npm audit`：4 个漏洞（1 moderate + 3 high）经非 `--force` 的 `npm audit fix` 降至 2 个 high。升级 `brace-expansion`/`nanoid`/`postcss`/`react-router`(dom)，全在 caret range 内、不 breaking、不跨 React 18/19。
  - lockfile 精修：保留 5 处版本升级，手工还原 npm 在 Windows 上剥离的 13 处 rollup linux 平台 `libc` 元数据，最终 diff 只含版本变化、零平台元数据噪声；`package.json` 未改动。
  - 剩余 2 个 react-router high 为 SSR/RSC/CSRF 场景，本应用纯客户端 SPA 不适用，无干净修复版本；不用 `--force`（只会降级到 7.11.0）。build/lint/logic(51/51)、SPA 路由与预取回归(8/8) 均通过。
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

1. 用同一 `CalloutLabel` 把其余 4 个 viewer（Pba/Graphite/ZnS/ZincMetal + BaTiO3 counting 徽章）分 viewer 扩展，各自单独提交。（MOF-5 = T-011、MXene = T-012、Ren3 = T-013、MetalClosePacking = T-014 已完成。）
2. 评估 `ZnSPolytypeCell.tsx` / `ZincMetalCell.tsx` 的纯几何计算下沉（T-004，搁置）。
3. 设计前后端结构数据去重方案，保持前端手写数据为真源（T-005，搁置）。

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
