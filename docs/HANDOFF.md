# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Codex 任务开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Codex
- **日期**：2026-08-09
- **分支**：`codex/t038d-luna-max`
- **任务**：T-038 Draft PR #1 Ready 前审阅修复。

### 2026-08-10 Codex：T-040 移除 Claude 专用协作入口

- 删除根目录 `CLAUDE.md` 和本地 `.claude/settings.local.json`。
- 当前治理入口统一为 `AGENTS.md`；历史交接、决策和 Git 提交记录保留，不改写历史归属。
- 本次未触碰工作区中已有的任何未提交改动。

### 本轮做的事

1. **继承并复核 T-038B/C**：未改 `LessonStep.guidedObservation`、NH₃ 四步数据、几何、坐标或键；`ExplorerPanel` 只在字段存在时消费它，其他普通分子继续走原 `titleZh` / `bodyZh`。
2. **补齐最小验收护栏**：在 `guided-observation.visual.spec.ts` 增加 1280×720 / 390×844 无横向溢出与 44×44 触控断言，并增加 reduced-motion 下四段引导与比较结论直接可见的断言；没有新增截图或更新视觉基线。
3. **修复一个真实阻断**：系统 Chrome 390×844 实测发现 `FloatingToolbar` 的 `size="sm"` 将四个普通分子工具栏按钮压为 36px；仅为这四个按钮增加 `!h-11`，不改共享工具栏、3D 内核或其他专题。
4. **只读目检两个断点**：1280×720 下 3D Viewer 保持左侧主视觉，右侧信息层级清楚；390×844 下 Viewer 仍为首屏主视觉，步骤、操作提示和比较表纵向可读；临时截图已删除。
5. **实现阶段范围控制**：未迁移其他结构、未实现 NaCl 第二样板或 T-039，未更新 Darwin 快照、版本、lockfile、几何数据或预取策略；“未提交、推送或创建 PR”仅描述 T-038D 实现阶段当时的边界，当前成果已进入 Draft PR #1。
6. **Ready 前审阅修复**：修正 NH₃ 孤电子对、键角步骤的操作提示，使其与进入步骤即自动显示的状态一致；第四步只描述当前真实存在的对比表，不再承诺 CH₄ / H₂O 跳转。Chrome spec 同步冻结自动显示与手动开关契约。

### 验证结果

- `npm.cmd ci --cache <worktree>/.tmp-npm-cache`：通过；为当前独立 worktree 恢复前端依赖，临时 cache 已删除，未改 lockfile。
- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过；仅保留既有的 `ThreeViewerFrame` 大 chunk 警告。
- `npm.cmd run test:logic`：163 / 163 通过（含 T-038B 的 3 项契约测试）。
- `PLAYWRIGHT_CHANNEL=chrome` 下运行 `npm.cmd run test:visual -- tests/visual/guided-observation.visual.spec.ts`：5 / 5 通过，无截图更新。
- `PLAYWRIGHT_CHANNEL=chrome` 下运行 `npm.cmd run test:production`：4 / 4 通过；首页不提前下载重型 3D chunk，production 预取 / 懒加载与路由恢复无回归。
- 系统 Chrome 只读目检：1280×720、390×844 均通过；未运行或更新 Darwin 快照。
- 最终治理复核（2026-08-09）：`git diff --check` 通过，`git status --short --branch` 已复核；未发现 lockfile、版本、几何、快照、缓存或测试产物变更。

### 关键决定

- 保持 `guidedObservation` 可选：结构化样板不是全站数据迁移，已有手写结构和课堂正文不受影响。
- 把退出设计为只切换引导层：教学步骤可以突出结构，但不能接管 OrbitControls 或覆盖学生手动开关的所有权。
- 把跨分子结论限制在表格数据中：不创建多 Canvas 对比系统，也不提前抽象通用教程引擎。D-042 记录本轮决定。
- 将 T-038D 的触控门槛锁在普通分子 `FloatingToolbar` 的四个按钮上，用局部 `!h-11` 解决 `size="sm"` 覆盖，不把修复扩展成全站工具栏重构。

### 已知限制

- Windows 未运行完整 Darwin 视觉回归，也没有更新任何视觉基线；本轮只执行无截图系统 Chrome 行为与临时目检。
- 当前比较表是数据呈现，不会同时打开或同步 CH₄ / NH₃ / H₂O 三个 3D Viewer；这符合本样板的范围。

### 给下一个 Agent 的建议

- 下一项为 T-039 小范围 Alpha（待启动）；本轮不要提前开展 Alpha，也不要迁移其他模块、更新 Windows 上的 Darwin 快照，或引入作答 / 评分状态。

---

## 往期

### 2026-08-03 Codex：T-035 在线自测（随后因方向纠偏撤销）

- `1c958be` 曾为晶胞均摊专题实现三道选择题、即时判定、重试和通用自测维护层。
- 同日产品方向确认网站核心是 3D 观察与结构解释；该提交已由后续独立 revert / product-direction 提交完整撤销，不作为当前产品能力。

### 2026-08-02 Codex：T-034 清理公开 XeO 占位

- 从公开 `examTopics` 删除未实现、无 route 的 `exam-xeo`；现有 16 个专题保持 5 / 4 / 7 分组且全部可进入。
- 新增数据与页面行为测试，阻止 XeO / “建设中”重新公开。该成果未被 T-035 撤销影响。

### 2026-08-01 Codex：T-037 Pages 动态导入失败恢复

- **Agent**：Codex
- **日期**：2026-08-01
- **分支**：`main`
- **任务**：T-037 修复 GitHub Pages 部署更新后的动态 import 旧 chunk 失效，安全合入 main、完成 Pages 部署与线上基础验证。

### 本轮做的事

1. **根因与配置审计**：`build:pages`、`<base>`、Router basename 和 workflow 都正确使用 `/chem3D-learn/`；Pages 构建继续生成 `ModuleDetailPage-[hash].js`。问题是新 artifact 删除旧 hash 后，旧标签页仍持有旧入口映射。
2. **一次自动恢复**：新增 `preloadRecovery.ts`，应用初始化时监听 `vite:preloadError`。首次失败写入时间戳并刷新原 URL；同一页面的重复事件只触发一次 reload。
3. **防循环与降级**：60 秒内再次失败不自动刷新；sessionStorage 不可用时回退到不改变 URL 的 `history.state`，两者都不可用时直接进入错误页。时间戳过期或用户主动清理后允许未来再次恢复。
4. **根路由错误页**：`router.tsx` 配置 `errorElement`；页面提供“刷新并重试”和“返回首页”，动态导入与未知错误使用不同中文文案，生产环境不展示内部错误，标题挂载后获得焦点。
5. **回归覆盖**：逻辑测试覆盖恢复控制器与 `/chem3D-learn/` 首页 href；Pages 产物测试锁定独立带 hash chunk、入口引用和监听器；生产 Playwright 真实拦截 ModuleDetailPage chunk，验证自定义错误页并保留原 URL。既有首页不下载 3D chunk 的三项测试继续执行。

