---

description: "Task list for 002-music-discography: Music Discography Browser"
---

# Tasks: Music Discography Browser

**Input**: Design documents from `/specs/002-music-discography/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-contracts.md ✅, contracts/ui-contracts.md ✅, quickstart.md ✅

**Tests**: MANDATORY per Constitution II (TDD/BDD). Playwright BDD acceptance tests MUST
be written and confirmed failing before any implementation code. Vitest unit tests MUST
be written and failing before component/lib code. Red-Green-Refactor cycle required.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

## Path Conventions

Next.js App Router convention — no `src/` wrapper:
- Routes: `app/`
- Shared components: `components/`
- Shared lib: `lib/`
- E2E tests: `tests/e2e/`
- Unit tests: `tests/unit/`

---

## Phase 1: Setup

**Purpose**: Install new dependency and extend project config for this feature.

- [x] T001Install `bandcamp-fetch` npm package: `npm install bandcamp-fetch` — confirm import resolves
- [x] T002Update `next.config.ts` — add `images.remotePatterns` entry for `{ protocol: 'https', hostname: 'f4.bcbits.com' }` to allow Bandcamp CDN cover art via `next/image`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type definitions, artist constants, and fallback data that all
user stories depend on. No user story work begins until this phase is complete.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T003 Create `lib/music.ts` — define `Release` TypeScript interface (fields: `id: number`, `title: string`, `artistName: string`, `artistUrl?: string`, `releaseDate: string`, `imageUrl?: string`, `url?: string`, `embedUrl: string`), export `ARTIST_URLS` constant array of all 7 Bandcamp URLs, export `buildEmbedUrl(id: number): string` helper that constructs `https://bandcamp.com/EmbeddedPlayer/album=${id}/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/`
- [x] T004 Create `lib/music-fallback.json` — static JSON array of at least 5 `Release` objects (one per artist minimum) with all required fields populated; use known Bandcamp album IDs from the artist roster; this is the emergency fallback if all live fetches fail

**Checkpoint**: `Release` type exported cleanly; `buildEmbedUrl` returns correct URL; fallback JSON validates against the `Release` schema.

---

## Phase 3: User Story 1 — Browse the Full Discography (Priority: P1) 🎯 MVP

**Goal**: Visitor arrives at `/music` and sees a responsive grid of all releases from
all seven artist projects, sorted newest-first, with cover art, artist name, title, and
release year visible on each card.

**Independent Test**: Visit `/music`, confirm skeleton → release grid transition,
check cards from multiple artists are visible, verify newest-first sort order,
verify no overflow at 320px.

### BDD Acceptance Tests for User Story 1 (MANDATORY — write FIRST, confirm failing) ⚠️

> **NON-NEGOTIABLE: Commit these tests, run `npm run test:e2e`, confirm they FAIL, then begin implementation.**

- [x] T005 [P] [US1] Create `tests/e2e/music.spec.ts` — Playwright BDD tests covering US1 acceptance scenarios from spec.md: (1) grid visible after load; (2) each card shows artist name, title, year; (3) releases sorted descending by date; (4) at least one release per artist project visible; (5) no horizontal overflow at 320px viewport; (6) skeleton cards visible during load state (use `page.route` to delay /api/music response)
- [x] T006 [P] [US1] Create `tests/unit/lib/music.test.ts` — Vitest unit tests: `buildEmbedUrl(123456)` returns URL containing `album=123456`; `ARTIST_URLS` array has exactly 7 entries; each entry starts with `https://`; `buildEmbedUrl` includes `bgcol=fafaf8` and `linkcol=d97706`
- [x] T007 [P] [US1] Create `tests/unit/components/music/ReleaseCard.test.tsx` — Vitest + RTL: renders cover art `<img>` with non-empty `alt`; renders artist name, title, and year; fires `onClick` when clicked; shows selected visual indicator when `isSelected={true}`; renders placeholder when `imageUrl` is absent

### Implementation for User Story 1

