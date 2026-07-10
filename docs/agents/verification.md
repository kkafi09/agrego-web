# Verification

Use this file before running checks.

## Allowed By Default

- Run `bun run lint` after code or instruction changes when practical.
- Use read-only commands such as `rg`, `Get-Content`, and `git status --short` to inspect the workspace.

## Requires User Permission

- Do not run `bun run dev`.
- Do not run `bun run build`.
- Do not run long-lived local services such as Vite dev server or `convex dev`.

## Current Scripts

- `bun run lint`: runs Oxlint.
- `bun run build`: runs `tsc -b && vite build`; avoid unless explicitly permitted.
- `bun run dev`: starts Vite; avoid unless explicitly permitted.
- `bun run dev:convex`: starts Convex dev; avoid unless explicitly permitted.
- `bun run preview`: starts Vite preview; avoid unless explicitly permitted.

