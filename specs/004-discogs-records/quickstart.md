# Quickstart: Records / Discogs Collection

**Feature**: 004-discogs-records

## What gets created

- `app/records/page.tsx` — Records page (server component)
- `app/api/discogs/recent/route.ts` — API route: last 5 releases
- `app/api/discogs/collection/route.ts` — API route: full collection
- `components/records/RecentAdditions.tsx` — Card grid for recent releases
- `components/records/RecordCard.tsx` — Single album card
- `components/records/CollectionGrowthChart.tsx` — Client-side bar chart
- `lib/discogs.ts` — API client, types, data transforms
- `lib/discogs-fallback.json` — Static fallback (5 records)

## Environment setup

```bash
# Add to .env.local
DISCOGS_TOKEN=your_personal_access_token_here
```

Get your token at: Discogs → Settings → Developers → Generate new token

## How to verify locally

```bash
# Start dev server
npm run dev

# Visit the records page
open http://localhost:3000/records

# Run unit tests
npm run test -- --run tests/unit/lib/discogs.test.ts
npm run test -- --run tests/unit/components/records

# Run E2E tests
npm run test:e2e -- tests/e2e/records.spec.ts
```

## What the page shows

1. **Recent Additions** — 5 most recently added records, card grid
2. **Collection Growth** — Bar chart of records added per month

## Key integration scenarios (BDD)

| Scenario | Given | When | Then |
|----------|-------|------|------|
| View recent additions | User is on /records | Page loads | 5 record cards visible with art, title, artist |
| View collection growth | User is on /records | Chart section loads | Bar chart with at least 1 bar rendered |
| Navigate to Discogs | User is on /records | Click "View on Discogs ↗" | Opens Discogs collection page in new tab |
| Navigate to record | User is on /records | Click a record card | Opens Discogs release page in new tab |
