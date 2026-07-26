# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-26
- **分支**：`main`
- **任务**：T-014 用 `CalloutLabel` 扩展金属密堆积 viewer 的恒显徽章（引线标签第二批，扩展第 3 个 viewer）
- **提交**：`547482b feat(crystal): leader-line callouts for metal close-packing badges`（代码已提交；文档改动待随本次一起提交）

> ℹ️ 本会话按用户要求连续处理：收尾未提交的 MXene 半成品（T-012 → `2c5615a`）+ 补文档（`2cc67f4`），扩展 ReN₃（T-013 → `9e3e464`）+ 补文档（`8d54576`），再扩展金属密堆积（T-014 → `547482b`）。工作区当前只余本轮 docs 改动待提交。

### 本次改动（T-014）

改 `MetalClosePackingCell.tsx` + 新增 1 个无截图测试，未新增组件（复用 `CalloutLabel`），未改后端、`package.json`、数据 JSON 或 Darwin 快照。

> ⚠️ 关键差异：这个 viewer 的标签**不是**前三个的裸 `<Html distanceFactor>`，而是一套**专门设计的彩色徽章 `LayerBadge`**（5 种 tone 配色，颜色刻意呼应层色 A 青/B 橙/C 灰，固定屏幕字号无 `distanceFactor`）。徽章是这个 viewer 教学语言的一部分，且很多已经放在结构旁边、不遮挡。用户明确选择「只转真正指向结构的少数几个」，不盲目全转。

**`MetalClosePackingCell.tsx`：只转 2 个 viewMode 里真正压在结构上、指向单一结构的 4 个徽章**

- `layer`（单层密排）1：`A 层｜同层 6 个最近邻`，原 `[0,0.54,-1.36]`（xz 距原点 1.36 < 层半径 1.62，压在层平面上）→ 锚点落层中心原点 `[0,0,0]`、外推到后上方。
- `coordination`（12 配位）3：`同层 6`/`上层 3`/`下层 3`，原本各自贴在对应原子组里（混在配位簇中）→ 锚点各引用真实代表原子 `sameLayer[0]`/`upperLayer[0]`/`lowerLayer[0]`、外推到外围。
- **保留**为徽章（`LayerBadge`）不加引线：所有标题（`FCC｜4 个 M`/`HCP｜6 个 M`/`HCP｜ABAB`/`FCC｜ABCABC`）、所有总结（`合计配位数 12`/`共同：配位数 12｜η ≈ 74%`）、以及 StackingScene 的 `A/B/C 层`（在 `[-1.55,y,-0.88]`，xz 距原点 ≈1.78 > 层半径 1.58，**已在层外侧、不遮挡**）；`showLabels` 门控的 `FocusLabel` 走原逻辑。
- **保留 tone 配色**：把徽章 span 抽成共享 `BadgeSpan({label,tone})` 组件，`LayerBadge`（原 `<Html>` 徽章）与转换后的 `CalloutLabel` children 共用，配色不丢。教学文案文字零变化，未引新依赖。

**新增测试（无截图）**

- `tests/visual/metal-close-packing-callout.visual.spec.ts`（chrome 通道 2 项）：layer / coordination 两个 viewMode 下 4 处转换徽章仍可见，且标签中心相对 stage 中心归一化偏移 > 0.15。

### 验证结果（T-014）

- `frontend npm run build`：**通过**。保留既有 `three` chunk ~688 KB 的非阻断警告。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**56 / 56 通过**（本任务未增删 logic 用例）。
- 新增 `metal-close-packing-callout.visual.spec.ts`（`PLAYWRIGHT_CHANNEL=chrome`）：**2 / 2 通过**。
- `git status`：提交前工作区只含 `MetalClosePackingCell.tsx` + 新 spec，无 lockfile / 缓存 / Darwin 快照被改写。

### 范围说明（分步策略）

引线标签扩展按 viewer 逐个提交。已完成 MOF-5（T-011）+ MXene（T-012）+ ReN₃（T-013）+ 金属密堆积（T-014）。**剩余 4 个 viewer**（Pba / Graphite / ZnSPolytype / ZincMetal + BaTiO3 计数徽章）待续，同一 `CalloutLabel`、各自单独提交、各自配无截图冒烟。

### 已知限制

- 完整 Darwin 视觉回归**未跑**（Windows 无 `*-darwin.png` 之外的基线，且缺 `chromium_headless_shell`）；本轮只跑无截图 DOM/文本/位置冒烟。截图基线漂移需 macOS 环境后续处理。
- 引线端点是 3D 坐标，极端旋转角度下引线可能穿过结构——本轮接受「比恒显遮挡明显改善」，不追求完美避让。

### 给下一个 Agent 的建议

- 本轮 docs 改动（DECISIONS/TASKS/PROJECT_STATUS/HANDOFF）建议作为一个单独的 docs commit 提交（代码 `547482b` 已先行提交）。
- 下一个 viewer 建议按剩余标签数从多到少推进：Pba → Graphite → ZnSPolytype → ZincMetal → BaTiO3。每个 viewer 先核对哪些标签「指向具体结构且压在结构上」（转 `CalloutLabel`）、哪些是「全局说明/标题/门控/已在外围」（保留原样），再配一个 chrome 通道无截图冒烟，单独提交。
- 参考已落地的 MOF-5 / MXene / ReN₃ / 金属密堆积 范式：锚点用真实几何坐标（能引用几何常量或从几何推算就别硬编码近似），offset 朝远离场景中心方向；对有外层 `scale` 的子 group 记得补偿。**若 viewer 用的是彩色徽章一类的专门标签系统（如金属密堆积的 `LayerBadge`），转换时把内容 span 抽成共享组件保留配色，并且只转真正压在结构上的少数几个——很多徽章本就在外围留白、不需要动。别被粗估标签数带跑，按标准逐条判定。**

---

## 往期

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
