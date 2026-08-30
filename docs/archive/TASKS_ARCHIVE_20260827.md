> **归档说明**：本文件是 `docs/TASKS.md` 截至 2026-08-13（T-039D 收口）的全文快照，含全部已完成任务的实现细节、验证数字与 commit 明细。2026-08-27 整理后现行 TASKS.md 只保留待办/搁置/索引，历史原文在此存档。

# TASKS.md

> 待办任务清单。供 Claude Code / Codex 领取任务、同步状态。
> 状态取值：`待办` / `进行中` / `已完成` / `搁置`。
> 领取任务前请先读 `docs/PROJECT_STATUS.md` 和 `docs/HANDOFF.md`。

---

## 进行中

（暂无。）

---

## 待办（按优先级）

### T-039 全站 3D-first 界面与教学层收缩

- **方向**：维护者对 T-038 的实际体验已证明，详细讲解右栏没有形成产品差异，反而压缩 Viewer、制造空白并带来退出后的滚动异常。T-039 不再开展朋友 / 同学 Alpha，先把产品收回到“3D 展示 + 独立操作 + 少量基础事实 / 功能反馈”。
- **总计划**：见 `docs/guided-observation/T039_3D_FIRST_REDUCTION.md`。
- [x] **T-039A 共享布局与普通分子**（2026-08-10）：删除 `ExplorerPanel`、步骤状态、全部 `lessonSteps` / `GuidedObservation*` 及对应测试；普通分子只保留名称 / 分子式、构型、典型键角与模型边界。PR #2 的维护者审阅最终采用 `xl` 起效的桌面“大 Viewer + 272px 右侧控制栏”，低于 `xl` 使用 Viewer → 工具栏 → 默认折叠结构信息；恢复大 Viewer 高度，右栏先放四个模型控制，再利用下方空白放置默认折叠的结构信息。PR #2 已合并，merge commit `5f3606acc7f1cb4399f94c967ced5acda05758e9`。
- [x] **T-039B 专题展示 Viewer**（2026-08-10）：从合并后的 `main` 独立实施；覆盖极性、σ/π 键、三类成键基础、乙烯 / 苯 / 乙炔和有机共面共 10 个公开模块。删除 7 个旧教学 Panel 与无消费者长文数据，保留全部真实模式、轨道 / 标签 / 平面 / 角弧 / 动画和渲染参数；控制密度适中的专题在 `xl` 以上使用大 Viewer + 304px Inspector，杂化 / 成键基础使用 360px 高密度 Inspector，低于 `xl` 全部纵向。PR #3 已合并，merge commit `c3e6876`。
- [x] **T-039C 晶体与 NaCl 周期工作台**（2026-08-13）：17 份晶体迁移最小 `CrystalControls` 并补齐 `CrystalInfo`，删除 `CrystalKnowledgePanel`，统一全宽 Viewer → 首层真实控制 → 默认折叠信息；NaCl 保留 N=1/2/3、选择 / 六配位 / ghost / 隔离，边框移入单层二级 Disclosure，周期计数压缩并折叠。全部周期与配位算法、3D 几何和 Darwin 快照保持不变；当时暂留的长 `CrystalTeaching` 已由 T-039D 删除。
- [x] **T-039D 拼装实验室、目录与全局清理**（2026-08-13）：Builder 改为常驻实时摘要 + 默认折叠诊断，Modules / Paths 压缩为目录决策文案；删除 17 份晶体 JSON 的无消费者 `crystalTeaching` 和 5 份 JSON 的契约外重复标题 / 描述。lint、build、logic 163 / 163、系统 Chrome 无截图回归 40 / 40、production 4 / 4 与六档视口实测通过；Windows 未更新 Darwin 快照，macOS 快照审核保留为平台专项任务。
- **阶段门**：A～D 各自独立 PR；前一阶段未合并，不启动下一阶段。

### T-038 3D 引导观察与结构解释样板（历史完成）

- **完成**：2026-08-09；PR #1 已合并，merge commit `99545223df0bc3cfec897d4d07e360a86c547d91`。
- **历史结果**：NH₃ 曾完成四步引导、响应式、触控、reduced-motion 与 production 验收。该结果只证明当时实现符合契约，不等于普通学生验证。
- **后续调整**：维护者体验触发 T-039 / D-044；T-038 证据保留用于追溯，不继续扩展或恢复公开讲解层。

---

## 搁置 / 低优先级

### T-031 v0.1.0-rc.1 真实反馈收集与问题分级

- **开始**：2026-07-30（Codex）；**暂停**：2026-08-01（产品所有者确认当前产品尚未完善，试用者主要为本人和少量朋友）。
- **已完成**：Bug / 化学 / UX Issue Form、反馈指南、P0–P3 分诊、真实反馈台账与发布门槛均已建立。
- **暂停原因**：当前先完成 T-039A～D 的全站 3D-first 收缩；广泛反馈目标与产品阶段不匹配。真实反馈仍为 0，不据此判断质量。
- **恢复条件**：待 T-039A～D 完成后，只根据真实使用中出现的具体问题决定是否恢复；当前不自动启动朋友 / 同学 Alpha，也不设置人数 KPI。
- **版本边界**：继续保留 `v0.1.0-rc.1` 历史 Release，不自动发布 `v0.1.0` 或 `rc.2`。

---

## 已取消

### T-035 核心考试专题轻量自测样板

- **取消**：2026-08-03（产品方向纠偏）
- **处理**：提交 `1c958be` 曾实现三道选择题、自测状态与判题 UI；因产品核心不是在线答题或题库，现已使用 `git revert` 完整撤销公开功能、维护代码和测试。
- **保留边界**：不影响 T-034 的 XeO 公开占位清理，也不否定考试专题作为结构说明、解题思路和关联 3D 入口的价值。

### T-036 扩展现有考试专题自测闭环

- **取消**：2026-08-03（产品方向纠偏）
- **原因**：不再把选择题、判题、即时评分或重试扩展到其余五个专题；网站的学习闭环改为通过可交互 3D 操作引导观察并解释结构。

---

## 已完成

### T-034 清理能力扩展页的公开“建设中”入口

- **完成**：2026-08-02（Codex）
- **内容**：
  - 从公开 `examTopics` 数据移除未实现、无 route 的 `exam-xeo`；没有实现 XeO 专题，也没有修改其余专题、3D 模型、路由或版本。
  - 公开 Exam 目录现有 16 个专题，分组保持为高频能力 5 个、高考真题结构 4 个、竞赛视野 7 个；每张卡片均为已开放状态并提供 `/exam/` 或 `/module/` 入口。
  - 新增数据契约与无截图页面行为测试，阻止 `planned` / 无 route 条目、XeO 文案或“建设中”按钮重新进入公开目录。
- **验证**：build / lint 通过；logic **160 / 160**；系统 Chrome Exam 专题测试 **8 / 8**。未运行或更新 Darwin 快照。
- **边界**：XeO 规划只保留在治理历史中；未开发 T-035，未改发布版本、lockfile 或任何 3D 数据。

### T-037 GitHub Pages 动态导入失败恢复与路由错误兜底

- **完成**：2026-08-01（Codex）
- **根因**：GitHub Pages 新部署会替换带内容 hash 的构建产物；已经打开的旧页面仍可能引用已被删除的 `ModuleDetailPage-[hash].js`，因此路由级动态 import 失败。现有 `/chem3D-learn/` base、Router basename 与构建产物路径均正确，不是 base 配置错误。
- **内容**：
  - 应用初始化时在 React 树外注册 `vite:preloadError`；首次失败记录恢复时间并刷新当前 URL。
  - `sessionStorage` 写入失败时回退到不改变地址栏的 `history.state`；两者都不可用时不自动刷新，直接进入错误页，避免循环。
  - 60 秒冷却期内再次失败不再自动刷新；用户可通过“刷新并重试”清理保护标记后主动重试。
  - 根路由增加中文 `errorElement`，动态导入失败提示网站可能刚刚更新，其他错误使用通用文案；生产环境不显示内部错误信息。
  - 保留 `/module/:id` 与 Organic Builder 的路由级懒加载，没有清缓存、Service Worker、固定旧 hash 或禁用 hash。
- **验证**：build / lint 通过；logic **158 / 158**；Pages 产物 **4 / 4**；系统 Chrome production **4 / 4**。生产测试真实拦截 `ModuleDetailPage-[hash].js`，确认自定义错误页、URL 保留、无默认开发者文案且无 `pageerror`；首页仍不提前下载页面 chunk 或重型 3D chunk。
- **部署结果**：已 fast-forward 合入 `main@4eb3738`；GitHub Actions `Deploy frontend to GitHub Pages` run `30689464952` 的 build / deploy 均成功。线上首页、Modules、CH₄ 详情、动态 chunk 路径与控制台基础验证通过。已在浏览器保留 `/modules` 标签页，跨版本“一次自动刷新并保留目标 URL”待下一次真实前端部署验证；本次部署前已打开旧 bundle 的测试用户仍需先强制刷新一次。

### T-033 收口 3 处化学待核实项

