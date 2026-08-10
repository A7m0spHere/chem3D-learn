# AGENTS.md

## Project Role

You are working on Chem3D Learn / 结构化学 3D 学习站.

This project is a Chinese high-school structural chemistry 3D learning website for ordinary students and classroom projection. It is a front-end-first educational product. The current frontend implementation is the source of truth for product shape.

Primary users:
- 中国高中普通学生
- 化学教师课堂展示

Primary goal:
- Help students understand spatial chemical structures through interactive 3D visualization, step-by-step explanation, and concise Chinese teaching content.

This project is not:
- a full chemistry database
- a large question bank
- a backend SaaS product
- a drug discovery platform
- an AI chat product

## Communication Rules

- 默认使用中文回复用户，包括过程说明、计划、总结和最终报告。
- 只有当用户明确要求英文，或需要保留代码、命令、错误信息、文件名、API 名称等原文时，才使用英文。

## Current Product Direction

当前以已经生成的前端为准。现有前端包含：
- Home page
- Modules page
- Module detail / 3D learning experience
- Paths page
- Exam page
- About page

Core 3D teaching content remains priority:
- CH4
- NH3
- H2O
- CO2
- BF3
- simplified NaCl teaching model

Extended module cards, routes, and placeholder learning sections may exist in the frontend as content structure. They should stay lightweight and classroom-friendly unless explicitly expanded.

Do not add unless explicitly requested:
- Login
- User accounts
- Database-backed user state
- Teacher admin panel
- Payment
- Dynamic SMILES input
- RDKit runtime API
- Gemini API
- AI chat features

Backend direction:
- A minimal backend may be added later based on the completed frontend.
- Backend work should follow frontend data and page needs.
- Backend should remain simple and read-only unless the user explicitly asks for more.
- Do not introduce database, auth, AI chat, Gemini API, or RDKit runtime as part of backend work unless explicitly requested.

## Tech Stack

Use:
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Three Fiber
- Drei

Do not use:
- Next.js
- Vue
- Angular
- Unity WebGL
- Firebase
- Database unless explicitly requested
- Large backend frameworks unless explicitly requested

## Repository Structure

Actual current structure（以仓库实际为准）:

```text
chem3D-learn/
├─ AGENTS.md            # 共享 AI 协作规则（本文件）
├─ PLANS.md             # 多步任务的一次性暂存区，完成后清空
├─ docs/                # 项目文档与治理文件
│  ├─ PROJECT_BRIEF.md / DESIGN_SYSTEM.md / UI_SPEC.md
│  ├─ MOLECULE_DATA_SCHEMA.md / CODE_REVIEW.md / QA_CHECKLIST.md
│  ├─ ROADMAP.md / ORGANIC_BUILDER_NAMING_SCOPE.md
│  ├─ ELECTRON_CLOUD_VISUAL_BASELINES.md / gemini-ui-draft.md
│  ├─ PROJECT_STATUS.md # 当前进度（完成 / 进行中 / 下一步）
│  ├─ TASKS.md          # 待办任务、优先级、状态、验收标准
│  ├─ DECISIONS.md      # 重要技术决策及理由
│  ├─ HANDOFF.md        # 最近一次 Agent 的交接记录
│  └─ ui-refactor/      # UI 改版前后对比截图
├─ frontend/            # 主产品：Vite + React 18 + TS + R3F
│  ├─ index.html        # Vite HTML 入口，挂载 /src/main.tsx
│  ├─ package.json      # 前端依赖与 build/lint/test 脚本
│  ├─ vite.config.ts    # @ 别名、3D vendor 分包与 modulePreload 策略
│  ├─ playwright*.ts    # logic / visual 两套 Playwright 配置
│  ├─ src/
│  │  ├─ main.tsx       # React 入口，挂载 RouterProvider
│  │  ├─ router.tsx     # 页面路由与 OrganicBuilder 懒加载入口
│  │  ├─ App.tsx        # 共享页头、Outlet 与路由滚动处理
│  │  ├─ pages/         # 页面级组件
│  │  ├─ components/
│  │  │  ├─ ui/         # shadcn/ui 基础组件
│  │  │  ├─ common/     # 共享布局 / 通用组件
│  │  │  ├─ learning/   # 各学习模块的 Toolbar / Panel
│  │  │  ├─ motion/     # 动效与装饰
│  │  │  └─ three/      # React Three Fiber 3D 组件（技术核心）
│  │  ├─ data/manual/   # 手写分子 / 晶体 JSON（结构记录真源）
│  │  ├─ data/*.ts      # 模块目录、考试专题与专项教学数据
│  │  ├─ hooks/ types/ lib/ styles/
│  │  └─ ...
│  └─ tests/            # logic + visual/浏览器交互测试
├─ backend/             # 极简只读 API（纯 node:http，零依赖）
│  ├─ src/  test/
└─ video/               # Remotion 演示视频子项目（React 19，独立于 frontend）
```

