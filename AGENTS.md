# AGENTS.md

## Project Role

You are working on Chem3D Learn / 结构化学 3D 学习站.

This project is a Chinese high-school structural chemistry 3D learning website for ordinary students and classroom projection. It is not a chemistry database, question bank, backend SaaS product, drug discovery platform, or AI chat product.

Primary users:
- 中国高中普通学生
- 化学教师课堂展示

Primary goal:
- Help students understand spatial chemical structures through interactive 3D visualization, step-by-step explanation, and concise Chinese teaching content.

## Communication Rules

- 默认使用中文回复用户，包括过程说明、计划、总结和最终报告。
- 只有当用户明确要求英文，或需要保留代码、命令、错误信息、文件名、API 名称等原文时，才使用英文。

## Current MVP Scope

Only implement:
- Home page
- 3D Learning page
- Core VSEPR molecules:
  - CH4
  - NH3
  - H2O
  - CO2
  - BF3
- One simplified crystal example:
  - NaCl unit cell
- Basic interactions:
  - rotate
  - zoom
  - auto rotate toggle
  - show/hide bond angles
  - show/hide lone pairs
  - lesson step switching

Do not implement:
- Login
- User accounts
- Backend database
- Teacher admin panel
- Complex question bank
- Payment
- Dynamic SMILES input
- RDKit runtime API
- Large competition-level content
- Gemini API
- AI chat features

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
- Backend framework unless explicitly requested
- Database unless explicitly requested

## Repository Structure

Expected structure:

```text
Chem3D-Learn/
├─ docs/
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  │  ├─ ui/
│  │  │  ├─ common/
│  │  │  └─ three/
│  │  ├─ data/
│  │  │  ├─ manual/
│  │  │  └─ generated/
│  │  ├─ types/
│  │  ├─ lib/
│  │  └─ styles/
├─ tools/
└─ README.md
```

Do not create `frontend/` unless the task explicitly asks to scaffold the frontend.

## Gemini UI Collaboration

Gemini may be used only as a UI drafting collaborator.

Rules:
- Gemini only drafts HomePage / LearningPage UI ideas.
- Gemini output should be stored as `docs/gemini-ui-draft.md` when there is an actual draft to preserve.
- Codex is responsible for integrating any Gemini draft into the Vite + React + TypeScript project.
- Codex must fix types, split components, align with the design system, and run validation after integration.
- Codex must not introduce Next.js, Firebase, backend services, login, Gemini API, or AI chat features because of a Gemini draft.
- Gemini output is reference material, not an implementation authority.

## Visual Design Rules

Use:
- Light background
- Clean education style
- Scientific but friendly visual tone
- Large 3D viewer area
- Moderate whitespace
- Clear cards and panels
- Readable classroom projection typography

Avoid:
- Dark dashboard style
- Cyberpunk style
- Purple-blue AI SaaS template style
- Heavy gradients
- Overcrowded text
- Shrinking the 3D viewer into a small card

## Development Rules

Before coding:
- Read `docs/PROJECT_BRIEF.md`
- Read `docs/DESIGN_SYSTEM.md`
- Read `docs/UI_SPEC.md`
- Read `docs/MOLECULE_DATA_SCHEMA.md` if data is involved

During coding:
- Make one focused change per task
- Do not rewrite unrelated files
- Do not introduce large dependencies without asking
- Keep components small and typed
- Use TypeScript types for molecule data
- Put 3D components in `frontend/src/components/three`
- Put hand-authored molecule data in `frontend/src/data/manual`
- Preserve manually authored core molecule data

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

After frontend changes, run:

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

For documentation-only tasks before frontend scaffolding, do not run `npm run build`.

## Done Means

A task is done only when:
- The requested files are changed.
- No unrelated large refactor is introduced.
- The user-facing behavior or documentation matches the task.
- Frontend changes build successfully when a frontend exists.
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
