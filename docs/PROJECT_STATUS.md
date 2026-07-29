# PROJECT_STATUS.md

> 项目当前状态快照。供 Claude Code / Codex 每次开工前快速了解全局。
> 最后更新：2026-07-29（Codex，T-028D Crystal Workspace 稳定化与上线验收）

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

- **T-027 已部署并推送**（2026-07-29，`6ada065` / `f31a6e3` / `67f5f94`）：正式公开站点为 `https://a7m0sphere.github.io/chem3D-learn/`。GitHub Pages 已设为 Actions 发布源，`deploy-pages.yml` 在 `main` 变化后安装前端依赖、运行 Pages 专用构建与 3 项产物测试，再发布 `frontend/dist`；首次 run `30400567495` 的 build / deploy 均成功。Vite 用 `/chem3D-learn/` 子路径构建，React Router 从 `%BASE_URL%` 生成的 `<base>` 读取 basename，`404.html` 负责保留并恢复直接访问的深层路由。README 已加入在线体验入口，`index.html` 已补 canonical、Open Graph / Twitter 元信息，社交图为 `frontend/public/og.png`。

- **T-026 已提交**（2026-07-29，`84a504e`）：新增根 `LICENSE`，采用 SPDX 标识为 `MIT` 的标准许可证文本，版权行为 `Copyright (c) 2026 A7m0spHere`；README 新增链接到 `./LICENSE` 的 MIT 徽章，并把许可证段落改为明确的 MIT 说明。未修改任何子项目依赖或 package metadata。

- **T-025 已提交**（2026-07-29，`5350ef2`）：新增根 `README.md`、`assets/readme/hero.svg` 与基于当前前端重新采集的 `assets/readme/organic-builder.png`。README 以真实界面截图开场，覆盖核心能力、快速开始、技术栈、项目结构、验证命令、产品边界与许可证现状；没有虚构在线演示、CI 状态或开源许可证。技能审计通过，SVG 已按 900px / 360px GitHub 宽度渲染目检。

- **T-024 已提交**（2026-07-28，`f151bfb`）：删除会吸收共享 React 运行时的对象式 `manualChunks`，生产首页不再静态下载 `r3f/three`；新增真实 `vite preview` 的无截图回归入口 `npm run test:production`。首页冷启动 gzip JS 349.10 → 114.66 KB，受限配置中位 2825 → 1491 ms。大 chunk 警告仍存在，但已移到按需的 `ThreeViewerFrame`，详见 D-022。

- **T-023 已提交**（2026-07-28，2 个代码 commit + 1 个 docs commit）：
  - `f42f076 feat(builder): finish 3d tweens with exit ghosts and reduced motion` —— 画布补间收尾（`OrganicBuilderCanvas.tsx`、`AngleArc.tsx` 加默认 1 的可选 `opacity`）
  - `4d698ed feat(builder): animate info panel sections and unify formula subscripts` —— 信息面板高度过渡与分子式下标（`OrganicBuilderInfoPanel.tsx`、`organicBuilderChemistry.ts`、3 个测试文件）
  - 接手时核对发现 TASKS 的 T-023 描述过时：7 个子项中 4 个半已随 T-021 的 `e8169cb` 落地（键级朝相机、toast 退出、错峰入场、确认弹窗、原子入场+位置补间）。本轮只补真正缺失的部分，详见 D-021。

- **T-021 已提交**（2026-07-28，按 D-019 分组拆成 4 个代码 commit + 1 个 docs commit）：
  - `d6ea076 fix(builder): correct bond geometry and functional-group detection` —— 化学与几何层（`organicBuilderChemistry.ts`、`organicBuilderGeometry.ts`、`types/organicBuilder.ts`、`organicBuilderSeeds.ts`、`tailwind.config.ts`）
  - `c940c33 fix(builder): keep chinese names consistent and refuse to guess` —— 命名层（`organicBuilderNomenclature.ts`）
  - `45485b8 fix(builder): make fragment assembly and undo actually usable` —— 状态与交互（`useOrganicBuilder.ts`、`ModuleDetailPage.tsx`、新增 `tests/logic/organic-builder-fixes.logic.spec.ts`）
  - `e8169cb fix(builder): surface live hints and tokenize overlay styles` —— 视觉与测试（`OrganicBuilderCanvas.tsx`、`OrganicBuilderPage.tsx`、Toolbox / InfoPanel、3 个测试文件）
  - `git diff --check` 对 `tailwind.config.ts` 报的 "space before tab in indent" 是该文件既有风格（shadcn 生成，HEAD 中每行都是两空格+制表符），非本次引入。
  - 提交过程中发现并修正了 TASKS.md 的一处事实错误：T-022 的前两项（模板坐标重写、旋转对齐）实际已在这批改动中落地，详见下方与 `docs/TASKS.md` T-022。