### 验证结果

- 开工前 `git fetch origin`；当前分支与 upstream 为 0 / 0，工作区干净。
- `npm run build`、`npm run lint` 通过；仅有既有按需 ThreeViewerFrame large chunk 警告。
- `npm run test:logic`：158 / 158；新增 6 项恢复、降级、过期、重复安装与 basename 契约。
- `npm run test:pages`：4 / 4；确认 Pages base 与带 hash 动态 chunk 产物。
- 设置 `PLAYWRIGHT_CHANNEL=chrome` 后 `npm run test:production`：4 / 4；3 项既有 lazy/prefetch 契约与 1 项 chunk 失败注入均通过。
- 系统 Chrome 额外检查 1280×720、390×844：焦点、链接、URL、按钮和无横向溢出通过。未运行或更新 Darwin 快照。
- `main` 由 `b634839` fast-forward 到 `4eb3738` 并正常推送；Pages workflow run `30689464952` 对应完整 SHA `4eb3738e616a6cde35348c2b1ff7280906e64783`，build / deploy 均成功。
- 线上首页、Modules 与 CH₄ 详情通过；CH₄ 有 1 个 Canvas，实际请求 `ModuleDetailPage-CvKCMIxF.js`、`MoleculeViewer-DPzpmdy0.js`、`ThreeViewerFrame-CdDH7oZW.js`，均位于 `/chem3D-learn/assets/`；控制台错误 / 警告为空。

### 关键决定

- 保留路由级 lazy 与文件 hash；不用取消懒加载、长期保留旧构建或 Service Worker 规避版本交叉窗口。
- 自动恢复必须先持久化再 reload；无法持久化时不自动刷新，安全失败到用户可操作页面。
- 自动冷却只阻止无人干预的循环；用户点击“刷新并重试”会清除标记并明确重试。

### 已知限制

- 本次部署之前已经打开的旧入口 bundle 不含新监听器，无法被新代码远程修补；测试用户需在新版本上线后先强制刷新一次。
- Pages 真实部署和基础线上验证已完成；跨版本旧标签页自动刷新仍必须等下一次真实前端部署才能形成“旧入口 → 新资源”窗口，不能在同一次部署后伪造完成。
- Windows 未运行 Darwin 完整视觉回归，也未更新任何视觉基线。
- workflow 有 GitHub 官方 action 的 Node.js 20 弃用提示，但 runner 已自动使用 Node 24，build / deploy 未受影响；它不是本次发布阻断项。

### 给下一个 Agent 的建议

- 下一次真实前端部署后，用本轮保留的模块列表标签页点击 CH₄：确认只自动刷新一次、地址保持 `/module/tetrahedral-ch4`，并成功进入新版本模块。
- 若当前报告问题的测试用户仍停在旧 bundle，让其先强制刷新；之后再验证新保护是否生效。
- 产品主线下一项仍是 T-034，不要因本修复扩张为缓存系统或 Service Worker。

### 2026-08-01 Codex：T-033 三处化学内容核验

- 使用 IUPAC、OpenStax、AFLOW、NIST、IUCr 与同行评审资料核实 BF₃、CaF₂ 和芳环—乙烯基构象边界，清理 3 处 `TODO-CHEM-VERIFY`。
- 扩展 `docs/CHEMISTRY_VERIFICATION.md`，建立来源—结论—文案—代码—测试矩阵；不改 3D 坐标或 Darwin 快照。
- build / lint、logic 152 / 152、系统 Chrome 定向 3 / 3、backend 22 / 22 通过。详见 T-033 与 D-035。

### 2026-07-29 Codex：T-030 v0.1.0-rc.1 发布候选

- `frontend` 版本更新为 `0.1.0-rc.1`，backend / video 保持独立版本；新增 CHANGELOG、Release Notes、README RC 入口和发布治理。
- 发布门禁修复 NaCl 教学 Canvas 事件层尚未 ready 时快速切换可能触发的 R3F `connect(null)` 竞态。
- build / lint、logic 149 / 149、production 3 / 3、Pages 3 / 3、backend 22 / 22、Darwin 146 / 146 和 Crystal Workspace 五轮 20 / 20 通过。
- 发布提交快进进入 `main`，Pages 成功；annotated tag `v0.1.0-rc.1` 与 GitHub Prerelease 指向 `8d3e16f`。详见 T-030、D-032 与版本化 Release Notes。

### 2026-07-29 Codex：T-029B macOS Darwin 完整视觉回归审核

- **分支**：`feat/t-029b-darwin-visual-regression`（由 `main@1435d46` 切出）
- **任务**：T-029B macOS Darwin 完整视觉回归审核。
- 固定 MacBook Neo / Apple A18 Pro / arm64、macOS 26.5.2（25F84）与 Playwright 默认 Chromium 149.0.7827.55；首次 141 / 146，分类审查全部失败后先修 BaTiO₃ 真实标签回归与测试稳定条件，再只更新 Modules、CaF₂、BaTiO₃ 三张审核通过的 Darwin 基线。
- 最终 build / lint、logic 149 / 149、production 3 / 3、完整视觉回归连续两轮 146 / 146、晶体 Viewer 63 / 63、工作台 12 / 12；快照库存 80 张 Darwin、0 张其他平台。D-031 固化默认 Chromium、失败分类、定向更新与稳定性策略。

### 2026-07-29 Codex：T-029A NaCl 化学事实复核与发布候选资料固化

- 以 IUCr、AFLOW、Materials Project / OSTI 与同行评审资料确认现有 `Fm-3m` 常规胞 4 Cl⁻ + 4 Na⁺、4 个化学式单位、双方六配位、`±x/±y/±z` 最近邻和 `a/2` 关系正确；新增 `docs/CHEMISTRY_VERIFICATION.md`，区分 `a_model`、`8N³` canonical 组成、`(2N+1)³` display instances 与 ghost images。build/lint、logic 149/149、production 3/3、Crystal Workspace 4/4、旧 NaCl 1/1。详见 D-030 与 TASKS T-029A。

