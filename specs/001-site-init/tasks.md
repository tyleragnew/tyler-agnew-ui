---

description: "Task list for 001-site-init: Site Foundation & Navigation"
---

# Tasks: Site Foundation & Navigation

**Input**: Design documents from `/specs/001-site-init/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅, quickstart.md ✅

**Tests**: MANDATORY per Constitution II (TDD/BDD). Playwright BDD acceptance tests MUST
be written and confirmed failing before any implementation code. Vitest unit tests MUST
be written and failing before component code. Red-Green-Refactor cycle required.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

## Path Conventions

Next.js App Router convention — no `src/` wrapper:
- Routes: `app/`
- Shared components: `components/`
- Font files: `app/fonts/milker/`
- E2E tests: `tests/e2e/`
- Unit tests: `tests/unit/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js project and install all tooling so every subsequent
phase can begin immediately.

- [X] T001 Initialize Next.js 15 App Router project with TypeScript (`npx create-next-app@latest . --app --typescript --eslint --tailwind --no-src-dir`) — confirm `app/` directory created at repo root
- [X] T002 Install Tailwind CSS v4 and replace v3 setup: `npm install -D tailwindcss @tailwindcss/postcss`, update `postcss.config.mjs` to use `@tailwindcss/postcss`, replace `globals.css` content with `@import "tailwindcss";`
- [X] T003 [P] Install Geist font package: `npm install next/font` (already included) — verify `next/font/geist` is importable
- [X] T004 [P] Download Milker font files from Fontshare (Regular + Bold at minimum in woff2 format), place in `app/fonts/milker/` directory
- [X] T005 [P] Install Vitest and React Testing Library: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react`
- [X] T006 [P] Install Playwright: `npm install -D @playwright/test` then `npx playwright install --with-deps chromium firefox webkit`
- [X] T007 [P] Install Stylelint for design token enforcement: `npm install -D stylelint stylelint-config-standard`
- [X] T008 Configure `vitest.config.ts` at repo root — set environment to `jsdom`, configure path aliases matching `tsconfig.json`, add `@testing-library/jest-dom` setup file
- [X] T009 Configure `playwright.config.ts` at repo root — set `baseURL` to `http://localhost:3000`, configure three browser projects (chromium, firefox, webkit), set `webServer` to auto-start `npm run dev`
- [X] T010 Configure `.stylelintrc.json` at repo root — extend `stylelint-config-standard`, add custom rule to disallow hardcoded hex values outside `app/globals.css`
- [X] T011 Add test scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`, `"lint:css": "stylelint '**/*.css' --ignore-path .gitignore"`
- [X] T012 Enable TypeScript strict mode: set `"strict": true` in `tsconfig.json`, confirm `noImplicitAny`, `strictNullChecks` are active

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design token system, font loading, and global layout infrastructure that
ALL user stories depend on. Nothing else can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [X] T013 Create `app/fonts/fonts.ts` — define `localFont` for Milker (`src: './milker/Milker-Regular.woff2'`, `variable: '--font-milker'`, `display: 'swap'`) and import Geist + Geist Mono from `next/font/geist` with variables `--font-geist` and `--font-geist-mono`
- [X] T014 Create `app/globals.css` — `@import "tailwindcss"`, define `@theme` block with color tokens (`--color-background: #FAFAF8`, `--color-surface: #FFFFFF`, `--color-text-primary: #111110`, `--color-text-secondary: #6B6B67`, `--color-accent: #D97706`, `--color-accent-hover: #B45309`, `--color-border: #E5E5E3`), define `@theme inline` block for font tokens (`--font-display: var(--font-milker)`, `--font-body: var(--font-geist)`, `--font-mono: var(--font-geist-mono)`), add base resets (background-color, color, font-family from tokens)
- [X] T015 Create `app/layout.tsx` — import fonts from `./fonts/fonts.ts`, apply font CSS variable classNames to `<html lang="en">`, import `globals.css`, render `{children}` in `<body>` — this is the bare root layout (header/footer added in US2)
- [X] T016 [P] Create `components/layout/Header.tsx` — placeholder shell (renders `<header>` with correct semantic element, exports component) — wired up with content in US2
- [X] T017 [P] Create `components/layout/Footer.tsx` — placeholder shell (renders `<footer>` with correct semantic element) — wired up with content in US2
- [X] T018 [P] Create `components/layout/Nav.tsx` — placeholder shell (renders `<nav aria-label="Main navigation">`) — wired up with route data and active state in US2

**Checkpoint**: Design tokens accessible via CSS custom properties; root layout renders without error; `npm run build` passes TypeScript strict check.

---

## Phase 3: User Story 1 — Site Can Be Visited and Navigated (Priority: P1) 🎯 MVP

