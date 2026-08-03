# ROADMAP.md

## v0.1 - Project Harness

- Establish project documentation.
- Define product positioning, design system, UI spec, molecule schema, QA checklist, and review guide.
- Keep the project focused on Chinese high-school structural chemistry learning.

## v0.2 - Frontend Scaffold

- Create Vite + React + TypeScript frontend.
- Add Tailwind CSS and shadcn/ui foundation.
- Set up routing for the current frontend page set.
- Confirm build command works.

## v0.3 - Current Frontend Baseline

- Build Home page.
- Build Modules page and module cards.
- Build module detail page as the main learning experience.
- Add Paths, Exam, and About pages as current frontend routes.
- Keep design aligned with the light education style.

## v0.4 - Molecule Data and Types

- Add TypeScript molecule data types.
- Add hand-authored records for core structures:
  - CH4
  - NH3
  - H2O
  - CO2
  - BF3
  - simplified NaCl teaching model
- Protect manual IDs.
- Mark uncertain facts with `TODO-CHEM-VERIFY`.

## v0.6 - 3D Viewer

- Integrate React Three Fiber and Drei.
- Render atoms, bonds, lone pairs, and key angle annotations.
- Support rotate, zoom, auto rotate, and viewer toggles.
- Use placeholder viewers for modules without real 3D data.

## v0.8 - Teaching Interaction

- Connect lesson steps to viewer focus states.
- Add toggles for bond angles, lone pairs, and atom labels.
- Improve mobile, tablet, and teacher projection readability.
- Keep module-detail learning flow concise and classroom-friendly.

## v0.9 - Frontend Polish

- Refine current multi-page navigation and module browsing.
- Improve motion, responsive layout, and projection readability.
- Reduce misleading placeholders where real 3D data is absent.
- Review Chinese teaching copy and visual hierarchy.

## Current - Product Completeness and Alpha Readiness

- Keep the completed chemistry verification and public-placeholder cleanup as product quality gates.
- Build one lightweight guided-observation sample around an existing core 3D viewer: observation goal, 3D operation, visible structural change, explanation, and comparison.
- Treat rotate, zoom, click, highlight, isolate, compare, and step animation as the primary learning actions.
- Do not use quizzes, grading, scores, retries, or question-bank scale as the core learning path.
- After the single 3D sample passes its engineering checks, use the maintainer and a small group of friends for Alpha observation. Do not require a large tester cohort.
- Treat `docs/PRODUCT_COMPLETENESS_AUDIT.md` and `docs/TASKS.md` as the detailed execution order.

## v1.0 - Frontend Release Candidate

- Verify current frontend pages.
- Review chemical accuracy for core structures.
- Confirm build, lint, and tests where available.
- Document known limitations and future backend needs.

## Later - Backend Support Layer

- Design backend from the finalized frontend data and page needs.
- Keep initial backend read-only and minimal.
- Avoid login, database-backed user state, AI chat, Gemini API, dynamic SMILES, and RDKit runtime unless explicitly approved.