### 2026-07-29 Codex：T-028D Crystal Workspace 稳定化、交互收尾与上线验收

- 保留相机重置与显式清除策略，完成 toolbar 分组、44px 触控、Canvas/面板可访问性、移动摘要及真实边界副本交互验收。build/lint、logic 149/149、Chrome production 3/3、工作台 4/4、模块复位 5/5、旧 NaCl 1/1。详见 D-029 与 TASKS T-028D。

### 2026-07-29 Claude Code：T-028C NaCl 粒子选择与第一配位层隔离

- 提交 `a7fe1c6` + `549b9e2`；引入完整显示身份选择、纯函数配位 cluster、背景降权/隔离/幽灵覆盖层、选择状态与交互测试。`test:logic` 149/149、Chrome production 3/3、工作台 2/2。详见 D-028 与 TASKS T-028C。

### 2026-07-29 Claude Code：T-028B NaCl 周期探索 Viewer

- **提交**：`5a44e30`（Commit 1 显示实例 + 晶胞边框几何）+ `73a89c5`（Commit 2 Viewer/工作台状态/UI/接线/交互测试）；已 ff-merge 到 main。
- Commit 1：`naclPeriodicGeometry.ts` 新增 `generateNaClDisplayInstances`（(2N+1)³=27/125/343 显示实例）与 `generateNaClCellFrameSegments`（hidden=0/outer=12/all=3N(N+1)²）+ 20 项 logic 契约。
- Commit 2：`NaClPeriodicCell`（Drei `<Instances>` 双组、相机 Canvas key 重置）、`useCrystalWorkspaceControls`、`CrystalWorkspaceToolbar`、`NaClPeriodicPanel`、`ModuleDetailPage` 接线、`crystal-workspace.visual.spec.ts`。教学 Viewer 并存零回归。`test:logic` 120→140。详见 D-027。

### 2026-07-29 Claude Code：T-028A.1 周期坐标语义修正

- **提交**：`777f468 fix(t-028a): correct supercell centering and periodic image semantics`（follow-up，不 amend/force push）
- 居中改为晶胞体积居中（`centerFractional`/size/2），删除私有 centerOffset；`NaClPeriodicNeighbor` 拆分 `cellOffset`（局部晶胞偏移）+ `periodicImageShift`（超晶胞周期平移，整数）；`fractional`→`absoluteFractional`；新增周期镜像可重建契约与 sites/size 一致性校验。`test:logic` 109→120 通过。详见 D-026 修正记录。

### 2026-07-29 Claude Code：T-028A NaCl 周期几何纯函数内核 + 逻辑测试

- **提交**：`a48d65d feat(t-028a): add NaCl periodic geometry kernel and logic tests`
- 新增 `naclPeriodicGeometry.ts`（常规立方晶胞 4 Cl⁻+4 Na⁺ 基元，N×N×N 独立周期位点 8·N³ 个，候选枚举法六配位）与 26 项 logic 测试。
- 居中 `centerOffset = 1/4+(size-1)/2`、邻居 `imageShift`/`fractional` 字段——**此两项已由 T-028A.1 修正**。
- `test:logic` 83 → 109 通过。详见 D-026。

### 2026-07-29 Codex：T-027 正式部署、SPA history fallback 与 README 在线入口

- **提交**：`6ada065` / `f31a6e3` / `67f5f94`
- 新增 GitHub Pages Actions 发布流（Node 20 + `npm ci` + `npm run test:pages` + artifact deploy），首次 run `30400567495` 成功。
- Pages 构建用 `/chem3D-learn/` base；`<base href="%BASE_URL%">` + `document.baseURI` 让 React Router 自动选 basename；`public/404.html` 编码深层路径到 `__spa` 后跳根页恢复。
- README 加在线体验入口；`index.html` 补 canonical、Open Graph / Twitter 大图与 `frontend/public/og.png`。
- 验证：`test:pages` 3/3、`test:sites` 3/3、`test:logic` 83/83、Chrome `test:production` 3/3；Actions build/deploy 成功；线上 `og.png` 200。
- 限制：GitHub Pages 深层 URL 首个 HTTP 响应仍 404（JS 随后恢复）；未配自定义域名；Darwin 视觉回归未运行；`ThreeViewerFrame` 845.42 KB 非阻断警告仍在。

### 2026-07-29 Codex：T-026 采用 MIT License 并同步 README

- 新增根 `LICENSE`，使用标准 MIT 文本与 `Copyright (c) 2026 A7m0spHere`。
- README 新增链接到许可证的 MIT 徽章与明确许可证段落；未修改子项目 package metadata 或 lockfile。
- 提交：`84a504e docs: license project under MIT`。

### 2026-07-29 Codex：T-025 创建公开仓库根 README 与项目原生视觉资产

- **Agent**：Codex
- **日期**：2026-07-29
- **分支**：`main`
- **任务**：T-025 创建公开仓库根 README 与项目原生视觉资产。
- **提交**：`5350ef2 docs: add project readme and visual showcase`

### 本轮做的事

1. **建立公开仓库首页**：新增根 `README.md`，以“价值 → 真实界面 → 核心能力 → 快速开始 → 技术与验证细节”为阅读顺序，覆盖产品边界、参与入口与许可证现状。
2. **创建项目原生 hero**：新增 `assets/readme/hero.svg`，复用项目设计 token，以 CH₄ 正四面体、109.5° 键角和“观察—切换—讲解”为视觉语法；没有通用 AI/SaaS 装饰。
3. **使用真实证明**：复用现有首页 / NH₃ 截图，并从当前 `/lab/organic-builder/ethylene-planar` 重新采集 `assets/readme/organic-builder.png`，等到 Canvas ready 和 `C₂H₄` 下标出现后才截图。
4. **不制造仓库状态**：仓库没有 CI、正式部署地址和 `LICENSE`，README 不放无依据的 build/license badge 或在线演示链接，并明确当前许可证现状。

### 验证结果

- `audit_readme.py`：通过；4 个本地图片引用与 SVG 基础结构有效。
- README 本地链接：hero、3 张真实界面图和 5 份文档全部存在。
- hero 用系统 Chrome 渲染 900×315 / 360×126 两种宽度，桌面和窄屏目检无裁切。
- 本任务仅改文档与静态资产，未运行 `npm run build`。

### 已知限制与建议

- 仓库尚无正式部署配置，README 因此没有在线演示按钮；部署后再补正式 URL 与 SPA fallback 说明。
- 当前没有 `LICENSE` 文件。若维护者希望接受外部贡献或授权复用，下一任务应先选定并添加许可证，再更新 README 徽章和许可证段落。