**Goal**: Visitor can reach tyleragnew.dev, see Tyler's name, navigate to all five
sections via working links, and see a friendly 404 for unknown routes.

**Independent Test**: Visit `/`, click each nav link (Blog, Music, Projects, Records),
confirm all land correctly, visit `/does-not-exist`, confirm 404 with nav intact.

### BDD Acceptance Tests for User Story 1 (MANDATORY — write FIRST, confirm failing) ⚠️

> **NON-NEGOTIABLE: Commit these tests, run `npm run test:e2e`, confirm they FAIL, then begin implementation.**

- [X] T019 [P] [US1] Create `tests/e2e/navigation.spec.ts` — Playwright BDD tests covering contracts NAV-01 through NAV-08: "Given any page is loaded, When user views nav, Then all 5 labels visible"; "Given on /blog, When nav renders, Then Blog link has aria-current=page" for each route; click-through test for each nav link; keyboard tab test for focus rings
- [X] T020 [P] [US1] Create `tests/e2e/routes.spec.ts` — Playwright BDD tests covering route behavior contract table: verify correct `<h1>` content and `<title>` for each of the 6 routes (/, /blog, /music, /projects, /records, unknown path)
- [X] T021 [P] [US1] Create `tests/e2e/error-pages.spec.ts` — Playwright BDD tests covering E404-01 through E404-04: HTTP 404 status, layout intact, home link present and functional, no stack trace visible

### Implementation for User Story 1

- [X] T022 [US1] Define route configuration — create `lib/routes.ts` with the 5 Route entities from data-model.md (path, label, navOrder, description) as a typed constant array
- [X] T023 [US1] Implement `components/layout/Nav.tsx` — render `<nav aria-label="Main navigation">` containing a list of links derived from route config; use `usePathname()` from `next/navigation` to set `aria-current="page"` on active link; style with design tokens (no hardcoded colors); visible focus rings using `--color-accent`
- [X] T024 [US1] Implement `components/layout/Header.tsx` — render `<header>` with site name "Tyler Agnew" as a styled link to `/`, include `<Nav />` component
- [X] T025 [US1] Wire `Header` and `Footer` into `app/layout.tsx` — update root layout to include `<Header />` above `{children}` and `<Footer />` below; ensure full-page layout structure with semantic landmarks
- [X] T026 [US1] Implement `app/page.tsx` (home page `/`) — render `<h1>` with "Tyler Agnew", tagline text, and section entry links for all 5 sections; all styled with design tokens; page `<title>` set via `export const metadata`
- [X] T027 [P] [US1] Implement `app/blog/page.tsx` — placeholder page with `<h1>Blog</h1>`, section description text, `metadata.title = "Blog — Tyler Agnew"`
- [X] T028 [P] [US1] Implement `app/music/page.tsx` — placeholder page with `<h1>Music</h1>`, section description text, `metadata.title = "Music — Tyler Agnew"`
- [X] T029 [P] [US1] Implement `app/projects/page.tsx` — placeholder page with `<h1>Projects</h1>`, section description text, `metadata.title = "Projects — Tyler Agnew"`
- [X] T030 [P] [US1] Implement `app/records/page.tsx` — placeholder page with `<h1>Records</h1>`, section description text, `metadata.title = "Records — Tyler Agnew"`
- [X] T031 [US1] Implement `app/not-found.tsx` — render friendly 404 message, a link to `/` (Home), within the global layout (header + nav + footer visible); `metadata.title = "Not Found — Tyler Agnew"`
- [X] T032 [US1] Run E2E tests: `npm run test:e2e` — confirm T019–T021 tests now pass (Green phase of Red-Green-Refactor); commit

**Checkpoint**: All 6 routes render; nav links functional; 404 page working; E2E tests green. User Story 1 independently deployable.

---

## Phase 4: User Story 2 — Consistent Visual Identity (Priority: P2)

**Goal**: Every page shares identical header, footer, typography (Milker + Geist), and
color tokens — no hardcoded values anywhere outside globals.css.

**Independent Test**: Navigate between all 6 routes; inspect computed styles; run
Stylelint; confirm fonts render with display/body distinction; run axe accessibility scan.

### BDD Acceptance Tests for User Story 2 (MANDATORY — write FIRST, confirm failing) ⚠️

> **NON-NEGOTIABLE: Commit these tests, confirm they FAIL, then implement.**

- [X] T033 [P] [US2] Create `tests/e2e/visual-identity.spec.ts` — Playwright BDD tests covering GL-01 through GL-06 (header present, footer present, nav present, site name visible, font CSS vars defined on html, background color correct); test that header and footer are visually identical across all 6 routes; test font variable `--font-display` is set on `<html>`
- [X] T034 [P] [US2] Create `tests/e2e/accessibility.spec.ts` — Playwright + axe-core tests covering A11Y-01 through A11Y-06: inject `@axe-core/playwright`, run `checkA11y()` on each route; verify single `<h1>` per page; verify `<html lang="en">`; verify heading hierarchy; verify all interactive elements keyboard reachable

