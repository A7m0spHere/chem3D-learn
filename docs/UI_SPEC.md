# UI_SPEC.md

## Pages

The MVP contains only:
- Home page
- 3D Learning page

Do not add login, dashboards, admin pages, question-bank pages, AI chat pages, or database-driven pages.

## Home Page

Purpose:
- Introduce Chem3D Learn as a 3D structural chemistry learning site.
- Guide students and teachers into the 3D Learning page quickly.

Required layout:
- Top navigation with product name and entry link to Learning.
- First viewport with the product name, short Chinese value statement, and primary action.
- Module preview area for the MVP structures:
  - CH4
  - NH3
  - H2O
  - CO2
  - BF3
  - NaCl
- Short explanation of the learning flow:
  - choose a structure
  - observe the 3D model
  - toggle angles/lone pairs
  - follow lesson steps

Visual requirements:
- Light background using the design tokens.
- Scientific but friendly tone.
- No dark hero, cyberpunk style, or purple-blue AI SaaS look.

## 3D Learning Page

Purpose:
- Let students explore one molecule or crystal at a time.
- Help teachers present a clear structure explanation in class.

Desktop layout:
- Three-column layout.
- Left sidebar: molecule/crystal selector and brief category labels.
- Center: large 3D viewer with rotate, zoom, and auto-rotate controls.
- Right panel: Chinese lesson explanation, step content, key facts, and step navigation.

Required controls:
- Select structure.
- Rotate and zoom via 3D viewer controls.
- Toggle auto rotate.
- Toggle key bond angles.
- Toggle lone pairs where applicable.
- Switch lesson steps.

3D viewer requirements:
- Must be visually dominant.
- Must not be reduced to a small decorative card.
- Should show atom labels or legends when useful.
- Angle labels and lone-pair markers must be readable.

Lesson panel requirements:
- Show current structure name and formula.
- Show current lesson step title and explanation.
- Keep text concise and high-school appropriate.
- Mark uncertain chemistry facts with `TODO-CHEM-VERIFY`.

## Responsive Strategy

Desktop:
- Use a three-column Learning layout.
- Keep the 3D viewer in the center and largest.

Tablet:
- Sidebar may collapse into a drawer or compact rail.
- Viewer remains above or beside the lesson panel depending on available width.
- Controls remain touch-friendly.

Mobile:
- Viewer appears at the top.
- Explanation appears below the viewer.
- Model selection changes to a top selector.
- Avoid horizontal overflow.

Teacher projection mode:
- Text, buttons, labels, and step explanations must remain readable.
- Avoid tiny dense controls.
- Prefer clear contrast and stable layout.

## Gemini UI Draft Boundary

Gemini may draft only HomePage / LearningPage UI ideas, preferably saved as `docs/gemini-ui-draft.md` when present.

Codex must adapt any Gemini draft into the approved stack:
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Three Fiber
- Drei

Codex must not adopt Gemini suggestions that introduce:
- Next.js
- Firebase
- backend services
- login
- Gemini API
- AI chat features
