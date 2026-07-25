# HANDOFF.md

> 最近一次 Agent 的交接记录。下一个 Agent（Claude Code 或 Codex）开工前先读这里。
> 每次完成工作后覆盖/追加本文件的“最近一次交接”。历史可下移到“往期”。

---

## 最近一次交接

- **Agent**：Codex（独立复核者）
- **日期**：2026-07-25
- **分支**：`main`，复核开始前与 `origin/main` 为 `0 ahead / 0 behind`
- **任务性质**：只读复核后的治理文档事实校正；未修改业务代码

### 本次修改

只修改用户明确允许的 4 个文件：

1. `AGENTS.md`
   - 补充前端真实入口链、关键数据/Viewer 注册文件和不可误改文件。
   - 把“教学数据全部在 manual”修正为“23 个结构 JSON 在 manual，其他教学数据还分布在 `data/*.ts`”。
   - 补充 Node 要求、5 个环境变量、SPA history fallback 风险和 Playwright 当前运行条件。
2. `docs/PROJECT_STATUS.md`
   - 用可重复统计的口径记录：44 个 three 源码文件、24 个 Canvas 主 Viewer、23 个 manual JSON、17 个 known organic molecules、33 个页面 state。
   - 区分“工作区已实现”“验证通过”“已提交/已交付”。
   - 记录当前 Git 脏工作区、测试结果、化学 TODO 和待确认项。
3. `docs/TASKS.md`
   - 将 ViewerErrorBoundary 与治理规范交付改为“进行中”。
   - 把 T-001 改成动态覆盖 17 个词典分子的表驱动测试，并避免重复现有 23 项测试。
   - 为 T-002 和低优先级任务补充具体范围与验收标准。
4. `docs/HANDOFF.md`
   - 用本次独立复核结果覆盖最近交接，并保留 Claude Code 的往期记录。

本次没有修改 `docs/DECISIONS.md`，因为没有作出新的技术决策。

### 独立验证结果

- `git fetch origin`：成功；当时本地与上游为 `0 / 0`。
- `frontend npm run build`：通过，2313 个模块完成构建。
- `frontend npm run lint`：通过。
- `frontend npm run test:logic`：23 / 23 通过。
- `backend npm test`：5 / 5 通过。
- `frontend npm run test:visual -- --list`：14 个文件、109 个用例。
- 快照统计：80 张，全部为 Darwin；Windows/Linux 为 0。
- 默认 Playwright 无截图冒烟：失败，缺少 `chromium_headless_shell-1228`。
- PowerShell 设置 `$env:PLAYWRIGHT_CHANNEL='chrome'` 后重跑同一冒烟：1 / 1 通过。
- 完整视觉回归未运行；`video/` 依赖未安装，因此未验证视频子项目。

`npm run build` 有非阻断的 chunk size 警告：`three` 约 688 KB。

### 当前未收口的前序改动

以下不是本次文档校正产生的，后续不要误混入提交：

- `frontend/src/pages/ModuleDetailPage.tsx`：已接入 ErrorBoundary 的未提交修改。
- `frontend/src/components/common/ViewerErrorBoundary.tsx`：未跟踪业务文件。
- `frontend/package-lock.json`：39 行 npm 平台 `libc` 元数据被删除。
- `.tmp-npm-cache/`：未跟踪、约 10.8 MB、未被当前 `.gitignore` 覆盖。
- `CLAUDE.md`：未跟踪。
- `docs/DECISIONS.md`：未跟踪。

### 已确认的关键事实

- 根目录和 `frontend/` 均没有 README；是否创建为待确认。
- 前端当前不调用后端 API。
- 后端还读取未在旧共享文档中说明的 `CORS_ORIGIN`。
- 前端视觉测试读取 `PLAYWRIGHT_CHANNEL` / `PLAYWRIGHT_PORT`。
- 视频素材采集读取 `CHEM3D_CAPTURE_URL`。
- `knownOrganicMolecules` 是 17 个，不是 18 个。
- 现有 logic 测试已经较广，但没有逐项覆盖全部 17 个词典结构。
- `MoleculeRecord` 实际类型比 `MOLECULE_DATA_SCHEMA.md` 展示的字段更丰富；该文档不在本次允许修改范围内。
- `DESIGN_SYSTEM.md` 的 Text Secondary / Border 色值与 Tailwind 实现不一致；该文档不在本次允许修改范围内。

### 风险与建议

- 优先完成 `T-ERR`：先证明 fallback、路由复位和“重新加载模型”的真实行为，再提交业务改动。
- React Error Boundary 不捕获所有异步、事件处理或 R3F 动画帧错误，交付说明不能承诺“覆盖所有 WebGL 白屏”。
- 手写 JSON 通过 `as unknown as MoleculeRecord` 接入，尚无 schema / 引用完整性测试。
- 当前两处 `TODO-CHEM-VERIFY`：BF₃ 缺电子表述、CaF₂ 约 5.46 Å 晶胞参数。
- 不要在 Windows 更新现有 Darwin 快照。

### 给下一个 Agent 的唯一建议

领取 `T-ERR ViewerErrorBoundary 收口与行为验收`，只处理 `ViewerErrorBoundary.tsx` 与 `ModuleDetailPage.tsx`，先验证再决定最小修复；不要顺带提交 lockfile、缓存或未跟踪治理文件。

---

## 往期

### 2026-07-25 Claude Code

- 在工作区新增 `ViewerErrorBoundary.tsx`，并在 `ModuleDetailPage.tsx` 包裹 3D viewer 的 `Suspense`。
- 初始化/扩充 AGENTS、CLAUDE、PROJECT_STATUS、TASKS、DECISIONS、HANDOFF。
- 安装 `frontend/node_modules`，记录 build 与 lint 通过。
- 遗留：ErrorBoundary 未做真实故障视觉验收；lockfile、npm 缓存和多份治理文件未收口。