### Unit Tests for User Story 2

- [X] T035 [P] [US2] Create `tests/unit/components/Nav.test.tsx` — Vitest + RTL tests: renders all 5 nav items; active link has `aria-current="page"` when pathname matches; inactive links do not have `aria-current`; all links have correct `href`
- [X] T036 [P] [US2] Create `tests/unit/components/Header.test.tsx` — Vitest + RTL tests: renders site name "Tyler Agnew"; renders `<Nav />`; site name links to `/`

### Implementation for User Story 2

- [X] T037 [US2] Install axe-core for Playwright: `npm install -D @axe-core/playwright`
- [X] T038 [US2] Finalize `components/layout/Footer.tsx` — implement footer with copyright attribution (`© {year} Tyler Agnew`), optionally a GitHub link; styled exclusively with design tokens; uses `--font-body` and `--color-text-secondary`
- [X] T039 [US2] Audit all implemented components (Header, Nav, Footer, all page files) with Stylelint — run `npm run lint:css` — fix any hardcoded color/font-family violations; ensure 100% token coverage
- [X] T040 [US2] Typography audit — verify Milker (`font-display`) is applied to all `<h1>` elements and the site name; verify Geist (`font-body`) is applied to nav links, body text, and footer; no component uses a font-family outside the token system
- [X] T041 [US2] Run unit tests: `npm run test` — confirm T035–T036 pass (Green phase); run E2E tests: `npm run test:e2e` — confirm T033–T034 pass; commit

**Checkpoint**: Token audit clean; axe reports zero critical/serious violations; font rendering verified; all tests green.

---

## Phase 5: User Story 3 — Responsive Layout on All Device Sizes (Priority: P3)

**Goal**: Every page renders correctly and accessibly at 320px, 768px, and 1280px viewport
widths without horizontal scrolling or broken layout.

**Independent Test**: Use Playwright viewport resize to test each breakpoint; confirm nav
accessible at 320px; confirm no overflow at any width; verify `prefers-reduced-motion`
suppresses all animations.

### BDD Acceptance Tests for User Story 3 (MANDATORY — write FIRST, confirm failing) ⚠️

> **NON-NEGOTIABLE: Commit these tests, confirm they FAIL, then implement.**

- [X] T042 [P] [US3] Create `tests/e2e/responsive.spec.ts` — Playwright BDD tests covering RL-01 through RL-05: test each route at `{ width: 320, height: 667 }`, `{ width: 768, height: 1024 }`, `{ width: 1280, height: 800 }` viewports; assert no horizontal scrollbar (`document.documentElement.scrollWidth <= viewport.width`); assert all nav links accessible (visible or within open menu); test `prefers-reduced-motion` via `page.emulateMedia({ reducedMotion: 'reduce' })` and confirm no animation fires

### Implementation for User Story 3