- **完成**：2026-08-01（Codex）
- **分支**：`codex/t-032-product-completeness-audit`
- **内容**：
  - 使用 IUPAC、OpenStax、AFLOW、NIST、IUCr 与同行评审资料核实 BF₃、CaF₂ 和芳环—乙烯基构象边界；`docs/CHEMISTRY_VERIFICATION.md` 已建立来源—结论—文案—代码—测试矩阵。
  - BF₃ 改为中心 B 在常用中性 Lewis 结构中周围 6 电子、未满足八隅体并可接受电子对；B—F 多键 / 离域只作补充，不写成所有原子缺电子或分子不稳定。
  - CaF₂ 确认为萤石型 `Fm-3m` 常规胞、4 Ca + 8 F、Ca 8 配位 / F 4 配位；室温附近常压参数采用约 5.463 Å，并明确 Viewer 使用分数坐标与视觉尺度。
  - 有机共面模型确认为 `C₁₁H₁₁N` 四取代苯理想化综合示例；固定 45° 只用于演示单键扭转，不代表单纯苯乙烯、最低能、固态或室温唯一构象。
  - [x] 3 处 `TODO-CHEM-VERIFY` 已清理；未修改原子坐标或 Darwin 快照。
- **验证**：build / lint 通过；logic 152 / 152；系统 Chrome 无截图定向行为测试 3 / 3；backend 22 / 22；`git diff --check` 与最终文档一致性检查在提交前通过。

### T-032 产品完备度审计与下一阶段拆解

- **完成**：2026-08-01（Codex）
- **分支**：`codex/t-032-product-completeness-audit`
- **内容**：
  - 审计正式站点的首页、32 个结构模块目录、参考顺序、能力扩展、About、6 个考试专题详情和 4 个代表性模块详情。
  - 核对 23 个手写结构 JSON 与 `deriveViewerKind` / `viewerRegistry`：当前公开模块均有真实或专题 Viewer，placeholder 仅为防御性 fallback。
  - 确认主要缺口是 3 处化学待核实项、能力扩展静态讲义缺少作答反馈、公开 XeO“建设中”卡片，以及 T-031 反馈阶段过早。
  - 新增 `docs/PRODUCT_COMPLETENESS_AUDIT.md`，按“化学准确 → 清理公开占位 → 自测样板 → 扩展自测 → 小范围 Alpha”重排主线。
- **验证**：线上与源码只读审计；GitHub Issues 仍为 0；本任务仅改文档，按规则未运行前端 build 或视觉回归。
- **后续纠偏**：2026-08-03 确认“缺少站内作答反馈”不是本产品的核心缺口；原自测扩展路线由 D-039 取代，审计历史保留用于说明决定如何变化。

### T-030 v0.1.0-rc.1 发布候选

- **完成**：2026-07-29（Codex）
- **分支**：`feat/t-030-release-candidate-rc1`
- **版本策略**：仓库发布版本以前端主产品为准；`frontend` 使用 SemVer prerelease `0.1.0-rc.1`，backend / video 保持独立版本；tag 使用 annotated tag，GitHub Release 标记 prerelease。
- **内容**：
  - 仅把 `frontend/package.json` 与 lockfile 根版本更新为 `0.1.0-rc.1`，没有修改依赖版本、完整性哈希或平台元数据。
  - 新增根 `CHANGELOG.md` 与用户向 Release Notes `docs/releases/v0.1.0-rc.1.md`；README 增加 RC badge、版本记录、当前状态、Crystal Workspace 简介和化学复核入口。
  - 新增发布候选 QA 清单与 D-032；版本、文档、README 本地链接和 backend / video 版本边界通过一次性 Node 检查。
  - 发布门禁首轮发现 R3F 教学 Canvas 尚未完成事件连接时快速进入周期探索会偶发 `connect(null)`。修复为 `onCreated` 成功后才启用入口，返回教学后重新等待；不改晶体几何、教学语义或视觉布局。
- **验收**：
  - [x] `npm ci` 成功，package / lockfile 只含 3 处预期版本文本变化。
  - [x] build / lint 通过；logic **149 / 149**；production **3 / 3**；Pages 产物测试 **3 / 3**；backend **22 / 22**。
  - [x] 修复后 Crystal Workspace 五轮压力复跑 **20 / 20**；默认 Chromium 完整 Darwin 无更新回归 **146 / 146**；PNG 零变化。
  - [x] 发布准备提交快进进入 `main` 后，由对应 Pages 成功部署；annotated tag `v0.1.0-rc.1` 与 GitHub prerelease 指向同一发布提交。
- **明确未做**：正式 `v0.1.0`、`rc.2`、npm 发布、二进制附件、backend / video 版本变更、新功能、化学内容扩展或快照更新。

### T-029B macOS Darwin 完整视觉回归审核

- **完成**：2026-07-29（Codex）
- **分支**：`feat/t-029b-darwin-visual-regression`
- **内容**：
  - 在 Darwin arm64 上以 Playwright 默认 Chromium 审核完整 80 张 macOS 基线；`npm ci` 未改 package / lockfile。
  - 首轮 141 / 146：Modules、CaF₂ 为合理但过期的基线；BaTiO₃ `O—O 轮廓 · 非化学键` 标注越出 Canvas，先修偏移再更新；NaCl / CsCl 图例断言与实际数据驱动标签不一致，修测试契约。
  - Crystal Workspace 不再假设世界原点一定是最上层 WebGL 命中目标，改用归一化网格命中真实实例；Viewer ready helper 同时等待真实 `<canvas>`，消除快速切换时 R3F Provider 的空事件目标竞态。
  - 仅更新 Modules、CaF₂、BaTiO₃ 3 张 Darwin 快照；没有删除快照，没有更新已通过的有机拼装快照，没有改 NaCl 化学几何。
- **验收标准达成**：完整视觉无更新模式连续 **146 / 146、146 / 146**；Crystal Viewer 三轮 **63 / 63**；Crystal Workspace 修正后三轮 **12 / 12**；桌面 / 390px、三档周期尺寸、选择 / 隔离 / ghost、旧教学 Viewer 和其余晶体均通过。
- **验证**：build/lint 通过；logic 149 / 149；production 3 / 3；`git diff --check` 通过。
- **明确未做**：版本号、Git tag、GitHub Release、新功能、依赖升级、快照容差放宽、Windows/Linux 基线。
- **T-029 总结**：T-029A 化学依据固化与 T-029B Darwin 视觉审核均完成，T-029 发布候选验收整体完成。

### T-029A NaCl 化学事实复核与发布候选资料固化

- **完成**：2026-07-29（Codex）
- **分支**：`feat/t-029a-nacl-chemistry-verification`
- **内容**：
  - 以 IUCr International Tables / Online Dictionary、IUCr 委员会报告、AFLOW、Materials Project / OSTI 与同行评审论文核对 NaCl 岩盐型结构。
  - 确认现有 `Fm-3m` FCC 常规胞的 Cl 4a / Na 4b 分数坐标、4+4 离子、4 个 NaCl 化学式单位、双方六配位、`±x/±y/±z` 与物理最近邻距离 `a/2` 均正确；没有修改几何数据。
  - 新增 `docs/CHEMISTRY_VERIFICATION.md`，把来源、结论、代码与测试逐项对应；两处 NaCl `TODO-CHEM-VERIFY` 已替换为该文档引用。
  - 明确 `NACL_LATTICE_PARAMETER=2` 是无量纲 `a_model`；区分 `8N³` canonical 组成、项目算法的 `(2N+1)³` display instances（27/125/343）和临时 ghost images。
  - 收紧周期 Viewer 与 `nacl.json` 的课堂文案：六条虚线 / `ionic-neighbor` 记录只表示第一配位层最近邻，不是共价键；离子晶体不描述为离散 NaCl 分子。
- **验收标准达成**：结构、坐标、组成、配位和尺度均有权威来源；实现与 149 项逻辑测试对应；UI 可见语义有浏览器断言；T-029B 明确保留、没有在 Windows 更新快照。
- **验证**：build/lint 通过；logic 149/149；Chrome production 3/3；Crystal Workspace 最终 4/4（既知 R3F 瞬时错误首次出现一次，随后定向 3/3 与整组 4/4）；旧 NaCl Viewer 1/1。
- **明确未做**：T-029B Darwin 快照审核、版本号 / tag、其他化学条目、几何重写、新功能。
- **下一步**：T-029B macOS Darwin 视觉回归审核。

### T-028D Crystal Workspace 稳定化、交互收尾与上线验收

- **完成**：2026-07-29（Codex）
- **分支**：`feat/t-028d-crystal-workspace-stabilization`（由已合并 T-028C 的 `main` 切出）
- **内容**：
  - 保留 `Canvas key={size}`、`frameloop="demand"` 与现有清除策略；真实 Chrome 证明 OrbitControls 拖拽不误清选择，尺寸切换、退出周期、切模块仍按原规则重置。
  - 工具栏用 `fieldset/legend` 分出「观察范围 / 晶胞边框 / 当前选择」，窄屏换行；按钮统一 44px 高并保持 `aria-pressed`、键盘 Enter 操作。
  - Canvas 增加辅助名称；离子 hover 增加 pointer 与 1.08 倍命中反馈；边框线段使用稳定 `segment.id` key。移动端摘要与离子图例上下堆叠。
  - 面板增加精简 `aria-live` 播报、aside 名称与标题层级；内部显示身份降权，配位数/最近邻/幽灵数保持优先。
  - 浏览器测试补真实边界显示副本点击、幽灵邻居、hover、隔离后拖拽保持、显式清除、1440/1280/768/390 无溢出、触控尺寸、移动摘要宽度与键盘切换。
- **验收标准达成**：完整身份 `siteId + periodicImageShift` 未被破坏；边界点击可在真实 Canvas 稳定命中；配位中心、六个异号邻居、幽灵与虚线不产生异常长线；工具栏与右侧面板在四档断点可读；无可复现 page/console error；未更新 Darwin 快照。
- **验证**：build/lint 通过；logic 149/149；Chrome production 3/3、Crystal Workspace 4/4、模块状态重置 5/5、旧 NaCl Viewer 1/1。上线结果见本轮最终交付报告。
- **明确未做**：相机状态持久化、其他晶体接入、拖动/删除/增添离子、改晶胞参数、约束/自由模式、能量判断、保存/分享/截图、晶面切片、后端或数据库。
- **下一步**：不自动立项，由用户选择 PROJECT_STATUS 中的下一阶段候选。

