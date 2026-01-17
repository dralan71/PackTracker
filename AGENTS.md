## Agent Guide

Keep output concise and focused. Avoid unnecessary comments and overly verbose explanations.

### Common Commands
- `npm run dev`: start the Vite dev server for local development.
- `npm run build`: run TypeScript project build and create the production bundle.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run ESLint on the codebase.
- `npx tsc --noEmit`: run a TypeScript type-only check.
- `npm run test`: start Vitest in watch mode.
- `npm run test:run`: run the full test suite once.
- `npm run test:coverage`: run tests with coverage.
- `npm run test:ui`: open Vitest UI.

### Pre-Commit Requirements
Always run these before committing:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run test` (or `npm run test:run` if you need a single run)

### Notes
- Keep changes minimal and aligned with existing patterns.
- Prefer updating existing code over adding new abstractions.
