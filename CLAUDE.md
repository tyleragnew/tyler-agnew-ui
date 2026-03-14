# tyler-agnew-site Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-14

## Active Technologies

- TypeScript 5.x (`strict: true`) + Next.js 15 (App Router), Tailwind CSS v4 (`@tailwindcss/postcss`), Vitest + React Testing Library (unit), Playwright (E2E/BDD acceptance) (001-site-init)

## Project Structure

```text
app/          # Next.js App Router (routes, layouts, pages)
components/   # Shared UI components (layout/, ui/)
public/fonts/ # Self-hosted font files (Milker woff2)
tests/e2e/    # Playwright BDD acceptance tests
tests/unit/   # Vitest + React Testing Library unit tests
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (TypeScript check included)
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright acceptance tests
npm run lint         # ESLint (next/core-web-vitals + @typescript-eslint)
npm run lint:css     # Stylelint (enforces design token usage)
```

## Code Style

- TypeScript strict mode — no `any`, no non-null assertions without justification
- All colors/fonts MUST reference CSS custom properties from `app/globals.css @theme`
- No hardcoded hex values or font-family strings outside globals.css
- TDD/BDD mandatory: Playwright BDD tests MUST be written and failing before any
  implementation code; Vitest tests before component code (Red-Green-Refactor)
- Given/When/Then format in Playwright test descriptions (no Cucumber.js)

## Recent Changes

- 001-site-init: Added TypeScript 5.x (`strict: true`) + Next.js 15 (App Router), Tailwind CSS v4 (`@tailwindcss/postcss`), Vitest + React Testing Library (unit), Playwright (E2E/BDD acceptance)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
