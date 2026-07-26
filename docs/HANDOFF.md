# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-26
- **分支**：`main`
- **任务**：T-011 晶体 viewer 恒显场景标签改为「引线 + 外围标签」（第一批 MOF-5 样板）
- **提交**：尚未提交（等待用户确认后再 commit）

> ⚠️ 重要：本轮工作区里同时含**尚未提交的 T-010**（`CrystalAtomLegend` + 4 个核心晶体 viewer）
> 与本轮 T-011。两者叠在同一棵未提交工作树上。提交时建议**分两个 commit**（先 T-010、再 T-011），
> 见文末建议。

### 本次改动（T-011）

新增 1 个共享组件 + 1 个无截图测试，改 `Mof5Cell.tsx` + 4 份 docs，未改后端、`package.json`、数据 JSON 或 Darwin 快照。

**`src/components/three/CalloutLabel.tsx`（新增，共享组件）**

- 入参 `anchor:[x,y,z]`（结构上的锚点）+ `offset:[x,y,z]`（外推偏移）+ `children`（标签内容）+ 可选 `lineColor` / `distanceFactor`。
- 内部渲染一条 drei `<Line points={[anchor, lineEnd]}>` 引线 + 一个 `<Html center position={anchor+offset}>` 标签；`lineEnd` 在标签根部回退 12%（≤0.12）留白，避免线头戳进文字。
- 引线两端都是 3D 坐标，R3F 每帧重投影，随相机旋转/缩放自动跟随——与 `AngleArc` 同款范式，不引新依赖。详见 D-016。

**`Mof5Cell.tsx`：15 处恒显 `<Html>` 场景标签 → `CalloutLabel`**

- 逐处把「压在结构中央/近旁」的恒显 `<Html>` 改为「锚点指向目标结构、标签外推到外围留白、引线连接」。每处均写了锚点/偏移的中文说明注释。
- 覆盖：BuildingUnitOverview（2）、DetailedNode（3）、DetailedBdc（3）、TopologyFramework 周期扩展（2）、TopologyLinker（1）、PoreVolume（1）、GuestMolecules（1）、CountingLabels（2）。
- **保留** 4 处不改：`showLabels` 门控的 `TopologyNode` 原子标签、以及 3 处「不指向单一结构」的全局说明（「两类构筑单元周期连接 → 开放框架」「Zn₄O(BDC)₃」「Fm-3m 常规晶胞：Z = 8」）——它们本就在外围留白、加引线会从空处拉线，仍用 `<Html>`。
- 删掉 `mof5Geometry` 里已不再使用的 `add` 导入。教学文案文字零变化。

**新增测试（无截图）**

- `tests/visual/mof5-callout.visual.spec.ts`（chrome 通道 6 项）：5 个 viewMode 下各引线标签仍可见且中心偏离 stage 中心 > 0.15（即已推到外围）；孔隙/客体逐阶段标签可见。

### 锚点精修（本轮第二次迭代：用户反馈「标签指向的对象有误或不明」）

首轮引线落地后，用户指出部分标签指向的结构对象不对或不清晰。开 3 个只读 subagent 分组审计
（covalentNetwork / coordination+comparison / cell+voids+counting），逐条核对「文案 → 应指向对象 →
真实几何坐标 → 当前 anchor 是否吻合」，主 Agent 用几何脚本独立复算后修正 5 处：

- **cell 视图（默认视图，两处悬空硬伤）**：
  - `pcu｜每个节点沿 ±x、±y、±z 六方向连接`：anchor `[0,-0.62,0]`（晶胞内空气、无节点）→ `[0.88,0.88,0.88]`（真实角节点，六条连接臂正从此辐射）。
  - `虚线末端｜跨晶胞继续连接`：anchor `[0.5,0.86,0]`（悬空）→ `[0.88,1.20,0.88]`（该角节点 +y 周期虚线的真实末端）。
- **covalentNetwork（BDC）视图**：
  - `BDC²⁻｜线性二连接体`：anchor `[0,0.36,0]`（误落苯环上沿、与「苯环刚性间隔」重叠）→ `[0,0,0]`（连接体几何中心、两端 node 连线主轴），引线沿主轴向上表达线性跨度。
  - `羧酸根接入节点`：anchor `[-0.79,0,0]`（仅在羧酸氧上、未触节点）→ `[-0.91,0,0]`（O→node 半透明衔接键中点，既贴节点又体现接入）。
