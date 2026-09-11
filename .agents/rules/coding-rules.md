---
trigger: always_on
---

# Coding Rules

## Code quality

- Prefer readable and maintainable code.
- Use the project's existing coding conventions.
- Avoid unnecessary abstraction.
- Keep functions and components reasonably focused.
- Use meaningful variable and function names.
- Do not duplicate logic when an existing utility can be reused.

## Existing code

- Do not replace an existing implementation just because another approach is possible.
- Prefer modifying the current implementation when it is already structurally sound.
- Preserve existing behavior unless the task explicitly requires changing it.

## Dependencies

- Check package.json before adding a dependency.
- Prefer existing libraries already used by the project.
- Before adding a new package, explain why it is needed.
- Do not add libraries simply to solve a small problem that can reasonably be solved with existing code.

## Errors

- Handle errors explicitly where appropriate.
- Do not hide errors just to make the application appear successful.
- When debugging, identify the root cause rather than repeatedly patching symptoms.

## Security

- Never hardcode API keys, passwords, tokens, or other secrets.
- Do not commit .env files containing secrets.
- Use environment variables for sensitive configuration.