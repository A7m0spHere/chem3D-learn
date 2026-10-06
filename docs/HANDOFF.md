# HANDOFF.md

## 当前任务

- **任务**：批次 B（零散收口）+ 批次 C（体检第三梯队第一批），2026-10-06，Claude Code，直接 push。共 6 个提交：`f95ba63`（缺陷④修复）、`8c92fba`（T-041-D）、`c1e1a5d`（D-053）、`e40ab88`（C-1）、`82742b0`（C-2）、文档收口。
- **前序**：2026-09-30 的 mock 层退役与 T-043 Phase 1/2（见 git log 与 `docs/archive/`）。

## 本次改了什么

### B-1 T-043 遗留缺陷④「标签×信息卡」（`f95ba63`）

- **缺陷比台账记载严重**：复测（sp/sp²/sp³ × 360/390/1280 共 9 组 DOM 几何扫描）发现不止「360px 下 p1 徽章躲进信息卡」——Y/Z 轴标签与 p1/p2/180° 徽章在**全部视口**被信息卡遮盖 22-100%，桌面 1280 的 Z 轴标签也被盖 51-100%。原因：碰撞体系只管「标签×标签」，顶部覆盖卡是 fullscreen DOM，不在 registry 里。
- **修复**：`useClampedHtmlPosition.ts` 新增能力 4 `useStaticHtmlObstacle()`——覆盖卡登记为碰撞障碍物（负 id、按元素 WeakMap 复用防重挂载泄漏、不可见自动退出）。`HybridOrbitalScene` 的信息卡/图例卡接入，场景标签完全让出卡片矩形。
- **顺带修正分离算法两处真 bug**（障碍物引入后暴露）：
  1. **Map 迭代按插入序不按 id 序**——障碍物晚于标签首帧注册时排在末尾，标签先分离再被推回彼此身上（实测冻结 85% 叠印）。改为显式两段遍历：先障碍物后标签。
  2. **穿越式推挤欠推**——`overlapY + 2` 只够推到对方中心附近；跨过对方中心时改用 `hh + rect.hh + 2 - direction*(y-rect.y)`（推到远侧外 2px）。
  3. **唤醒带单向堆叠**——被卡推离的标签沿同方向继续让位（registry 条目带 `wake` 方向），对称互推会把对方推回卡内。
- **守卫**：`hybrid-scene-labels.visual.spec.ts` 新增「标签×覆盖卡遮盖 ≤5%」断言（遮盖 30% 即内容不可读，5% 阈值留余量）；台账 `LABEL_AUDIT_20260930.md` 第 2 节补缺陷④行。极性/Ren₃/电子云守卫回归 11/11 ✓。

### B-2 基线收口决策 D-053（`c1e1a5d`）

- 批次 A 后 verify 对既有基线零差异（机制见 `a1a9f5c`），rebuild + 人工逐张审核只会产出相同图片。D-053：**verify 全绿即视为基线同步、关闭 rebuild 前置；有真实差异才走 rebuild PR**。T-041-B、T-043 Phase 4 据此关闭（首轮 verify run `37458457980` 已全绿确认）。

### B-3 T-041-D（`8c92fba`）

- `mxene-callout.visual.spec.ts` 的 `waitForTimeout(1000)` 改为 fonts.ready + 页面进入动画的 settle 模式（与 hybrid 守卫同款）。Windows 4/4 ✓，随 CI 全量套件验证。

### C-1 TeachingHtml 包装器（`e40ab88`）

- 新组件 `TeachingHtml`（center + pointerEvents="none" + distanceFactor/position/zIndexRange 透传；**distanceFactor 不设默认**，各页 6.8-7.8 是调过的参数）。codemod 迁移 three/ 下 **69 处**样板；交互层（pointerEvents 可点击）与接入 `useClampedHtmlPosition` 的受钳标签（calculatePosition）不迁移。
- 教训：node 脚本处理 CRLF 仓库要先归一化再匹配（`\r\n` 导致首跑正则全空）；codemod 要防止改到目标组件自身文件。

