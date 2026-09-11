---
name: debugging
description: Systematically diagnose and fix bugs instead of guessing or repeatedly patching symptoms.
---

# Debugging

Use this skill when the user reports an error, bug, broken feature, unexpected behavior, or failed build.

## Debugging process

1. Reproduce or inspect the reported problem.
2. Read the relevant error message carefully.
3. Identify the file and code path involved.
4. Trace the problem to its likely root cause.
5. Check related code and dependencies.
6. Propose the smallest reasonable fix.
7. Apply the fix.
8. Run the relevant check or test.
9. Verify that the original problem is resolved.

## Do not

- Randomly change unrelated files.
- Rewrite large portions of the project without justification.
- Install packages just because an error occurred.
- Hide errors.
- Remove functionality to make an error disappear.
- Claim success without verification.

## Final response

Explain:

- What caused the problem.
- What was changed.
- How it was verified.
- Whether anything remains unresolved.