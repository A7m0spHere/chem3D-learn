# DESIGN_SYSTEM.md

## Visual Direction

Chem3D Learn uses a light, clean, education-focused design. The interface should feel scientific, friendly, calm, and suitable for both self-study and classroom projection.

Avoid:
- dark dashboard style
- cyberpunk style
- purple-blue AI SaaS template style
- heavy gradients
- decorative visual noise
- overcrowded text
- shrinking the 3D viewer into a small card

## Color Tokens

Use these tokens consistently in Tailwind theme configuration or CSS variables when the frontend is created.

| Token | Hex | Usage |
| --- | --- | --- |
| Primary | `#2A9D8F` | Main actions, active states, selected molecule |
| Primary Dark | `#1F6F68` | Hover states, strong headings, emphasis |
| Accent | `#F4A261` | Highlights, angle labels, warm callouts |
| Background | `#F7FAF9` | Page background |
| Surface | `#FFFFFF` | Panels, cards, toolbars |
| Text Primary | `#1F2933` | Main text |
| Text Secondary | `#64748B` | Helper text, metadata |
| Border | `#DDE7E4` | Panel borders, separators |

## Layout Principles

- Make the 3D viewer the dominant area on the Learning page.
- Use panels for navigation, controls, and lesson text, but avoid nesting cards inside cards.
- Keep whitespace moderate: enough clarity for students, not a sparse marketing page.
- Keep classroom projection readability in mind: labels, buttons, and step text must remain legible.
- Use icons for common controls when appropriate, with clear labels or tooltips.

## Typography

- Use clean sans-serif typography.
- Use Chinese copy with short sentences.
- Avoid tiny helper text for essential learning content.
- Use larger step titles and readable body text in teacher projection mode.

## Component Tone

- Buttons should be clear, compact, and predictable.
- Selection states should be obvious without relying only on color.
- Science labels, atom labels, and angle annotations should be legible against the viewer background.
- Explanatory panels should be concise and structured.