结构说明与偏差（重要，避免 Agent 误判）:

- 当前**没有根 README**，也**没有 `tools/` 目录**（早期文档曾提及，尚未创建）。
- `frontend/src/data/generated/` 目前不存在；23 个分子 / 晶体结构 JSON 位于 `data/manual/`，但模块目录、考试专题、轨道/极性/有机拼装等教学数据还分布在 `data/*.ts`。
- `video/` 用 React 19，`frontend/` 用 React 18，二者依赖独立，**不要混装或互相升级**。
- `frontend/node_modules` 需单独安装才能通过类型检查（见安装命令）。

## Critical Entry Points and Dependencies

- 前端启动链：`frontend/index.html` → `src/main.tsx` → `src/router.tsx` → `src/App.tsx`。
- `frontend/src/data/learningModules.ts` 是模块卡片、学习路径和 `/module/:id` 语义的目录真源。
- `frontend/src/data/mockMolecules.ts` 显式导入并注册 23 个手写 JSON；只新增 JSON 而不注册，不会启用真实 3D viewer。
- `frontend/src/pages/ModuleDetailPage.tsx` 的 `deriveViewerKind` / `viewerRegistry` 负责 viewer、toolbar、panel 的统一分发，新增模块时必须保持三者一致。
- `frontend/src/lib/organicBuilderChemistry.ts`、`organicBuilderNomenclature.ts` 和 `organicBuilderGeometry.ts` 共同承担拼装、识别、命名和键角逻辑，属于教学准确性高风险文件。
- 当前前端没有调用 `backend/` API；后端数据仍是 6 条结构的独立副本。未来接线前必须单独设计数据同步方案。
- `video/scripts/capture-assets.mjs` 依赖已启动的真实前端页面，`video/public/assets/` 是当前演示视频的已捕获素材。

重要文件保护:

- 不要随意更新 Playwright 截图基线；先确认平台、预期 UI 变化和审核范围。
- 不要把 `frontend/package-lock.json` 与 `video/package-lock.json` 混用，也不要提交与任务无关的 npm 平台元数据改写。
- 修改手写 JSON 时同步检查 `mockMolecules.ts` 注册、`learningModules.ts` 路由映射和 `MoleculeRecord` 类型。

## Gemini UI Collaboration

Gemini may be used only as a UI drafting collaborator.

Rules:
- Gemini output may inform HomePage, module pages, and learning UI ideas.
- Gemini output should be stored as `docs/gemini-ui-draft.md` when there is an actual draft to preserve.
- The current frontend implementation has priority over historical Gemini drafts.
- Codex is responsible for integrating any Gemini draft into the Vite + React + TypeScript project.
- Codex must fix types, split components, align with the design system, and run validation after integration.
- Codex must not introduce Next.js, Firebase, login, Gemini API, RDKit runtime, database features, or AI chat features because of a Gemini draft.
- Gemini output is reference material, not implementation authority.

## Visual Design Rules

Use:
- Light background
- Clean education style
- Scientific but friendly visual tone
- Large 3D viewer area where 3D learning is the main task
- Moderate whitespace
- Clear cards and panels
- Readable classroom projection typography

Avoid:
- Dark dashboard style
- Cyberpunk style
- Purple-blue AI SaaS template style
- Overcrowded text
- Shrinking the 3D viewer into a small decorative card

The current frontend visual direction is accepted as the baseline. Future visual changes should refine it instead of resetting it.

## Development Rules