### T-028C NaCl 粒子选择与第一配位层隔离

- **完成**：2026-07-29（Claude Code）
- **分支**：`feat/t-028c-nacl-coordination-selection`（由含 T-028B 的 main 切出；T-028B 已先 ff-merge 到 main）
- **提交**：`a7fe1c6 feat(t-028c): add NaCl coordination display cluster` + Commit 2 `feat(t-028c): add periodic ion selection and coordination isolation`
- **内容**：
  - **Commit 1**：`naclPeriodicGeometry.ts` 新增 `NaClDisplaySelection`（选择身份 = siteId + periodicImageShift）、`NaClCoordinationDisplayAtom`/`NaClCoordinationDisplayCluster` 类型与纯函数 `buildNaClCoordinationDisplayCluster`（精确匹配被点击显示副本 → getNaClCoordinationImages 取 canonical 六邻居 → 叠加 selectedShift 得 combinedShift → 据当前 displayInstances 是否含 siteId+combinedShift 判 ghost）。新增 9 项 logic 契约（本体/边界副本选择、6 异号最近邻、ghost 不依赖 cellOffset、边界副本整体平移出现负 shift ghost、重建公式、结果确定）。
  - **Commit 2**：`NaClPeriodicCell` 重构为完整可点击实例数组 + 点击回传 siteId+periodicImageShift、背景降权/隔离/聚焦层覆盖渲染、六条虚线配位引导、幽灵半透明+线框、demand frameloop 下 InvalidateOnChange、onPointerMissed 清除；`useCrystalWorkspaceControls` 扩展 selectedDisplay/isolateCoordination（改尺寸/进出周期/切模块清除选择并关隔离，改边框不清除）；`CrystalWorkspaceToolbar` 选择时显示「仅看配位层」+「退出选择」；`NaClPeriodicPanel` 动态选择摘要；`ModuleDetailPage` 页面层 useMemo 生成 cluster 供 Viewer+Panel 共用；`crystal-workspace.visual.spec.ts` 新增选择交互测试。
  - **关键区分**：选择身份必须是 `siteId + periodicImageShift`；被点击副本是 cluster 空间中心；邻居最终 shift = selectedShift + neighbor.periodicImageShift；ghost 判定基于当前 displayInstances 是否含最终显示身份，不用 cellOffset；幽灵粒子和虚线不代表额外独立离子或共价键。
  - **明确未做**：不实现拖动/删除粒子/改晶胞参数/约束模式/能量判断/保存/IndexedDB/分享/截图/晶面切片/相机持久化/其他晶体接入/改教学 Viewer/T-028D。
- **验证**：build/lint 通过；`test:logic` 149 通过（新增 9 项配位 cluster 契约）；Chrome `test:production` 3/3、`crystal-workspace` 交互 2/2 通过；NaCl 既有文本断言零回归。详见 D-028 与 HANDOFF。
- **下一步**：T-028D 工作台 UI 收尾 + 完整测试 + 治理收尾。

### T-028B NaCl 周期探索 Viewer

- **完成**：2026-07-29（Claude Code）
- **分支**：`feat/t-028b-nacl-periodic-viewer`（由含 `777f468` 的 main 切出；T-028A 已先 ff-merge 到 main）
- **提交**：`5a44e30 feat(t-028b): add NaCl display and cell-frame geometry` + Commit 2 `feat(t-028b): add NaCl periodic exploration viewer`
- **内容**：
  - **Commit 1**：`naclPeriodicGeometry.ts` 新增 `generateNaClDisplayInstances`（闭合正侧边界显示副本，按 fractional=0 轴非空组合生成 +1 周期镜像，数量 (2N+1)³=27/125/343，不创新 NaClPeriodicSite）与 `CrystalCellFrameMode` 类型 + `generateNaClCellFrameSegments`（hidden=0/outer=12/all=3N(N+1)²=12/54/144，共享边去重，每段长 a=2）。新增 20 项 logic 契约。
  - **Commit 2**：`NaClPeriodicCell.tsx`（Drei `<Instances>` Na⁺/Cl⁻ 双组渲染，相机按 N 动态距离 + Canvas `key={size}` 重置记录取舍）、`useCrystalWorkspaceControls` hook（teaching/2/outer 默认 + 模块切换重置）、`CrystalWorkspaceToolbar`（返回教学/N=1·2·3/外边框·全部·隐藏，沿用 chem-touch-button）、`NaClPeriodicPanel`（状态摘要含 testid FactRow）、`ModuleDetailPage` 接线（crystal-nacl 按 workspaceMode 分发 viewer/toolbar/panel，教学模式加「周期探索」入口按钮不改 CrystalViewMode 联合类型）、`crystal-workspace.visual.spec.ts`（无截图交互测试 10 验证点）。
  - **关键区分**：8/64/216 是周期独立位点；27/125/343 是显示实例（含闭合正侧边界周期镜像副本，不重复计入化学组成）。状态面板显式注明。
  - **明确未做**：不实现粒子点击选择/配位线/幽灵配位粒子/自由拖动/T-028C/D；不改 nacl.json；不改其他晶体；不加依赖；不更新 Darwin 快照。
- **验证**：build/lint 通过；`test:logic` 140 通过；Chrome `test:production` 3/3、`crystal-workspace` 交互 1/1 通过；NaCl 既有文本断言零回归。Windows 其他晶体 Darwin 快照用例因无基线失败（既有平台限制）。详见 D-027、D-026 与 HANDOFF。
- **下一步**：T-028C 用 `siteId + periodicImageShift` 定位显示实例做粒子选择。

### T-028A NaCl 周期几何纯函数内核 + 逻辑测试

- **完成**：2026-07-29（Claude Code）
- **分支**：`feat/t-028a-nacl-periodic-kernel`（T-028A commit `a48d65d` + T-028A.1 follow-up commit）
- **内容**：
  - 新增 `frontend/src/components/three/naclPeriodicGeometry.ts`：基于 NaCl 常规立方晶胞（非原胞）的 4 Cl⁻ + 4 Na⁺ 分数坐标基元，生成 N×N×N 超晶胞独立周期位点（8·N³ 个，Na⁺:Cl⁻=1:1）与六配位周期镜像。区分 `NaClPeriodicSite`（独立位点）与 `NaClDisplayInstance`（显示镜像副本，留类型边界）。
  - 新增 `frontend/tests/logic/nacl-periodic.logic.spec.ts` 契约测试。
  - **T-028A.1 修正**（follow-up）：居中改为晶胞体积居中（`centerFractional`/size/2），删除私有 centerOffset；邻居字段拆分为 `cellOffset`（局部晶胞偏移）+ `periodicImageShift`（超晶胞周期平移，整数）；`fractional`→`absoluteFractional`；新增周期镜像可重建契约与 sites/size 一致性校验。详见 D-026 修正记录。
  - **验收标准达成**：N=1/2/3 → 8/64/216 位点；id 与 (cell+basisIndex) 唯一；canonical fractional 去重；晶胞体积居中（边界关于原点对称）；六配位（siteId+periodicImageShift 唯一、距离 a/2、±x±y±z 全覆盖、N=1 允许同 siteId 不同 periodicImageShift、边界完整六配位、不返回同号离子、canonical+periodicImageShift 重建镜像 cartesian、不把周期镜像误算为额外 canonical site）。
  - **明确未做**：不接入旧 NaCl Viewer、不改 `nacl.json`、不改教学模式、无 UI、无视觉快照。
- **验证**：`npm run build` 通过；`npm run lint` 通过（0 warning）；`npm run test:logic` 83 → 109 → **120 通过**。详见 D-026 与 HANDOFF。
- **下一步**：T-028B 接入 Viewer 时必须遵守内核接口约束（见 HANDOFF「T-028B 接入须知」）。

### T-027 正式部署、SPA history fallback 与 README 在线入口

- **完成**：2026-07-29（Codex）
- **提交**：`6ada065 feat(deploy): add Sites hosting with SPA fallback`、`f31a6e3 docs(deploy): link production site`、`67f5f94 feat(deploy): publish frontend with GitHub Pages`
- **内容**：
  - 新增 GitHub Pages Actions 工作流；`main` 的前端变更会执行 `npm ci`、`npm run test:pages`、上传 `frontend/dist` 并发布。
  - Pages 构建使用 `/chem3D-learn/` 资源基路径；React Router 从 `<base href="%BASE_URL%">` 读取 basename。
  - 新增 `404.html` 深层路由保留 / 恢复脚本与 3 项 Pages 产物测试；同时保留并测试 Sites Worker 的根路径 history fallback。
  - README 新增在线体验徽章、导航和正文入口；`index.html` 补 canonical、Open Graph / Twitter 元信息；新增 `frontend/public/og.png`。
  - 正式公开地址：`https://a7m0sphere.github.io/chem3D-learn/`。
- **验收**：
  - [x] `npm run test:pages` **3 / 3**、`npm run test:sites` **3 / 3**、`npm run lint` 通过。
  - [x] `npm run test:logic` **83 / 83**；系统 Chrome 下 `npm run test:production` **3 / 3**。
  - [x] GitHub Actions run `30400567495` 的 build / deploy 均成功。
  - [x] 系统 Chrome 直接打开首页与四类有效深层链接，地址恢复正确、页面渲染完成、无 `pageerror`。
  - [x] 线上社交预览图返回 HTTP 200、`image/png`。