### 2026-07-28 Codex：T-024 修复生产首页提前加载 3D 依赖

- **Agent**：Codex
- **日期**：2026-07-28
- **分支**：`main`
- **任务**：T-024 修复生产首页提前加载 3D 依赖，并补真实生产预览回归。
- **提交**：`f151bfb fix(perf): keep 3d chunks off production homepage`

### 本轮做的事

1. **用生产构建证明问题不是无害警告**：旧对象式 `manualChunks` 把 React/JSX 共享运行时吸入 `r3f`，入口 `index` 因此静态导入 `r3f`，再导入 `three`。首页冷启动实际下载 `index + r3f + three`（1223.80 KB / gzip 349.10 KB）。
2. **只删错误的对象式分包规则**：保留 `modulePreload: false`、路由 lazy、卡片 hover/focus 预取与 `/modules` idle 预取。自动分包后首页只请求 `index`（356.80 KB / gzip 114.66 KB），重型依赖移到按需 `ThreeViewerFrame`。
3. **补生产回归入口**：新增 `playwright.production.config.ts` 与 `npm run test:production`，先 build、再用 `vite preview` 跑既有无截图预取用例。旧配置准确复现 1/3 失败，修复后 3/3 通过；断言同时识别当前 `ThreeViewerFrame-*` 和历史 `three-*` / `r3f-*`。

### 效果与验证

- gzip 首页 JS **349.10 → 114.66 KB（-67.2%）**。
- 1.6 Mbps、150 ms、4× CPU、5 次冷启动：首页中位 **2825 → 1491 ms**；CH₄ 直达 Canvas **5124 → 4377 ms**；预取后点击到 Canvas 中位 **1300 ms**（比直达快 70.3%）；无 page/console error。
- `npm run build`、`npm run lint` 通过；`npm run test:logic` **83 / 83**；开发态预取 **3 / 3**；生产预取 **3 / 3**。
- 未改 UI、路由、Viewer、教学数据、lockfile 或 Darwin 快照。
- `webapp-testing` 技能的 Python Playwright 在本机两套 Python 中均缺包，本轮继续使用项目已有 `@playwright/test` 与系统 Chrome，没有安装新依赖。

### 已知限制与建议

- `ThreeViewerFrame` 约 845.42 KB / gzip 227.97 KB，仍有 Vite large chunk 警告，但现在只在 3D 意图/路由下请求；不要为了消除警告恢复对象式 `manualChunks`。
- 受限设备直达 CH₄ 中位仍约 4.38 秒，略高于 4 秒目标。下一任务应先评估最小加载反馈或预取时机，不直接扩大为 Viewer 解耦或新一轮 vendor 拆分。
- Windows 没有 Darwin 基线；本任务无 UI 变化，未跑/未更新完整视觉快照。

### 2026-07-28 Claude Code：T-023 有机拼装实验室 3D 补间动画与视觉收尾

- **Agent**：Claude Code
- **日期**：2026-07-28
- **分支**：`main`（已推送到 `origin/main`）
- **任务**：T-023 有机拼装实验室 3D 补间动画与视觉收尾（接手"昨天未开发完的"）。
- **提交**：`f42f076 feat(builder): finish 3d tweens with exit ghosts and reduced motion`、`4d698ed feat(builder): animate info panel sections and unify formula subscripts`（配套 docs commit 见 git log）。

### 本轮做的事

1. **先核对，发现 TASKS 范围记录反向漂移**。T-023 待办列的 7 个子项里，**4 个半已随 T-021 的 `e8169cb` 落地**（用 `git log -S entranceInitialized/offsetGroupRef/CONFIRM_COPY` 核实）：原子入场缩放+位置补间、双/三键偏移面旋向相机、toast 退出延迟卸载、浮层错峰入场、自定义确认弹窗（两个浏览器 spec 也已改用自定义弹窗按钮——TASKS 里"4 处 page.once(dialog) 可简化"的注也过时了）。上轮教训是"记为已做的其实没做全"，这轮是"记为未做的其实已做"——同一个病，方向相反。
2. **只做真正缺失的 5 件事**（详见 D-021）：
   - 3D 补间遵守 `prefers-reduced-motion`：R3F 画布内 JS 补间不吃 motion.css 的 CSS 全局兜底，需在 useFrame 里显式直接落位。
   - 删除退场残影：原子缩没、键并拢变细（~200ms 后卸载）；不用透明材质（防深度排序伪影）；残影禁 raycast；撤销加回同 id 部件立即清残影。
   - 键跟随补间：共享 `animatedPositions` 表（原子 useFrame **优先级 -1** 先写、键默认 0 后读，键圆柱改单位长度 + `scale.y`），修掉吸附/撤销后"键先跳终点、原子飞过去追"的 200ms 脱节。-1 优先级是必须的：R3F 按订阅顺序执行 useFrame，不排序则拖拽时键滞后一帧。
   - 键角弧淡入淡出：共享 `AngleArc` 加可选 `opacity`（默认 1、未传时渲染逐位一致，Benzene/Ethylene/MoleculeViewer 三个调用点与 Darwin 快照零暴露）。
   - 信息面板：键角/官能团区块 `CollapsibleSection`（grid-rows 0fr↔1fr）高度过渡，收拢期间保留最后一份非空内容、**退场结束后才真正卸载**——既有 `toHaveCount(0)` 断言靠 Playwright 自动重试保持成立；间距 pt-4 移入收拢内容内部防折叠双倍空隙。分子式显示层新增 `formatFormulaSubscripts`（"C2H4"→"C₂H₄"），`getFormula` 保持 ASCII（词典与 8 处既有 logic 断言依赖），2 个浏览器 spec 的 8 处期望同步改为下标。

### 验证结果

- `frontend npm run build`：**通过**（含 `tsc --noEmit`），保留既有 `three` chunk ~688 KB 非阻断警告。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**83 / 83 通过**（原 82 + formatter 回归 1 项）。
- 浏览器行为回归（`PLAYWRIGHT_CHANNEL=chrome`，`--grep-invert` 排除 2 个含截图用例）：拼装页 **10 / 10 通过**（含分子式下标断言、键角区块收拢/展开、拔下+撤销、确认弹窗、reduced-motion 入场）。
- `git diff --check` 无换行噪声；`git status` 确认只改 4 个源文件 + 3 个测试文件 + 文档，未触碰 Darwin 快照 / lockfile / 缓存。
- 过程插曲：验证期间 Claude Code auto 权限模式的安全分类器（Anthropic 侧服务）一度不可用、无法执行 npm 命令，经项目所有者切换权限模式后恢复。环境事件，与代码无关。

