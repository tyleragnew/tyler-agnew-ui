# Tasks: Records / Discogs Collection

**Input**: Design documents from `specs/004-discogs-records/`
**Prerequisites**: plan.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Maps to user story phase

---

## Phase 1: Setup

**Purpose**: Install dependencies, configure environment, create shared types and fallback data.

- [x] T001 Install MUI X Charts dependencies: `npm install @mui/x-charts @mui/material @emotion/react @emotion/styled`
- [x] T002 Add `i.discogs.com` to `remotePatterns` in `next.config.ts`
- [x] T003 [P] Create `lib/discogs.ts` with `DiscogsRelease` type, `cleanArtistName()`, `formatDateAdded()`, `buildChartData()` utility functions
- [x] T004 [P] Create `lib/discogs-fallback.json` with 5 sample records matching the `DiscogsRelease` shape

---

## Phase 2: API Routes (Foundational)

**Purpose**: Server-side Discogs proxy routes that keep the token out of the client bundle.

- [x] T005 Create `app/api/discogs/recent/route.ts`: fetches last 5 releases from Discogs and returns JSON; uses `DISCOGS_TOKEN` env var; returns fallback on error
- [x] T006 Create `app/api/discogs/collection/route.ts`: paginates through full Discogs collection and returns all releases as JSON; uses `DISCOGS_TOKEN` env var

---

## Phase 3: US1 — Recent Additions

**Goal**: Display the 5 most recently added records as a card grid.

**Independent Test**: Navigate to `/records`, verify 5 cards each showing album art, artist name, title, label/year.

- [x] T007 [US1] Write failing Playwright E2E test in `tests/e2e/records.spec.ts`: "Given user is on /records, When page loads, Then 5 record cards are visible with artist name and title"
- [x] T008 [P] [US1] Write failing Vitest test `tests/unit/components/records/RecordCard.test.tsx`: renders artist, title, label+year, format badge, date added; card links to Discogs release URL
- [x] T009 [P] [US1] Write failing Vitest test `tests/unit/components/records/RecentAdditions.test.tsx`: renders section heading "Recently added", renders "View on Discogs ↗" link, renders 5 RecordCard children
- [x] T010 [US1] Implement `components/records/RecordCard.tsx`: album art (`next/image`), artist, title, label+year, format badge, date added (relative if ≤30 days, absolute otherwise); links to `https://www.discogs.com/release/{id}`
- [x] T011 [US1] Implement `components/records/RecentAdditions.tsx`: section header with "Recently added" and "View on Discogs ↗" link; 5-column desktop grid, responsive mobile layout; accepts `releases: DiscogsRelease[]` prop

---

## Phase 4: US2 — Collection Growth Chart

**Goal**: Display a bar chart of records added per month with total collection count.

**Independent Test**: Navigate to `/records`, scroll to chart section, verify a bar chart with labeled axes is visible.

- [x] T012 [US2] Write failing Playwright E2E test in `tests/e2e/records.spec.ts`: "Given user is on /records, When chart section is visible, Then a bar chart with at least 1 bar is rendered"
- [x] T013 [US2] Write failing Vitest test `tests/unit/components/records/CollectionGrowthChart.test.tsx`: renders total count headline, renders chart container, shows loading state when `loading` prop is true
- [x] T014 [US2] Implement `components/records/CollectionGrowthChart.tsx` (client component): MUI X `BarChart` with month x-axis formatted as `"Jan '24"`, `count` y-axis; total count stat header above chart; `localStorage` cache with 24hr TTL for collection data; loading skeleton state

---

## Phase 5: US3 — Records Page Assembly

**Goal**: Wire up the records page with server-side data fetch and navigation.

**Independent Test**: Full page render at `/records` shows both sections with real or fallback data.

- [x] T015 [P] [US3] Write failing Vitest test `tests/unit/lib/discogs.test.ts`: `cleanArtistName` strips `(N)` suffix; `formatDateAdded` returns relative for ≤30 days; `buildChartData` produces sorted array of `{ month, count }` objects
- [x] T016 [US3] Write failing Playwright E2E test in `tests/e2e/records.spec.ts`: "Given user navigates to /records via nav, When page loads, Then both sections are visible"
- [x] T017 [US3] Implement `app/records/page.tsx`: server component; fetches recent releases with `unstable_cache` (1hr revalidation); renders `<RecentAdditions>` and `<CollectionGrowthChart>`; uses fallback data when API unavailable
- [x] T018 [US3] Add "Records" link to site navigation (`components/layout/Nav.tsx` or equivalent)

---

## Phase 6: Polish & Validation

- [x] T019 [P] Add loading skeleton states to `RecentAdditions` and `RecordCard` (use CSS animation matching existing patterns)
- [x] T020 [P] Add error state to `RecentAdditions`: inline message "Unable to load records"
- [x] T021 Verify all Vitest tests pass: `npm run test`
- [ ] T022 Verify Playwright E2E tests pass: `npm run test:e2e -- tests/e2e/records.spec.ts`
- [x] T023 Verify lint passes: `npm run lint && npm run lint:css`

---

## Dependencies & Execution Order

- T001 before T010, T011, T014 (MUI dependency needed at runtime)
- T002 before T010 (remotePatterns needed for `next/image` on Discogs images)
- T003 before T005, T006, T010, T011, T014, T017 (types and utils needed everywhere)
- T004 before T005, T017 (fallback data used in API routes and page)
- T005, T006 before T017 (page depends on API routes)
- T007–T009 (failing tests) before T010–T011 (TDD: red before green)
- T012–T013 (failing tests) before T014 (TDD: red before green)
- T015 (failing tests) before T003 completeness check
- T017 before T018 (page must exist before nav link)

---

## Implementation Strategy

### MVP (US1 — Recent Additions only)

1. T001–T004 (Setup)
2. T005 (recent API route)
3. T007–T009 (failing tests)
4. T010–T011 (implement components)
5. T017 (page, recent section only)
**STOP and VALIDATE**: Push to verify the records page shows 5 cards.

### Incremental Delivery

1. MVP (above) → Records page live with recent additions
2. T006, T012–T014 → Growth chart live
3. T018 → Nav link added
4. T019–T023 → Polish and validation