### T-026 采用 MIT License 并同步 README

- **完成**：2026-07-29（Codex）
- **提交**：`84a504e docs: license project under MIT`
- **内容**：
  - 新增根 `LICENSE`，使用 SPDX `MIT` 标准文本；版权行为 `Copyright (c) 2026 A7m0spHere`。
  - README 徽章区新增链接到 `./LICENSE` 的 MIT 徽章。
  - README 许可证段落改为明确的 MIT 说明与保留版权 / 许可声明提示。
- **验收**：
  - [x] 标准文本包含标题、版权行、授权条款和免责声明，无占位符残留。
  - [x] MIT 徽章唯一，许可证与 README 全部本地链接存在。
  - [x] `git diff --check` 通过；未修改业务代码、依赖或 lockfile。
  - [x] 本任务为许可证与文档修改，按规则未运行前端 build。

### T-025 创建公开仓库根 README 与项目原生视觉资产

- **完成**：2026-07-29（Codex）
- **提交**：`5350ef2 docs: add project readme and visual showcase`
- **内容**：
  - 使用 `beautify-github-readme` 的 README mode 创建根 `README.md`，阅读顺序为“价值 → 真实界面 → 核心能力 → 首次运行 → 技术与验证细节”。
  - 新增 `assets/readme/hero.svg`：沿用设计 token，以 CH₄ 正四面体、109.5° 键角和“观察—切换—讲解”作为项目原生 motif；静态 SVG 自带标题、描述和完整背景。
  - 新增 `assets/readme/organic-builder.png`：从当前 `/lab/organic-builder/ethylene-planar` 页面重新采集，避免复用已知会因分子式下标产生漂移的旧 Darwin 快照。
  - README 复用现有首页与 NH₃ 真实截图，提供快速开始、技术栈、数据流、仓库结构、验证命令、产品边界、参与入口和许可证现状。
- **验收**：
  - [x] `audit_readme.py` 通过，4 个本地图片引用与 SVG 基础结构有效。
  - [x] 所有 README 本地链接存在；没有虚构在线演示、CI 状态、采用数据或许可证。
  - [x] hero 在 900px 与 360px GitHub 显示宽度下无裁切，桌面和窄屏目检通过。
  - [x] 本任务仅改文档与静态资产，按规则未运行前端 build。

### T-024 修复生产首页提前加载 3D 依赖并补生产回归

- **完成**：2026-07-28（Codex）
- **提交**：`f151bfb fix(perf): keep 3d chunks off production homepage`
- **背景**：Hyperplan 方法审计发现，`vite.config.ts` 的对象式 `manualChunks` 虽把 `three` / `r3f` 命名为独立 chunk，却吸收了共享 React 运行时；生产入口因此静态导入 `r3f`，再连带导入 `three`。首页冷启动实际下载 `index + r3f + three`，不是单纯的 688 KB 构建警告。
- **内容**：
  - 删除对象式 `manualChunks`，交回 Rollup 自动分包；保留 `modulePreload: false`、`/module/:id` 路由 lazy、卡片 hover/focus 预取和 `/modules` 空闲预取。
  - 新增 `playwright.production.config.ts` 与 `npm run test:production`：先 build，再用 `vite preview` 跑现有无截图预取用例，补上开发服务器无法覆盖的生产依赖图回归。
  - 生产断言同时识别当前 `ThreeViewerFrame-*` 与历史 `three-*` / `r3f-*` 产物名，防止因 chunk 改名出现假通过。
- **效果**：
  - 首页冷启动 JS：修复前 `index + r3f + three` **1223.80 KB / gzip 349.10 KB**；修复后只请求 `index` **356.80 KB / gzip 114.66 KB**，gzip 减少 **67.2%**。
  - 受限配置（1.6 Mbps、150 ms、4× CPU，5 次冷启动）：首页中位 `networkidle` **2825 → 1491 ms**；CH₄ 直达 Canvas **5124 → 4377 ms**；预取后点击到 Canvas 中位 **1300 ms**，比当前直达快 **70.3%**；无 page/console error。
- **验证**：
  - [x] 旧配置下新增生产入口准确复现：**1 失败 / 2 通过**，失败项为“首页初始不下载重型 3D chunk”。
  - [x] 修复后设置 `$env:PLAYWRIGHT_CHANNEL='chrome'` 并运行 `npm run test:production`：**3 / 3 通过**。
  - [x] 开发态定向预取回归：**3 / 3 通过**；`npm run lint` 通过；`npm run test:logic` **83 / 83 通过**。
  - [x] 未改 UI、路由、数据、Viewer、lockfile 或 Darwin 快照。
- **已知限制**：构建仍提示 `ThreeViewerFrame` 约 **845.42 KB / gzip 227.97 KB** 超过 500 KB；它现在只在 3D 意图/路由下按需加载，不再影响首页。受限配置直达 CH₄ 中位仍为 4.38 秒，略高于 4 秒门槛；后续应优先评估加载反馈或预取时机，不因警告直接扩大为新一轮 vendor 拆分。

### T-023 有机拼装实验室：3D 补间动画与视觉收尾

- **完成**：2026-07-28（Claude Code）
- **提交**：`f42f076`（3D 补间收尾：退场残影 / 键跟随 / reduced-motion）、`4d698ed`（信息面板高度过渡 + 分子式下标统一）
- **接手时的关键修正**：本条待办描述与代码不符——**7 个子项中有 4 个半已随 T-021 的 `e8169cb` 落地**（原子入场缩放 + 位置补间、双/三键偏移面旋向相机、toast 退出动画、浮层错峰入场、自定义确认弹窗，测试也已改用自定义弹窗按钮），当时的 docs 提交未察觉。本轮先逐项 git 考古核实，再只做真正缺失的部分。详见 D-021。
- **本轮实际开发内容**：
  - **3D 补间遵守 `prefers-reduced-motion`**：画布内 JS 补间（R3F 不吃 motion.css 的 CSS 兜底）在 reduce 下全部退化为直接落位、无入场缩放、无残影、键角弧直接挂卸。
  - **删除退场动画**：被删原子缩没、被删键向轴并拢变细（约 200ms 残影后真正卸载）；不用透明材质避免排序伪影；残影禁用 raycast；撤销把同 id 部件加回来时立即清残影。
  - **键跟随补间**：新增共享 `animatedPositions` 注册表——原子 useFrame（优先级 -1）每帧先写实际显示位置，键 useFrame（默认 0）后读端点更新（圆柱改单位长度 + `scale.y`），修掉「吸附/撤销后约 200ms 键先跳到终点、原子飞过去追」的脱节；-1 优先级避免 R3F 按挂载顺序执行造成的一帧滞后。
  - **键角弧淡入淡出**：`BuilderAngleArcs` 进出场管理（含拖拽隐藏），退场淡出后再卸载；共享组件 `AngleArc` 增加可选 `opacity` prop，默认 1、未传时渲染与原来逐位一致（Benzene/Ethylene/MoleculeViewer 三个调用点不受影响）。
  - **信息面板高度过渡**：键角匹配 / 官能团区块用本地 `CollapsibleSection`（grid-rows 0fr↔1fr + 透明度）；收拢期间保留最后一份非空内容、退场结束后才真正卸载（`toHaveCount(0)` 断言在自动重试内成立）；间距（pt-4）移入收拢内容内部，折叠不留双倍空隙；首挂载即打开不播动画。
  - **分子式排版统一**：新增显示层纯函数 `formatFormulaSubscripts`（"C2H4"→"C₂H₄"），InfoPanel 应用；`getFormula` 保持 ASCII（词典比较与既有 logic 测试依赖）；同步更新 2 个浏览器 spec 的 8 处分子式期望。
- **验收标准核对**：
  - [x] 3D 内容变化有可见补间（入场 e8169cb 已有 + 本轮补退场/键跟随/弧淡入淡出），且 `prefers-reduced-motion: reduce` 下退化为无动画。
  - [x] 双键/三键在任意视角都能看出键级（e8169cb 已落地，本轮核实并保留）。
  - [x] 无原生 `confirm`；确认弹窗风格与离开弹窗一致，破坏性动作不用主色主按钮（e8169cb 已落地，本轮核实）。
  - [x] `npm run build` / `npm run lint` 通过；`npm run test:logic` **83 / 83 通过**（原 82 + 新增 formatter 回归 1 项）。
  - [x] `PLAYWRIGHT_CHANNEL=chrome` 定向跑拼装页无截图用例 **10 / 10 通过**（含分子式下标断言、键角区块收拢/展开、拔下+撤销、确认弹窗、reduced-motion 入场流程）。
  - [x] 未更新 Darwin 截图基线，未动 lockfile / 缓存。
- **已知限制**：InfoPanel 分子式改为下标后，`organic-builder-ethylene` / `organic-builder-mobile-info` 两张 Darwin 快照会在 macOS 上漂移，需 macOS 环境审核重算（Windows 无基线、不得更新）；键圆柱改单位长度 + scale.y 在数学上与原渲染等价，macOS 回归时一并目检。原生 `window.confirm` 相关的测试简化（TASKS 旧注）已在 e8169cb 完成，无遗留。

### T-021 有机拼装实验室教学正确性与交互修复