- `main` 已包含 Claude Code 的全站滚动滑入动画（`5f66b7a`）与 Codex 对接修复（`55c3dfc`）：Home / Modules / Paths / Exam / About / ExamTopicDetail 使用统一 `ScrollReveal`，ModuleDetailPage 的 3D Canvas 保持不动；Modules 分类区块间距已移到动画 wrapper，避免子 `section` 的 `last:` 因包装层变化而把每个区块都误判为末项。
- 工作区干净，与 `origin/main` 同步。**引线标签扩展系列已收尾**：转换类 T-011 MOF-5（`fb6ceec`）、T-012 MXene（`2c5615a`）、T-013 ReN₃（`9e3e464`）、T-014 金属密堆积（`547482b`）、T-015 PBA（`f3f4984`）、T-018 ZincMetal（`cac0e90`）、T-019 BaTiO3（`a52cf62`）；评估类 T-016 Graphite / T-017 ZnS 逐 scene 核对后判定**无需改动**（全部恒显标签均为标题/总结/门控/已在外围，无压在结构上的指向型恒显标签，见 D-016）。T-010 原子图例（`d18b785`）亦已提交。此前 HANDOFF/STATUS 记录的「T-010/T-011 尚未提交、等用户确认」已过时，实际已按当时建议分 commit 落地。
- `frontend/package-lock.json` 的 npm 平台元数据（rollup linux 包的 `libc` 字段）问题已在 T-007 收口：升级只保留 5 个包的版本变化，13 处被 npm 剥离的 `libc` 元数据已按 HEAD 原值还原，lockfile diff 无平台元数据噪声。
- `.tmp-npm-cache/` 已加入根 `.gitignore`（`d759f94`），不再出现在 `git status`；仍不得提交。
- `CLAUDE.md` 与 `docs/DECISIONS.md` 已在 T-000 提交 `6a5361e` 中交付；Windows 环境治理补充已在 `0bd9b58` 中交付。

## 独立验证结果（2026-07-29，T-027）

- `frontend npm run test:pages`：**3 / 3 通过**；验证 `/chem3D-learn/` 资源基路径、SPA `404.html` 路由恢复脚本和社交预览 PNG 已进入 Pages 产物。
- `frontend npm run test:sites`：**3 / 3 通过**；根路径 Worker 继续覆盖导航 fallback、静态资源直出和真实 404。
- `frontend npm run lint`：**通过**；`frontend npm run test:logic`：**83 / 83 通过**。
- 设置 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后运行 `npm run test:production`：**3 / 3 通过**。
- GitHub Actions run `30400567495`：build / deploy 均成功；真实系统 Chrome 直接访问首页、Modules、NH₃、乙烯拼装与晶胞均摊考试专题深层 URL，最终地址保持原路径、页面标题与 H1 正确、`pageerror` 为 0。
- 线上 `og.png`：HTTP 200、`image/png`、1,434,334 bytes。
- 保留既有 `ThreeViewerFrame` 845.42 KB / gzip 227.97 KB 非阻断警告；未运行或更新 Darwin 截图基线。

## 独立验证结果（2026-07-29，T-026）

- MIT 文本结构检查：标题、版权行、授权条款与 `AS IS` 免责声明均存在，且没有遗留 `<year>` / `<copyright holders>` 占位符。
- README 链接检查：MIT 徽章仅 1 处，`./LICENSE` 及其余 10 个本地资源 / 文档引用全部存在；旧“尚未包含 LICENSE”文案已清除。
- `git diff --check`：通过。
- 本任务仅改许可证、README 与治理文档，未改前端源码，因此按仓库规则未运行 `npm run build`。

## 独立验证结果（2026-07-29，T-025）

- `beautify-github-readme` 自带 `audit_readme.py`：**通过**；4 个本地图片引用与 SVG 基础结构均有效。
- 本地链接检查：hero、3 张真实界面图与 5 个文档链接均存在。
- `hero.svg`：用项目现有 Playwright + 系统 Chrome 按 900×315 与 360×126 两种 GitHub 显示宽度渲染，桌面与窄屏均无裁切；窄屏细节由紧邻 Markdown 提供等价说明。
- `organic-builder.png`：由当前 `/lab/organic-builder/ethylene-planar` 页面重新采集，等待 Canvas ready 且 `C₂H₄` 下标显示出现后截图；临时 Vite 服务与浏览器均已关闭。
- 本任务仅改文档与 README 静态资产，未改前端源码，因此按仓库规则未运行 `npm run build`。

## 独立验证结果（2026-07-28，T-024）

- `frontend npm run build`：**通过**（含 `tsc --noEmit`）；自动分包后 `index` 356.80 KB / gzip 114.66 KB，按需 `ThreeViewerFrame` 845.42 KB / gzip 227.97 KB，保留非阻断 large chunk 警告。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**83 / 83 通过**。
- 生产回归（设置 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后运行 `npm run test:production`）：旧配置 **1 / 3 失败**，修复后 **3 / 3 通过**；失败/修复项正是首页初始重型 3D 请求。
- 开发态定向预取回归（系统 Chrome、无截图）：**3 / 3 通过**。
- 受限配置 5 次冷启动：首页中位 2825 → 1491 ms；CH₄ 直达 Canvas 5124 → 4377 ms；预取后点击到 Canvas 1300 ms（比直达快 70.3%）；无 page/console error。
- Darwin 视觉回归：**未运行**；本任务无 UI 改动、未更新任何快照。

## 独立验证结果（2026-07-28，T-023）

- `frontend npm run build`：**通过**（含 `tsc --noEmit`）；保留既有 `three` chunk ~688 KB 非阻断警告。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**83 / 83 通过**（原 82 + 新增 `formatFormulaSubscripts` 回归 1 项）。
- 浏览器行为回归（`PLAYWRIGHT_CHANNEL=chrome`，排除 2 个含截图用例）：拼装页 **10 / 10 通过**（含分子式下标断言、键角区块收拢/展开、拔下+撤销、确认弹窗、reduced-motion 入场）。
- Darwin 视觉回归：**未运行**（Windows 无基线，不得更新）。已知 `organic-builder-ethylene` / `organic-builder-mobile-info` 两张快照会因分子式下标在 macOS 漂移，需 macOS 审核重算。
- 过程记录：本轮验证期间 Claude Code auto 权限模式的安全分类器（Anthropic 侧服务）一度不可用，无法执行 npm 命令；经项目所有者切换权限模式后恢复执行。属环境事件，与项目代码无关。

