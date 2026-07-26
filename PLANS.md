# PLANS.md

For complex tasks, Codex should first produce a clear plan and wait for user confirmation before editing files.

## Required Plan Sections

Each plan should include:

### Goal

What will be changed or built.

### Scope

What is in scope and what is explicitly out of scope.

### Files to Inspect

List files Codex needs to read before implementation.

### Files Likely to Change

List files Codex expects to modify or create.

### Implementation Steps

Small ordered steps that can be executed without making additional product decisions.

### Risks

Possible breakages, uncertain points, chemistry accuracy concerns, UI risks, backend coupling risks, or scope creep risks.

### Validation

Exact commands to run. For frontend code work, include `cd frontend && npm run build`; include lint and tests when available.

### Done When

Concrete completion criteria, including changed files, validation result, and known limitations.

## Planning Rules

- Use the current frontend implementation as the product baseline.
- Do not roll back the existing multi-page frontend unless the user explicitly asks.
- Keep backend plans aligned with frontend needs; backend can be introduced or adjusted later as a minimal support layer.
- Do not create login, user accounts, database-backed state, payment, AI chat, Gemini API, dynamic SMILES, or RDKit runtime features unless explicitly approved in a later plan.
- If Gemini UI draft material is involved, treat it as reference only and plan how Codex will adapt it into Vite + React + TypeScript.
- If chemistry facts are uncertain, plan to mark them with \`TODO-CHEM-VERIFY\`.
- For documentation-only tasks, plan not to run frontend build unless requested.
