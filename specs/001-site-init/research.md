# Research: Site Foundation & Navigation (001-site-init)

**Date**: 2026-03-14
**Branch**: `001-site-init`

---

## 1. Testing Framework

### Decision: Vitest + React Testing Library (unit) + Playwright (E2E/BDD acceptance)

**Rationale**:

- **Vitest** is the preferred unit/component test runner for modern Next.js App Router
  projects in 2025. It uses Vite's transform pipeline, has native TypeScript support, and
  is significantly faster than Jest for a modern ESM-first codebase. Jest requires heavy
  configuration (babel transforms, custom moduleNameMapper) to handle App Router's RSC
  module system.
- **React Testing Library (RTL)** works with Vitest seamlessly for testing client
  components. Server Components cannot be rendered in jsdom — they are tested via
  Playwright E2E tests instead. This is the Next.js-recommended approach.
- **Playwright** is the clear choice over Cypress for E2E/acceptance tests:
  - Native support for multiple browsers (Chromium, Firefox, WebKit)
  - Faster, no iframe restrictions
  - Superior TypeScript ergonomics
  - Official Next.js + Vercel integration and recommendation
  - Built-in test generator and tracing tools
- **BDD format**: Given/When/Then lives as structured Playwright test descriptions
  (`test('Given X, When Y, Then Z', ...)`) — no Cucumber.js or .feature files. A personal
  site has no stakeholders requiring Gherkin syntax; the overhead is unjustified.

**Alternatives considered**:
- Jest + RTL: Rejected — requires complex configuration for App Router; slower; ESM
  interop issues with server components.
- Cypress: Rejected — heavier install, iframe-based architecture limits some testing
  patterns, slower than Playwright for CI.
- Cucumber.js: Rejected — adds a parsing/wiring layer with no practical benefit for a
  single-developer personal site.

---

## 2. Tailwind CSS Version

### Decision: Tailwind CSS v4

**Rationale**:

- Tailwind v4 was released stable in early 2025. As of mid-2025 it is production-ready
  and officially recommended for new projects.
- v4 uses a **CSS-first configuration** via `@theme {}` blocks in CSS rather than
  `tailwind.config.js`. This is cleaner for design tokens (all tokens live in one CSS
  file, referenced as CSS custom properties throughout the codebase).
- For Next.js 15, v4 uses `@tailwindcss/postcss` (PostCSS plugin) — compatible with
  Next.js's PostCSS pipeline out of the box. No separate Vite plugin needed.
- CSS custom properties emitted by `@theme` are available globally as `var(--color-*)`,
  making design token enforcement via lint trivially checkable.

**Alternatives considered**:
- Tailwind v3: Rejected — `tailwind.config.js` is the older paradigm; starting a new
  project in 2026 on v3 would require migration later. v4 is stable and the correct
  starting point.

---

## 3. Typography & Font Loading

### Decision: `next/font/local` for Milker + `next/font/geist` for body + Geist Mono for code

**Rationale**:

**Milker (display/headings)**:
- Milker is from Fontshare (fontshare.com), not Google Fonts — not available via
  `next/font/google`.
- **Self-host via `next/font/local`**: Download the font files from Fontshare
  (woff2 format), add to `public/fonts/` or `app/fonts/`, configure `next/font/local`.
  This gives automatic `font-display: swap`, zero external network dependency, and
  optimal LCP performance (no render-blocking font CDN request).
- Fontshare fonts are free for personal/commercial use under the Fontshare license.

**Body/UI (Geist)**:
- **Geist** selected over DM Sans and Instrument Sans.
  - Vercel's own font: ships as `next/font/geist` — zero-config integration with Next.js,
    optimized loading, excellent developer experience.
  - Modern, slightly technical aesthetic; clean geometric grotesque — contrasts well with
    Milker's rounded warmth without competing.
  - Pairs naturally with Geist Mono (same family) for code blocks.
- Integration: `import { Geist, Geist_Mono } from 'next/font/geist'`

**CSS variable exposure**:

