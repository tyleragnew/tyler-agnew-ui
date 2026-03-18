# Research: Records / Discogs Collection

**Feature**: 004-discogs-records | **Date**: 2026-03-17

## Decision Log

### 1. Image handling — CORS problem

**Decision**: Use `next/image` with `i.discogs.com` in `next.config.ts` `remotePatterns`
**Rationale**: Next.js Image Optimization proxies the fetch server-side, solving the CORS issue with zero extra code. The image URL flows through Next's `/_next/image` endpoint. Keeps token server-side; images are cached and optimized automatically.
**Alternatives considered**: Standalone `/api/discogs-image` proxy route — more code, same outcome; embedding URLs at build time (SSG) — too rigid for a live collection view.

---

### 2. Token exposure

**Decision**: Discogs personal token stored in `DISCOGS_TOKEN` environment variable, read only in API route handlers (server-side)
**Rationale**: Next.js App Router API routes execute in the Node.js runtime. The token never appears in client bundles.
**Alternatives considered**: Build-time token use only — would require ISR revalidation for updates; not practical for a live collection.

---

### 3. Recent additions data fetch strategy

**Decision**: Fetch in a Next.js Server Component (`app/records/page.tsx`) using `unstable_cache` with 1-hour revalidation
**Rationale**: Consistent with the Music page pattern (`lib/music.ts` uses `unstable_cache`). Server-side fetch means no loading spinner for above-the-fold content.
**Alternatives considered**: Client-side fetch with SWR — introduces loading states for primary content; Route Handler as intermediary — extra network hop.

---

### 4. Collection growth chart — data fetch strategy

**Decision**: Client component; fetches from `/api/discogs/collection` on mount; caches result in `localStorage` with 24-hour TTL
**Rationale**: The full collection is paginated and can take 2–5 seconds for large collections. Moving it client-side unblocks the page render. `localStorage` cache avoids re-fetching on every visit.
**Alternatives considered**: Server-side with streaming — complex; Build-time (SSG) — stale data problem.

---

### 5. MUI X Charts integration

**Decision**: Install `@mui/x-charts`, `@mui/material`, `@emotion/react`, `@emotion/styled`
**Rationale**: Spec explicitly calls for MUI X React Charts `BarChart`. The peer dependencies (`@mui/material`, `@emotion/*`) are required by MUI X.
**Alternatives considered**: Recharts — not specified; Chart.js — heavier; Custom SVG — violates simplicity principle.

---

### 6. Fallback data

**Decision**: `lib/discogs-fallback.json` with 5 real-looking records for use when `DISCOGS_TOKEN` is not set (dev without token) or API fails
**Rationale**: Consistent with Music page pattern (`lib/music-fallback.json`). Prevents broken page in dev.

---

## Open Questions

None — all decisions resolved above.
