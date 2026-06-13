# UI_SPEC.md

## Pages

The current frontend baseline contains:
- Home page
- Modules page
- Module detail page
- Paths page
- Exam page
- About page

The module detail page is also the current 3D learning experience when a module has real structure data.

Do not add login, dashboards, admin pages, payment pages, AI chat pages, database-driven user pages, or dynamic molecule-input pages unless explicitly requested.

## Home Page

Purpose:
- Introduce Chem3D Learn as a 3D structural chemistry learning site.
- Guide students and teachers into module exploration quickly.
- Provide an entry into the current module system and learning paths.

Required layout:
- Top navigation with product name and primary learning entry.
- First viewport with the product name, short Chinese value statement, and primary action.
- Module/category preview area aligned with the current frontend.
- Short explanation of the learning flow:
  - choose a module or structure
  - observe the 3D model when available
  - toggle angles/lone pairs/labels where supported
  - follow lesson steps or module guidance

Visual requirements:
- Light background using the design tokens.
- Scientific but friendly tone.
- Current frontend visual direction is the baseline.
- Avoid dark hero, cyberpunk style, or purple-blue AI SaaS look.

## Modules Page

Purpose:
- Present the current learning module catalog.
- Let users filter or browse by topic category.
- Keep extended modules lightweight until their real 3D content exists.

Requirements:
- Category filters should be clear and touch-friendly.
- Module cards should show title, subtitle, difficulty, tags, and concise explanation.
- Modules without real 3D data may use placeholder visual guidance instead of pretending to have a complete model.

## Module Detail / 3D Learning Experience

Purpose:
- Let students explore one molecule, crystal, or learning module at a time.
- Help teachers present a clear structure explanation in class.
- Use real 3D viewer only when hand-authored structure data is available.

Desktop layout:
- Viewer and lesson/module panel should dominate the page content.
- 3D viewer must stay large enough for classroom projection.
- Explanation, key facts, common mistakes, and related modules should remain readable.

Required 3D controls when real structure data exists:
- Rotate and zoom via 3D viewer controls.
- Toggle auto rotate.
- Toggle key bond angles.
- Toggle lone pairs where applicable.
- Toggle atom labels where supported.
- Switch lesson steps.

3D viewer requirements:
- Must be visually dominant when the structure is the main learning task.
- Must not be reduced to a small decorative card.
- Should show atom labels or legends when useful.
- Angle labels and lone-pair markers must be readable.

Lesson/module panel requirements:
- Show current structure or module name.
- Show formula when applicable.
- Show current lesson step title and explanation when structure data exists.
- Keep text concise and high-school appropriate.
- Mark uncertain chemistry facts with `TODO-CHEM-VERIFY`.

## Paths, Exam, and About Pages

Purpose:
- Paths page can organize recommended learning sequences.
- Exam page can group exam-oriented spatial thinking topics.
- About page can explain product positioning and use cases.

Requirements:
- These pages should follow the same light education visual language.
- Placeholder states are acceptable while the frontend is being developed.
- Avoid expanding into a full question bank, account system, or backend SaaS workflow without explicit approval.

## Responsive Strategy

Desktop:
- Keep the viewer and teaching panel prominent on 3D learning pages.
- Keep navigation and category browsing clear.

Tablet:
- Viewer may stack above or beside the lesson panel depending on available width.
- Controls remain touch-friendly.

Mobile:
- Viewer appears near the top when available.
- Explanation appears below the viewer.
- Avoid horizontal overflow.

Teacher projection mode:
- Text, buttons, labels, and step explanations must remain readable.
- Avoid tiny dense controls.
- Prefer clear contrast and stable layout.

## Gemini UI Draft Boundary

Gemini drafts are historical/reference material.

Codex must adapt any draft into the approved stack:
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Three Fiber
- Drei

The current frontend implementation has priority over draft text.

Codex must not adopt Gemini suggestions that introduce:
- Next.js
- Firebase
- login
- database-backed user workflows
- Gemini API
- RDKit runtime
- AI chat features