- **coordination 视图**：
  - `整个 SBU：六连接方向`：anchor `[0,-0.76,0]`（仅 −y 单一连接末端、代表不了六方向）→ `[0,-0.30,0]`（近核连接臂，引线由辐射源附近延伸，暗示六方向）。

其余锚点经审计确认已准确落在文案所述对象上（含 Zn 四配位化学与模型一致），未改。build/lint 通过、`mof5-callout` 冒烟 **6/6** 通过。详见 D-016 追加条目。

### 顺带修复（T-010 遗留）

- `NaClCell.tsx` 在 T-010 里**有 `<CrystalAtomLegend>` 使用却漏了 import**（其 diff 只有 +1 行，而 CsCl/CaF2/BaTiO3 都是 +2 行含 import）。这是上会话「Edit 报成功却未完全落地」的伪影，导致 `tsc` 报 `TS2304: Cannot find name 'CrystalAtomLegend'`、build 实际是坏的。本轮已补上 import，与另外三个 viewer 保持一致。**这意味着 T-010 之前记录的「build 通过」在当时并不成立——现在才真正通过。**

### 验证结果（T-010 + T-011 合并工作树）

- `frontend npm run build`：**通过**（补 NaClCell import 后）。保留既有 `three` chunk ~688 KB 的非阻断警告。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**56 / 56 通过**（本任务未增删 logic 用例）。
- 新增 `mof5-callout.visual.spec.ts`（`PLAYWRIGHT_CHANNEL=chrome`，`playwright.config.ts`）：**6 / 6 通过**。
- T-010 的 `crystal-atom-legend.visual.spec.ts`（chrome 通道）：上会话记录 **4 / 4 通过**；本轮未重跑（仅补了 NaClCell import，未改图例逻辑）。

### 范围说明（分步策略）

按 PLANS 分步策略，本轮只做 **MOF-5 一个 viewer 的样板**。用户在浏览器验证 MOF-5 引线效果满意后，再用同一 `CalloutLabel` 组件按相同模式扩展到其余 8 个 viewer（Mxene ~16 / Ren3 ~14 / MetalClosePacking ~11 / Pba ~5 / Graphite ~4 / ZnSPolytype ~3 / ZincMetal / BaTiO3 计数徽章），**各自单独提交**。

### 已知限制

- 完整 Darwin 视觉回归**未跑**（Windows 无 `*-darwin.png` 之外的基线，且缺 `chromium_headless_shell`）；本轮只跑无截图 DOM/文本/位置冒烟。截图基线漂移需 macOS 环境后续处理。
- 引线端点是 3D 坐标，极端旋转角度下引线可能穿过结构——本轮接受「比恒显遮挡明显改善」，不追求完美避让。

### 给下一个 Agent 的建议

建议**分两个 commit**（工作树目前混着 T-010 与 T-011）：
1. **T-010**：`feat(crystal): shared atom-size legend for 4 core crystal viewers` —— 暂存 `CrystalAtomLegend.tsx` + `NaClCell/CsClCell/BaTiO3Cell/CaF2Cell.tsx` + `crystal-atom-legend.visual.spec.ts`。（注意 NaClCell 现在才含正确 import。）
2. **T-011**：`feat(crystal): leader-line callouts for MOF-5 scene labels` —— 暂存 `CalloutLabel.tsx` + `Mof5Cell.tsx` + `mof5-callout.visual.spec.ts`。
3. 文档改动（TASKS/DECISIONS/HANDOFF/PROJECT_STATUS/PLANS）可随 T-011 一起提交或单独 docs 提交。
- 用户验证 MOF-5 引线满意后，再把 `CalloutLabel` 扩展到其余 8 个 viewer。

---

## 往期

### 2026-07-25 Claude Code：T-010 晶体 viewer 共享「原子球对照图例」（第一批 4 个核心晶体）

- 新增共享组件 `CrystalAtomLegend.tsx`：从 `molecule.atoms` 按元素去重，取代表 label/颜色/半径（多半径取最大），半径线性映射到 10–20px 圆点，挂 `ThreeViewerFrame` 的 `footerMeta`，带 `aria-label="原子对照图例"`。铺到 NaCl/CsCl/CaF2（新增 footerMeta）与 BaTiO3（替换旧私有等大色点图例）。新增无截图 `crystal-atom-legend.visual.spec.ts`（chrome 通道 4/4）。详见 D-015。
- **注意**：`NaClCell` 当时漏了 `CrystalAtomLegend` 的 import（Edit 伪影），build 实际未通过；已在 T-011 会话补齐。
- 未提交（等待用户确认；见上方 T-011 的分两 commit 建议）。

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