## 独立验证结果（2026-07-27，T-021）

- `frontend npm run build`：**通过**（含 `tsc --noEmit`）；保留既有 `three` chunk ~688 KB 非阻断警告。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**80 / 80 通过**（原 64 + 新增 `organic-builder-fixes.logic.spec.ts` 16 项）。
- 过程记录：首次运行 logic 测试有 7 项失败，全部源于新增甲苯词典条目未同步 T-001 表驱动测试的独立中文名期望表（该表有"与词典 ID 一一对应"断言）；补上期望表后全绿。**新增或删除 `knownOrganicMolecules` 条目时必须同步那张表。**
- 浏览器行为回归（`PLAYWRIGHT_CHANNEL=chrome`）：**未运行**。
- Darwin 视觉回归：**未运行**（Windows 无基线，不得更新）。

## 独立验证结果（2026-07-27，T-020）

- `frontend npm run build`：**通过**；Vite 转换 2322 个模块，保留既有 `three` chunk 约 688 KB 非阻断警告。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**64 / 64 通过**。
- `PLAYWRIGHT_CHANNEL=chrome` 定向运行 `scroll-reveal-layout.visual.spec.ts`：**1 / 1 通过**；逐个滚动触发 Modules 分类区块后，所有相邻分类仍保留至少 55px（设计值 56px）间距。
- 对接前浏览器探针确认回归事实：动画 wrapper 引入后四个分类 `section` 的计算下边距均为 `0px`，滚动完成后的中间区块间距为 0；修复后由新增回归用例锁定。
- 完整 Darwin 视觉回归未运行；Windows 仍不得更新现有 macOS 快照。

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

T-024 已确认旧 `three` 688 KB 警告背后存在真实生产回归：对象式 `manualChunks` 让首页静态下载 `r3f/three`。修复后首页只请求 `index`，3D 依赖图移到按需 `ThreeViewerFrame`。构建仍有 845 KB large chunk 警告，但它不再代表非 3D 页面会下载该资源；受限设备直达 CH₄ 仍需约 4.38 秒，属于下一阶段可评估的加载体验问题。

## 正在进行

- **Crystal Workspace / 晶体探索工作台（T-028 系列）**：面向初高中学生与化学爱好者的「数字化结构模型盒 + 科学探索工作台」。T-028A（NaCl 周期几何内核）/ A.1（坐标语义修正）/ B（周期 Viewer）/ C（粒子选择与第一配位层）/ D（稳定化、交互收尾与上线验收）均已完成；其他晶体接入、保存/分享/截图等高级能力未立项。

## 最近完成

- **T-028D Crystal Workspace 稳定化、交互收尾与上线验收**（2026-07-29 完成，分支 `feat/t-028d-crystal-workspace-stabilization`）
  - 保留 `Canvas key={size}` 与现有 `onPointerMissed`：系统 Chrome 实测证明尺寸切换能可靠重置相机、OrbitControls 拖拽不会误清选择；显式「退出选择」仍是清除主路径，不为本轮引入相机持久化。
  - `CrystalWorkspaceToolbar` 用 `fieldset/legend` 明确「观察范围 / 晶胞边框 / 当前选择」三组，窄屏独立换行；所有工作台按钮锁定 44px 触控高度，保留 `aria-pressed` 与原生键盘操作。
  - `NaClPeriodicCell` 为 R3F Canvas 外层语义容器增加辅助名称，为实例增加指针光标与轻度放大 hover 反馈；晶胞边框改用几何段稳定 id 作 key。移动端 Viewer 摘要与离子图例改为上下堆叠，390px 正文不再被图例挤窄。
  - `NaClPeriodicPanel` 增加受控 `aria-live` 精简播报、aside 名称与正确标题层级；第一配位数/最近邻/幽灵数量保持高优先级，内部显示身份降到摘要末位并改为课堂友好文案。
  - 浏览器回归新增真实 WebGL 边界副本网格点击、非零幽灵邻居、hover 命中、隔离后 OrbitControls 拖拽保持选择、四档无横向溢出、44px 触控目标、390px 摘要宽度与键盘切换。完整 Darwin 快照未运行、未更新。
  - 验证：build/lint 通过；logic 149/149；Chrome production 3/3、Crystal Workspace 4/4、模块状态重置 5/5、旧 NaCl Viewer 1/1。Pages 与线上深层路由结果见本轮最终交付报告。