- **完成**：2026-07-27（Claude Code）
- **提交**：`d6ea076`（化学与几何）、`c940c33`（命名）、`45485b8`（状态与交互）、`e8169cb`（视觉与测试）
- **背景**：用户要求全面检查有机拼装页面的过渡动画、前端美观性与功能问题。采用三路只读审查：主 Agent 查 UI / 交互 / 动画层，两个子 Agent 分别查化学与状态逻辑、命名与键角逻辑；所有 P0 结论由主 Agent 逐行核对源码后才动手。
- **修复内容**（详见 D-019）：
  - **7 项教学正确性硬伤**：O 中心弯折角实际 75° 却标 104.5°；CO₂ 型双双键碳摆成 120° 却标 180°；不饱和醇/酮/胺中文名丢失烯/炔（丙烯醇 → "丙-1-醇"）；不饱和多元醛中英文都错；最长链解析失败时静默给出违反最长碳链规则的短母链名；羧基误报"羰基+羟基"、苯误报"碳碳双键"；三/四元环键角标 109.5°（环丙烷真实约 60°）。
  - **关键交互缺陷**：片段 ID 必然冲突导致"两片段拼乙酸"不可用；吸附预览不做价键预检、失败时连位移一起回弹；旋转视角误清空选中；沉浸模式下实时拖拽提示永不显示；Ctrl+Z 在按钮聚焦时被忽略；`reset` 清空撤销历史；seedId 变化不重置分子。
  - **顺带完成**：官能团补齐氰基/醚键/酯基；HCl 不再报卤代；甲苯进入教学词典；NH₃ 分子式不再显示 "H3N"；`isDirty` 性能短路；`shadow-overlay` 等 token 化与 3 个死类名清理。
- **验证**：
  - [x] `npm run build` 通过（含 `tsc --noEmit`），保留既有 `three` chunk ~688 KB 非阻断警告。
  - [x] `npm run lint` 通过。
  - [x] `npm run test:logic`：**80 / 80 通过**（原 64 + 新增 `organic-builder-fixes.logic.spec.ts` 16 项）。
  - [x] 同步更新 T-001 表驱动测试的中文名期望表（新增甲苯条目会触发"期望表与词典 ID 一一对应"断言）。
  - [ ] 浏览器行为回归（`PLAYWRIGHT_CHANNEL=chrome`）**未运行**。
  - [ ] Darwin 视觉回归**未运行**（Windows 无基线，不得更新）。
- **一并落地的 T-022 部分**：这批改动同时完成了原 T-022 的模板坐标重写（10 个模板按各自杂化，甲基 109.5°、氨基 107°、sp² 片段 120°、氰基/乙炔基 180°）与片段旋转对齐（`anchorDirection` + `rotateVectorBetween`），因此 T-022 现在只剩苯种子 C–H 键长标尺一项。
- **已知限制 / 未做**：苯种子 C–H 键长与 `getStylizedBondLength` 不一致见 T-022；3D 补间动画、双键朝向相机、确认弹窗统一、分子式排版统一见 T-023。


### T-020 对接 Claude Code 全站滚动滑入动画并修复 Modules 分类间距

- **完成**：2026-07-27（Claude Code + Codex）
- **提交**：`5f66b7a feat(ui): 全站页面滚动平滑滑入动画`、`55c3dfc fix(ui): preserve module section spacing with scroll reveal`
- **背景**：Claude Code 已把 Home / Modules / Paths / Exam / About / ExamTopicDetail 的页面进入动效统一为 `ScrollReveal`，并为首页 Hero 增加 48px / 1.1s 的分层错峰滑入；但共享交接文档尚未记录这笔最新提交，需要独立审查与对接验证。
- **内容**：
  - 确认 `main` 与 `origin/main` 在对接前完全同步、工作区干净，最新动画提交已完整推送；ModuleDetailPage 的 3D Canvas 未纳入动画包装。
  - 浏览器实测发现 `ModulesPage` 的分类 `section` 新增 `ScrollReveal` wrapper 后，原 `mb-14 last:mb-0` 的 `last:` 会在每个 wrapper 内都命中，导致四个分类的计算下边距全部变为 0。
  - 将分类间距职责移到 `ScrollReveal` 外层，并使用当前 `visibleSections` 索引判断末项；搜索或分类筛选后仍不会产生多余尾部空白。
  - 新增 `tests/visual/scroll-reveal-layout.visual.spec.ts`，逐个滚动触发分类动画后，用真实 DOM 几何断言相邻分类间距至少 55px；测试不含截图，不触碰 Darwin 基线。
- **验证**：
  - [x] `npm run build`、`npm run lint` 通过。
  - [x] `npm run test:logic`：**64 / 64 通过**。
  - [x] `PLAYWRIGHT_CHANNEL=chrome` 定向布局回归：**1 / 1 通过**。
  - [x] `git diff --check` 通过；未改 lockfile、缓存或视觉快照。
- **已知限制**：完整 Darwin 视觉回归未运行。当前 `motion.css` 按产品主人既有选择，在系统开启“减少动态效果”时仍播放 Hero / ScrollReveal 的 1100ms 过渡；本次只记录，不改变该产品取舍。

### T-005 前后端结构数据去重方案（先设计 + 防漂移契约）

- **完成**：2026-07-26（Claude Code）
- **提交**：`fd67aca test(backend): anti-drift parity contract for shared molecule data (T-005)`
- **背景**：`backend/src/molecules.js` 与前端 6 个核心 JSON 存在重复、有数据漂移风险（PROJECT_STATUS 既有风险项）。任务要求「先设计后实现」，且前端手写 JSON 保持真源、后端只读、不引数据库或运行时大依赖。
- **调研发现（关键）**：逐字段比对后确认——5 个 VSEPR 分子（ch4/nh3/h2o/co2/bf3）的**结构核心** `id/kind/formula/names/nameZh/category/atoms/bonds/lonePairs` 在前后端**逐字一致**，只有教学文案（`summaryZh`/`lessonSteps`/`keyAngles`/`rendering`）已漂移；`nacl` 则是**有意的教学简化**——后端 15 原子简化胞、无 `crystalTeaching`，前端 27 原子完整胞。因此不能盲目对 nacl 做全等断言。
- **内容**：
  - 新增设计文档 `docs/BACKEND_DATA_SYNC.md`：说明真源边界（前端 JSON 为真源、后端只读映射）、Node 安全读取方式（测试期 `readFileSync` 相对读取，不引运行时依赖、不让前端依赖后端）、发布边界，以及三个候选方案（A 防漂移契约测试[已采纳]、B 构建期生成、C 运行时读取）的取舍。
  - 新增防漂移测试 `backend/test/data-parity.test.js`：测试期读取前端 5 个 JSON，逐字断言结构核心与后端一致；对 nacl 只断言「双方都存在且为 crystal」并注释说明其为有意简化，不参与相等契约。
- **验证**：
  - [x] `backend npm test`：**22 / 22 通过**（原 15 + 新增 7 项防漂移）。现有 5 项纯函数 + 10 项 HTTP 集成测试全部兼容。
  - [x] 前端无需依赖后端即可构建运行（测试是后端读前端，方向单一；前端零改动）。
  - [x] 未引入数据库或运行时依赖；`backend/` 仍零运行时依赖。
- **已知限制**：本次是「先设计 + 最低风险实现（防漂移护栏）」，未做构建期代码生成去重（方案 B）。教学文案的漂移是刻意保留的（后端文案与前端可各自演进），契约只锁结构核心。若未来要彻底单源，按 `docs/BACKEND_DATA_SYNC.md` 的方案 B 推进。

### T-004 大晶胞几何计算下沉（ZnS / ZincMetal）

- **完成**：2026-07-26（Claude Code）
- **提交**：`4f5d707 refactor(crystal): extract pure geometry from ZnS/ZincMetal viewers`
- **背景**：`ZnSPolytypeCell.tsx`（816 行）和 `ZincMetalCell.tsx`（744 行）把纯坐标 / 棱 / 位点构造和渲染逻辑混在一个大文件里。沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 模式，只抽无 React/R3F 副作用的纯几何。
- **内容**：
  - 新增 `znsPolytypeGeometry.ts`：`createCubeEdges(half)`、`createWurtziteCellEdges()`、`tetrahedronNeighborPositions`、`tetrahedronEdgeIndices`。
  - 新增 `zincMetalGeometry.ts`：`ZnSiteKind` / `ZnVisualAtom` / `HcpLayer` / `HcpPackingAtom` 类型，晶胞与堆积常量（`hexRadius`/`cellHalfHeight`/`hexAngles`/`packing*`），位点数组（`bottomCorners`/`topCorners`/`unitCellAtoms`/`sameLayerNeighbors`/`coordinationCluster`），`cellEdges`、`electronPoints`、`generateHexLayer(...)`、`hcpLayerPatch`。
  - 两个 viewer 改为从各自 `*Geometry.ts` 导入；颜色、相机预设、教学文案、标签文案、视图分场景逻辑仍留在 viewer。JSX、交互、相机行为零变化。
- **验证**：
  - [x] `npm run build`、`npm run lint` 通过。
  - [x] `npm run test:logic`：**64 / 64 通过**（原 56 + 新增 `crystal-geometry.logic.spec.ts` 8 项，覆盖两个模块的边数、端点、位点数量与层错位等代表性断言）。
  - [x] `zinc-metal-callout` 冒烟（chrome 通道 1/1）通过，确认 ZincMetal viewer 抽离后仍正常渲染。
  - [x] `git status` 确认只改两个 viewer + 两个新几何模块 + 一个新 logic spec，无 lockfile / 缓存 / Darwin 快照改写。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线）。ZnS viewer 未单独配冒烟（其几何抽离与 ZincMetal 同款，logic 单测已覆盖纯函数）。

### T-016～T-019 引线标签扩展收尾（Graphite / ZnS / ZincMetal / BaTiO3）