- [x] T008 [US1] Implement `app/api/music/route.ts` — `export const revalidate = 86400`; import `ARTIST_URLS` and `buildEmbedUrl` from `lib/music`; use `unstable_cache` from `next/cache` to wrap async function that calls `bcfetch.band.getDiscography({ bandUrl, imageFormat: 10 })` for all 7 artists via `Promise.allSettled`; filter to `type === 'album'`; map to `Release` shape including `embedUrl`; sort descending by `releaseDate`; fall back to `lib/music-fallback.json` if result is empty; return `new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })`
- [x] T009 [P] [US1] Create `components/music/ReleaseSkeleton.tsx` — renders a single `animate-pulse` placeholder card with same dimensions as `ReleaseCard` (square aspect-ratio image area, two text lines below); accepts no props; used in a grid of 8–12 instances
- [x] T010 [P] [US1] Create `components/music/ReleaseCard.tsx` — accepts `release: Release`, `isSelected: boolean`, `onClick: () => void`; renders `<Image>` from `next/image` with `width={300} height={300}` and `alt="{title} by {artistName} cover art"`; renders `release.artistName`, `release.title`, `new Date(release.releaseDate).getFullYear()`; renders placeholder div with initials if `imageUrl` absent; applies `aria-label="Play {title} by {artistName}"`; applies accent border when `isSelected`; all styling via design tokens
- [x] T011 [US1] Create `components/music/DiscographyBrowser.tsx` — `"use client"`; fetches `/api/music` on mount with `useEffect` + `fetch`; shows 8× `ReleaseSkeleton` while loading; renders responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`) of `ReleaseCard` once loaded; manages `selectedRelease: Release | null` state; passes `isSelected` and `onClick` to each card; all colors/spacing via design tokens; handles fetch error by using empty array (page never blank — fallback served from API)
- [x] T012 [US1] Update `app/music/page.tsx` — replace placeholder content with proper `metadata` (`title: "Music — Tyler Agnew"`, `description: "..."`), render `<h1>` heading ("Music"), and render `<DiscographyBrowser />` below the heading; keep global layout (Header/Footer) via root layout

**Checkpoint**: `/music` loads, shows skeleton, then renders release cards from all 7 artists sorted newest-first. US1 E2E tests pass. Unit tests pass.

---

## Phase 4: User Story 2 — Stream a Release Inline (Priority: P2)

**Goal**: Visitor clicks a release card and an embedded Bandcamp player appears at the
bottom of the viewport, allowing streaming without leaving the page. Clicking a second
card switches the player. Close button removes the player.

**Independent Test**: Click a card → player appears with correct `iframe src`; click
another → player switches; close button removes player; scroll while playing → player
stays fixed at bottom.

### BDD Acceptance Tests for User Story 2 (MANDATORY — write FIRST, confirm failing) ⚠️

> **NON-NEGOTIABLE: Add these tests to the spec file first, confirm FAILING, then implement.**

- [x] T013 [P] [US2] Add US2 BDD tests to `tests/e2e/music.spec.ts` — covering MUSIC-UI-03 contract scenarios: no player visible on initial load; clicking a release card makes player visible; player `iframe[src]` matches the release `embedUrl` pattern; clicking a different card updates `iframe[src]`; `iframe` has non-empty `title` attribute; close button (aria-label "Close player") removes the player
- [x] T014 [P] [US2] Create `tests/unit/components/music/BandcampPlayer.test.tsx` — Vitest + RTL: renders `<iframe>` with `src` matching `release.embedUrl`; `iframe` has `title` attribute containing release title; renders close button with `aria-label="Close player"`; clicking close button calls `onClose` prop

### Implementation for User Story 2

- [x] T015 [US2] Create `components/music/BandcampPlayer.tsx` — accepts `release: Release`, `onClose: () => void`; renders `fixed bottom-0 left-0 right-0` container with `bg-(--color-surface) border-t border-(--color-border)`; renders `<iframe src={release.embedUrl} title="{release.title} by {release.artistName} player" width="100%" height="180" allow="autoplay">`; renders release title and artist name as context above player; renders close button with `aria-label="Close player"` that calls `onClose`; fully accessible (close button keyboard-operable)
- [x] T016 [US2] Update `components/music/DiscographyBrowser.tsx` — import and conditionally render `<BandcampPlayer>` when `selectedRelease !== null`; add `pb-48` (or `pb-[180px]`) to the grid wrapper when player is active so cards are not hidden behind the fixed bar; pass `onClose={() => setSelectedRelease(null)}` to player; ensure only one player renders at a time

**Checkpoint**: Click any card → player opens. Switch releases. Close player. US2 E2E tests pass. Unit tests pass.

---

## Phase 5: User Story 3 — Discography Stays Current Automatically (Priority: P3)

**Goal**: New Bandcamp releases appear within 24 hours automatically. When all live
fetches fail, the static fallback JSON is served — the page never goes blank.

**Independent Test**: Mock all Bandcamp fetches to throw → `/api/music` still returns
200 with fallback data → `/music` renders release cards.

### BDD Acceptance Tests for User Story 3 (MANDATORY — write FIRST, confirm failing) ⚠️

- [x] T017 [P] [US3] Add US3 BDD tests to `tests/e2e/music.spec.ts` — covering fallback resilience: use `page.route('/api/music', ...)` to mock the API response with fallback data shape; verify `/music` renders release cards (not blank/error); verify response has correct `Cache-Control` header; verify release cards show title and artist name from mocked data
- [x] T018 [P] [US3] Add fallback unit tests to `tests/unit/lib/music.test.ts` — test that `music-fallback.json` is valid JSON; each entry has required fields (`id`, `title`, `artistName`, `releaseDate`, `embedUrl`); `embedUrl` values match the embed URL pattern; array has at least 5 entries

### Implementation for User Story 3

- [x] T019 [US3] Populate `lib/music-fallback.json` with real release data — research actual album IDs for at least 2 albums per artist from the Bandcamp pages (tyleragnew, scarryburdz, howlingboil, blueplutos, toyfactory, pescidevito, coveredbridges); fill all `Release` fields including `id`, `title`, `artistName`, `releaseDate`, and generated `embedUrl`; sort descending by `releaseDate`

**Checkpoint**: `/api/music` returns non-empty array even when Bandcamp is unreachable. US3 tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete constitution gates, validate all contracts, confirm production readiness.

- [x] T020 Run full E2E test suite against `/music`: `npm run test:e2e -- --grep "music"` — all US1, US2, US3 tests pass across Chromium, Firefox, WebKit
- [x] T021 Run accessibility E2E audit on `/music` — add axe-core test to `tests/e2e/music.spec.ts` (or `tests/e2e/accessibility.spec.ts`): zero critical/serious axe violations; all release cards keyboard-reachable via Tab; player iframe has `title` attribute; `prefers-reduced-motion` suppresses skeleton pulse
- [x] T022 [P] Run Stylelint: `npm run lint:css` — zero violations; no hardcoded hex colours in any `components/music/` file
- [x] T023 [P] Run ESLint: `npm run lint` — zero warnings or errors across all new files
- [x] T024 Run `npm run build` — production build succeeds with zero TypeScript errors; confirm `/music` route renders correctly
- [x] T025 Run quickstart.md validation checklist — step through all 14 validation items; confirm `/api/music` returns 200, releases sorted, player works, fallback serves, 320px responsive, axe clean

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Browse)**: Depends on Phase 2 — first user story, MVP target
- **Phase 4 (US2 — Stream)**: Depends on Phase 3 (player builds on DiscographyBrowser)
- **Phase 5 (US3 — Auto-refresh)**: Depends on Phase 2; can be worked after Phase 3 is complete
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundation → API route → components → page update
- **US2 (P2)**: US1 complete (BandcampPlayer extends DiscographyBrowser)
- **US3 (P3)**: Foundation (fallback JSON) + US1 API route (error handling already in T008)

### Within Each User Story (TDD order — NON-NEGOTIABLE)

1. Write BDD/unit tests → commit → confirm FAILING
2. Implement lib/types (if any)
3. Implement API route (if any)
4. Implement components
5. Update page
6. Run tests → confirm PASSING (Green)
7. Refactor if needed → still PASSING
8. Commit Green phase

### Parallel Opportunities

**Phase 1**: T001 and T002 can run in parallel (independent files)

**Phase 2**: T003 and T004 can run in parallel (independent files)

**Phase 3 (US1)**:
- Tests T005, T006, T007 run in parallel (all different files)
- Components T009, T010 run in parallel after T008 (API route) is done
- T008 (API route) must precede T011 (DiscographyBrowser fetches it)

**Phase 4 (US2)**:
- Tests T013, T014 run in parallel
- T015 (BandcampPlayer) before T016 (wire into DiscographyBrowser)

**Phase 5 (US3)**:
- Tests T017, T018 run in parallel
- T019 (populate fallback JSON) can run any time after Phase 2

**Phase 6**: T022, T023 run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1: Write all US1 tests in parallel (commit, confirm failing):
Task: "Create tests/e2e/music.spec.ts (T005)"
Task: "Create tests/unit/lib/music.test.ts (T006)"
Task: "Create tests/unit/components/music/ReleaseCard.test.tsx (T007)"

# Step 2: Implement API route first (T008), then components in parallel:
Task: "Implement app/api/music/route.ts (T008)"
# Then in parallel:
Task: "Create components/music/ReleaseSkeleton.tsx (T009)"
Task: "Create components/music/ReleaseCard.tsx (T010)"

# Step 3: Wire up browser and page:
Task: "Create components/music/DiscographyBrowser.tsx (T011)"
Task: "Update app/music/page.tsx (T012)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundation (T003–T004)
3. Complete Phase 3: User Story 1 (T005–T012)
4. **STOP and VALIDATE**: Run `npm run test:e2e -- --grep "music"`, visit `/music`
5. Site now has a live discography grid — deployable

### Incremental Delivery

1. Setup + Foundation → types and fallback data ready
2. US1 complete → MVP: discography grid visible ✅
3. US2 complete → inline streaming player working ✅
4. US3 complete → fallback resilience verified, real fallback data populated ✅
5. Polish → all gates pass, production build clean, ready to merge ✅

---

## Notes

- [P] tasks = different files, no unresolved dependencies — safe to parallelize
- [Story] label maps each task to a specific user story for traceability
- TDD order is non-negotiable: test files committed and FAILING before implementation
- All colours MUST use CSS custom properties — Stylelint enforces this in `components/music/`
- The Bandcamp iframe is a third-party embed — do not attempt to style its internals
- `bandcamp-fetch` may occasionally fail for individual artists — `Promise.allSettled` ensures partial data is always returned
- Commit after each checkpoint to build the Red-Green-Refactor history required by Gate 5
