# HANDOFF.md

## 当前任务

- **任务**：T-041 code review 收口（2026-08-28，Claude Code）。上游同步 + 对 T-040 合并后 `main` 的一次完整 review，并修复其中低风险项。
- **同步**：`git pull --ff-only` 从 `14badfe` 快进到 `e0bfc39`（13 个提交，T-040 视觉基线迁移至 Linux CI）。工作区全程干净，无 stash / reset / force。

## 本次改了什么

**无障碍（11 处，不改变任何渲染输出）**

- `ModeToolbar.tsx` 模式按钮补 `aria-pressed`——T-040 只给同文件的视图切换按钮加了，模式组漏了；该组被 Acetylene / Benzene / Ethylene / MolecularPolarity 四个工具条共用，改一处修四页。
- `BondingBasicsToolbar.tsx` 5 处（模式组 + 实体轨道 / 电子云 / 未杂化 p / XYZ），模式组顺带提取 `isActive` 变量与同族文件对齐。
- `OrganicCoplanarToolbar.tsx` 2 处、`SigmaPiBondToolbar.tsx` 2 处、`OrganicBuilderToolbox.tsx` 1 处。
- **有意跳过 2 处**：`SigmaPiBondToolbar` 播放 / 暂停、`OrganicCoplanarToolbar`「对齐平面 / 恢复 45°」。这两个按钮的可见文字随状态反向切换，属动作按钮；加 `aria-pressed` 会让读屏读出矛盾信息。理由见 D-047。

**测试与清理**

- `organic-builder.visual.spec.ts`：折叠态断言从 `toHaveCSS("grid-template-rows", "0px")` 改为轮询 `clientHeight === 0`，不再绑定「用 0fr 网格实现折叠」这一具体做法。
- `crystal-viewer.visual.spec.ts` / `scroll-reveal-layout.visual.spec.ts`：修正两处与代码不符的注释（写着「等 1100ms」，实际用的是 `toHaveCSS(transform)` 轮询）。
- `mxene-callout.visual.spec.ts`：只修正注释里的错误病因（不是补间动画，是 CJK 字体度量），**保留** `waitForTimeout(1000)`，原因见下方遗留问题 D。
- 删除死代码 `CrystalModelStyleToggle.tsx`（全 `src/` 零引用，功能已由 `CrystalModeToolbar` 的球棍 / 堆积按钮取代）。
- 删除 2 张孤儿基线 `molecule-viewer-nh3-lone-pair-darwin.png`、`sigma-pi-bonds-pi-viewer-darwin.png`（对应截图断言已不存在，Playwright 不检测未使用快照）。两套基线现各 78 张。
- `visual-regression.yml`：rebuild 步骤改用 `npm run test:visual:update` 而非 `npx playwright test --update-snapshots`；修正 PR body 里 `\*-darwin.png` 的多余转义。

**文档**

- `AGENTS.md` 修正 6 处过期事实：基线状态（80 张全 darwin → 各 78 张，Linux 为现行基线）、`test:logic` 83 → 163、`test:production` 3 → 4、命令表补 `test:visual:update` / `test:pages` / `test:sites`、部署状态从「待确认」改为记录已有的 `deploy-pages.yml`、仓库结构补 `.github/workflows/` 与 `docs/archive/`。
- `AGENTS.md` 新增护栏：Windows 本机跑 `playwright test` **必须**加 `--ignore-snapshots`（见下方教训）。
- `docs/DECISIONS.md` 追加 D-047；`docs/TASKS.md` 新增 T-041 四条待办。

## 验证

- `npm run build` 通过（保留既有 3D chunk 体积警告）；`npm run lint` 通过；`npm run test:logic` **163 / 163**。
- 系统 Chrome 通道 + `--ignore-snapshots`，受影响的 12 个 spec 共 **67 / 67** 通过（crystal-viewer、organic-builder、scroll-reveal、organic-coplanar、sigma-pi-bonds、mxene-callout、acetylene、benzene、ethylene、molecular-polarity、specialty-viewers、molecule-viewer）。
- `git status` 干净：无 win32 快照、无 lockfile 或缓存污染；darwin 78 / linux 78。

## 本次教训（务必读）

在 Windows 上用 `-g` 过滤「无截图用例」**不可靠**。本次一次遗漏 `--ignore-snapshots`，过滤命中了含 `toHaveScreenshot` 的 CaF₂ 用例，Playwright 因缺 win32 基线自动写入了 4 张 `caf2-*-win32.png`。已全部删除、未进入提交，但这正是 `AGENTS.md` 明令禁止的快照污染。此后任何 Windows 本机的 `playwright test` 都要带 `--ignore-snapshots`。

## 遗留问题（均已记入 TASKS.md T-041）

- **A（高，需你决策）**：`main` 没有自动质量门禁。push 主分支即自动部署到 GitHub Pages，流程内只跑 `test:pages`；视觉回归只能手动触发，实际上不拦截任何改动。三个候选方案与成本对比见 T-041-A。
- **B（中）**：390px 下 3D 主视区仅 177px（约 21% 屏高），与「不要把 3D viewer 缩成小装饰卡片」冲突；T-040 把测试下限 200 → 150 等于把现状固化为预期。修复会动 Linux 基线，需走 `rebuild` 流程。
- **C（中）**：23 / 23 份手写 JSON 的 `metadata.notesZh` 全库无消费者——经化学核验的模型边界说明（如「画面单位不等于 Å」）从未展示给学生；UI 上的「模型边界」是 `ModuleDetailPage.tsx` 里另一套硬编码短句，只覆盖专题模块。
- **D（低）**：`mxene-callout` 的 `waitForTimeout(1000)` 应改为 `document.fonts.ready`，但需先在 CI 上验证，避免把当前绿的用例改成 flaky。

## T-040 未收口部分

PR #4 已合并（本次 pull 即包含）。**收口仍需**：手动跑两次 `verify` 模式且连续全绿，之后才能关闭 T-040。darwin 旧基线（78 张）清理是独立后续任务。

## 平台与环境边界

- 视觉基线两套：**Linux 78 张为现行基线**（CI 维护，`visual-regression.yml` 的 `verify` / `rebuild`）；darwin 78 张为历史遗留，待清理。任何平台的快照都不得在 Windows 本机更新。
- 浏览器行为回归使用系统 Chrome 通道（`$env:PLAYWRIGHT_CHANNEL='chrome'`）并加 `--ignore-snapshots`；默认 Playwright Chromium 无头壳未安装。
- Windows 下使用 Git Bash 路径与 `npm.cmd`；向项目所有者提供的命令用 PowerShell 语法。

## 治理文档索引

- 待办与状态流转：`docs/TASKS.md`；全局事实与风险：`docs/PROJECT_STATUS.md`。
- 历史任务全文与逐日独立验证日志：`docs/archive/TASKS_ARCHIVE_20260827.md`、`docs/archive/PROJECT_STATUS_ARCHIVE_20260827.md`（只读存档）。
- 共享规则、流程与禁止事项：根目录 `AGENTS.md`（CLAUDE.md 仅承载 Claude Code 专用补充）。