- **T-028C NaCl 粒子选择与第一配位层隔离**（2026-07-29 完成，分支 `feat/t-028c-nacl-coordination-selection`）
  - 在 NaCl 周期探索 Viewer 中新增点击选择：点击任一显示离子选中**被点击的那个显示副本**（身份为 `siteId + periodicImageShift`，非仅 siteId），高亮中心 + 六个最近邻异号离子，六条虚线标示最近邻配位关系（非共价键），超出当前显示超晶胞的邻居用半透明幽灵粒子补齐。支持「仅看配位层」隔离与「退出选择」。
  - **Commit 1**（`a7fe1c6`）：`naclPeriodicGeometry.ts` 新增 `NaClDisplaySelection` / `NaClCoordinationDisplayAtom` / `NaClCoordinationDisplayCluster` 类型与纯函数 `buildNaClCoordinationDisplayCluster`（在 displayInstances 中精确匹配被点击副本 → `getNaClCoordinationImages` 取 canonical 六邻居 → 叠加 selectedShift 得 combinedShift → 幽灵判定基于「当前 displayInstances 是否含最终显示身份」）。新增 9 项 logic 契约。
  - **Commit 2**：`NaClPeriodicCell` 重构为完整可点击实例数组（不再用平行数组 + index 对齐，`<Instance>` 用稳定 id 作 key、携带完整身份）+ 聚焦覆盖层（中心放大发光、邻居轻度高亮、幽灵半透明线框、drei 虚线引导）；`useCrystalWorkspaceControls` 扩展 selectedDisplay/isolateCoordination（改尺寸/进出周期/切模块清除选择并关隔离，改边框不清除）；`CrystalWorkspaceToolbar` 选择存在时显示「仅看配位层」+「退出选择」；`NaClPeriodicPanel` 动态选择摘要；`ModuleDetailPage` 页面层 `useMemo` 生成 cluster 供 Viewer 与 Panel 共享；`crystal-workspace.visual.spec.ts` 新增粒子选择交互测试。
  - **关键区分**：选择身份 = `siteId + periodicImageShift`；被点击显示副本是配位 cluster 的空间中心；邻居最终 shift = selectedShift + neighbor periodic shift；幽灵判定基于当前 displayInstances 是否含最终显示身份（**不用 cellOffset，也不单用 neighbor.periodicImageShift**）；幽灵粒子与虚线不代表额外独立离子或共价键。
  - **明确未做**：拖动/删除/增加粒子、改晶胞参数、约束/自由模式、能量判断、保存/IndexedDB/分享/截图、晶面切片、相机状态持久化、其他晶体接入、教学 Viewer 改造、T-028D。
  - build/lint 通过；`test:logic` 149 通过（新增 9 项 cluster 契约）；Chrome `test:production` 3/3、`crystal-workspace` 交互 2/2、NaCl 教学摘要 1/1 通过。详见 D-028 与 HANDOFF。

- **T-028B NaCl 周期探索 Viewer**（2026-07-29 完成，分支 `feat/t-028b-nacl-periodic-viewer`）
  - 在现有 NaCl 教学模块中新增独立「周期探索模式」，与教材教学 Viewer（`NaClCell.tsx`，27 个边界展开位置）并存。教学模式完整保留，零回归（`crystal-viewer` 的 NaCl 文本断言、`module-state-reset` 仍通过）。
  - **Commit 1**（`5a44e30`）：`naclPeriodicGeometry.ts` 新增 `generateNaClDisplayInstances`（闭合正侧边界显示副本，数量 (2N+1)³ = 27/125/343）与 `generateNaClCellFrameSegments`（晶胞边框 hidden=0/outer=12/all=3N(N+1)²）；新增 20 项 logic 契约。
  - **Commit 2**：`NaClPeriodicCell.tsx`（Drei `<Instances>` 双组渲染，相机按 N 动态距离 + Canvas key 重置）、`useCrystalWorkspaceControls` hook、`CrystalWorkspaceToolbar`、`NaClPeriodicPanel`、`ModuleDetailPage` 接线（crystal-nacl 按 workspaceMode 分发 viewer/toolbar/panel，教学模式加「周期探索」入口不改 CrystalViewMode 联合类型）、`crystal-workspace.visual.spec.ts`（无截图交互测试 10 验证点）。
  - **关键区分**：8/64/216 是周期独立位点；27/125/343 是显示实例（含闭合正侧边界的周期镜像副本，不重复计入化学组成）。状态面板显式注明此区分。
  - 首页仍不下载 three/r3f chunk（`test:production` 3/3 通过，NaClPeriodicCell 独立懒加载 chunk）。
  - build/lint 通过；`test:logic` 140 通过；Chrome `test:production` 3/3、`crystal-workspace` 交互 1/1 通过。Windows 下其他晶体 Darwin 快照用例因无基线+Chrome 差异失败（既有平台限制，非本轮引入）。详见 D-027、D-026 与 HANDOFF。

- **T-028A.1 周期坐标语义修正**（2026-07-29 完成，分支 `feat/t-028a-nacl-periodic-kernel`，follow-up commit 不 amend/force push）
  - 修正 T-028A 两个影响 T-028B 晶胞边框与幽灵粒子的接口问题：
    1. **居中语义**：删除私有 `centerOffset = 1/4+(size-1)/2`（原使 canonical 平均值为零，导致晶胞体积偏离原点），改用 `centerFractional(fractional, size)`（size/2 偏移），居中晶胞空间范围（N=1 边界 `[-1,+1]`、N=2 `[-2,+2]`、N=3 `[-3,+3]`）。canonical 位点平均值不作为中心。
    2. **cellOffset 与 periodicImageShift 拆分**：原 `imageShift` 实为局部晶胞偏移，改为 `cellOffset`（邻居晶胞相对中心 cell 的局部偏移）+ `periodicImageShift`（canonical 位点到镜像的超晶胞周期平移，整数，非零=来自超晶胞外）。`fractional` 重命名为 `absoluteFractional`。T-028B 幽灵粒子只能据 `periodicImageShift !== [0,0,0]` 判断。
    3. 新增周期镜像可重建契约：`neighbor.cartesian ≈ canonical.cartesian + periodicImageShift * size * a`。
    4. `getNaClCoordinationImages` 加 `sites.length !== 8*size³` 一致性校验。
  - build/lint 通过；`test:logic` 109 → **120 通过**。详见 D-026（同决定追加修正记录）。

