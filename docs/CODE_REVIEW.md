# CODE_REVIEW.md

Use this guide when reviewing Chem3D Learn changes.

## Product Baseline

- Review against the current frontend implementation, not the old two-page MVP.
- Existing pages include Home, Modules, Module Detail, Paths, Exam, and About.
- Module Detail is the current 3D learning experience when real structure data exists.
- Extended module content may exist as frontend structure or placeholder teaching material.
- Do not require backend removal merely because backend exists; review whether backend changes stay minimal and frontend-driven.

## Component Structure

- Components are small, typed, and named by responsibility.
- Page-level components stay in `frontend/src/pages`.
- Shared UI or layout components stay in `frontend/src/components/common`.
- Learning-specific components stay in `frontend/src/components/learning`.
- Motion-specific components stay in `frontend/src/components/motion`.
- 3D-specific components stay in `frontend/src/components/three`.
- shadcn/ui components stay in `frontend/src/components/ui`.
- Avoid introducing login, user-account flows, database-backed user state, payment, AI chat, Gemini API, dynamic SMILES, or RDKit runtime without explicit approval.

## Data Structure

- Molecule data follows `docs/MOLECULE_DATA_SCHEMA.md`.
- Records include `atoms`, `bonds`, `lonePairs`, `keyAngles`, and `lessonSteps`.
- Hand-authored frontend data stays in `frontend/src/data/manual`.
- Protected IDs are preserved: `ch4`, `nh3`, `h2o`, `co2`, `bf3`, `nacl`.
- Frontend manual data is the current source of truth until backend integration is explicitly designed.
- Data should stay small, typed, and teaching-focused.

## Chemistry Content

- Chemistry explanations are suitable for Chinese high-school students.
- Content focuses on spatial structure, electron pair arrangement, molecular geometry, key angles, and learning sequence.
- Uncertain facts are marked `TODO-CHEM-VERIFY`.
- NaCl is reviewed as a simplified teaching model, not as an exhaustive crystallographic record.

## UI Style

- UI follows the light education design system.
- Required color tokens are used consistently.
- The 3D viewer is large and central when the user is in a real 3D learning flow.
- Desktop, tablet, mobile, and teacher projection readability are checked.
- Avoid dark dashboard, cyberpunk, purple-blue AI SaaS template, and overcrowded text.
- Current frontend visual direction is the accepted baseline; future changes should refine rather than reset it unless requested.

## Gemini Draft Review

- Gemini drafts are historical/reference material.
- Gemini output should be stored as `docs/gemini-ui-draft.md` when there is actual draft material.
- Codex must adapt any draft into Vite + React + TypeScript.
- Reject Gemini suggestions that introduce Next.js, Firebase, login, Gemini API, RDKit runtime, or AI chat features.
- Reject UI suggestions that conflict with the current frontend direction unless the user explicitly asks for a redesign.

## Backend Review

- Backend should follow frontend data and page needs.
- Initial backend should remain minimal and read-only unless explicitly expanded.
- Backend should not introduce auth, database-backed user state, payment, Gemini API, AI chat, dynamic SMILES, or RDKit runtime without explicit approval.
- Backend documentation should clearly state whether an endpoint is implemented, planned, or placeholder.

## Build and Validation

- Frontend code changes must pass `cd frontend && npm run build`.
- Run lint and tests if scripts exist.
- Backend code changes should run backend tests if available.
- Documentation-only tasks should not run npm build unless requested.
- Final review should note changed files, commands run, build status, and known limitations.
