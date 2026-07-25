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

Current expected structure:

```text
Chem3D-Learn/
├─ docs/
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  │  ├─ ui/
│  │  │  ├─ common/
│  │  │  ├─ learning/
│  │  │  ├─ motion/
│  │  │  └─ three/
│  │  ├─ data/
│  │  │  ├─ manual/
│  │  │  └─ generated/
│  │  ├─ hooks/
│  │  ├─ types/
│  │  ├─ lib/
│  │  └─ styles/
├─ backend/
├─ tools/
└─ README.md
```

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
- Read `docs/PROJECT_BRIEF.md`
- Read `docs/DESIGN_SYSTEM.md`
- Read `docs/UI_SPEC.md`
- Read `docs/MOLECULE_DATA_SCHEMA.md` if data is involved

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

If tests exist, also run:

```bash
npm test
```

For documentation-only tasks, do not run `npm run build` unless the user explicitly asks.

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
