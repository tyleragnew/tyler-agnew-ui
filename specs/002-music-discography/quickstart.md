# Quickstart: Music Discography Browser

**Feature**: 002-music-discography
**Date**: 2026-03-14

This document provides integration scenarios and validation steps for the
Music discography browser feature.

---

## Scenario 1: Browse the Discography (US1 Happy Path)

**Goal**: Verify a visitor can see all releases on the Music page.

**Steps**:
1. Run `npm run dev` and open `http://localhost:3000/music`
2. Observe: skeleton loading grid appears immediately
3. Wait ~2–5 seconds for Bandcamp fetches to complete
4. Observe: skeleton replaced by release cards with cover art, title, artist, year
5. Scroll the grid — verify releases from multiple artists are visible
6. Verify cards are sorted newest-first (compare release years top-to-bottom)

**Pass criteria**:
- At least 1 release visible from each of the 7 artist projects
- Cards sorted descending by release date
- No layout overflow at any viewport width

---

## Scenario 2: Stream a Release (US2 Happy Path)

**Goal**: Verify the inline player works correctly.

**Steps**:
1. On `/music` with releases loaded, click any release card
2. Observe: Bandcamp player appears at the bottom of the viewport
3. Verify: player shows the album that was clicked
4. Verify: page content shifts up (bottom padding applied), no content hidden
5. Click the close button (×) — player disappears
6. Click a second release — player appears for the new release
7. While player is active, click a different release — player updates to new album

**Pass criteria**:
- Player iframe `src` matches the clicked release's embed URL
- One player active at a time
- Close button removes the player

---

## Scenario 3: Fallback Data (US3 Resilience)

**Goal**: Verify the page renders even when Bandcamp is unreachable.

**Steps** (development mock):
1. In `app/api/music/route.ts`, temporarily replace the `getDiscography()` call
   with `throw new Error('mock failure')`
2. Reload `/music`
3. Observe: release cards still appear (from `lib/music-fallback.json`)
4. Restore the original implementation

**Pass criteria**:
- Page never shows a blank content area or raw error message
- Fallback releases are displayed with correct card layout

---

## Scenario 4: Mobile Responsiveness (US3 Responsive)

**Goal**: Verify the grid and player work at 320px viewport.

**Steps**:
1. Open browser DevTools → set viewport to 320×667
2. Navigate to `/music`
3. Observe: 2-column grid, no horizontal overflow
4. Click a release → player appears as fixed bottom bar
5. Scroll the grid while player is active — player stays fixed at bottom

**Pass criteria**:
- No horizontal scrollbar at 320px
- All card content readable (no truncation of title)
- Player doesn't overlap or hide grid content (bottom padding active)

---

## Scenario 5: Accessibility Check

**Goal**: Verify WCAG 2.1 AA compliance on the Music page.

**Steps**:
1. Run `npm run test:e2e -- --grep "music"` (once E2E tests are written)
2. Manually: Tab through all release cards — every card receives focus
3. Press Enter on a focused card — player opens
4. Tab to close button — it receives focus
5. Press Enter/Space — player closes

**Pass criteria**:
- Zero critical/serious axe violations
- All release cards keyboard-reachable
- Player iframe has `title` attribute

---

## Validation Checklist

Before marking the feature complete, verify:

- [ ] `/api/music` returns 200 with a non-empty Release array
- [ ] Releases sorted newest-first
- [ ] All 7 artists represented in the response
- [ ] Cover art images load (check network tab — no 404s)
- [ ] Clicking a card opens the player with correct embed URL
- [ ] Only one player active at a time
- [ ] Close button removes the player
- [ ] Fallback JSON serves when Bandcamp fetch throws
- [ ] No horizontal overflow at 320px, 768px, 1280px
- [ ] Axe reports zero critical/serious violations on `/music`
- [ ] Player iframe has `title` attribute
- [ ] Skeleton displays during initial load
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes with no warnings
- [ ] `npm run lint:css` passes with no violations