- [X] T043 [US3] Implement mobile navigation in `components/layout/Nav.tsx` — add hamburger/drawer pattern for viewports below `md` breakpoint (768px): toggle button with `aria-expanded` and `aria-controls`, drawer menu that is hidden at desktop; ensure all 5 nav items remain accessible at 320px; use design tokens exclusively; add `aria-label="Toggle navigation"` to toggle button
- [X] T044 [US3] Implement responsive layout in `app/layout.tsx` — add max-width container centered with auto margins for desktop; ensure `<main>` fills available width; confirm no fixed-width elements that cause overflow at 320px
- [X] T045 [US3] Implement responsive styles across all page components — `app/page.tsx`, all 4 placeholder pages, `app/not-found.tsx`: constrain content width with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`); use responsive padding/margin from token scale; test each page renders without overflow at 320px
- [X] T046 [US3] Add `prefers-reduced-motion` support — in `app/globals.css`, add `@media (prefers-reduced-motion: reduce)` block suppressing all transitions and animations site-wide; ensure any hover/focus transitions respect this media query
- [X] T047 [US3] Run E2E tests: `npm run test:e2e` — confirm T042 tests pass (Green phase); run full test suite `npm run test && npm run test:e2e`; commit

**Checkpoint**: All breakpoints clean; mobile nav accessible; reduced-motion verified; full test suite green.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete all constitution gates, ensure production build is clean, and
validate the feature is merge-ready.

- [X] T048 Run complete Stylelint audit: `npm run lint:css` — zero violations; document any intentional exceptions
- [X] T049 Run full ESLint check: `npm run lint` — zero warnings or errors; fix any TypeScript strict violations found
- [X] T050 Run `npm run build` — confirm production build succeeds with zero TypeScript errors and zero unused imports
- [X] T051 [P] Run Lighthouse CI manually against `npm run start` (production build) — verify Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90 on `/`; document scores
- [X] T052 [P] Verify Core Web Vitals: LCP ≤ 2.5s (font self-hosted = no CDN latency), CLS ≤ 0.1 (fonts use `display: swap` + metric-compatible fallback), INP ≤ 200ms
- [X] T053 [P] Accessibility final check: run `axe` in browser DevTools on each route; screen-reader smoke test (NVDA or VoiceOver) — confirm nav landmark announced, active page link announced, heading hierarchy logical
- [X] T054 Run quickstart.md validation checklist — step by step, confirm all 8 steps pass; note any failures
- [X] T055 [P] Verify design token contract DT-01 through DT-05 from `contracts/ui-contracts.md` — confirm computed contrast ratios in browser DevTools match documented values
- [X] T056 Commit all passing work with descriptive commit messages evidencing the TDD cycle (test commits preceding implementation commits); confirm branch `001-site-init` is ready for PR to `main`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 complete — BLOCKS all user stories
- **Phase 3 (US1 — Navigation)**: Depends on Phase 2 — first user story, MVP target
- **Phase 4 (US2 — Visual Identity)**: Depends on Phase 2; can start after Phase 3 but benefits from US1 components being in place
- **Phase 5 (US3 — Responsive)**: Depends on Phase 3 and Phase 4 (needs all components to exist)
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundation → implement all routes and nav
- **US2 (P2)**: Foundation → can start in parallel with US1 after Phase 2; tests run over US1 output
- **US3 (P3)**: Requires US1 (components exist) + US2 (tokens applied) before responsive work is meaningful

### Within Each User Story (TDD order — NON-NEGOTIABLE)

1. Write BDD/unit tests → commit → confirm FAILING
2. Implement models/config (lib/routes.ts, etc.)
3. Implement components
4. Implement pages/routes
5. Run tests → confirm PASSING (Green)
6. Refactor if needed → confirm still PASSING
7. Commit Green phase

### Parallel Opportunities

**Phase 1**: T003, T004, T005, T006, T007 all run in parallel after T001+T002

**Phase 2**: T016, T017, T018 run in parallel after T013+T014+T015

**Phase 3 (US1)**:
- Tests T019, T020, T021 written in parallel (all different files)
- Placeholder pages T027, T028, T029, T030 implemented in parallel (independent files)

**Phase 4 (US2)**:
- Tests T033, T034, T035, T036 written in parallel
- T038 (Footer) and T039 (lint audit) run in parallel

**Phase 5 (US3)**:
- Test T042 written first; T043–T046 can partially overlap (different files)

**Phase 6**: T051, T052, T053, T055 run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1: Write all US1 tests in parallel (commit, confirm failing):
Task: "Create tests/e2e/navigation.spec.ts (T019)"
Task: "Create tests/e2e/routes.spec.ts (T020)"
Task: "Create tests/e2e/error-pages.spec.ts (T021)"

# Step 2: Implement foundation (T022 → then parallel):
Task: "Create lib/routes.ts (T022)"
# Then in parallel:
Task: "Implement Nav.tsx (T023)"
Task: "Implement Header.tsx (T024)"

# Step 3: Implement placeholder pages in parallel:
Task: "app/blog/page.tsx (T027)"
Task: "app/music/page.tsx (T028)"
Task: "app/projects/page.tsx (T029)"
Task: "app/records/page.tsx (T030)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (design tokens + font loading)
3. Complete Phase 3: User Story 1 (navigation + all routes)
4. **STOP and VALIDATE**: Run `npm run test:e2e`, visit all routes, confirm nav works
5. Deploy preview to Vercel — site is live and navigable

### Incremental Delivery

1. Setup + Foundation → tokens and fonts working
2. US1 complete → MVP: site navigable, all routes exist ✅
3. US2 complete → visual identity consistent, axe clean, fonts correct ✅
4. US3 complete → fully responsive, mobile nav working ✅
5. Polish → Lighthouse ≥ 90, build clean, ready to merge ✅

### Parallel Team Strategy

With a single developer:
- Complete Phase 1 + Phase 2 first
- Then US1 → US2 → US3 in sequence (each builds on previous)
- Polish at end before PR

---

## Notes

- [P] tasks = different files, no unresolved dependencies — safe to parallelize
- [Story] label maps each task to a specific user story for traceability
- TDD order is non-negotiable: test files committed and FAILING before implementation
- All color/font values MUST use CSS custom properties — Stylelint enforces this
- Commit after each checkpoint to build the Red-Green-Refactor history required by Gate 5
- Stop at any checkpoint to validate story independently before continuing