- **T-028A NaCl 周期几何纯函数内核 + 逻辑测试**（2026-07-29 完成，分支 `feat/t-028a-nacl-periodic-kernel`，commit `a48d65d`）
  - 新增 `frontend/src/components/three/naclPeriodicGeometry.ts`：基于 NaCl **常规立方晶胞**（非原胞）的 4 Cl⁻ + 4 Na⁺ 分数坐标基元，生成 N×N×N 超晶胞的独立周期位点（8·N³ 个，Na⁺:Cl⁻=1:1）与六配位周期镜像计算。区分 `NaClPeriodicSite`（独立位点）与 `NaClDisplayInstance`（显示镜像副本，只留类型边界）。不读 `nacl.json`、不接入旧 Viewer、不改教学模式。
  - 新增 `frontend/tests/logic/nacl-periodic.logic.spec.ts` 契约：位点计数（N=1/2/3 → 8/64/216）、id 与 (cell+basisIndex) 唯一、canonical fractional 去重、晶胞体积居中、配位六镜像（siteId+periodicImageShift 唯一、距离 a/2、±x±y±z 全覆盖、N=1 允许同 siteId 不同 periodicImageShift、边界完整六配位、不返回同号离子、canonical+周期平移重建）。
  - 配位用候选枚举法（中心 cell ±1 邻域内枚举异号子格子镜像，按距离 a/2 容差取最近邻），避免「晶胞内分数 0/½ 二分」在跨越 a/2 边界时把 ±x 误映射到同一基元位点。
  - build / lint 通过；`test:logic` 由 83 → **109 通过**。未运行 Darwin 视觉回归（无 UI 改动）。详见 D-026。

- **T-027 正式部署、SPA history fallback 与 README 在线入口**（2026-07-29 完成，提交 `6ada065` / `f31a6e3` / `67f5f94`）
  - GitHub Pages 作为正式公开托管；Actions 对 `main` 的前端变更自动执行 Pages 专用构建、产物契约测试与发布。
  - Vite 资源基路径、React Router basename 与 GitHub Pages 404 路由恢复协同工作；本地 / Sites 根路径构建保持 `/`。
  - README、canonical、Open Graph / Twitter 图片全部指向公开站点；新增项目原生社交预览图。详见 D-025。
- **T-026 采用 MIT License 并同步 README**（2026-07-29 完成，提交 `84a504e`）
  - 以 SPDX `MIT` 标准文本新增根许可证，版权持有人使用仓库所有者 `A7m0spHere`。
  - README 技术徽章区新增 MIT badge，并链接到仓库内 `LICENSE`；许可证段落改为明确的授权与保留声明提示。
  - 未修改 `frontend/`、`backend/`、`video/` 的 package metadata，避免为私有子 package 改写 lockfile。详见 D-024。
- **T-025 根 README 与项目原生视觉资产**（2026-07-29 完成，提交 `5350ef2`）
  - 采用 README mode 重建仓库首页：首屏使用从 CH₄ 正四面体、109.5° 键角和“观察—切换—讲解”学习流程提炼的静态 SVG hero，紧接首页、NH₃ 学习页与当前有机拼装页真实截图。
  - README 提供功能范围、快速开始、技术栈、数据流、目录结构、测试命令、产品边界、参与入口与许可证现状；明确前端无需后端即可运行，`frontend/` 与 `video/` 依赖树隔离。
  - 未添加无依据的 CI / license badge、在线演示地址、采用数据或功能承诺。详见 D-023。
- **T-024 修复生产首页提前加载 3D 依赖**（2026-07-28 完成，提交 `f151bfb`）
  - Hyperplan 审计确认旧入口静态导入 `r3f` 与 `three`；新增生产预览回归先在旧配置上复现 1/3 失败，再删除对象式 `manualChunks`，相同测试 3/3 通过。
  - 首页冷启动 gzip JS 349.10 → 114.66 KB（-67.2%）；受限配置首页中位 2825 → 1491 ms。路由 lazy、预取入口、`modulePreload: false` 与 UI 均保持不变。
  - 新增 `npm run test:production`，防止生产依赖图问题再被开发服务器测试漏过。详见 D-022。
- **T-023 有机拼装实验室 3D 补间动画与视觉收尾**（2026-07-28 完成，提交 `f42f076` / `4d698ed`）
  - **接手修正**：TASKS 待办描述与代码不符——7 个子项中 4 个半已随 T-021 的 `e8169cb` 落地（原子入场缩放+位置补间、双/三键偏移面旋向相机、toast 退出延迟卸载、浮层错峰入场、自定义确认弹窗与配套测试）。先 git 考古核实，再只做缺失部分（教训与 T-022 同款：接手先核对代码，别只信 TASKS）。
  - **本轮新做**：3D 补间遵守 `prefers-reduced-motion`（R3F 不吃 motion.css 的 CSS 兜底，需 JS 显式退化）；删除退场残影（原子缩没、键并拢变细，~200ms 后卸载，不用透明材质防排序伪影，撤销即清残影）；键跟随补间（共享 `animatedPositions` 表，原子 useFrame 优先级 -1 先写、键默认 0 后读，圆柱改单位长度 + scale.y，修掉吸附/撤销后键与原子约 200ms 脱开）；键角弧淡入淡出（`AngleArc` 加默认 1 的可选 `opacity`，其他 3 个调用点零变化）；信息面板键角/官能团区块 grid-rows 高度过渡（收拢保留旧内容、退场后才卸载保住 `toHaveCount(0)` 断言、间距移入收拢内容防双倍空隙）；分子式显示层统一下标（新增 `formatFormulaSubscripts`，`getFormula` 保持 ASCII，8 处浏览器测试期望同步更新）。
  - build / lint 通过；`test:logic` 82 → **83 通过**；chrome 通道拼装页无截图用例 **10 / 10 通过**。Darwin 视觉回归未运行；`organic-builder-ethylene` / `organic-builder-mobile-info` 两张快照将因分子式下标在 macOS 漂移，待 macOS 审核。详见 D-021。
