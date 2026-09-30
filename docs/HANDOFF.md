# HANDOFF.md

## 当前任务

- **任务**：全项目体检第一梯队快速赢（2026-09-30，Claude Code，直接 push，两个提交）。前序同日：T-043 Phase 2 全部收口（杂化 + Ren₃ + 极性，含算法单向让位修正）、D-051 输出模式、D-052 直接 push 流程。

## 本次改了什么

- **删除零引用死代码 7 个文件（约 390 行）**：`components/motion/` 下 ChemistryCursor / CursorBenzeneFollower / FloatingChemistryBackground / MoleculeBackground（其中 ChemistryCursor 是全库唯一运行时性能异味：mousemove setState + 常驻无限旋转动画）+ `hooks/usePointerFollower` + `three/ViewerPlaceholder` + `common/PageShell`。删除前逐个 grep 复核（含 tests 目录）零外部引用；`motion/ScrollReveal.tsx` 是活文件保留。
- **CI：quality-gate 补 backend `npm test`**（deploy-pages.yml）——直接 push 模式下每次推送都会跑 lint + logic + backend 测试，backend 22 个测试首次进入 CI。backend 零依赖无需安装步骤。
- **文档**：HANDOFF（本文件）。

## 体检报告的两处误报澄清（未改动，避免过度整理）

- 「根 .gitignore 缺 test-results」——误报：`frontend/.gitignore` 已覆盖（层级 gitignore 生效，check-ignore 实证）。
- 「assets/readme 是空目录」——误报：内有 README 引用的 organic-builder.png 与 hero.svg。

## 验证

- 删除后：`npm run build` 通过、lint 零警告、logic **163/163**、visual 全套 **176/176**（19.5 分钟）。
- CI 改动由本次 push 的 deploy 流水线实测（quality-gate 首次跑 backend 测试）。

## 遗留问题

- 体检第二梯队：mockMolecules 瘦身 + JSON 按模块懒加载、测试 helpers 模块去重（71 处 waitForTimeout / 7 份复制粘贴 callout helper / PNG 解码器 ×2）、tsconfig 强化。
- 体检第三梯队与子系统决策：晶体 cell 样板合并、TeachingHtml 包装器、three chunk 隔离、backend 冻结决策、video 采集管线修复（capture-assets.mjs 的「六配位」步骤已失效）。
- T-043 尾巴：密堆积配位视图布局缺陷（随 T-041-B rebuild 周期）→ fadeTo 启用；标签×信息卡遮挡。
- T-041-B/C/D、rc.2 发布路径（video 重采后自然时点）。

## 下一步建议

1. 体检第二梯队：mockMolecules 瘦身 + JSON 懒加载（一个 PR 量级，直接 push）。
2. T-041-B + 密堆积布局 + fadeTo 启用 + 推荐卡重复，攒一个 rebuild 周期。
