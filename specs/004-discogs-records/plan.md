# Implementation Plan: Records / Discogs Collection

**Branch**: `004-discogs-records` | **Date**: 2026-03-17 | **Spec**: `specs/004-discogs-records/spec.md`
**Input**: Feature specification from `/specs/004-discogs-records/spec.md`

## Summary

Build a Records page (`/records`) that displays the user's Discogs vinyl collection: 5 most recently added records in a card grid, and a bar chart showing collection growth over time. Data is fetched server-side via a thin Next.js API route that holds the Discogs personal access token. Images are served via `next/image` with `i.discogs.com` in `remotePatterns`. The full collection (for the chart) is cached client-side in `localStorage` with a 24-hour TTL.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 15 (App Router), `@mui/x-charts`, `@mui/material`, `@emotion/react`, `@emotion/styled`
**Storage**: No database — Discogs API (read-only) + `localStorage` cache for full collection
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E BDD)
**Target Platform**: Vercel (Node.js serverless runtime)
**Project Type**: Web application (personal site, Next.js)
**Performance Goals**: Records page loads in <2s on 3G; chart data loads from cache on revisit
**Constraints**: Discogs token MUST remain server-side; images MUST be proxied or go through `next/image`
**Scale/Scope**: Single page, ~5 API calls on first load (recent + 1 chart page), cached thereafter

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| I. Code Quality | PASS | Components scoped to single responsibility; no duplication |
| II. TDD/BDD | PASS | BDD scenarios written first; unit tests before implementation |
| III. UX Consistency | PASS | Reuses Music page card pattern; all colors from CSS custom properties |
| IV. Development Standards | PASS | All secrets in env vars; no client-side token exposure |
| V. Modern Frontend Standards | PASS | Server components for data fetch; `next/image` for images |

**Gate 5 — TDD/BDD Compliance**: Tests MUST be committed and failing before implementation files are created.

## Project Structure

### Documentation (this feature)

```text
specs/004-discogs-records/
├── plan.md              ← this file
├── research.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── records/
│   └── page.tsx                          # Records page (server component)
└── api/
    └── discogs/
        ├── recent/route.ts               # Last 5 releases endpoint
        └── collection/route.ts           # Full collection endpoint (for chart)

components/
└── records/
    ├── RecentAdditions.tsx               # 5-card grid section
    ├── RecordCard.tsx                    # Single album card
    └── CollectionGrowthChart.tsx         # MUI X BarChart wrapper (client component)

lib/
├── discogs.ts                            # API client, types, transforms
└── discogs-fallback.json                 # Static fallback data (5 records)

tests/
├── unit/
│   ├── lib/discogs.test.ts
│   └── components/records/
│       ├── RecordCard.test.tsx
│       ├── RecentAdditions.test.tsx
│       └── CollectionGrowthChart.test.tsx
└── e2e/
    └── records.spec.ts                   # Playwright BDD acceptance tests
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MUI X Charts dependency | Bar chart with tooltip, axis formatting, and responsive sizing requires a chart library | Rolling a custom SVG chart would violate the UX Consistency principle and add significant complexity |
