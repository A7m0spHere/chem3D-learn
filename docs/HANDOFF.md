# HANDOFF.md

## 当前任务

- **任务**：T-043 Phase 2 第一个体系——杂化专题 fullscreen 场景标签全视口叠印修复（2026-09-30，Claude Code，分支 `claude/t043-phase2-hybrid-labels`，**PR #13**）。前序同日：T-042 合并（PR #10）、T-043 Phase 1 审计（PR #11）、文档整理（PR #12）。
- **来源**：维护者指示按台账启动 Phase 2，先修 `docs/LABEL_AUDIT_20260930.md` 缺陷 1（杂化 `Y×p1` 43-67%、`p1×180°` 26-67%、`Z×p2` 33% 全视口叠印）。

## 本次改了什么

- **`HybridOrbitalScene.tsx`**：
  - `SceneBadge`（p1/p2/180° 等场景徽章）**去掉 distanceFactor 改恒定字号**并接入 `useClampedHtmlPosition`（collisionGroup `hybrid-scene`）——distanceFactor 徽章在 360px 视口宽达 57-78px，是与轴标签结构性挤压的根源之一；徽章不出现在任何截图基线，恒定字号同时改善移动端可读性。
  - sp 模式 **180° 徽章从弧顶移到弧 45° 外推 0.24 处**：弧顶正上方是 Y 轴标签与 p1 徽章锚点带，三个 pill 沿 +Y 堆叠间距小于高度和，碰撞分离在数学上无解（推开 180° 离开 Y 就撞进 p1）；45° 位置同样在标注的弧上、语义不变，且外推到主瓣梨形轮廓（45° 方向约 0.5）之外的净空，amber 底不再与青色瓣叠出发淡。
  - `SharedAxisTriad` 传入新 prop `labelCollisionGroup="hybrid-scene"`。
- **`OrbitalPrimitives.tsx`**：`AxisTriad` 新增**可选** `labelCollisionGroup` prop——传入时轴标签走新的 `ClampedAxisLabel` 分支（hook + `data-scene-label` 锚点），不传时渲染逐字节不变；**SigmaPiBondCell（有截图基线）与 electron-cloud 系列零影响**。
- **`useClampedHtmlPosition.ts`（通用修复，惠及全部接入体系）**：`measureRef` 实测尺寸变化时触发 3 帧 `invalidate`。根因：demand 渲染模式下挂载首帧 pill 未量得尺寸（hw/hh=0），分离/钳制按零尺寸点跳过，帧循环停止后**冻结在未收敛状态**（杂化模式切换后实测 38% 叠印冻结；T-042 场景靠拖拽连续渲染掩盖）。
- **守卫**：新增 `hybrid-scene-labels.visual.spec.ts`——sp/sp²/sp³ 三模式（进度固定 80）× 360/390/1280 视口，断言全部场景标签不出界、两两重叠 ≤25%（台账缺陷定义阈值）。
- **文档**：TASKS T-043 状态更新（Phase 2 ①已修）；HANDOFF（本文件）。

## 验证

- 守卫 **3 / 3**；标签相关回归（mof5-callout、molecular-polarity、specialty-viewers、sigma-pi-bonds、three-viewer-frame、electron-cloud-labels、module-state-reset）**69 / 69**（Windows 系统 Chrome + `--ignore-snapshots`）。
- `npm run build`（tsc + vite）通过；lint 通过。
- 目检：1280/360 sp、360 sp² 截图——六标签零叠印、徽章恒定字号后不再压模型、180° 徽章在瓣外净空处清晰可读。
- 基线预期：杂化 source 态基线（three-viewer-frame `hybrid-orbitals-source-state-viewer.png`）只含远离的 X/Y/Z 轴标签（无徽章、钳制 no-op、scheduleSettle 不改像素），sigma-pi 基线组件未触碰——预期 verify 零差异。

## 遗留问题

- **T-043 Phase 2 其余两项**：② Ren₃ 注释层被图例完全遮盖（内容不可达类）；③ 极性 `TinyAtomLabel`/`ChargeMarker` 接入 collisionGroup（与 D-050 第 4 条淡出启用前提相关）。
- **本次新发现（建议入台账）**：360px 下 sp/sp² 的 p1 徽章会躲进左上信息卡（`SceneOverlay`）背后——信息卡与场景标签的遮挡是另一类关系，本次守卫只覆盖标签×标签；后续可评估窄视口收窄信息卡或为徽章避让卡片矩形。
- T-041-B/C/D 待办不变；远端约 22 个历史分支与 darwin 快照待维护者清理。

## 下一步建议

1. 维护者合并本 PR 后继续 Phase 2：Ren₃ 注释层重排 → 极性原子标签接入 collisionGroup。
2. 把「信息卡遮挡场景标签」补进台账（可并入 ③ 的极性/杂化收尾或单列）。
3. 每体系收口后跑一次 ledger 第 4 节方法的复核扫描，防新欠账。
