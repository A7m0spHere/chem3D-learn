# HANDOFF.md

## 当前任务

- **任务**：无进行中任务。T-039A～D 全站 3D-first 收缩已于 2026-08-13 全部收口（HEAD `14badfe`）。
- **日期**：2026-08-27 文档整理后交接快照
- **下一项**：见 `docs/TASKS.md` 待办区——先做「视觉基线审核解法决策」（原计划 macOS 默认 Chromium 集中审核 T-039 影响的过期基线；备选思路是迁移到可复现 CI 环境，由维护者选择），决策前不直接更新任何快照。

## 上次交付摘要（T-039D，2026-08-13）

- Organic Builder 右栏收为常驻实时摘要 + 默认折叠「诊断详情」；拼装、3D 操作、命名、键角、官能团与验证数据流未改。
- Modules 卡片压缩为两行说明 + 单行观察重点；Paths 删除重复自学段落。模块数、分组、路由及 Exam 未改。
- 17 份晶体 JSON 删除无消费者的 `crystalTeaching`，另删 5 份 JSON 的契约外顶层标题 / 描述字段。
- 新增六档视口契约测试覆盖 Builder、Modules、Paths 与三个 Viewer 家族。
- 验证：lint、build、logic **163 / 163**、系统 Chrome 回归合计 **40 / 40**、production **4 / 4** 通过；横向溢出与浏览器错误为 0，关键动作 ≥44px。Windows 未运行或更新 Darwin 快照。

## 平台与环境边界

- 视觉基线只有 `*-darwin.png`（80 张）；Windows 环境一律不得更新快照（仓库既有规则）。
- 浏览器行为回归使用系统 Chrome 通道（`PLAYWRIGHT_CHANNEL=chrome`）；默认 Playwright Chromium 无头壳未安装。
- Windows 下使用 Git Bash 路径与 `npm.cmd`；向项目所有者提供的命令用 PowerShell 语法。

## 治理文档索引

- 待办与状态流转：`docs/TASKS.md`；全局事实与风险：`docs/PROJECT_STATUS.md`。
- 历史任务全文与逐日独立验证日志：`docs/archive/TASKS_ARCHIVE_20260827.md`、`docs/archive/PROJECT_STATUS_ARCHIVE_20260827.md`（只读存档）。
- 共享规则、流程与禁止事项：根目录 `AGENTS.md`（CLAUDE.md 仅承载 Claude Code 专用补充）。
