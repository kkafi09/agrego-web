# Backend Conventions

Use this file for tasks touching `convex/`.

## Stack

- Convex is used for backend schema and generated API types.
- `convex/schema.ts` defines tables with `defineSchema`, `defineTable`, and validators from `convex/values`.

## Coding

- Keep schema changes explicit and small.
- Prefer Convex validators over loose TypeScript-only assumptions for persisted data.
- Treat files in `convex/_generated/` as generated artifacts; do not edit them manually.
- If generated Convex files need updating, ask before running long-lived Convex commands.

