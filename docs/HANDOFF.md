# HANDOFF.md

## 当前任务

- **任务**：全库文档整理（2026-09-30，Claude Code，分支 `claude/docs-tidy-20260930`）。前序同日工作：T-042 合并（PR #10，含评审修复自反馈振荡 P1）与 T-043 Phase 1 审计落档（PR #11）。
- **来源**：维护者要求「整理下项目的文档」。整理前用探索代理对 `docs/` 全量扫描，逐文件核对陈旧断言、矛盾与引用完整性。

## 本次改了什么（文档整理）

- **状态三件套对齐现实**：
  - `PROJECT_STATUS.md`：最后更新改为 2026-09-30；任务面改写为「T-042 已合并（PR #10）+ T-043 Phase 1 已完成（PR #11）+ 当前最重要任务是 T-043 Phase 2」；verify 数字更新为最新 169/169（run `36671342932`）；里程碑表补 2026-08-27 ~ 09-30 两行。
  - `TASKS.md`：进行中段刷新；**T-042 详情块从待办移除**（内容由 D-050 评审更正 + LABEL_AUDIT + 本文件承载），完成索引新增 T-041-A / T-042 / T-043 Phase 1 三行；T-043 已知缺陷①按台账修正为「fullscreen 场景标签全 6 视口叠印，不止移动端」。
  - `HANDOFF.md`：本文件。
- **矛盾与过时断言清理**：
  - `QA_CHECKLIST.md`：移除已取消的自测闭环检查项（T-035/036 取消、D-039/D-044 方向）与「少量朋友 Alpha」表述（对齐 T-031：rc.2 后重启、不自动启动朋友/同学 Alpha）；**Darwin 视觉回归整节重写为 Linux CI 现实**（保留仍然有效的通用原则，新增 D-049 稳定等待惯例）。
  - `README.md`：修正「视觉快照以 macOS 基线为准」→ Linux CI 基线；「步骤讲解 / 分步讲解」措辞改为「精简中文讲解 / 右侧控制栏」（T-039A 已移除普通分子的课程步骤）。
  - `AGENTS.md`：修正「当前没有根 README」（T-025 已于 2026-07-29 建立）；目录树补 README 与 docs/ 下此前漏列的 CHEMISTRY_VERIFICATION / LABEL_AUDIT / RC_FEEDBACK / BACKEND_DATA_SYNC / guided-observation / releases。
  - `ROADMAP.md`：Current 段由「Product Completeness and Alpha Readiness」改写为「Label/Annotation Hardening (T-043)」，移除朋友 Alpha 句与指向已归档审计的「执行顺序」指针。
  - `CHEMISTRY_VERIFICATION.md`：移除「T-029B macOS 视觉回归仍待执行」（实际已于 2026-07-29 执行 146/146）；头部标注文件清单为检索时点快照（`*Panel.tsx` 已在 T-039B 删除）。
- **归档**：`docs/PRODUCT_COMPLETENESS_AUDIT.md` → `docs/archive/PRODUCT_COMPLETENESS_AUDIT_20260810.md`（内容冻结于 2026-08-10，加归档横幅；引用方 ROADMAP / CHEMISTRY_VERIFICATION 已同步更新）。
- **有意不动**：治理文档间的受控重复（保护 ID / Avoid 风格清单在 PROJECT_BRIEF、CODE_REVIEW、QA_CHECKLIST、UI_SPEC、DESIGN_SYSTEM 各出现一次）——各文档面向不同读者需可独立阅读；`docs/guided-observation/` 两个历史审计保留原位（DECISIONS D-040 以路径引用，append-only 不改写历史记录）；`gemini-ui-draft.md` 保留（PROJECT_BRIEF / CODE_REVIEW 指定的 Gemini 草稿存放地）；`BACKEND_DATA_SYNC.md` 保留（后端接线设计参考，步骤 1-2 未实施标记属实）。

## 验证

- 纯文档改动，`npm run build` 不适用（AGENTS.md：documentation-only 任务不跑 build）。
- 全库 docs 交叉引用经检索复核：无断链；唯一失效的代码路径引用（CHEMISTRY_VERIFICATION 中的 `*Panel.tsx`）已加时点标注。

## 遗留问题

- **T-043 Phase 2 未开始**——当前最高优先级，按 `docs/LABEL_AUDIT_20260930.md` 第 5 节排序：杂化 fullscreen 叠印 → Ren₃ 注释层 → 极性原子标签接入 collisionGroup。T-041-B/C/D 待办不变。
- 远端约 22 个历史分支与 darwin 78 张遗留快照待清理（均为维护者操作）。
- ROADMAP v0.x 章节命名与已发布 `v0.1.0-rc.1` 的统一（PROJECT_STATUS「其他待确认」既有项）。

## 下一步建议

1. T-043 Phase 2 按台账排序实施（每体系独立小提交 + 守卫断言）。
2. 远端分支与 darwin 基线清理（维护者操作，前者可在 GitHub 合并时勾选自动删除）。