- **T-021 有机拼装实验室教学正确性与交互修复**（2026-07-27 完成，2026-07-28 提交 `d6ea076` / `c940c33` / `45485b8` / `e8169cb`）
  - 三路只读审查（主 Agent 查 UI/交互/动画，两个子 Agent 查化学状态逻辑与命名键角逻辑），P0 结论全部逐行核对源码后才动手。
  - 修掉 **7 项会向学生展示错误化学事实的硬伤**：O 中心弯折角实际 75° 却标注 104.5°（方向向量分量写反）；CO₂ 型双双键碳摆成 120° V 形却标 180° 直线形（只判断有无双键、不数个数）；不饱和醇/酮/胺的中文名丢失"烯/炔"（丙烯醇显示为"丙-1-醇"，即另一种真实分子，而英文正确）；不饱和多元醛中英文都命名为饱和二醛；最长链解析失败时静默降级给出违反"最长碳链"规则的名称；羧基同时误报"羰基+羟基"、苯（凯库勒式）误报"碳碳双键"；三/四元环中心键角标 109.5°（环丙烷真实约 60°）。
  - 修掉**关键交互缺陷**：片段 ID 生成必然冲突（`nextBuilderId` 只查 `fragment-1`，实际入库 `fragment-1-c`），导致"用两个片段拼乙酸"这一最基本课堂流程直接不可用；吸附预览不做价键预检、失败时连拖动位移一起回弹；旋转视角松手误清空选中；沉浸模式下实时拖拽提示因传给不渲染的 `footerMeta` 而永不显示；Ctrl+Z 在按钮聚焦时被忽略；"恢复起点"清空撤销历史；seedId 变化不重置分子（`useReducer` 惰性初始化陷阱，改为路由层 `key` 重挂载）。
  - 顺带：官能团补齐氰基/醚键/酯基（自带 –C≡N 片段此前接上后面板空白）、HCl 不再报"卤代结构"、甲苯进入教学词典、NH₃ 分子式不再显示 "H3N"、`isDirty` 加廉价短路避免每次渲染跑指数级图同构、`shadow-overlay`/`accent-dark` token 化并清理 3 个 CSS 中根本不存在的死类名。
  - build / lint 通过；`test:logic` 由 64 → **80 通过**（新增 16 项针对本次每一条修复的回归）。浏览器行为回归与 Darwin 视觉回归**未运行**。
  - 同批还落地了原 T-022 的前两项：10 个片段模板坐标按各自杂化重写并统一到 `getStylizedBondLength` 标尺（甲基 H–C–H 现为 109.5°，非此前记录的约 70°），`addFragment` 用新增的 `rotateVectorBetween` 把模板 `anchorDirection` 旋转对齐到真实母体方向，不再是纯平移。
  - **未做**（当时写入 TASKS 的说法，后经 T-023 接手核对修正）：其中「双键圆柱朝向相机、确认弹窗统一、toast/错峰、原子入场补间」实际已随本批 `e8169cb` 落地，真正遗留的是删除退场、键角弧过渡、3D reduced-motion、面板高度过渡与分子式排版，均已由 T-023 完成（见 D-021）。
- **T-022 有机拼装实验室键长标尺统一**（2026-07-28 完成，提交 `b06c653`）
  - 原 T-022 的前两项（模板坐标重写、片段旋转对齐）已随 T-021 批次落地，本次收尾第 3 项：拔下的原子吸附回去时不再无条件用样式化常数 0.92，而是沿用该分子的局部键长标尺。
  - 核对时发现范围比原记录（只提苯 C–H = 0.66）更广：四个种子的键长都各自偏离 `getStylizedBondLength` 标尺（乙烯 C–H = 1.09、乙炔 1.10、共面综合模型约 0.45），根因相同——拔下再吸附会明显长/短一截。
  - 采用改 `getSuggestedPosition` 而非改种子坐标的方案：`resolveBondLength` 先取同一中心原子上的同类键长，退回全分子同类键中位数，都没有才用样式化常数。**关键取舍**：不改任何种子坐标，因此不触碰共享这些种子的模块 viewer（`BenzenePlanarCell` / `EthylenePlanarCell` / `AcetyleneLinearCell`）的 Darwin 快照——Windows 无基线、不得更新。从零拼装时分子内本就全是常数长度，行为不变。
  - build / lint 通过；`test:logic` 由 80 → **82 通过**（新增 2 项：拔下原子沿用局部标尺、从零拼装仍用样式化标尺）；`PLAYWRIGHT_CHANNEL=chrome` 定向跑无截图的拼装页浏览器用例 9 + 1 通过（含拔下/撤销流程）。Darwin 视觉回归未运行（Windows 无基线）。