Before coding:
- Read `docs/PROJECT_STATUS.md` — what is done / in progress / next.
- Read `docs/TASKS.md` — pick up the backlog and acceptance criteria.
- Read `docs/HANDOFF.md` — what the previous agent changed and left behind.
- Read `docs/PROJECT_BRIEF.md`
- Read `docs/DESIGN_SYSTEM.md`
- Read `docs/UI_SPEC.md`
- Read `docs/MOLECULE_DATA_SCHEMA.md` if data is involved

Shared agent context (Codex reads and updates these):
- `docs/PROJECT_STATUS.md` — living status snapshot.
- `docs/TASKS.md` — prioritized backlog with status + acceptance criteria.
- `docs/DECISIONS.md` — append-only log of important technical decisions and why.
- `docs/HANDOFF.md` — overwrite each task: what changed, tests run, open issues, advice for the next agent.
- `PLANS.md` (repo root) — scratch space for a single multi-step task; clear it when done.

After finishing a task, update `docs/PROJECT_STATUS.md`, mark the task in `docs/TASKS.md`,
append any decision to `docs/DECISIONS.md`, and rewrite `docs/HANDOFF.md` for the next agent.

GitHub sync and delivery:
- The remote repository is `https://github.com/A7m0spHere/chem3D-learn.git`.
- Before every development task, run `git fetch origin`, identify the current branch and its upstream branch, and compare their state.
- If the upstream branch is ahead and the local branch can be fast-forwarded, run `git pull --ff-only`; if there are no remote updates, continue development.
- If the branches have diverged, conflicts exist, or uncommitted changes prevent a safe sync, stop and report the situation. Do not automatically stash, reset, overwrite files, or force-push.
- After development and validation, review the diff, stage only files that belong to the current task, and create a clear commit.
- Run `git fetch origin` again before pushing. If the upstream advanced during development, safely rebase the task commit onto the updated upstream only with a clean worktree; if conflicts occur, stop and report them.
- Push the current branch to its upstream branch. If the branch has no upstream, use `git push -u origin <current-branch>`.
- Never use `--force` or `--force-with-lease`. If a normal push is rejected, fetch and safely integrate the remote updates before retrying.

During coding:
- Make one focused change per task
- Do not rewrite unrelated files
- Do not introduce large dependencies without asking
- Keep components small and typed
- Use TypeScript types for molecule data
- Put 3D components in `frontend/src/components/three`
- Put hand-authored molecule data in `frontend/src/data/manual`
- Preserve manually authored core molecule data
- Treat frontend hand-authored molecule data as the primary source until backend integration is explicitly planned

Chemistry accuracy:
- If unsure about a chemical fact, add `TODO-CHEM-VERIFY` instead of inventing.
- Protected manual IDs:
  - `ch4`
  - `nh3`
  - `h2o`
  - `co2`
  - `bf3`
  - `nacl`

## Validation Commands

After frontend code changes, run:

```bash
cd frontend
npm run build
```

If lint exists, also run:

```bash
npm run lint
```

If tests exist, run the tests that apply to the change (see command table below).
Note: the frontend has **no** `npm test` script. Use `npm run test:logic`, `npm run test:production`, or `npm run test:visual` instead.

For documentation-only tasks, do not run `npm run build` unless the user explicitly asks.

## Command Reference

All commands verified against the actual `package.json` files in this repo.

### frontend/ (main product)

```bash
cd frontend
npm install          # install deps (required once; node_modules is gitignored)
npm run dev          # Vite dev server, default http://localhost:5173
npm run build        # tsc --noEmit && vite build
npm run lint         # eslint .
npm run test:logic   # Playwright logic tests (playwright.logic.config.ts)
npm run test:production # build + production preview prefetch regression (no screenshots)
npm run test:visual  # 截图回归 + 浏览器交互/布局测试
npm run check        # build + test:visual
npm run preview      # preview the production build
```

