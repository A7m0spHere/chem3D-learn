# CODE_REVIEW.md

Use this guide when reviewing Chem3D Learn changes.

## Component Structure

- Components are small, typed, and named by responsibility.
- Page-level components stay in `frontend/src/pages`.
- Shared UI or layout components stay in `frontend/src/components/common`.
- 3D-specific components stay in `frontend/src/components/three`.
- shadcn/ui components stay in `frontend/src/components/ui`.
- No backend, auth, database, or AI chat architecture is introduced.

## Data Structure

- Molecule data follows `docs/MOLECULE_DATA_SCHEMA.md`.
- Records include `atoms`, `bonds`, `lonePairs`, `keyAngles`, and `lessonSteps`.
- Hand-authored data stays in `frontend/src/data/manual`.
- Protected IDs are preserved: `ch4`, `nh3`, `h2o`, `co2`, `bf3`, `nacl`.
- Data remains small and MVP-focused.

## Chemistry Content

- Chemistry explanations are suitable for Chinese high-school students.
- Content focuses on spatial structure, electron pair arrangement, molecular geometry, and key angles.
- Uncertain facts are marked `TODO-CHEM-VERIFY`.
- NaCl is reviewed as a simplified unit cell teaching model, not as an exhaustive crystallographic record.

## UI Style

- UI follows the light education design system.
- Required color tokens are used consistently when implemented.
- The 3D viewer is large and central to the Learning page.
- Desktop, tablet, mobile, and teacher projection readability are checked.
- Avoid dark dashboard, cyberpunk, purple-blue AI SaaS template, heavy gradients, and overcrowded text.

## Gemini Draft Review

- Gemini drafts may influence only HomePage / LearningPage UI.
- Gemini output should be stored as `docs/gemini-ui-draft.md` when there is actual draft material.
- Codex must adapt any draft into Vite + React + TypeScript.
- Reject Gemini suggestions that introduce Next.js, Firebase, backend services, login, Gemini API, or AI chat features.
- Reject UI suggestions that violate `docs/DESIGN_SYSTEM.md` or shrink the viewer into a small decorative card.

## Build and Validation

- Frontend changes must pass `cd frontend && npm run build`.
- Run lint and tests if scripts exist.
- Documentation-only tasks before frontend scaffolding should not run npm commands.
- Final review should note changed files, commands run, build status, and known limitations.