### 已知限制

- 完整 Darwin 视觉回归**未运行**（Windows 无基线、不得更新）。**预期内漂移**：`organic-builder-ethylene` / `organic-builder-mobile-info` 两张快照因 InfoPanel 分子式改下标需在 macOS 审核重算；键圆柱改单位长度 + scale.y 数学上等价，macOS 回归时一并目检。
- 键角弧仍按 state 目标位置绘制，原子补间途中弧短暂领先原子（弧只出现在结构完整的静止场景，接受）。OrbitControls target 随删除跳变属既有行为，未纳入本轮。

### 给下一个 Agent 的建议

1. **backlog 已清空**。候选方向见 PROJECT_STATUS「下一步」：macOS 视觉回归审核（含本轮 2 张预期漂移）、两处 `TODO-CHEM-VERIFY` 化学核实、后端单源方案 B、部署配置。动手前先与用户确认立项。
2. 教训延续并升级：TASKS 范围描述连续两轮与代码漂移（T-022 记窄了、T-023 记反了）。接手任务先用 `git log -S <关键符号>` 核对每一子项的落地情况，再定范围；完成任务的同一批 docs 提交里，把"顺带做掉的"逐项写清。
3. 若做 macOS 视觉回归：除 2 张预期漂移外，其余拼装页快照理论上不应变化（键渲染等价、面板在完整结构下首挂载即展开无动画）；若出现其他漂移，先查 `CollapsibleSection` 首挂载分支与 `AngleArc` 未传 opacity 的调用点。

### 2026-07-28 Claude Code：T-022 键长标尺统一收尾

- **提交**：`b06c653 fix(builder): reuse local bond-length scale when reattaching atoms`（配套 docs `7bc7f69`）。
- 核对发现范围比 TASKS 记录（只提苯 C–H 0.66）宽：四个种子键长全都偏离 `getStylizedBondLength` 标尺（乙烯 1.09、乙炔 1.10、共面综合 ~0.45），根因同一个——`getSuggestedPosition` 无条件用常数摆位，拔下再吸附回去键长跳变。
- 采取不改种子坐标的方案（种子被 `BenzenePlanarCell` 等 viewer 复用、牵动 Darwin 快照）：新增 `resolveBondLength`，优先取同一中心原子上的同类键，退回全分子同类键中位数，都没有才用样式化常数，参考值夹在 0.35~2。从零拼装行为不变。
- `test:logic` 80 → 82；build / lint 通过；chrome 通道无截图用例 9 + 1 通过。种子坐标本身仍是旧标尺（有意保留）；若将来统一到 0.92 需在 macOS 重算快照。详见 D-020。

### 2026-07-28 Claude Code：T-021 提交 + 校正 T-022 记录

- **提交**：`d6ea076` / `c940c33` / `45485b8` / `e8169cb`（代码）+ `e6d7584`（docs）。把上一轮留在工作区的 16 个文件按 D-019 分 4 组提交，并校正 TASKS 中 T-022 的过时描述。
- **关键发现**：TASKS 把 T-022 整条列为待办（写「模板键角 ≈69–78°、`addFragment` 只做平移」），但核对代码后确认前两项已在那批工作区改动里完成——10 个模板坐标按各自杂化重写（甲基 109.5°、氨基 107°、sp² 120°、氰基/乙炔基 180°），`addFragment` 已用 `anchorDirection` + `rotateVectorBetween` 旋转对齐，回归固化在 `organic-builder-fixes.logic.spec.ts:299`。据此把 T-022 收窄为「只剩苯种子 C–H 键长标尺」，优先级下调为中。
- **T-021 本身的改动内容**（供追溯）：三路只读审查后修掉 7 项教学正确性硬伤（`BENT_DIRECTIONS` 分量写反 O 摆成 75° 却标 104.5°；CO₂ 型碳摆 120° 却标 180°；不饱和醇/酮/胺中文名丢失烯/炔；不饱和多元醛中英文都错；最长链解析失败静默降级；羧基误报"羰基+羟基"、苯误报碳碳双键；三/四元环标 109.5°）+ 关键交互缺陷（片段 ID 必然冲突致「两片段拼乙酸」不可用；吸附失败连位移回弹；旋转误清选中；沉浸模式实时提示永不显示；Ctrl+Z 被按钮吞掉；`reset` 清空撤销栈；seedId 不重挂载）。`test:logic` 由 64 → 80。详见 D-019。

### 2026-07-27 Codex：T-020 全站滚动滑入动画对接与 Modules 间距修复

- **Agent**：Codex
- **日期**：2026-07-27
- **分支**：`main`
- **任务**：T-020 对接 Claude Code 全站滚动滑入动画，并修复 Modules 分类间距回归。
- **提交**：Claude Code `5f66b7a feat(ui): 全站页面滚动平滑滑入动画`；Codex `55c3dfc fix(ui): preserve module section spacing with scroll reveal`。

### 本次对接

- 对接前执行 `git fetch origin`，确认 `main` 与 `origin/main` 为 `0 / 0`、工作区干净；Claude 的动画提交已在远端，无需 pull 或合并。
- `5f66b7a` 将 Home / Modules / Paths / Exam / About / ExamTopicDetail 统一接入 `ScrollReveal`，首页 Hero 使用逐层错峰滑入；ModuleDetailPage 的 3D Canvas 保持不动。
- 独立审查发现 `ModulesPage` 的包装层改变了 CSS 结构语义：原 `section` 是每个 `ScrollReveal` 的唯一子元素，所以 `last:mb-0` 对每个分类都命中。系统 Chrome 探针确认四个分类下边距全为 `0px`，滚动完成后的中间分类间距为 0。
- `55c3dfc` 把 `mb-14` 移到动画 wrapper，并按 `visibleSections` 判断末项；这保留原 56px 分类间距，同时保证筛选后最后一项没有多余尾部空白。
- 新增 `scroll-reveal-layout.visual.spec.ts`：逐个触发分类进入视口，等待 opacity 完成，再断言所有相邻分类的真实几何间距至少 55px。无截图，不会更新 Darwin 基线。

### 验证结果