- 当前 80 张视觉快照全部为 macOS 基线（`*-darwin.png`），没有 Windows/Linux 基线；不要在 Windows/Linux 上更新这些快照。
- 当前 Windows 环境缺少 Playwright 默认使用的 `chromium_headless_shell`，直接运行 `npm run test:visual` 会在浏览器启动阶段失败。系统 Chrome 通道的冒烟测试已验证可用：PowerShell 中先设置 `$env:PLAYWRIGHT_CHANNEL='chrome'`。完整截图回归仍受 macOS 基线限制。
- `npm run test:production` 会先构建，再用 `vite preview` 运行 `prefetch-viewer-chunks.visual.spec.ts`；它不含截图，用于防止生产首页再次提前下载 3D chunk。
- `npm run check` 等于 build + 完整 visual 测试，因此也受上述浏览器和平台条件约束。

### backend/ (minimal read-only API, zero runtime deps)

```bash
cd backend
npm start            # node src/server.js, default port 4000
npm run dev          # node --watch src/server.js
npm test             # node --test (node:test runner, no install needed)
```

### video/ (Remotion demo video — separate sub-project)

```bash
cd video
npm install          # uses React 19, independent from frontend's React 18
npm run dev          # remotion studio
npm run lint         # eslint src && tsc --noEmit
npm run render       # render out/chem3d-learn-demo.mp4
```

The `video/` project is a standalone Remotion project. It is **not** part of the learning-site build and has its own dependency tree. Do not mix its dependencies with `frontend/`.

## Runtime and Environment Variables

- 本项目的 Windows 开发环境统一以 Node.js `>=20` 为兼容下限；`backend/package.json` 已显式声明该要求。前端与视频尚未声明 `engines`，因此 Node.js `>=20` 是仓库级开发基线，不代表两个子项目已经通过 package metadata 强制校验。
- 前端业务代码当前不读取 `VITE_*` 环境变量，也没有 `.env.example`。

| Scope | Variable | Default / purpose |
| --- | --- | --- |
| backend | `PORT` | `4000`，HTTP 监听端口 |
| backend | `CORS_ORIGIN` | `*`，覆盖 API 的 `Access-Control-Allow-Origin` |
| frontend tests | `PLAYWRIGHT_CHANNEL` | 未设置时使用 Playwright 默认 Chromium；当前 Windows 可设为 `chrome` |
| frontend tests | `PLAYWRIGHT_PORT` | 未设置时按进程 ID 计算本地 Vite 测试端口 |
| video capture | `CHEM3D_CAPTURE_URL` | `http://127.0.0.1:5173`，真实前端素材采集地址 |

使用 `createBrowserRouter` 意味着生产静态托管需要 SPA history fallback；当前仓库没有正式部署配置，具体托管方式为**待确认**。

## Windows Development Environment

本项目当前按**原生 Windows** 工作流维护，不默认切换到 WSL。精确版本用于记录本机已验证快照，不是强制锁定；兼容下限才是新环境需要满足的要求。

### 兼容下限与本机快照

| Tool | Requirement | Verified on this computer |
| --- | --- | --- |
| Windows | Windows 10 或更高版本，64 位 | Windows 11 专业版 10.0.22631 |
| PowerShell | PowerShell 7 推荐；Windows PowerShell 仅作兼容回退 | PowerShell 7.6.4 |
| Node.js | `>=20` | 24.14.0 |
| npm | 随受支持的 Node.js 安装 | 11.9.0 |
| Git | Git for Windows；必须可用 `git` 和 Git Bash | 2.54.0.windows.1 / Git Bash 5.3.9 |
| Browser | 仍受安全更新支持的 Chromium 浏览器；Windows 测试使用系统 Chrome 通道 | Google Chrome 119.0.6045.106（本机快照，不作为推荐版本） |

本机约有 16 GB 内存，足以完成当前前端构建和 3D 页面开发。版本升级后先运行下方预检和验证矩阵；不要因为快照版本变化就无理由重写 lockfile。

### PowerShell 预检

从仓库根目录 `D:\chem3D-learn` 运行：

```powershell
$PSVersionTable.PSVersion
node --version
npm --version
git --version
where.exe node
where.exe npm
where.exe git
npm config get cache
git config --get core.autocrlf
git status --short --branch
```

如果某工具不存在或版本低于兼容下限，先报告实际输出再处理；不要擅自升级 Node.js、npm、Git 或 Chrome。

### PowerShell 命令与路径规则