- **T-020 对接 Claude Code 全站滚动滑入动画并修复 Modules 分类间距**（2026-07-27，commits `5f66b7a` + `55c3dfc`）
  - Claude Code 将 Home / Modules / Paths / Exam / About / ExamTopicDetail 的整页进入动效统一为 `ScrollReveal`，首页 Hero 使用分层错峰滑入；ModuleDetailPage 的 3D Canvas 未包入动画，避免影响 R3F 布局。
  - Codex 独立审查与系统 Chrome 实测发现：`ModulesPage` 新增 wrapper 后，原 `section` 上的 `last:mb-0` 会对每个 wrapper 内唯一子元素都生效，导致分类间距归零。现将间距放到 `ScrollReveal` 外层，并根据 `visibleSections` 判断末项，筛选后同样正确。
  - 新增无截图回归 `tests/visual/scroll-reveal-layout.visual.spec.ts`；build / lint / logic 64 / 64 / Chrome 1 / 1 均通过。
- **T-005 前后端结构数据去重方案（先设计 + 防漂移契约）**（2026-07-26，commit `fd67aca`）
  - 逐字段比对确认：5 个 VSEPR 分子（ch4/nh3/h2o/co2/bf3）的结构核心 `id/kind/formula/names/nameZh/category/atoms/bonds/lonePairs` 在前后端**逐字一致**，只有教学文案漂移；`nacl` 是**有意的教学简化**（后端 15 原子、无 `crystalTeaching`，前端 27 原子完整胞）。
  - 新增设计文档 `docs/BACKEND_DATA_SYNC.md` + 防漂移测试 `backend/test/data-parity.test.js`（测试期读前端 JSON 逐字断言结构核心，nacl 只断言存在且为 crystal）。`backend npm test` 15 → **22 通过**；前端零改动、不依赖后端。详见 D-018。**至此 backlog 全部收口。**
- **T-004 ZnS / ZincMetal viewer 纯几何计算下沉到 `*Geometry.ts`**（2026-07-26，commit `4f5d707`）
  - 沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 范式，新增 `znsPolytypeGeometry.ts`（`createCubeEdges` / `createWurtziteCellEdges` / 四面体近邻与棱索引）与 `zincMetalGeometry.ts`（Zn 位点类型、六方晶胞与堆积常量、`unitCellAtoms` / `coordinationCluster` / `cellEdges` / `generateHexLayer` / `hcpLayerPatch` 等），把两个大 viewer（816 / 744 行）里无 React/R3F 副作用的纯几何计算搬出。颜色、相机预设、教学文案、标签/高亮逻辑仍留 viewer。
  - 新增 `tests/logic/crystal-geometry.logic.spec.ts` 8 项（棱数/端点/对称/位点计数/层错位），`test:logic` 由 56 → **64** 通过；build/lint 通过；ZincMetal 浏览器冒烟仍 1/1，渲染行为不变。详见 D-017。
- **引线标签系列收官：Graphite/ZnS 评估无需改动，ZincMetal/BaTiO3 完成扩展**（2026-07-26）
  - **T-016 Graphite（无需改动）**：`GraphiteCell.tsx` 唯一的 3D `<Html>` 是 `showLabels` 门控原子标签（按既定标准保留），全部说明在不遮挡 3D 的 DOM 图例 `LayeredHexLegend`；没有恒显、压在结构上的场景标签。按标准逐条判定，无可转对象，不产生代码改动。
  - **T-017 ZnS（无需改动）**：`ZnSPolytypeCell.tsx` 所有恒显 `LayerBadge` 均为场景标题（结构上方 y≈1.2）、总结（下方 y≈-1.3）或 `${layer} 层`（在 `[-1.5,y,-0.9]`、xz≈1.75 > 层半径 1.58，已在层外侧），与金属密堆积保留的 A/B/C 层徽章同判据；指向结构的 `FocusLabel` 均受 `showLabels` 门控。无压在结构上的恒显场景标签，不产生代码改动。
  - **T-018 ZincMetal（commit `cac0e90`）**：`ZincMetalCell.tsx` 的 `CountingLabels` 4 个徽章中，只有 `内部：3×1=3`（原 `[0.12,0.2,-0.82]`，xz 距原点 0.83 < 六方半径 0.95、y 在半高 0.75 内，压在 3 个内部 B 层 Zn 上）改为 `CalloutLabel`，锚点落真实内部原子 `unit-inner-3 [0,0,-0.548]`。顶角/面心（上方外侧）、合计（底部总结）及 `LayerPlane` 边缘标签保持徽章。徽章 span 抽成共享 `BadgeSpan` 保留 tone 配色。新增 `tests/visual/zinc-metal-callout.visual.spec.ts`（chrome 通道 1/1）。
  - **T-019 BaTiO3（commit `a52cf62`）**：`BaTiO3Cell.tsx` 2 处压在结构上的恒显场景导引 `<Html>` 改为 `CalloutLabel`——`O—O 轮廓·非化学键`（`OctahedronGuide`，锚点落八面体中心原点，即 O—O 轮廓辐射源）、`Ba²⁺·中心`（`BaCoordinationCluster`，锚点落中心 Ba 原点）。保留 `12 个最近邻 O²⁻`（配位簇下方总结）、`OriginShiftGuide` 原点平移说明（全局注解）与 `CrystalAtom` 门控/计数原子标签为原 `<Html>`。新增 `tests/visual/batio3-callout.visual.spec.ts`（chrome 通道 2/2）。build/lint/test:logic(56/56) 通过。**至此 9 个 viewer 的引线标签系列全部处理完毕。**
