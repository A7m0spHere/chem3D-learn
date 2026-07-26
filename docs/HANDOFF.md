# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Claude Code
- **日期**：2026-07-26
- **分支**：`main`
- **任务**：T-004 大晶胞几何计算下沉——把 `ZnSPolytypeCell.tsx` / `ZincMetalCell.tsx` 的纯几何计算抽到 `*Geometry.ts`，配代表性单测。
- **提交**：`4f5d707 refactor(crystal): extract pure geometry from ZnS/ZincMetal viewers`（代码 + 测试已提交；本轮 docs 改动待随后单独提交）。

> ℹ️ 本会话按 `/goal「一个一个完成，直到把任务做完」`连续清空 backlog：T-014 docs（`f6195d2`）→ T-015 PBA（`f3f4984`/`318ee17`）→ 引线标签收官 T-016~T-019（`cac0e90`/`a52cf62`/`9f90aa7`）→ T-004 几何下沉（`4f5d707`）。当前只余 T-005（前后端数据去重）这一搁置低优先级项。

### 本次改动（T-004）

沿用 `closePackingGeometry.ts` / `mof5Geometry.ts` 范式，把两个大 viewer 里**无 React / R3F 副作用**的纯几何计算抽到新模块，viewer 只保留渲染、交互、相机、教学文案。

**新增 `znsPolytypeGeometry.ts`**（从 `ZnSPolytypeCell.tsx` 下沉）
- `createCubeEdges(half)`（立方晶胞 12 棱）、`createWurtziteCellEdges()`（纤锌矿六方胞 12 棱）、`tetrahedronNeighborPositions`（四面体 4 近邻）、`tetrahedronEdgeIndices`（6 棱索引对）。
- 留在 viewer：颜色常量、`getCameraPreset`、`getDisplaySummary`/`getVoidStageBadge` 教学文案。

**新增 `zincMetalGeometry.ts`**（从 `ZincMetalCell.tsx` 下沉）
- 类型 `ZnSiteKind`/`ZnVisualAtom`/`HcpLayer`/`HcpPackingAtom`；六方晶胞尺寸 + 堆积基矢常量；`bottomCorners`/`topCorners`/`unitCellAtoms`（17 位点）、`sameLayerNeighbors`/`coordinationCluster`（1+12）、`cellEdges`（18 棱）、`electronPoints`、`generateHexLayer()`、`hcpLayerPatch`（ABAB 三层）。
- 留在 viewer：颜色常量、`getAtomLabel`/`getHighlightColor` 标签与高亮逻辑。

**新增测试**
- `tests/logic/crystal-geometry.logic.spec.ts`（8 项）：棱数/端点/对称/位点计数/`coordinationCluster` 1+12 分层/`generateHexLayer` 半径 2 得 19 原子/`hcpLayerPatch` A/B/A 57 原子且 A 层零错位 B 层 `packingBOffset` 等，输入输出类型明确。

### 验证结果（T-004）

- `frontend npm run build`：**通过**（保留既有 `three` chunk ~688 KB 非阻断警告）。
- `frontend npm run lint`：**通过**，无 warning。
- `frontend npm run test:logic`：**56 → 64 通过**（新增 8 项几何单测）。
- `zinc-metal-callout`（`PLAYWRIGHT_CHANNEL=chrome`）：**1 / 1 通过**，证明下沉后 viewer 渲染行为不变。
- `git status`：提交前工作区仅含两个 viewer + 两个新 `*Geometry.ts` + 一个新 logic spec，无 lockfile / 缓存 / Darwin 快照被改写。

### 已知限制（T-004）

- 只搬「纯几何」；`SulfurPackingLayer` 等仍在 viewer 内的几何辅助未下沉（保持本次范围最小）。
- 完整 Darwin 视觉回归**未跑**（Windows 无基线）；只跑了 ZincMetal 无截图冒烟确认渲染不变。

### 给下一个 Agent 的建议

- 本轮 docs 改动（DECISIONS D-017 / TASKS / PROJECT_STATUS / HANDOFF）建议作为一个单独的 docs commit 提交（代码 `4f5d707` 已先行提交）。
- backlog 只剩 **T-005 前后端结构数据去重**（搁置、低优先级，需先设计后实现）。这是「先设计」类任务、且涉及后端发布边界，动手前先与用户确认范围与是否现在做。
- 若后续继续几何下沉，`ZnSPolytypeCell` 的 `SulfurPackingLayer` 布点、`ZincMetalCell` 其余布点可按同款零副作用标准继续抽，但每次都要保 viewer JSX / 相机 / 交互不变，并补单测。

---

## 往期

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

## 往期

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
