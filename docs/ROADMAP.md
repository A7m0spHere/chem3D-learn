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

## Current - Label/Annotation Hardening (T-043)

- Complete the label-system audit-and-fix arc: the Phase 1 audit ledger is `docs/LABEL_AUDIT_20260930.md` (three confirmed defects: fullscreen scene-label overlap, Ren3 legend/note occlusion, polarity atom-label overlap).
- Phase 2 fixes them system by system; per-system guard assertions follow the ledger's methodology notes.
- Treat `docs/TASKS.md` as the detailed execution order and `docs/PROJECT_STATUS.md` as the status snapshot.
- Do not use quizzes, grading, scores, retries, or question-bank scale as the core learning path (T-035/T-036 remain cancelled).
- Real-feedback collection restarts per T-031 after `v0.1.0-rc.2`; no friends/classmates Alpha auto-start and no tester-count KPI.

## v1.0 - Frontend Release Candidate

- Verify current frontend pages.
- Review chemical accuracy for core structures.
- Confirm build, lint, and tests where available.
- Document known limitations and future backend needs.

## Later - Backend Support Layer

- Design backend from the finalized frontend data and page needs.
- Keep initial backend read-only and minimal.
- Avoid login, database-backed user state, AI chat, Gemini API, dynamic SMILES, and RDKit runtime unless explicitly approved.