- **完成**：2026-07-26（Claude Code）
- **提交**：`cac0e90 feat(crystal): leader-line callout for zinc-metal internal counting badge`（T-018）、`a52cf62 feat(crystal): leader-line callouts for BaTiO3 scene labels`（T-019）；T-016 / T-017 无代码改动。
- **背景**：`CalloutLabel` 分 viewer 扩展的最后一批。按 MOF-5 以来「只转真正压在结构上、指向单一结构的恒显标签；标题 / 总结 / 门控 / 已在外围的一律保留」的既定标准，逐个 viewer 核对几何坐标，不被粗估标签数带跑。
- **逐 viewer 判定**：
  - **T-016 Graphite（无改动）**：`GraphiteCell.tsx` 唯一的 `<Html>` 是 `showLabels` 门控的原子标签（`shouldShowLabel = showLabel && ...`），其余说明都在不遮挡 3D 的 DOM 图例 `LayeredHexLegend`。无恒显、压结构的场景标签，按标准无需转换。
  - **T-017 ZnS（无改动）**：`ZnSPolytypeCell.tsx` 全部恒显 `LayerBadge` 均为场景标题（结构上方 y≈1.2~1.36，晶胞/四面体半高仅 ≈0.5）、底部总结（y≈-1.1~-1.5）或 `A/B/C 层`（在 `[-1.5,y,-0.9]`、xz 距原点 ≈1.75 > 层半径 1.58，已在层外侧）；指向结构的 `FocusLabel` 全部 `showLabels` 门控。与 MetalClosePacking 保留的徽章判据一致，无需转换。
  - **T-018 ZincMetal（转 1 处）**：`ZincMetalCell.tsx` 的 `CountingLabels` 4 个恒显徽章中，`顶角`（`[1.18,0.78,0]` 外侧）、`面心`（`[0.2,1.02,0.42]` 上方）、`合计：6`（`[0,-1.05,0]` 底部总结）均不遮挡；唯 `内部：3 × 1 = 3` 原在 `[0.12,0.2,-0.82]`（xz 距原点 0.83 < 六方半径 0.95、y 在半高 0.75 内）压在 3 个内部 B 层 Zn 上 → 锚点落真实内部原子 `unit-inner-3` `[0,0,-0.548]`、沿 −z 上方外推。徽章 span 抽成共享 `BadgeSpan`（`LayerBadge` 与 `CalloutLabel` 共用）保留 tone 配色。层平面标签（`LayerPlane` / `CoordinationCluster` 的 `同层6`/`上层3`/`下层3`）本就画在平面边缘 `[radius+0.12,…]`、门控原子标签走原逻辑，均保留。
  - **T-019 BaTiO3（转 2 处）**：`BaTiO3Cell.tsx` 2 处恒显场景导引 `<Html>` 压在结构上 → `polyhedron` 的 `O—O 轮廓 · 非化学键`（`OctahedronGuide`，锚点落八面体中心原点、即 O—O 轮廓辐射源）、`aSiteCoordination` 的 `Ba²⁺ · 中心`（`BaCoordinationCluster`，锚点落中心 Ba 原点）。保留 `12 个最近邻 O²⁻`（配位簇底部总结）、`originShift` 的原点平移说明（全局注释）、`showLabels`/counting 门控的代表原子标签（原子标签机制，走原逻辑）。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/zinc-metal-callout.visual.spec.ts`（chrome 通道 1/1）、`tests/visual/batio3-callout.visual.spec.ts`（chrome 通道 2/2）：转换标签仍可见且相对 stage 中心归一化偏移 > 0.15。
  - [x] 未动几何、tone 配色、门控标签系统、教学文案；`git status` 确认只改两个 viewer + 两个新 spec。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线）。`CalloutLabel` 分 viewer 扩展系列（MOF-5 T-011 起）到此全部收尾：9 个 viewer 中 6 个有转换、Graphite/ZnS 按标准无需转换。

### T-015 用 CalloutLabel 扩展 PBA viewer 的引线标签（第二批，扩展第 4 个）

- **完成**：2026-07-26（Claude Code）
- **提交**：`f3f4984 feat(crystal): leader-line callouts for PBA scene labels`
- **背景**：延续分步扩展的下一个 viewer。PBA（普鲁士蓝类似物，双金属氰基桥联框架）。恒显场景标签用裸 `<Html distanceFactor>`，与 MOF-5 同型。
- **内容**：
  - `PbaCell.tsx` 把 2 处**指向具体结构**的恒显 `<Html>` 换为 `CalloutLabel`，每处均有中文锚点/偏移说明注释：
    - `coordination`（配位骨架）1：`六配位方向`（锚点落 `OctahedralGuide` 八面体中心原点 `[0,0,0]`，即六配位辐射源，外推到上方留白）。
    - `voids`（空位水合）1：空位标记 `□ 空位`/`空位/水合`（锚点落 `VacancyMarker` group 局部原点 `[0,0,0]`，即空位中心，外推到上方留白）。
  - **保留** `<Html>` 不加引线：`节点-桥-节点`（comparison 视图 `FrameworkComparisonGuide`，描述整个「节点-桥-节点」连接概念的总结、非单一锚点结构，且已在晶胞底面下方，与 MOF-5 保留「两类构筑单元周期连接 → 开放框架」同判据）；`PbaAtom` 的 `showLabels` 门控原子标签（走原逻辑）。
  - 教学文案文字零变化，未引新依赖，未改几何/相机/`showLabels` 系统。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/pba-callout.visual.spec.ts`（chrome 通道 2/2）：coordination/voids 两个 viewMode 下 2 处转换标签仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15（voids 需先切到「六氰空位」阶段才渲染空位标记）。
  - [x] 未动几何、门控标签系统、教学文案；`git status` 确认只改 `PbaCell.tsx` + 新增 spec。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线，只跑无截图冒烟）。其余 4 个 viewer（Graphite/ZnS/ZincMetal/BaTiO3 计数徽章）待后续分 viewer 扩展。

### T-014 用 CalloutLabel 扩展金属密堆积 viewer 的徽章标签（第二批，扩展第 3 个）

- **完成**：2026-07-26（Claude Code）
- **提交**：`547482b feat(crystal): leader-line callouts for metal close-packing badges`
- **背景**：延续分步扩展的下一个 viewer。与前两个不同，`MetalClosePackingCell.tsx` 的恒显标签是一套**带 tone 配色的彩色徽章 `LayerBadge`**（`same`/`upper`/`lower`/`note`/`center` 五色呼应层色），固定屏幕字号（无 `distanceFactor`），且不少徽章已放在结构旁不遮挡——不是前两个 viewer 那种「裸 `<Html distanceFactor>` 浮在正中」的问题。经与用户确认，采用**「只转真正指向结构的少数几个」**策略，保留徽章配色作为教学语言。
- **内容**：
  - 把徽章文本 span 抽成可复用的 `BadgeSpan`（`LayerBadge` 与 `CalloutLabel` 共用），确保引线标签保留原 tone 配色。
  - 只转 2 个 viewMode 里真正压在结构上的 4 个徽章：
    - `layer`（单层密排）1：`A 层｜同层 6 个最近邻`（原 `[0,0.54,-1.36]` 落在层平面内，xz 距原点 1.36 < 层半径 1.62）→ 锚点落层中心原点、外推到后上方。
    - `coordination`（12 配位）3：`同层 6` / `上层 3` / `下层 3`，各自锚点引用对应配位原子组的代表位置（`sameLayer[0]`/`upperLayer[0]`/`lowerLayer[0]`），外推到外围。
  - **保留**徽章的：所有场景标题（`FCC｜4个M`/`HCP｜6个M`/`HCP｜ABAB`/`FCC｜ABCABC`）、总结（`合计配位数 12`/`共同：配位数 12｜η≈74%`）、以及 StackingScene 的 `A/B/C 层`（在 `[-1.55,y,-0.88]`、xz 距原点 ≈1.78 > 层半径 1.58，已在层外侧不遮挡）；`FocusLabel` 门控标签走原逻辑。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/metal-close-packing-callout.visual.spec.ts`（chrome 通道 2/2）：layer/coordination 两个 viewMode 下 4 个转换徽章仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。
  - [x] 未动几何、tone 配色、门控标签系统、教学文案；`git status` 确认只改 `MetalClosePackingCell.tsx` + 新增 spec。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线，只跑无截图冒烟）。其余 5 个 viewer（Pba/Graphite/ZnS/ZincMetal/BaTiO3 计数徽章）待后续分 viewer 扩展。

### T-013 用 CalloutLabel 扩展 ReN₃ viewer 的引线标签（第二批，扩展第 2 个）

- **完成**：2026-07-26（Claude Code）
- **提交**：`9e3e464 feat(crystal): leader-line callouts for ReN3 scene labels`
- **背景**：延续 T-012 的分步扩展，按剩余标签数从多到少推进的下一个 viewer。ReN₃（`Imm2` 理论预测相）。
- **内容**：
  - `Ren3Cell.tsx` 把 3 处**指向具体结构**的恒显 `<Html>` 场景标签替换为 `CalloutLabel`，每处均有中文锚点/偏移说明注释：
    - `covalentNetwork`（N₃ 单元）2 处：`N₃ 单元｜N1–N2–N1`（锚点落在折线单元中心，即中央 N2 原点）、`两条短 N–N 距离 ≈ 1.36 Å`（锚点落在原点到端基 N1 的真实键中点）。
    - `coordination`（Re 七配位）1 处：`Re 中心｜7 个 N 最近邻`（锚点落在中心 Re 原点）。
  - **保留** `<Html>` 不加引线的均为「不指向单一结构」的标题 / 全局说明 / 门控标签：`pressure` 视图的相名标题、压力窗口 widget 与免责；`cell` 视图的晶胞标题、晶格参数、a/b/c 轴标签（本就在晶胞外缘）、`showLabels` 门控位点标签；`covalentNetwork` 的折线单元免责与门控位点标签；`coordination` 的七配位澄清与门控计数；整个 `polyhedron`（多面体标题 + 网络总结 + 门控色注）与整个 `counting`（计数 widget + 化学式单位标题 + 力学总结 + Wyckoff 免责）。
  - 教学文案文字零变化，未引新依赖，未改几何/图例/相机/`showLabels` 系统。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/ren3-callout.visual.spec.ts`（chrome 通道 2/2）：covalentNetwork / coordination 两个 viewMode 下 3 处转换标签仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。
  - [x] 未动 lockfile、缓存或 Darwin 快照；`git status` 确认只改 `Ren3Cell.tsx` + 新增 spec。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线）；引线极端角度可能穿过结构。「~14」的旧粗估把门控/全局标签也算进去了；按 MOF-5/MXene「只转指向具体结构的恒显标签」标准，Ren3 里符合的实为 3 处。其余 6 个 viewer（MetalClosePacking/Pba/Graphite/ZnS/ZincMetal/BaTiO3 计数徽章）待续。

