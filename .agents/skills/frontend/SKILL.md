---
name: frontend
description: Build and modify frontend interfaces while preserving the existing project's design, structure, responsiveness, and components.
---

# Frontend Development

Use this skill when creating or modifying frontend UI.

## Before editing

1. Inspect the existing page.
2. Identify reusable components.
3. Inspect existing styles and design patterns.
4. Understand the current layout.
5. Identify whether the requested change can be made without restructuring the page.

## Design principles

- Prefer clean and simple interfaces.
- Preserve the project's existing visual language.
- Reuse existing colors, typography, spacing, and components.
- Do not redesign unrelated parts of the application.
- Do not add unnecessary animations.
- Avoid excessive gradients, shadows, and decorative elements unless they match the existing design.
- Prioritize readability and usability.

## Responsive behavior

Check that changes work appropriately across:

- Desktop
- Tablet
- Mobile

Do not create layouts that only work at one screen size.

## Components

- Reuse existing components when possible.
- Create a new component when it improves maintainability.
- Avoid creating components for trivial one-off elements unless useful.

## After editing

- Check for TypeScript errors.
- Check for broken imports.
- Check the affected UI.
- Verify that existing functionality has not been unnecessarily changed.