# HANDOFF.md

## 当前任务

- **任务**：T-040 视觉基线迁移至 ubuntu CI（2026-08-27 启动，Claude Code）。
- **内容**：新增 `.github/workflows/visual-regression.yml`（`verify` / `rebuild` 两种 dispatch 模式）；首次 `rebuild` 在 `visual-baselines/linux-rebuild-*` 分支生成 `-linux.png` 基线并开评审 PR，**必须人工逐张审核后合并**。
- **验收**：合并 rebuild PR 后，`verify` 连续两轮全绿；之后 UI 迭代的视觉回归由 CI 承担。darwin 旧基线的清理是独立后续任务。
- **同日决策记录**：T-031 真实用户反馈待 `v0.1.0-rc.2` 发布后重启（rc.2 前置 = T-040 完成）。

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