- `frontend npm run build`：通过；2322 个模块，保留既有 `three` chunk ~688 KB 非阻断警告。
- `frontend npm run lint`：通过。
- `frontend npm run test:logic`：64 / 64 通过。
- `PLAYWRIGHT_CHANNEL=chrome` 定向运行 `scroll-reveal-layout.visual.spec.ts`：1 / 1 通过。
- `git diff --check`：通过；无 lockfile、缓存、临时探针或 Darwin 快照改动。

### 已知限制

- 完整 Darwin 视觉回归未运行，Windows 不更新 macOS 基线。
- `motion.css` 当前按产品主人既有选择，在 `prefers-reduced-motion: reduce` 下仍让 Hero / ScrollReveal 播放 1100ms 过渡；本次保留并记录这一可访问性取舍。
- `webapp-testing` 技能建议的 Python Playwright 入口在本机默认 Python 与 Codex bundled Python 中均缺少 `playwright` 包；本次改用项目已有 `@playwright/test` Node 入口完成等价系统 Chrome 探针，未安装新依赖。

### 给下一个 Agent 的建议

- 在 macOS 环境运行一次完整视觉回归，重点检查新增动画 wrapper 是否让现有 80 张 Darwin 基线产生非预期布局漂移；不要在 Windows 更新快照。


### 2026-07-26 Claude Code：T-005 前后端结构数据防漂移契约

- 设计文档 `docs/BACKEND_DATA_SYNC.md` + `backend/test/data-parity.test.js` 已由 `fd67aca` 交付；5 个 VSEPR 分子锁结构核心，NaCl 保留有意简化差异，backend 22 / 22 通过。详见 D-018 与 TASKS T-005。

### 2026-07-26 Claude Code：T-004 大晶胞几何计算下沉（ZnS / ZincMetal）

- 沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 范式，新增 `znsPolytypeGeometry.ts`（`createCubeEdges`/`createWurtziteCellEdges`/四面体近邻与棱索引）与 `zincMetalGeometry.ts`（位点类型、晶胞/堆积常量、`unitCellAtoms`/`coordinationCluster`/`cellEdges`/`electronPoints`/`generateHexLayer`/`hcpLayerPatch`）。两个 viewer 改为从各自几何模块导入；颜色、相机、教学文案、标签逻辑仍留 viewer，JSX/交互/相机零变化。新增 `crystal-geometry.logic.spec.ts` 8 项，`test:logic` 56 → 64 通过。ZincMetal 无截图冒烟 1/1 确认渲染不变。详见 D-017。
- 提交：`4f5d707 refactor(crystal): extract pure geometry from ZnS/ZincMetal viewers`；配套文档 `8d1ac7b docs: record T-004 geometry extraction`。

### 2026-07-26 Claude Code：T-016~T-019 引线标签系列收官（转 ZincMetal/BaTiO3，评估 Graphite/ZnS 无需改）

- 提交：T-018 `cac0e90`、T-019 `a52cf62`、docs `9f90aa7`；T-016/T-017 无代码改动。

#### 本次改动（T-016~T-019）

按既定标准「只转指向单一结构、且当前压在结构上的恒显标签；标题/总结/门控/已在外围的保留」**逐 viewer 核对几何**后：

**T-016 Graphite：无需改动（no-change）**
- `GraphiteCell.tsx` 的唯一 3D `<Html>` 是 `showLabels` 门控的原子标签（`shouldShowLabel = showLabel && ...`），按标准保留；所有说明文字在 `LayeredHexLegend` DOM 图例里（不遮挡 3D）。无恒显、压结构的场景标签，故不改。

**T-017 ZnSPolytype：无需改动（no-change）**
- `ZnSPolytypeCell.tsx` 用彩色徽章 `LayerBadge`，但逐 scene 核对后其恒显徽章全部是：标题（`闪锌矿｜ABC` 等，在 `[0,+1.2~1.36,0]` 结构上方）、总结（`共同：Zn 4 配位` 等，在 `[0,-1.26~-1.52,0]` 下方）、或 `${layer} 层`（在 `[-1.5,y,-0.9]`，xz 距原点 ≈1.75 > 层半径 1.58，已在外侧）——与金属密堆积 T-014 保留的那批同判据。指向结构的 `FocusLabel` 全是 `showLabels` 门控。故不改。

**T-018 ZincMetal：转 1 个徽章**（`ZincMetalCell.tsx`）
- `CountingLabels` 的 4 个计数徽章里，`顶角：12×1/6=2`（`[1.18,0.78,0]` 外侧）、`面心：2×1/2=1`（`[0.2,1.02,0.42]` 上方）、`合计：6`（`[0,-1.05,0]` 底部总结）都不遮挡，保留徽章。只有 `内部：3×1=3` 原在 `[0.12,0.2,-0.82]`：xz 距原点 0.83 < 六方半径 0.95、y 0.2 在半高 0.75 内，**正压在 3 个内部 B 层 Zn 上** → 转 `CalloutLabel`，锚点落真实内部原子 `unit-inner-3` `[0,0,-0.548]`、`offset=[0.3,0.9,-0.72]` 沿 −z 上方外推。
- 徽章 span 抽成共享 `BadgeSpan`（`LayerBadge` 与转换后的 `CalloutLabel` children 共用），**保留 tone 配色**——与 T-014 同款做法。`LayerPlane` 的层标签本就放在平面边缘 `[radius+0.12,...]`（外围）、`CoordinationCluster` 的同层/上层/下层标签同理，均不动。

**T-019 BaTiO3：转 2 处场景引导标签**（`BaTiO3Cell.tsx`）
- `polyhedron` 视图 `OctahedronGuide` 的 `O—O 轮廓·非化学键`：原 `[0.42,-0.46,0.34]` 落在八面体内 → 锚点落八面体中心原点 `[0,0,0]`（O—O 轮廓辐射源）、`offset=[0.6,-0.72,0.5]` 外推到外侧下方。
- `aSiteCoordination` 视图 `BaCoordinationCluster` 的 `Ba²⁺·中心`：原 `[0,0.21,0]` 贴在中心 Ba 球上 → 锚点落中心原点 `[0,0,0]`、`offset=[-0.7,0.85,0]` 外推过配位壳层（近邻在 ±0.5）。
- **保留**为原 `<Html>`：`12 个最近邻 O²⁻`（cluster 底部 `[0.42,-0.58,0.42]` 总结）、origin-shift 说明（全局注记）、counting 模式的 3 个代表原子标签（走 `CrystalAtom` 的 `showLabels`/counting 门控原子标签系统，与既定「门控原子标签保留」一致）、`O²⁻·周期延展`（门控）。

