# Instruction Maintenance

Use this file when updating `AGENTS.md` or files in `docs/agents/`.

## Progressive Disclosure

- Keep root `AGENTS.md` limited to project identity, package manager, unusual verification constraints, and links to scoped instruction files.
- Put instructions in the narrowest file that matches when they are needed.
- Avoid repeating instructions across files; link instead.
- Prefer concrete commands, paths, and project-specific constraints over broad advice.

## Contradictions

- If two instructions conflict, stop and ask the user which version to keep before editing.
- Keep the user's latest explicit instruction over older local guidance when they clearly conflict.

## Flag For Deletion

No existing `AGENTS.md` instructions were found during this refactor, so no current instructions were deleted.

Do not add instructions that are:

- Redundant with normal agent behavior, such as "inspect the code before editing."
- Too vague to verify, such as "write clean code" or "make it better."
- Obvious for every project, such as "do not introduce bugs."
- Duplicated from another instruction file.

