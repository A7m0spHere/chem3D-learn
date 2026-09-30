# HANDOFF.md

## 当前任务

- **任务**：交付流程改为直接 push 到 main，不再开 PR（2026-09-30，Claude Code）。维护者原话："以后不直接pr，能push就push"。决策记录：DECISIONS D-052；本提交即为新流程的首次执行（直接 push）。
- **同日已完成**：输出模式改为自然汇报（D-051，PR #14 已合并清账）；T-043 Phase 2 首个体系（杂化场景标签，PR #13 已合并）；文档整理（PR #12）；T-042（PR #10）；T-043 Phase 1（PR #11）。

## 本次改了什么

- `AGENTS.md`（GitHub sync and delivery）：新增「直接 push 到 main，不开 PR」条目，含两条配套规则——历史未合并 PR 仍按收口条件合并但不再新开；PR 触发的视觉回归不再自动运行，重要前端改动落地后手动跑 `verify` 确认。
- `docs/DECISIONS.md`：新增 D-052（背景、决定、连带影响、边界）。
- `docs/HANDOFF.md`：本文件。

## 验证

- 纯文档改动，`npm run build` 不适用；本提交直接 push 到 main（新流程首次执行），deploy-pages 的 quality-gate（lint/logic）随部署自动运行。

## 遗留问题

- 全项目体检报告（2026-09-30 会话）的优化清单待排期：第一梯队（死代码删除、CI 门禁补口、仓库卫生）、第二梯队（测试 helpers、mockMolecules 瘦身 + JSON 懒加载）、第三梯队与子系统决策项（backend 命运、video 采集管线修复）。
- T-043 Phase 2 剩余：Ren₃ 注释层、极性原子标签接入 collisionGroup。T-041-B/C/D 待办不变。
- 标签×信息卡遮挡（360px 下 p1 徽章躲进信息卡）待入台账处理。

## 下一步建议

1. 全项目体检第一梯队快速赢（半天内）。
2. T-043 Phase 2 第二项：Ren₃ 注释层重排。