### T-012 用 CalloutLabel 扩展 MXene viewer 的引线标签（第二批，扩展第 1 个）

- **完成**：2026-07-26（Claude Code）
- **提交**：`2c5615a feat(crystal): leader-line callouts for MXene scene labels`
- **背景**：T-011 在 MOF-5 上验证了 `CalloutLabel`「引线 + 外围标签」样板满意后，按 PROJECT_STATUS「下一步第 1 条」的分步策略，用同一组件扩展其余 8 个恒显标签密集的 viewer，各自单独提交。MXene（`Ti₃C₂Tₓ`）是扩展的第 1 个。
- **内容**：
  - `MxeneCell.tsx` 把 7 处**指向具体结构**的恒显 `<Html>` 场景标签替换为 `CalloutLabel`，锚点落在其所指结构、标签沿 `offset` 外推到结构外围、引线连接二者，每处均有中文锚点/偏移说明注释：
    - `comparison`（MAX → MXene）3 处：`MAX 前驱体｜Ti₃AlC₂`、`二维片层｜Ti₃C₂Tₓ`、`Al 层`。
    - `coordination`（C 六配位）2 处：`C 中心｜6 个 Ti 最近邻`（锚点中心 C）、`Ti₆ 八面体轮廓`（锚点引用真实 `OCTAHEDRAL_TI_POSITIONS[5]` 顶点）。
    - `covalentNetwork`（表面端基）1 处：`O / OH / F 混合端基示意`。
    - `interlayerForce`（重新堆叠）1 处：`层间水 / 离子（示意）`。
  - **保留** `<Html>` 不加引线的均为「不指向单一结构」的全局说明：工艺流程（`选择性移除 Al + 剥离 →`）、厚度方向标注、辅助线免责说明、堆叠标题、剖面推导，以及整个 `counting`（`FormulaScene`）的化学式推导链与通式；`showLabels` 门控标签与 `TerminationMarkers` 的端基 `kind` 原子标签走原逻辑，未改。
  - 教学文案文字零变化，未引新依赖，未改几何/图例/相机/`showLabels` 系统。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/mxene-callout.visual.spec.ts`（chrome 通道 4/4）：comparison/coordination/covalentNetwork/interlayerForce 四个 viewMode 下 7 处转换标签仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15（证明已外推到外围）。
  - [x] 未动 lockfile、缓存或 Darwin 快照；`git status` 确认只改 `MxeneCell.tsx` + 新增 spec。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线，只跑无截图 DOM/文本/位置冒烟）；引线极端旋转角度可能穿过结构，本批不追求完美避让。其余 7 个 viewer（Ren3/MetalClosePacking/Pba/Graphite/ZnS/ZincMetal/BaTiO3 计数徽章）待后续分 viewer 扩展、各自单独提交。

### T-011 晶体 viewer 恒显场景标签改为「引线 + 外围标签」（第一批 MOF-5）

- **完成**：2026-07-26（Claude Code）
- **背景**：MOF-5 等「示意/分解类」晶体 viewer 有大量恒显场景说明标签（`<Html distanceFactor>` 透视缩放、硬编码 3D 坐标、位置多在结构中央上/下方），模型一旋转就压到晶体结构上遮挡视野。全仓库这类恒显标签合计 70+ 处、跨 9 个 viewer。目标是抽共享「引线标签」组件，把标签外推到结构外围、用引线指回锚点，先做 MOF-5 一个 viewer 作样板，验证满意后再用同一组件扩展其余 viewer。
- **内容**：
  - 新增共享组件 `components/three/CalloutLabel.tsx`：入参 `anchor`（结构上的锚点，世界坐标）、`offset`（把标签外推到结构外的偏移）、`children`、`lineColor`、`distanceFactor`。内部渲染一条 drei `<Line points={[anchor, lineEnd]}>` 引线（终点回退 12% 留白，不戳进文字）+ 一个 `<Html center position={anchor+offset}>` 标签。引线两端均为 3D 坐标，随相机旋转/缩放每帧自动重投影——与 `AngleArc` 同款范式，无需引新依赖。
  - 把 `Mof5Cell.tsx` 15 处**指向具体结构**的恒显 `<Html>` 场景标签替换为 `CalloutLabel`：`comparison` 视图 2、`coordination`（Zn₄O 节点）3、`covalentNetwork`（BDC）3、`cell`/`voids` 拓扑（周期扩展）2、`counting` 计数 2、TopologyLinker/TopologyNode 各 1、PoreVolume 1、GuestMolecules 1。每处 anchor 取原标签指向对象的中心坐标，offset 取结构外围留白方向。
  - 明确**保留**为 `<Html>` 不加引线的 4 处：对比图总结（「两类构筑单元周期连接 → 开放框架」）、`Zn₄O(BDC)₃` 化学式、`Fm-3m 常规晶胞：Z = 8`（均为不指向单一结构的全局说明）与 `TopologyNode` 的 `showLabels` 门控原子标签（走原逻辑）。viewMode 分场景显示逻辑与教学文案文字零变化。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/mof5-callout.visual.spec.ts`（chrome 通道 6/6）：各 viewMode 下标签文案仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15（证明已外推到结构外围、不再压在正中）；孔隙/客体阶段引线标签在场。
  - [x] 未改原子级 `showLabels` 标签系统、未改图例、未改教学文案文字，未引新依赖，未动 `vite.config`、lockfile、缓存或 Darwin 快照。
- **已知限制**：完整 Darwin 视觉回归未跑（Windows 无基线，本轮只跑无截图 DOM/文本冒烟）；引线极端角度可能穿过结构，本轮不追求完美避让。其余 8 个 viewer（Mxene/Ren3/MetalClosePacking/Pba/Graphite/ZnS/ZincMetal/BaTiO3）待本样板验证满意后用同一 `CalloutLabel` 分 viewer 扩展、各自单独提交。

### T-010 晶体 viewer 共享「原子球对照图例」（第一批 4 个核心晶体）

- **完成**：2026-07-25（Claude Code）
- **背景**：晶体 3D 里贴在原子上的浮动标签（O²⁻/Ti⁴⁺/Ba²⁺ 等）会遮挡视图；且 6 个 viewer 各自私有定义 `AtomLegend`/`LegendItem`（重复实现、等大色点、不体现真实球大小）。目标是抽共享组件、按真实相对大小+颜色做常驻脚注图例，先铺 4 个数据驱动核心晶体，验证后再扩展。
- **内容**：
  - 新增共享组件 `components/three/CrystalAtomLegend.tsx`：从 `molecule.atoms` 按元素去重，取代表 `label`/`color`/`radius`（同元素多半径取最大），把半径线性映射到 10–20px 圆点直径，渲染「按真实相对大小+颜色的球 + 名称」，挂 `ThreeViewerFrame` 的 `footerMeta`，带 `aria-label="原子对照图例"`。
  - 铺到 4 个数据驱动核心晶体：`NaClCell` / `CsClCell` / `CaF2Cell`（原无图例，新增 footerMeta）与 `BaTiO3Cell`（替换旧的私有 `AtomLegend`/`LegendItem`）。
  - 浮动标签维持 `showCrystalLabels` 默认关闭（`useCrystalControls` 既有行为），图例常驻，二者互补；未改标签开关逻辑、viewer 分发或教学文案。
- **验证**：
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（56/56）通过。
  - [x] 新增 `tests/visual/crystal-atom-legend.visual.spec.ts`（chrome 通道 4/4）：4 个 viewer 图例常驻可见、列出正确离子名称、项数=元素种类数。
  - [x] 未改数据、未动 lockfile/缓存/Darwin 快照。
- **待扩展**：其余 11 个晶体 viewer（含 Mof5/Mxene/Ren3/ZnS 等几何生成型，颜色/半径为组件常量而非 `molecule.atoms`）待本批验证后再铺。

### T-009 有机拼装实验室「常用基团」片段库扩充