**新增测试（无截图）**
- `tests/visual/zinc-metal-callout.visual.spec.ts`（chrome 通道 1 项）：counting 模式下 `内部：3×1=3` 引线标签可见且偏离 stage 中心 > 0.15。
- `tests/visual/batio3-callout.visual.spec.ts`（chrome 通道 2 项）：polyhedron / aSiteCoordination 下 2 处引线标签可见且偏离中心 > 0.15。

### 验证结果

- `frontend npm run build`：**通过**（保留既有 `three` chunk ~688 KB 非阻断警告）。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**56 / 56 通过**（本批未增删 logic 用例）。
- `zinc-metal-callout` + `batio3-callout`（`PLAYWRIGHT_CHANNEL=chrome`）：**3 / 3 通过**。
- `git status`：提交前工作区仅含 `ZincMetalCell.tsx` / `BaTiO3Cell.tsx` + 2 个新 spec，无 lockfile / 缓存 / Darwin 快照被改写。

### 范围说明（引线标签系列收官）

引线标签扩展系列（PROJECT_STATUS「下一步 #1」）**全部完成**：MOF-5（T-011）、MXene（T-012）、ReN₃（T-013）、金属密堆积（T-014）、PBA（T-015）已转；Graphite（T-016）、ZnSPolytype（T-017）逐 scene 核对后判定**无恒显遮挡标签、无需改**；ZincMetal（T-018）、BaTiO3（T-019）已转。9 个 viewer 全部核对完毕。

### 已知限制

- 完整 Darwin 视觉回归**未跑**（Windows 无 `*-darwin.png` 之外的基线，且缺 `chromium_headless_shell`）；本轮只跑无截图 DOM/文本/位置冒烟。截图基线漂移需 macOS 环境后续处理。
- 引线端点是 3D 坐标，极端旋转角度下引线可能穿过结构——本轮接受「比恒显遮挡明显改善」，不追求完美避让。

### 给下一个 Agent 的建议

- 本轮 docs 改动（DECISIONS/TASKS/PROJECT_STATUS/HANDOFF）建议作为一个单独的 docs commit 提交（代码 `cac0e90`/`a52cf62` 已先行提交）。
- 引线标签系列已收官，下一步转入 **T-004（大晶胞几何计算下沉，`ZnSPolytypeCell`/`ZincMetalCell`）** 或 **T-005（前后端结构数据去重方案，先设计）**，两者原为「搁置」，需与用户确认是否启动。
- 经验留存：彩色徽章类 viewer（`LayerBadge`）转换时把 span 抽成共享组件保留 tone 配色，且**只转真正压在结构上的少数几个**——很多徽章（标题/总结/已在外围）不需要动。判定要按几何逐条算（xz 距原点 vs 层/胞半径、y vs 半高），别被粗估标签数带跑。Graphite/ZnS 就是核对后确认无需改的例子。

---

## 更早记录

### 2026-07-26 Claude Code：T-015 用 `CalloutLabel` 扩展 PBA viewer 的恒显场景标签（引线标签第二批，扩展第 4 个 viewer）

- 复用 `CalloutLabel`，把 `PbaCell.tsx` 2 处**指向具体结构且压在结构上**的恒显 `<Html>` 改为引线 + 外围标签：coordination 1（`六配位方向`，`OctahedralGuide` 锚点落八面体中心原点 `[0,0,0]`、`offset=[0.4,0.9,0]`）、voids 1（`□ 空位`/`空位/水合`，`VacancyMarker` 锚点落空位中心局部原点 `[0,0,0]`、`offset=[0.3,0.7,0]`）。保留 comparison 的 `节点-桥-节点`（`FrameworkComparisonGuide` 总结说明、已在晶胞底面下方，与 MOF-5「周期连接 → 开放框架」同判据）与 `showLabels` 门控原子标签为 `<Html>`。新增无截图 `pba-callout.visual.spec.ts`（chrome 通道 2/2；voids 需切「六氰空位」阶段）。详见 D-016 扩展记录。
- 提交：`f3f4984 feat(crystal): leader-line callouts for PBA scene labels`；配套文档提交 `318ee17 docs: record T-015 PBA callout extension`。

### 2026-07-26 Claude Code：T-014 用 `CalloutLabel` 扩展金属密堆积 viewer 的恒显徽章（引线标签第二批，扩展第 3 个 viewer）

- 与前三个 viewer 不同，`MetalClosePackingCell.tsx` 的标签是彩色徽章 `LayerBadge`（5 种 tone 配色呼应层色、固定屏幕字号、多数已在结构旁）。按用户「只转真正指向结构的少数几个」，只转 2 个 viewMode 里压在结构上的 4 个徽章：layer 1（`A 层｜同层 6 个最近邻` 锚点落层中心原点）、coordination 3（`同层 6`/`上层 3`/`下层 3` 锚点各落 `sameLayer[0]`/`upperLayer[0]`/`lowerLayer[0]`）。徽章 span 抽成共享 `BadgeSpan` 保留 tone 配色。保留所有标题/总结/已在层外侧的 `A/B/C 层` 徽章与门控 `FocusLabel`。新增无截图 `metal-close-packing-callout.visual.spec.ts`（chrome 通道 2/2）。详见 D-016 扩展记录。
- 提交：`547482b feat(crystal): leader-line callouts for metal close-packing badges`；配套文档提交 `f6195d2 docs: record T-014 metal close-packing callout extension`。

### 2026-07-26 Claude Code：T-013 用 `CalloutLabel` 扩展 ReN₃ viewer 的恒显引线标签（引线标签第二批，扩展第 2 个 viewer）

- 复用 `CalloutLabel`，把 `Ren3Cell.tsx` 3 处**指向具体结构**的恒显 `<Html>` 改为引线 + 外围标签：covalentNetwork 2（`N₃ 单元｜N1–N2–N1` 锚点落折线中心原点、`两条短 N–N 距离 ≈ 1.36 Å` 锚点落原点→端基 N1 的真实键中点）、coordination 1（`Re 中心｜7 个 N 最近邻` 锚点落中心 Re 原点）。其余标签逐 scene 核对均为全局说明/场景标题/门控（pressure/cell/polyhedron/counting 的标题·参数·免责·widget、covalentNetwork 折线免责、coordination 七配位澄清、`showLabels` 门控位点），按既定标准保留 `<Html>`。PROJECT_STATUS 曾粗估「~14」把门控/全局全算进去；按标准实际只有 3 处。新增无截图 `ren3-callout.visual.spec.ts`（chrome 通道 2/2）。详见 D-016 扩展记录。
- 提交：`9e3e464 feat(crystal): leader-line callouts for ReN3 scene labels`；配套文档提交 `8d54576 docs: record T-013 ReN3 callout extension`。