- 面向项目所有者给出的 Windows 命令默认使用 PowerShell 语法，并明确工作目录。
- 路径含空格或特殊字符时始终加引号；PowerShell 文件操作优先使用 `-LiteralPath`。
- 一个文件操作必须在同一种 shell 中完成。不要在 PowerShell 中枚举路径后交给 `cmd.exe`、Git Bash 或批处理脚本删除、移动。
- 不要通过 `Set-ExecutionPolicy Unrestricted`、`Bypass` 等方式降低系统执行策略。若 PowerShell 阻止 `npm.ps1`，改用同目录下的 `npm.cmd`，并报告原因。
- PowerShell 的环境变量使用进程级语法，例如 `$env:PORT = '4001'`。不要用 `setx` 永久写入本机配置，除非用户明确要求。
- 当前 `core.autocrlf=true`，仓库没有 `.gitattributes`。保持既有换行方式，不运行全仓库换行归一化或无关格式化；提交前用 `git diff --check` 和 `git diff --stat` 排查换行噪声。

### 依赖安装与 npm 缓存

本机 npm 默认缓存为 `C:\Program Files\nodejs\node_cache`，可能因权限不足导致 `npm install` 报 `EPERM`。不要修改全局 npm 配置；为需要安装依赖的单次命令显式指定仓库本地缓存：

```powershell
Push-Location 'D:\chem3D-learn\frontend'
npm install --cache 'D:\chem3D-learn\.tmp-npm-cache'
Pop-Location
```

- `.tmp-npm-cache/` 是临时目录，当前未被 `.gitignore` 覆盖，绝对不能暂存或提交。
- `frontend/` 与 `video/` 各自运行安装命令并维护各自的 `node_modules` / `package-lock.json`；禁止在仓库根目录混装，也禁止复制 lockfile。
- `backend/` 零运行时依赖，不需要执行 `npm install`。
- 当前 `frontend/node_modules` 已安装；`video/node_modules` 未安装。只有视频任务才安装 `video/` 依赖。

### Windows 日常命令

短时验证命令可在同一个 PowerShell 会话中顺序运行：

```powershell
Push-Location 'D:\chem3D-learn\frontend'
npm run build
npm run lint
npm run test:logic
Pop-Location

Push-Location 'D:\chem3D-learn\backend'
npm test
Pop-Location

# 仅在 video/node_modules 已单独安装后
Push-Location 'D:\chem3D-learn\video'
npm run lint
npm run render
Pop-Location
```

开发服务器是持续运行进程，每个服务应在独立 PowerShell 终端中启动：

```powershell
# Frontend terminal
Push-Location 'D:\chem3D-learn\frontend'
npm run dev

# Backend terminal
Push-Location 'D:\chem3D-learn\backend'
npm start

# Remotion Studio terminal（仅视频任务）
Push-Location 'D:\chem3D-learn\video'
npm run dev
```

上面三个区块是三个独立终端示例，不要整体粘贴到同一个终端。端口或测试通道需要覆盖时使用进程级变量：

```powershell
$env:PORT = '4001'
$env:CORS_ORIGIN = 'http://127.0.0.1:5173'
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_PORT = '4173'
$env:CHEM3D_CAPTURE_URL = 'http://127.0.0.1:5173'
```

### Windows 验证矩阵

| Scope | Command | Current Windows status |
| --- | --- | --- |
| frontend type/build | `npm run build` | 已通过；保留按需 3D chunk 的 large chunk 警告 |
| frontend lint | `npm run lint` | 已通过 |
| frontend pure logic | `npm run test:logic` | 83 / 83 已通过，不依赖浏览器 |
| frontend production prefetch | 设置 `$env:PLAYWRIGHT_CHANNEL = 'chrome'` 后运行 `npm run test:production` | 3 / 3 已通过，不含截图 |
| frontend browser behavior | 设置 `$env:PLAYWRIGHT_CHANNEL = 'chrome'` 后运行针对性无截图用例 | 系统 Chrome 通道已验证可用 |
| frontend visual snapshots | `npm run test:visual` | 只有 80 张 Darwin 基线；Windows 不得更新 |
| backend | `npm test` | 22 / 22 已通过 |
| video | `npm run lint` / `npm run render` | 本机尚未安装 `video/node_modules`，未验证 |

