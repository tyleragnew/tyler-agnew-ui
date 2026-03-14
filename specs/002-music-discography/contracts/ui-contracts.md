# UI Contracts: Music Discography Browser

**Feature**: 002-music-discography
**Date**: 2026-03-14

---

## MUSIC-UI-01: Release Card

**Purpose**: Displays a single release in the discography grid.

### Required Elements

| Element        | Role / Selector           | Content | Notes |
|----------------|--------------------------|---------|-------|
| Cover art      | `img` with alt text       | `"{title} by {artistName} cover art"` | 300×300px, placeholder if absent |
| Artist name    | Visible text              | `artistName` value | Secondary text style |
| Album title    | Visible text, heading level | `title` value | Primary card text |
| Release year   | Visible text              | 4-digit year from `releaseDate` | Secondary text style |
| Card action    | `button` or clickable element | — | `aria-label="Play {title} by {artistName}"` |

### Visual States

| State    | Appearance |
|----------|-----------|
| Default  | Row with thumbnail, metadata, and a down-chevron indicator |
| Selected | Chevron rotates 180° (pointing up); inline player expands below the row |
| Loading  | Skeleton placeholder matching row dimensions |

### Test Scenarios

**MUSIC-UI-01-T1**: Each release card contains visible artist name, album title, and release year.

**MUSIC-UI-01-T2**: The cover art `img` element has a non-empty `alt` attribute.

**MUSIC-UI-01-T3**: The selected release card is visually distinguishable from unselected cards.

**MUSIC-UI-01-T4**: Clicking a card triggers player open for that release.

---

## MUSIC-UI-02: Discography List

**Purpose**: Vertically stacked, year-grouped list of release rows.

### Layout

- Single-column list grouped by release year (descending)
- Each year has a small-caps heading label
- Rows are divided by a subtle border

### Loading State

- While data is fetching: show skeleton grid with same column count as loaded state
- Skeletons are `animate-pulse` placeholder cards matching card dimensions
- Minimum 8 skeleton cards shown

### Empty / Error State

- If API returns empty array (should not happen due to fallback): show "No releases found" message
- No raw error messages shown to the user

### Test Scenarios

**MUSIC-UI-02-T1**: At 320px viewport, release grid has no horizontal overflow.

**MUSIC-UI-02-T2**: While data is loading, skeleton cards are visible.

**MUSIC-UI-02-T3**: After data loads, skeleton cards are replaced by release cards.

**MUSIC-UI-02-T4**: The list contains cards from all ten artist projects.

---

## MUSIC-UI-03: Bandcamp Player

**Purpose**: Inline streaming player for a selected release.

### Behaviour

- Hidden when no release is selected (`selectedRelease === null`)
- Expands inline below the selected release row (accordion pattern)
- Selecting a new release collapses the previous player and expands the new one
- Selecting the same release a second time collapses the player

### Required Elements

| Element          | Notes |
|-----------------|-------|
| `<iframe>`      | `src` = `embedUrl` from selected Release, `title` = `"{title} by {artistName} player"` |
| Close button    | `aria-label="Close player"`, clicking sets selectedRelease to null |
| Release context | Shows title and artist name above/beside the player |

### Accessibility

- `<iframe>` MUST have a `title` attribute
- Close button MUST be keyboard-focusable and operable
- When player opens, focus should remain usable (player is non-modal)
- Player container must not obscure focused elements in the grid

### Test Scenarios

**MUSIC-UI-03-T1**: No player is visible on initial page load.

**MUSIC-UI-03-T2**: After clicking a release card, the player becomes visible with the correct `iframe src`.

**MUSIC-UI-03-T3**: Clicking a second release card updates the player `iframe src` to the new release.

**MUSIC-UI-03-T4**: The player `<iframe>` has a non-empty `title` attribute.

**MUSIC-UI-03-T5**: Clicking the close button hides the player.

**MUSIC-UI-03-T6**: The player expands inline below the selected row and does not affect the position of other rows outside the accordion.

---

## MUSIC-UI-04: Accessibility Contract

**Purpose**: Defines axe/WCAG requirements specific to the Music page.

### Requirements

| Requirement | Standard | Test |
|-------------|---------|------|
| Zero critical/serious axe violations | WCAG 2.1 AA | Automated axe scan on `/music` |
| All interactive elements keyboard-reachable | WCAG 2.1 AA 2.1.1 | Tab through all cards and player |
| Cover art images have alt text | WCAG 2.1 AA 1.1.1 | `img[alt]` not empty |
| Player iframe has title | WCAG 2.1 AA 4.1.2 | `iframe[title]` not empty |
| No content lost at 320px | WCAG 2.1 AA 1.4.10 | No horizontal overflow |
| `prefers-reduced-motion` respected | WCAG 2.1 AA 2.3.3 | Skeleton pulse suppressed |

### Test Scenarios

**MUSIC-UI-04-T1**: `@axe-core/playwright` reports zero critical or serious violations on `/music`.

**MUSIC-UI-04-T2**: All release cards are reachable via keyboard Tab navigation.

**MUSIC-UI-04-T3**: The player close button is reachable via keyboard.