### C-2 晶体 cell 样板合并（`82742b0`）

- 新组件 `CrystalSceneCanvas`（Canvas(demand) + SceneLighting + OrbitControls 标准块，ambient/secondaryIntensity/相机回退/缩放距离显式传参）+ `crystalEdges.unitCellEdges(half)`（12 条晶胞棱单一真源）。
- **迁移了 6 个同质页**（Diamond/CsCl/Pba/SodiumMetal/VoidStructure/CaF2），-96 行。
- **实测修正 HANDOFF 上「约 600 行」的估计**：晶体 cell 的 CellFrame（各文件实现不同）、灯光（0.68-0.74）、相机回退、CameraRig 均为逐分子调参，逐一对比后真正同质的只有上述子集；带 CameraRig / 动态 frameloop / onCreated 的 7 个页面（BaTiO₃/MOF-5/Ren₃/MXene/石墨/锌金属/NaCl 工作台）结构不同，不迁移。体检第三梯队其余项（ChemCanvas wrapper、registry 表格化、three chunk 体积守卫、11 条路由基线、tsconfig 强化）仍待做。

## 验证

- `npm run build` ✓、`npm run lint` ✓、`npm run test:logic` 163/163 ✓。
- 全量 visual 套件（chrome 通道 `--ignore-snapshots`）**177/177**（C-1 后）；晶体相关 32/32（C-2 后）；杂化守卫 3 视口 × 3 模式含新卡片断言 ✓。
- CI：首轮 verify run `37458457980` 全绿（批次 B + C-1，D-053 收口依据）；deploy-pages（含 quality-gate）run `37458426010` 全绿。C-2 的最终 verify 见 run `37459897092`。

## 遗留问题

- 体检第三梯队第二批：three chunk 函数式 manualChunks 隔离 + CI 体积守卫、ModuleDetailPage registry 表格化、ChemCanvas wrapper、11 条路由基线补齐、tsconfig 强化。
- T-041-C：`metadata.notesZh` 无消费者（待维护者决策短字段 vs 折叠渲染）。
- video 采集管线修复 + 素材重采 → rc.2 → T-031 反馈重启；backend 冻结决策。
- 本机 `ui-review-20260830/`（8-30 的 UI 评审截图，1.1MB，其中问题均已修复）待维护者决定去留；`.mimosa/` 已加 .gitignore。

## 下一步建议

1. 体检第三梯队第二批，优先 **three chunk 函数式 manualChunks 隔离 + CI 体积守卫（S）**——守住 mock 退役后的加载成果。
2. T-041-C 决策后接入 notesZh。
3. video 管线修复 → rc.2 发布 → T-031 反馈重启。

## 附：分支清理记录（2026-10-06）

- 上次整理（2026-09-30，commit `90fbdea`）保留的 2 个未合并分支已**确认废弃并删除**：
  - `codex/motion-performance-audit`（tip `6c7737d2ee9281a95166409b67877cb6c8a99e1b`）——其改动 4 个文件中 3 个（ChemistryCursor / FloatingChemistryBackground / MoleculeBackground）已被死代码清理（`ffa379b`）删除，剩余 ScrollReveal 微调属弃案；`git cherry` 确认从未进 main。
  - `codex/t039a-3d-first`（tip `80dd25227bacf9702c59a604cb01849ddfcaeffc`）——T-039A 最终版经 PR #2（`5f3606a`）以另一形态合并，本分支是被取代的旧迭代，且含与现状相悖的「移除 Claude 协作入口」提交。
- 恢复锚点：上述两个 tip SHA 可用于 `git fetch origin pull/<n>/head` 或从 GitHub 事件日志找回；main 历史未重写。
- 远端现状：仅 `main` + GitHub 自动保留的 `refs/pull/*` PR 存档；本地仅 `main`；无 stash。