- Playwright 缓存当前有 Chromium，但缺少默认配置需要的 `chromium_headless_shell`；不要把“缓存存在”误写成完整视觉环境可用。
- 在 Windows 使用系统 Chrome 时，只运行明确不更新截图的针对性行为用例。不得运行 `test:visual:update`，也不得接受由平台字体、抗锯齿或 GPU 差异造成的 Darwin 快照改写。
- `npm run check` 包含完整 visual 测试，因此在现有 Windows 环境下不能作为无条件的一键验收命令。
- 每次测试后用 `git status --short` 确认没有快照、lockfile、缓存或其他无关文件被改写。

## Code Style

- **Language:** TypeScript everywhere in `frontend/`. `strict` mode is on — no implicit `any`, respect the existing types. Backend is JavaScript (ESM) with JSDoc `@typedef` importing the `.d.ts` types.
- **Components:** Function components with typed props (`type XProps = {...}`). The only class component is `ViewerErrorBoundary` (React error boundaries require a class — this is intentional, do not "modernize" it).
- **Imports:** Use the `@/` alias for `frontend/src` (configured in `tsconfig.json` and `vite.config`). Do not write long relative `../../..` chains.
- **Props ordering:** Existing components pass JSX props in alphabetical order. Match the surrounding file.
- **Styling:** Tailwind utility classes only. Use the design tokens (`text-primary`, `text-secondary`, `border`, `surface`, `primary`, `shadow-panel`, etc.) from `docs/DESIGN_SYSTEM.md` — do not hardcode hex colors in `className`.
- **3D:** React Three Fiber + Drei. Prefer extracting pure geometry math into `*Geometry.ts` files (see `closePackingGeometry.ts`, `mof5Geometry.ts` as the established pattern).
- **Teaching copy:** Chinese, concise, classroom-friendly. Chemistry facts you are unsure about get `TODO-CHEM-VERIFY`, never invented values.
- **Comments:** Match the density of the file you are editing. Existing non-trivial logic uses Chinese explanatory comments — follow suit.
- Run `npm run lint` — it is the style source of truth. Do not add a formatter or change ESLint config without asking.

## File Naming

- **React components:** `PascalCase.tsx` (e.g. `MoleculeViewer.tsx`, `CrystalKnowledgePanel.tsx`).
- **Hooks:** `useSomething.ts` (camelCase starting with `use`).
- **Pure logic / data / geometry modules:** `camelCase.ts` (e.g. `organicBuilderChemistry.ts`, `learningModules.ts`, `ren3Geometry.ts`).
- **Hand-authored molecule data:** `frontend/src/data/manual/<id>.json`, where `<id>` is lowercase (e.g. `ch4.json`, `batio3.json`).
- **Docs:** `UPPER_SNAKE_CASE.md` in `docs/` for governance/spec files.
- **Tests:** `*.logic.spec.ts` / `*.visual.spec.ts` under `frontend/tests/`.
- Place files by responsibility: pages → `pages/`, shared layout → `components/common/`, learning panels/toolbars → `components/learning/`, 3D → `components/three/`, motion/decoration → `components/motion/`, shadcn primitives → `components/ui/`.

## Explain Changes for the Owner (Learning Mode)

The project owner is actively learning React, TypeScript, and 3D web development.
For every non-trivial change, include a short plain-language explanation covering:

- **What** changed and in which file(s).
- **Why** this approach (and what alternatives were considered, if relevant).
- **Key concept** involved, if the change touches an unfamiliar pattern
  (e.g. "error boundaries must be class components because React only exposes
  `getDerivedStateFromError` / `componentDidCatch` on classes").

Keep it teaching-oriented, not a code dump. The goal is that the owner understands
the change well enough to maintain or extend it. Trivial edits (typos, copy tweaks)
do not need this.

## Done Means

A task is done only when:
- The requested files are changed.
- No unrelated large refactor is introduced.
- The user-facing behavior or documentation matches the task.
- Frontend changes build successfully when frontend code changes exist.
- Documentation-only tasks explain why build was not run.
- Every final response must use this report format:

```markdown
## Changed Files
List modified files.

## Commands Run
List commands that were run.

## Build Result
State whether `npm run build` passed, or why it was not run.

## What Works
State what is now usable.

## Known Limitations
State what has not been done yet.

## Next Suggested Task
Suggest exactly one next task.
```
