# HANDOFF.md

## 当前任务

- **任务**：项目目标审核 + T-040 收口 + T-041-A 质量门禁落地（2026-08-30，Claude Code）。
- **维护者确认**：① 按推荐顺序执行（T-040 收口 → T-041 A→B→C→D）；② T-041-A 选方案③（PR 视觉回归 + 部署前 lint/logic）。

## 同步与 PR 链

全程 `git fetch` 核对后推进，merge commit 风格与仓库一致，无 stash / reset / force：

| PR | 内容 | 结果 |
| --- | --- | --- |
| #6 | 526a96b：44px 断言补 `fonts.ready` + 诊断式输出（第一次修复，误诊） | 已合并（main `4b278f7`） |
| #8 | `waitForTouchTargetSettled`：等页面进入动画结束（第二次修复，真因） | 已合并（main `145dc2c`） |
| #7 | T-041-A 方案③：两个 workflow 加质量门禁 + 治理文档更新 | 已合并（门禁生效） |

## 关键发现（务必读）

1. **44px 触控失败的真因不是字体**：`ModuleDetailPage.tsx:1183` 整页容器挂 `motion-page-enter`（`motion.css:74`，350ms `scale(0.98→1)`）。动画进行中测量，rect 被等比缩小（43.12 = 44×0.98）。Windows 本机字体解析慢于 350ms 所以一直复现不了，Linux CI 上 `fonts.ready` 秒回恰好落在动画窗口。诊断式断言（输出实测 rect）是破案关键——**后续新增二值尺寸断言时必须先等 `waitForTouchTargetSettled`**（见 D-049）。
2. 这是 T-040 期间第二例「平台时序差异被错误归因」（第一例是「软件渲染超时」）。遇到「只在 CI 失败」的测量类断言，优先怀疑动画 / 字体交换的时序，让断言输出实测数据。

## 本次改了什么

- `frontend/tests/visual/specialty-viewers.visual.spec.ts`、`crystal-3d-first.visual.spec.ts`：各加 `waitForTouchTargetSettled` helper（fonts.ready + `.motion-page-enter` 有限动画 finished），替换三处 44px 断言的测量前等待。
- `.github/workflows/deploy-pages.yml`：新增 `quality-gate` 作业（lint + test:logic），`build` `needs` 它——push main 与手动触发均生效。
- `.github/workflows/visual-regression.yml`：增加 `pull_request` 触发（目标 main，路径限 `frontend/**` 与 workflow 自身）；PR 事件一律 verify（`RUN_MODE: ${{ inputs.mode || 'verify' }}`），rebuild 仅限手动；concurrency 按 PR 分组、新提交取消旧运行。
- 文档：TASKS.md（T-040 移入索引、T-041-A 标记完成）、PROJECT_STATUS.md（2026-08-30 快照）、DECISIONS.md（D-048、D-049）、archive（T-040 完整收口记录）、本文件。

## 验证

- Linux CI：`verify` 连续两轮 **168 / 168**（runs `33309722930`、`33310145143`，main `145dc2c`）——T-040 收口条件满足并关闭。
- Windows 本机：lint 通过；logic **163 / 163**（门禁两步本地预验证）；系统 Chrome 通道 + `--ignore-snapshots` 两 spec **12 / 12**。
- `git status` 全程干净：无 win32 快照、无 lockfile / 缓存污染。

## 遗留问题（T-041 B/C/D，按序待办）

- **B（中）**：390px 下 3D 主视区仅 177px（约 21% 屏高）。`ThreeViewerFrame`（`min-h-[500px]` + 顶栏/摘要栏 `flex-wrap` 换行吃掉约 323px）是病灶。验收：canvas ≥40% 屏高、无横向溢出。**改动会影响 Linux 基线，必须走 rebuild → 人工逐张审核 PR 流程**；A 已合并，B 的 PR 会自动触发 PR 视觉回归（预期对基线红，属正常信号）。
- **C（中）**：23 份 JSON 的 `metadata.notesZh` 零消费者；UI「模型边界」是 `ModuleDetailPage.tsx` 中 8 处硬编码 `modelBoundary`，只覆盖专题模块。接入方式（并入 `StructureInfoDisclosure.modelBoundary` 处理长度，或 JSON 另立短字段）待维护者决策。
- **D（低）**：`mxene-callout.visual.spec.ts` 的 `waitForTimeout(1000)` 应改事件驱动；需先在 CI 上验证避免引入 flaky。

## 平台与环境边界（不变）

- Linux 78 张基线为现行基线；darwin 78 张为遗留待清理；任何平台的快照不得在 Windows 本机更新。
- Windows 本机跑 `playwright test` 必须带 `--ignore-snapshots`，用系统 Chrome 通道（`PLAYWRIGHT_CHANNEL=chrome`）。
- verify / rebuild 由 `.github/workflows/visual-regression.yml` 承担：`gh workflow run visual-regression.yml --ref main -f mode=verify`。

## 下一步建议

1. 决策 T-041-C 的接入方式后实施 B / C（各为独立 PR；B 走 rebuild 流程）。
2. T-041-D 借一次 CI verify 验证事件驱动改写。
3. 全部收口后发 `v0.1.0-rc.2`，重启 T-031 真实反馈收集。
4. 可选：Settings → Branches 把 `lint / test:logic / visual` 设为必需检查；清理 darwin 旧基线。