- **T-015 用 `CalloutLabel` 扩展 PBA viewer 引线标签（第二批，扩展第 4 个）**（2026-07-26，commit `f3f4984`）
  - 沿用同一 `CalloutLabel` 组件，把 `PbaCell.tsx` 中 2 处「指向具体结构且压在结构上」的恒显 `<Html>` 标签改为引线 + 外围标签：coordination（`六配位方向`，`OctahedralGuide` 锚点落八面体中心原点、外推到上方）1、voids（`□ 空位`/`空位/水合`，`VacancyMarker` 锚点落空位中心局部原点）1。
  - 保留 comparison 的 `节点-桥-节点`（`FrameworkComparisonGuide` 里描述整个框架连接概念的总结说明，无单一锚点结构、且已在晶胞底面下方，与 MOF-5 保留的「周期连接 → 开放框架」同判据）与 `showLabels` 门控原子标签为原 `<Html>`。未改几何、图例、相机、教学文案文字，未引新依赖。
  - 新增无截图回归 `tests/visual/pba-callout.visual.spec.ts`（chrome 通道 2 / 2）：coordination / voids 两个 viewMode 下 2 处引线标签文案仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。build / lint / test:logic（56 / 56）通过。详见 D-016 扩展记录。
  - **待扩展**：其余 4 个 viewer（Graphite/ZnS/ZincMetal + BaTiO3 counting 徽章）待续，同一组件、各自单独提交。
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

T-028A/A.1/B/C/D 已全部完成。本轮不擅自选择下一阶段；以下候选均未立项，动手前由用户确认：

1. 评估把周期探索能力扩展到 CsCl 等其他晶体；每种晶体必须有自己的配位 cluster 生成器，不能复用 NaCl 的“异号六配位”假设。
2. 针对受限设备下 CH₄ 直达 Canvas 中位约 4.38 秒，先评估最小加载反馈或预取时机调整；不要仅为消除 Vite 警告恢复对象式 vendor 拆分。
3. 在 macOS 环境跑完整 Darwin 视觉回归，审核 T-023 的 2 张预期漂移与 T-028D 工作台视觉变化；Windows 不更新基线。
4. 化学待核实项收口：BF₃ 缺电子表述、CaF₂ 晶胞参数，以及 NaCl 最近邻距离/方向的 `TODO-CHEM-VERIFY`。
5. 若要彻底单源前后端数据，按 `docs/BACKEND_DATA_SYNC.md` 方案 B 推进。

已收口的历史优先项（仅供追溯）：
- 引线标签扩展系列（T-011~T-019）**已全部收口**：MOF-5/MXene/ReN₃/MetalClosePacking/PBA/ZincMetal/BaTiO3 已按标准转换恒显遮挡标签；Graphite（T-016）与 ZnS（T-017）逐条核对后判定**无需改动**。
- ZnS / ZincMetal 纯几何计算下沉（T-004）**已完成**（commit `4f5d707`）：新增 `znsPolytypeGeometry.ts` / `zincMetalGeometry.ts` + 8 项 logic 测试。
- 前后端数据去重（T-005）**已完成**（commit `fd67aca`）：设计文档 `docs/BACKEND_DATA_SYNC.md` + 防漂移契约测试，backend 22/22 通过。

## 已知风险

- `motion.css` 当前按产品主人既有选择，在 `prefers-reduced-motion: reduce` 下仍让首页 Hero 与 `ScrollReveal` 播放 1100ms 过渡。这与常规“减少动态效果”预期不同，属于已知可访问性取舍；未经确认不要擅自改回全局禁用。
- `ViewerErrorBoundary` 的重试会重新加载整个页面，而不是只重建 3D Canvas；这是为绕开 `React.lazy` 缓存拒绝 Promise 的可靠最小方案。
- React Error Boundary 只能捕获后代组件的渲染、构造和生命周期错误；不能覆盖事件处理、普通异步回调、服务端渲染、边界自身错误，以及所有 R3F 动画帧故障。
- 23 个 JSON 通过 `as unknown as MoleculeRecord` 接入，绕过了静态结构核验，当前没有运行时 schema / 引用完整性测试。
- `backend/src/molecules.js` 与前端 6 个核心 JSON 重复。T-005（commit `fd67aca`）已加防漂移契约测试：5 个 VSEPR 分子的结构核心逐字锁定，漂移即测试变红；教学文案与 nacl 简化胞的差异是**有意保留**的（见 `docs/BACKEND_DATA_SYNC.md`），未做构建期单源生成。
- GitHub Pages 不提供可配置的服务端 history rewrite；当前 `404.html` 会在真实浏览器中保留原路径并跳转回 SPA，因此用户直达可用，但非 JavaScript 客户端看到的首个深层 URL HTTP 响应仍是 404。若未来需要所有深层 URL 原生返回 200 或更强 SEO，应改用支持服务器 rewrite 的公开托管。
- 自动分包后的按需 `ThreeViewerFrame` chunk 约 845.42 KB（gzip 227.97 KB），仍触发 Vite large chunk 警告；首页已不下载它，但受限设备直接进入 CH₄ 的 Canvas 中位约 4.38 秒，略高于 4 秒目标。
- 当前有两处显式化学待核实项：
  - `mockMolecules.ts` 的 BF₃ 缺电子表述。
  - `caf2.json` 的约 5.46 Å 晶胞参数。
- HANDOFF 曾记录 npm 安装报告 4 个漏洞（1 中危、3 高危），本轮未联网重跑 `npm audit`，所以该数字仍为**待确认**。

## 其他待确认

- `docs/ROADMAP.md` 的 v1.0 RC 计划与实际实现如何对应。
- 前端与视频未声明 Node `engines`，最低支持版本待确认。
- GitHub Pages 已作为正式公开部署平台；自定义域名尚未配置。