Font CSS variables (emitted by `next/font` onto `<html>`) are forwarded to Tailwind
using `@theme inline` — the `inline` keyword tells Tailwind these reference existing CSS
variables rather than literal values, preventing it from trying to inline the value:

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  --font-display: var(--font-milker);    /* next/font/local variable */
  --font-body: var(--font-geist);        /* next/font/geist variable */
  --font-mono: var(--font-geist-mono);   /* next/font/geist variable */
}
```

**Font file location**: `app/fonts/milker/` (not `public/fonts/`) — `next/font/local`
resolves paths relative to the file importing the font, so placing fonts inside `app/`
keeps them co-located with the `fonts.ts` definition.

**Alternatives considered**:
- DM Sans via next/font/google: Rejected — less distinctive; Geist has tighter Next.js
  integration and better mono companion.
- Instrument Sans: Rejected — slight personality is appealing but Geist's technical
  neutrality better serves a site that spans both code and music.
- Fontshare CDN @import: Rejected — external network dependency adds latency and
  introduces a SPOF; self-hosting is always preferred for performance.

---

## 4. Design Token System

### Decision: Tailwind v4 `@theme` block as single source of truth

**Rationale**:

All design tokens defined once in a root CSS file (`app/globals.css`) inside a
`@theme {}` block. Tailwind v4 emits these as CSS custom properties automatically,
making them available both as Tailwind utility classes and as `var(--*)` references
in arbitrary CSS.

**Defined palette** (from project spec):

| Token | Value | Role |
|-------|-------|------|
| `--color-background` | `#FAFAF8` | Page background (warm white) |
| `--color-surface` | `#FFFFFF` | Card / elevated surface |
| `--color-text-primary` | `#111110` | Primary text (near-black, warm) |
| `--color-text-secondary` | `#6B6B67` | Secondary / muted text |
| `--color-accent` | `#D97706` | Warm amber accent |
| `--color-border` | `#E5E5E3` | Borders and dividers |

**Accent color**: Warm amber `#D97706` selected. Rationale:
- Consistent with the warm palette (warm white background, warm gray text).
- Strong enough contrast against `#FAFAF8` for interactive elements (contrast ratio ≈
  3.2:1 against background — acceptable for large/bold interactive elements; pair with
  text color for body-copy links).
- Feels craft-forward and personal without being too cold (deep teal) or too soft
  (dusty rose).
- Tyler can override this in implementation with a different amber shade if needed.

**Lint enforcement**: ESLint rule or Stylelint rule to flag hardcoded hex values outside
`globals.css` — enforces the "no hardcoded color values" constitutional requirement.

---

## 5. Source Code Structure

### Decision: Next.js App Router convention (no `src/` directory)

**Rationale**:

Next.js App Router projects use the `app/` directory at root by default. For a personal
site without a separate backend service, a flat structure is preferred over adding a
`src/` wrapper.

```text
app/                    # Next.js App Router (routes, layouts, pages)
├── (site)/             # Route group: public site routes
│   ├── layout.tsx      # Root layout (fonts, global styles, nav, footer)
│   ├── page.tsx        # Home /
│   ├── blog/
│   │   └── page.tsx    # /blog placeholder
│   ├── music/
│   │   └── page.tsx    # /music placeholder
│   ├── projects/
│   │   └── page.tsx    # /projects placeholder
│   └── records/
│       └── page.tsx    # /records placeholder
├── not-found.tsx       # Custom 404
└── globals.css         # Tailwind @theme tokens + global resets

components/             # Shared UI components
├── layout/
│   ├── Header.tsx
│   ├── Nav.tsx
│   └── Footer.tsx
└── ui/                 # Primitive UI components (tokens, spacing)

public/
└── fonts/
    └── Milker/         # Self-hosted Milker font files (woff2)

tests/
├── e2e/                # Playwright BDD acceptance tests
│   ├── navigation.spec.ts
│   ├── responsive.spec.ts
│   └── visual-identity.spec.ts
└── unit/               # Vitest + RTL unit tests
    └── components/

playwright.config.ts
vitest.config.ts
```

---

## 6. Linting & Code Quality Tooling

### Decision: ESLint (Next.js built-in config) + Prettier + Stylelint

- **ESLint**: `next/core-web-vitals` + `@typescript-eslint` — enforces Next.js best
  practices, TypeScript strictness.
- **Prettier**: Code formatting; integrated via `eslint-config-prettier`.
- **Stylelint**: `stylelint-config-standard` + custom rule to flag hardcoded color/
  spacing values outside `globals.css` (enforces design token constitutional requirement).
- TypeScript `strict: true` in `tsconfig.json`.

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Unit/Component testing | Vitest + React Testing Library |
| E2E / Acceptance testing | Playwright (Given/When/Then as test descriptions) |
| BDD framework | No Cucumber.js — structured test names only |
| Tailwind version | v4 (CSS-first `@theme`, PostCSS) |
| Display font | Milker (Fontshare, self-hosted via next/font/local) |
| Body font | Geist (next/font/geist) |
| Mono font | Geist Mono (next/font/geist) |
| Accent color | Warm amber `#D97706` |
| Design token system | Tailwind v4 `@theme` block in globals.css |
| Source structure | Next.js App Router convention, no `src/` |
| Linting | ESLint (next/core-web-vitals) + Prettier + Stylelint |