### 2026-07-26 Claude Code：T-012 用 `CalloutLabel` 扩展 MXene viewer 的恒显引线标签（引线标签第二批，扩展第 1 个 viewer）

- 复用 T-011 的 `CalloutLabel`，把 `MxeneCell.tsx` 7 处**指向具体结构**的恒显 `<Html>` 改为引线 + 外围标签：comparison 3（MAX 前驱体 / 二维片层 / Al 层）、coordination 2（C 中心 / Ti₆ 八面体，后者引用真实 `OCTAHEDRAL_TI_POSITIONS[5]` 顶点）、covalentNetwork 1（端基示意）、interlayerForce 1（层间水）。保留 5 处全局说明 + 整个 `counting`（`FormulaScene` 化学式推导）为 `<Html>`。`Al 层` 所在块 `scale=0.72` 且在左侧，offset 朝远离中心放大补偿。新增无截图 `mxene-callout.visual.spec.ts`（chrome 通道 4/4）。详见 D-016 扩展记录。
- 提交：`2c5615a feat(crystal): leader-line callouts for MXene scene labels`；配套文档提交 `2cc67f4 docs: record T-012 MXene callout extension and reconcile commit status`（该提交同时修正了 T-010/T-011「未提交」的过时描述）。

### 2026-07-26 Claude Code：T-011 晶体 viewer 恒显场景标签改为「引线 + 外围标签」（第一批 MOF-5 样板）

- 新增共享组件 `CalloutLabel.tsx`（`<Line>` 引线 + 外推 `<Html>` 标签，与 `AngleArc` 同范式、零新依赖）。把 `Mof5Cell.tsx` 15 处**指向具体结构**的恒显 `<Html>` 改为 `CalloutLabel`，保留 4 处全局说明 + `showLabels` 门控标签为 `<Html>`。用户反馈「指向不明」后经 3 个只读 subagent 分组审计 + 几何脚本复核修正 5 处锚点（cell 两处悬空、covalentNetwork 两处、coordination 一处）。新增无截图 `mof5-callout.visual.spec.ts`（chrome 通道 6/6）。详见 D-016。
- 顺带修复 T-010 遗留：`NaClCell.tsx` 有 `<CrystalAtomLegend>` 使用却漏了 import（Edit 伪影），补齐后 build 才真正通过。
- 提交：`fb6ceec feat(crystal): leader-line callouts for MOF-5 scene labels`。

### 2026-07-25 Claude Code：T-010 晶体 viewer 共享「原子球对照图例」（第一批 4 个核心晶体）

- 新增共享组件 `CrystalAtomLegend.tsx`：从 `molecule.atoms` 按元素去重，取代表 label/颜色/半径（多半径取最大），半径线性映射到 10–20px 圆点，挂 `ThreeViewerFrame` 的 `footerMeta`，带 `aria-label="原子对照图例"`。铺到 NaCl/CsCl/CaF2（新增 footerMeta）与 BaTiO3（替换旧私有等大色点图例）。新增无截图 `crystal-atom-legend.visual.spec.ts`（chrome 通道 4/4）。详见 D-015。
- **注意**：`NaClCell` 当时漏了 `CrystalAtomLegend` 的 import（Edit 伪影），build 当时实际未通过；已在 T-011 会话补齐。
- 提交：`d18b785 feat(crystal): shared atom-size legend for 4 core crystal viewers`。

### 2026-07-25 Claude Code：T-009 有机拼装实验室「常用基团」片段库扩充

- `BuilderFragmentId` 新增 vinyl/ethynyl/methoxy/cyano；`builderFragmentTemplates` 加 4 个模板（–CH=CH₂/–C≡CH/–OCH₃/–C≡N）。工具箱遍历渲染，新片段自动出现。新增 logic 5 项 + 无截图 visual 2 项。详见 D-014。
- 提交：`e0bc597 feat(builder): add 4 common functional-group fragments to assembly lab`（PLANS 收尾 `aeea99b`）。

### 2026-07-25 Claude Code：T-007 依赖安全与 lockfile 评估

- 联网 `npm audit` 复核，非 `--force` 升级 5 个包（brace-expansion/nanoid/postcss/react-router(dom)），漏洞 4→2；剩余 2 个 react-router high 为 SSR/RSC 场景不适用纯客户端 SPA。手动还原 13 处 rollup `libc` 元数据，lockfile 只含版本升级。详见 D-013。
- 提交：`e9b3c32 fix(deps): patch 2 of 4 audit findings without breaking changes`。

### 2026-07-25 Claude Code：T-006 模块卡片按意图预取 ModuleDetailPage chunk

- `lib/prefetch.ts` 的 `prefetchViewerChunks` 新增 `import("@/pages/ModuleDetailPage")`，与 lazy 路由指向同一 chunk；保留 `warmed` 守卫，未改 ModuleCard/ModulesPage 调用点。新增无截图 `prefetch-viewer-chunks.visual.spec.ts`（3/3）。详见 D-012。
- 提交：`36024af perf: prefetch module detail page chunk on card intent`。

### 2026-07-25 Claude Code：T-008 ModuleDetailPage 路由级 lazy 主包瘦身

- `router.tsx` 的 `/module/:id` 改为 lazy 路由（同 `OrganicBuilderPage` 范式），页面连同 23 个 JSON 移出 `index` 主包（496→209 KB）。详见 D-011。
- 提交：`232e4ea perf: lazy-load ModuleDetailPage to drop molecule data from main bundle`。

### 2026-07-25 Claude Code：T-002 拆解 ModuleDetailPage 专题状态到 typed hook

- 新增 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls`，各自 `useEffect([moduleId])` 自管切模块复位；页面 `useState` 从 33 降到自留 9 个，`deriveViewerKind`/`viewerRegistry` 与教学文案零改动。新增无截图 `module-state-reset.visual.spec.ts`（5/5）。
- 提交：`cf121d3 refactor: split ModuleDetailPage topic state into typed hooks`。

### 2026-07-25 Claude Code：T-003 后端两个 P0 修复 + 真实 HTTP 集成测试

- `server.js` 启动守卫改用 `pathToFileURL`、新增 `parseRequestPathname` 收敛畸形 URL、补 `server.on("error")`；新增 `test/server.integration.test.js`（真实 HTTP，15/15）。
- 提交：`c4ed156 fix: make backend actually start and survive malformed urls`。

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