- **完成**：2026-07-25（Claude Code）
- **背景**：3D 有机分子自由拼接实验室是成熟模块（拖拽拆装、撤销/重做、实时命名/式量/官能团/键角），但工具箱「常用片段」只有 6 个（甲基/羟基/氨基/醛基/羰基/羧基），缺高中常见基团，课堂拼装能力受限。此前未在 TASKS.md 立项。
- **内容**：
  - `types/organicBuilder.ts` 的 `BuilderFragmentId` 联合类型扩充 4 个 id：`vinyl` / `ethynyl` / `methoxy` / `cyano`。
  - `lib/organicBuilderChemistry.ts` 的 `builderFragmentTemplates` 新增 4 个模板：乙烯基 –CH=CH₂、乙炔基 –C≡CH、甲氧基 –OCH₃、氰基 –C≡N。均在现有 8 元素中性价模型内自洽，附教学坐标。
  - 工具箱按钮遍历 `builderFragmentTemplates` 渲染，新片段自动出现，未改任何 UI 组件。
  - 实施前用一次性探针脚本（跑完即删）验证 4 个候选的引擎行为，剔除需形式电荷、会触发 over-valence 的基团（硝基、磺酸基）——它们超出现有价态模型，不硬塞。
- **验证**：
  - [x] `npm run build`（tsc --noEmit + vite build）、`npm run lint`（无 warning）通过。
  - [x] `npm run test:logic`：**56 / 56 通过**（原 51 + 新增 `organic-builder-fragments.logic.spec.ts` 5 项：4 个片段接碳后价态完整/补氢/命名或官能团预期，含氰基 unsupported 的既有引擎边界断言）。
  - [x] 系统 Chrome 通道浏览器冒烟 `tests/visual/organic-builder-fragments.visual.spec.ts`：**2 / 2 通过**（新片段按钮出现在工具箱、乙烯基拼接补氢成丙烯、氰基拼接价态完整）。
  - [x] 未改命名/几何引擎、未改 UI 组件、未改 seed 或 3D 拖拽逻辑；未动 lockfile、缓存或 Darwin 快照。
- **已知边界**：氰基 –C≡N 的 C≡N 被现有命名引擎归入「复杂含氮」而返回 `unsupported`（InfoPanel 如实显示「无法命名 + 原因」）——这是既有引擎边界，非本次回归引入。扩充命名引擎以支持腈类属另一独立任务。

### T-007 依赖安全与 lockfile 评估

- **完成**：2026-07-25（Claude Code）
- **背景**：前序记录称有 4 个漏洞，本轮联网用 `npm audit` 复核并处理；`frontend/package-lock.json` 另有历史平台元数据删除隐患需一并防范。
- **联网 audit 证据（升级前）**：`npm audit` 报 **4 个漏洞（1 moderate + 3 high）**：
  - `postcss` <=8.5.17（**直接 devDep**，high，Path Traversal in source-map auto-loading）。
  - `react-router` 6.0.0–8.2.0（**传递依赖**，经直接 dep `react-router-dom`，high，5 条 advisory：开放重定向、RSC XSS、deserializeErrors 构造注入、路由匹配 DoS、RSC CSRF）。
  - `react-router-dom` 6.0.0-alpha.0–7.17.0（**直接 dep**，moderate，因依赖上面的 react-router）。
  - `brace-expansion` <=5.0.7 与 `nanoid`（均 **传递依赖 devDep**，high/附带，DoS）。
- **处理**：运行**非 `--force`** 的 `npm audit fix`，仅在现有 caret range 内做 patch/minor 升级：
  - `postcss` 8.5.15→8.5.23、`brace-expansion` 5.0.7→5.0.8、`nanoid` 3.3.12→3.3.16、`react-router(-dom)` 7.17.0→**7.18.1**（仍 7.x，**未跨 React 18/19**）。
  - `package.json` 未改动（升级都在 `^` range 内）；`audit fix` 顺带把 13 处 rollup linux 平台包的 `libc` 元数据剥离，已**逐条精确还原**（gnu→glibc、musl→musl，保持键顺序），最终 lockfile diff **只含 5 个包的版本升级、零 libc、零格式噪声**。
- **剩余 2 个 high 的处置**：升级后 `npm audit` 仍报 2 个 react-router high。经核实：(1) 该 advisory 无更高稳定修复版（范围覆盖到 8.2.0），`--force` 实际会**降级到 7.11.0**，既倒退又破坏 `^7.17.0` caret 并改写 package.json——属验收禁止的盲目 force，故不采纳；(2) 剩余 CVE 全部限 SSR / RSC / `deserializeErrors` / RSC-CSRF 场景，本应用用 `createBrowserRouter` 纯客户端 SPA，**不触发**这些路径。判定为**可接受的暂缓**，待上游发布干净版本再跟进。
- **验证**：
  - [x] 联网 `npm audit` 证据已保存于本条目：4 → 2 漏洞，区分了直接/传递、生产/开发依赖。
  - [x] 未使用 `npm audit fix --force`，未跨 React 18/19 子项目升级。
  - [x] lockfile 只含 5 处明确批准的版本升级，无 `libc` 平台元数据改写（13 处已还原）。
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过；`module-state-reset` + `prefetch-viewer-chunks`（chrome 通道）**8/8** 通过，确认 react-router 7.18.1 不破坏路由与预取。

### T-006 模块卡片按意图预取 3D 资源

- **完成**：2026-07-25（Claude Code）
- **背景**：T-008 把 `/module/:id` 改为 lazy 后，`ModuleDetailPage` 连同 23 个分子 JSON 成了独立页面 chunk。此前 `prefetchViewerChunks` 只预热 three/r3f（`MoleculeViewer`），hover 卡片后点击仍需等页面 chunk 下载，预取意图不完整。
- **内容**：
  - `lib/prefetch.ts` 在原有 `import("@/components/three/MoleculeViewer")` 基础上新增 `import("@/pages/ModuleDetailPage")`，与 `router.tsx` 的 lazy import 指向同一 chunk；保留 `warmed` 单次守卫，只在 hover/focus 卡片或列表页空闲时触发。
  - 未改 `ModuleCard.tsx` / `ModulesPage.tsx`——它们已调用 `prefetchViewerChunks`，新增的页面 chunk 预取自动随现有 hover/focus/idle 入口生效。
- **验证**：
  - [x] 首页初始加载不下载 three/r3f vendor 或 `ModuleDetailPage` chunk（占位组件 `ModulePlaceholderViewer` 属轻量首屏依赖，非 3D vendor）。
  - [x] hover 模块卡片后预取 `ModuleDetailPage` 与 `MoleculeViewer`（后者拉起 three/r3f）；预取后点击仍正常进入模块并渲染 viewer。
  - [x] `npm run build`、`npm run lint`、`npm run test:logic`（51/51）通过；新增 `tests/visual/prefetch-viewer-chunks.visual.spec.ts`（无截图，系统 Chrome 通道）3/3 通过。
  - [x] 未改数据/viewer 分发/文案；未动 lockfile、缓存或 Darwin 快照。

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

---

## T-040 视觉基线迁移至 ubuntu CI（完整收口记录，2026-08-30 归档）

- **决策**：2026-08-27 维护者在两个候选方案中选定「迁移到可复现 CI 环境」，放弃依赖 macOS 人工审核。
- **已落地**：新增 `.github/workflows/visual-regression.yml`，提供 `verify`（跑视觉套件）与 `rebuild`（重生成 Linux 快照并开评审 PR）两种 workflow_dispatch 模式；runner 为 `ubuntu-latest` + Playwright 官方 Chromium，基线文件带 `-linux.png` 平台后缀，不动既有 `*-darwin.png`。
- **执行流程**：`rebuild` 产出的快照以 `visual-baselines/linux-rebuild-*` 分支开 PR，必须人工逐张审核后合并。
- **首轮 rebuild（run `33078407631`）**：168 个测试中 155 通过并写出 `-linux.png` 快照，13 个失败。经本地 Windows 复核，全部是 T-038/T-039 内容收缩后 main 上从未回绿的过期断言（首轮「软件渲染超时」归因是错的），分三批修复（含 commit `438139f`）；另有 3 个时序抖动修复（`9b0f5ad`、`8f3c2bf`、`06ed5b9`，均为等 `document.fonts.ready` 或滑入落位）。
- **第五轮 rebuild（run `33091976613`）168 / 168 全绿**：78 张 `-linux.png` 推到 `visual-baselines/linux-rebuild-20260827-1622` 分支，人工逐张审核后经 **PR #4** 合并（run 内 `gh pr create` 被仓库设置拒绝，PR 由维护者手动补开；workflow 已加降级警告）。
- **合并后首次 `verify` 失败（run `33093611347`）**：167 / 168，`specialty-viewers` 44×44 触控目标断言。第一次修复（PR #6，commit `526a96b`）补 `fonts.ready` 并把三处同类断言改为输出实测 rect 的诊断式写法——**但字体归因是误诊**。
- **第二次 `verify` 失败（run `33308780225`）**：诊断输出揭示真因——7 个按钮实测 43.12px（= 44 × 0.98）、105.84px（= 108 × 0.98），是 `ModuleDetailPage.tsx:1183` 整页容器 `motion-page-enter`（350ms `scale(0.98→1)`）动画进行中测量所致，与 CJK 字体度量无关。修复（PR #8，commit `4feee97`）：`specialty-viewers` / `crystal-3d-first` 两 spec 增加 `waitForTouchTargetSettled`，测量前等 `document.fonts.ready` **且** `.motion-page-enter` 容器上的有限动画全部 `finished`（决策记录见 `docs/DECISIONS.md` D-049）。
- **收口验证（2026-08-30）**：`main@145dc2c` 上连续两轮 `verify` 全绿——run `33309722930`、run `33310145143`，各 168 / 168。
- **遗留**：darwin 78 张旧基线清理为独立后续任务；T-041-A 质量门禁已另行落地（PR #7，见 D-048）。
