# Frontend Conventions

Use this file for tasks touching `src/`, `public/`, `index.html`, or Vite/PWA configuration.

## Stack

- React 19 with the automatic JSX runtime.
- TypeScript is configured for ES2023, bundler module resolution, `verbatimModuleSyntax`, and no emit.
- Vite 8 is the app runtime and build tool.
- React Compiler is enabled through `@vitejs/plugin-react` and `@rolldown/plugin-babel`.
- `vite-plugin-pwa` is configured in `vite.config.ts`.

## Coding

- Keep imports and component code consistent with the existing TypeScript style.
- Prefer focused components and plain React state unless the feature clearly needs additional structure.
- Preserve strict TypeScript settings: avoid unused locals, unused parameters, fallthrough switch cases, and non-erasable TypeScript syntax.
- Keep asset references compatible with Vite, including public assets addressed from `/`.

## Styling

- Follow the existing CSS files in `src/` before adding new styling patterns.
- Keep responsive layout changes scoped to the affected component or page.
- Do not introduce a new styling framework unless the user asks for it.

