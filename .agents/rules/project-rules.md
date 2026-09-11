---
trigger: always_on
---

# Project Rules

## General behavior

- Understand the existing project before making changes.
- Inspect relevant files before editing them.
- Do not rewrite working code unnecessarily.
- Prefer small, targeted changes over large rewrites.
- Reuse existing components and utilities whenever possible.
- Do not introduce a new dependency unless it is actually necessary.
- Do not remove existing functionality unless explicitly asked.

## Before making changes

1. Identify the files relevant to the request.
2. Inspect the current implementation.
3. Understand how the existing code works.
4. Decide on the smallest reasonable change.
5. If the requested change could significantly affect the architecture, explain the plan before proceeding.

## After making changes

- Check the modified code for errors.
- Run the relevant tests or checks when available.
- Verify that the requested functionality actually works.
- Do not claim something is fixed or working without checking it.

## Communication

- Keep explanations clear and beginner-friendly.
- Tell me what you changed.
- Tell me which files were modified.
- Mention important assumptions or limitations.
- If something cannot be verified, say so instead of pretending it was verified.