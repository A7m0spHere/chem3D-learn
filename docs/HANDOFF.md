# HANDOFF.md

## 当前任务

- **任务**：批次 A——移动端主视区 + 推荐卡重复 + 缺陷②闭环 + fadeTo 决策-实现背离修复（2026-09-30，Claude Code，直接 push，三个提交）。**T-043 三项已知缺陷全部闭环，T-041-B 主体达标**，待 verify + rebuild 基线人工审核收口。
- **前序同日**：T-042（PR #10）、Phase 1 审计（PR #11）、文档整理（PR #12）、杂化体系（PR #13）、D-051/D-052、Phase 2 收口（Ren₃ + 极性 + 单向让位）。

## 本次改了什么

- **T-041-B 主体（`ThreeViewerFrame.tsx`）**：舞台行 `minmax(0,1fr)` → `minmax(340px,1fr)`。诊断发现台账的「177px」是 PR #9 修复摘要栏之前的快照——MOF-5 现已 357px（42.3% 达标），但其余晶体页仍差一线（NaCl 39% / 密堆积 37% / CaF₂ 39%）。340px 下限使全部页面移动端画布 ≥40% 屏高（390 达 40.3%、360 达 45.7%）；桌面现有舞台均 ≥388px 逐像素不变。
- **挂账②推荐卡重复（`ModuleCard.tsx`）**：无 formula 且标题不含「：」的专题模块（σ 键 / π 键 / 离子键形成等），大字行回退 `title.split("：")[0]` 渲染出与 h3 相同的完整标题（σ 键卡两张「σ 键」叠放，维护者审查截图 08 号即此）。改为无「：」时不渲染大字行；σ 键卡 DOM 断言 + 目检确认唯一标题。分子模块有 formula，渲染不变。
- **T-043 缺陷②闭环**：批次 A 以 1280×800 / 1280×720 × 新加载 / 模式切换共 6 种配置复测密堆积配位视图，**全部正常**（结构实测居中，截图留证）——「顶出上缘」推定随 PR #9 布局修复 incidental 解决。留证闭环，不修。
- **T-043 ③ fadeTo 决策-实现背离修复（`useClampedHtmlPosition.ts` + `CalloutLabel.tsx`，D-050 勘误第 4 条）**：探针实锤配位视图三个教学徽章 span opacity = 0.3（幽灵不可读）——`fadeTo ?? 0.3` 的默认值使淡出对全部 CalloutLabel **暗中开启**，与 D-050「默认关闭」决策相反。修复为 `options?.fadeTo`（undefined 即关闭）；`CalloutLabel` 新增 `fadeTo` / `minCovered` 透传 prop 作为按 viewer 显式启用通道。配位徽章恢复 opacity 1（目检清晰可读）。
- **文档**：TASKS（T-041-B 主体完成、T-043 三缺陷闭环）、DECISIONS D-050 勘误第 4 条、HANDOFF（本文件）。

## 验证

- build / lint 通过；受影响 spec **95/95**（crystal-viewer、three-viewer-frame、specialty-viewers、core-learning-pages、module-state-reset、hybrid-scene-labels、mof5/molecular-polarity/ren3/polarity 守卫与断言）。
- 目检：MCP 配位 1280（徽章 opacity 1 清晰可读）、MCP-390（画布 340px = 40%）、σ 键卡（唯一标题）、极性 360（此前已验）。
- **基线预期**：rebuild 将触碰——① 桌面 crystal 基线中 mcp 配位视图（徽章 0.3 → 1）；② Modules 页含 specialty 卡片的基线（大字行移除）；③ molecule 页面基线**预期零差异**（frame 高度不变）。落地后跑 verify 确认差异范围，再 rebuild + 人工逐张审核。

## 遗留问题

- 「标签×信息卡」遮挡（360px 下 p1 徽章躲进杂化信息卡）待入台账处理。
- T-041-C notesZh 接入（待维护者拍板接入方式）、T-041-D mxene 等待反模式。
- 体检第二梯队：mockMolecules 瘦身 + JSON 懒加载、测试 helpers 去重、tsconfig 强化；第三梯队：TeachingHtml、晶体样板合并、ChemCanvas、three chunk 隔离、11 路由基线补齐。
- video 采集管线修复 + 素材重采 → rc.2 发布 → T-031 反馈重启。

## 下一步建议

1. 跑 verify 确认差异范围 → 触发 rebuild → 人工逐张审核基线 PR（批次 A 收口）。
2. 体检第二梯队（mockMolecules 瘦身 + JSON 懒加载）。
