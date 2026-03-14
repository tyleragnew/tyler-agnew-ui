# Research: Music Discography Browser

**Feature**: 002-music-discography
**Date**: 2026-03-14
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Bandcamp Data Fetching — `bandcamp-fetch`

**Decision**: Use `bandcamp-fetch` v3.0.0 (npm) for all discography fetching.

**Rationale**: It is the only maintained TypeScript-typed library for programmatic
access to Bandcamp discography data. It ships as an ESM+CJS hybrid, so it works
in Next.js without module compatibility issues.

**API usage**:
```ts
import bcfetch from 'bandcamp-fetch';

const discography = await bcfetch.band.getDiscography({
  bandUrl: 'https://tyleragnew.bandcamp.com',
  imageFormat: 10, // ~700px square — format ID for high-res art
});
// Returns Promise<Array<Album | Track>>
```

**Album shape** (relevant fields):
```ts
interface Album {
  type: 'album';
  id?: number;          // Numeric Bandcamp album ID — used for embed URL
  name: string;         // Album title
  url?: string;         // Full Bandcamp album URL
  imageUrl?: string;    // Cover art URL (Bandcamp CDN)
  releaseDate?: string; // Date string, e.g. "01 Jan 2023 00:00:00 GMT"
  artist?: { name: string; url: string };
  numTracks?: number;
}
```

**Alternatives considered**:
- Bandcamp official API: Does not exist publicly.
- Discogs API: Not relevant (Bandcamp data only).
- Manual `music.json` only: Viable but requires manual updates — defeats FR-007.

**Caveat**: `bandcamp-fetch` is a scraper using Bandcamp's undocumented internal
structure. It may break if Bandcamp changes their HTML. Treat as a monitored
dependency; the fallback static JSON is the mitigation.

---

## Decision 2: Caching Strategy — `unstable_cache` in Route Handler

**Decision**: Use `unstable_cache` from `next/cache` to cache the `bandcamp-fetch`
calls with a 24-hour revalidation window, plus `export const revalidate = 86400`
on the Route Handler for full-route cache alignment.

**Rationale**: `bandcamp-fetch` uses its own HTTP layer (not the native `fetch` API),
so Next.js cannot intercept it with `fetch`'s `next.revalidate` option.
`unstable_cache` wraps any async function and stores the result in Next.js's
Data Cache, enabling the same stale-while-revalidate behaviour with a configurable
TTL.

**Implementation pattern**:
```ts
// app/api/music/route.ts
import { unstable_cache } from 'next/cache';
import bcfetch from 'bandcamp-fetch';
import fallback from '@/lib/music-fallback.json';

export const revalidate = 86400; // 24 hours

const ARTIST_URLS = [
  'https://tyleragnew.bandcamp.com',
  'https://scarryburdz.bandcamp.com',
  'https://howlingboil.bandcamp.com',
  'https://blueplutos.bandcamp.com',
  'https://toyfactory.bandcamp.com',
  'https://pescidevito.bandcamp.com',
  'https://coveredbridges.bandcamp.com',
];

const getDiscography = unstable_cache(
  async () => {
    const results = await Promise.allSettled(
      ARTIST_URLS.map((url) =>
        bcfetch.band.getDiscography({ bandUrl: url, imageFormat: 10 })
      )
    );
    const releases = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value)
      .filter((item) => item.type === 'album');

    if (releases.length === 0) return fallback;

    return releases.sort(
      (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  },
  ['discography'],
  { revalidate: 86400, tags: ['discography'] }
);

export async function GET() {
  try {
    const data = await getDiscography();
    return Response.json(data);
  } catch {
    return Response.json(fallback);
  }
}
```

**Vercel edge CDN caching**: `export const revalidate` controls Next.js's Data Cache
(server-side). For responses also to be cached at Vercel's edge CDN (geography-
distributed), the Route Handler must return explicit `Cache-Control` headers:

```ts
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
  },
});
```

The plan implements both: `unstable_cache` for Data Cache + `Cache-Control` header
for edge CDN.

**Alternatives considered**:
- `fetch` with `next.revalidate`: Not applicable — `bandcamp-fetch` bypasses native fetch.
- React `cache()`: Per-request only, does not persist across requests.
- Build-time static generation: Would require a rebuild for new releases; defeats FR-007.

---

## Decision 3: Bandcamp Iframe Embed URL Format

**Decision**: Construct embed URLs from the `id` field on each Album object.

**Format**:
```
https://bandcamp.com/EmbeddedPlayer/album={id}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/
```

**Parameter reference**:
- `album={id}` — numeric album ID (from `Album.id`)
- `size=large` — player width: `small` (350px), `large` (350px tall)
- `bgcol=ffffff` — player background hex (no `#`)
- `linkcol=0687f5` — link/accent colour hex (no `#`)
- `tracklist=false` — hide tracklist to keep the player compact
- `artwork=small` — show artwork in player

For the site's design tokens, use:
- `bgcol=fafaf8` (matches `--color-background`)
- `linkcol=d97706` (matches `--color-accent`) — note: contrast concerns do not
  apply inside the Bandcamp iframe since Bandcamp controls its own CSS.

**Getting the ID**: The `Album.id` field from `bandcamp-fetch` is the same numeric
ID used in the embed URL. No additional lookup is required.

---

## Decision 4: Cover Art Image Handling

**Decision**: Use Next.js `<Image>` with `remotePatterns` configured for Bandcamp's
CDN domain (`f4.bcbits.com`). Explicit `width={300}` `height={300}` on all covers.

**Rationale**: Constitution Principle IV requires images in modern formats with
explicit dimensions to prevent CLS. Next.js `<Image>` auto-converts to WebP/AVIF
and handles lazy loading. Bandcamp CDN is `f4.bcbits.com`.

**next.config.ts addition**:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'f4.bcbits.com' },
  ],
}
```

**Fallback**: If `imageUrl` is absent on a release, render a styled placeholder
div with the release title and artist initials.

---

## Decision 5: Player Persistence While Scrolling

**Decision**: Render the `BandcampPlayer` as a fixed bottom bar that appears when
a release is selected, allowing the visitor to scroll the release grid without
losing the player.

**Rationale**: The spec states "the player remains accessible when scrolling"
(US2 acceptance scenario 4). A fixed bottom bar (sticky footer pattern) is the
standard music player UI pattern and the most accessible implementation.

**Implementation**: Tailwind `fixed bottom-0 left-0 right-0` container,
conditionally rendered when `selectedRelease !== null`. Height ~180px to
accommodate the Bandcamp large player. Main content gets `pb-48` padding when
player is active to avoid overlap.

---

## Decision 6: Component Architecture

**Decision**: Client-side data fetching via SWR or plain `useEffect` + `fetch('/api/music')`.
The `DiscographyBrowser` is a Client Component that manages all state.

```
app/music/page.tsx              — Server Component (metadata, layout)
app/api/music/route.ts          — Route Handler (fetch, cache, fallback)
components/music/
  DiscographyBrowser.tsx        — "use client" — fetches /api/music, manages state
  ReleaseCard.tsx               — Pure display (cover, title, artist, year)
  BandcampPlayer.tsx            — iframe embed, fixed-bottom when active
  ReleaseSkeleton.tsx           — Loading grid skeleton
lib/
  music.ts                      — Shared Release type + artist URL constants
  music-fallback.json           — Static fallback release list
```

**Alternatives considered**:
- Server Component data fetching + props: Simpler, but player state must still
  be client-side. A hybrid (server fetch → client hydration) would work but adds
  complexity for minimal benefit on a personal site.
- SWR: Good option but adds a dependency. Plain `useEffect` + `fetch` is
  sufficient for a fire-once-and-cache pattern.

---

## Decision 7: Skeleton Loading Pattern

**Decision**: Show a CSS skeleton grid while data loads, using Tailwind's
`animate-pulse` utility on placeholder cards.

**Rationale**: FR-011 requires a loading state. `animate-pulse` is zero-JS, respects
`prefers-reduced-motion` (Tailwind suppresses it automatically), and matches the
production card grid layout to minimise CLS.

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|-----------|
| `bandcamp-fetch` API surface | `band.getDiscography({ bandUrl })` — confirmed v3.0.0 |
| Album ID field name | `Album.id: number` — used directly in embed URL |
| Caching non-fetch libraries | `unstable_cache` from `next/cache` |
| Embed URL format | `https://bandcamp.com/EmbeddedPlayer/album={id}/...` |
| Cover art CDN domain | `f4.bcbits.com` — add to `next.config.ts` remotePatterns |
| Toy Factory Bandcamp handle | `toyfactory` (from URL in spec) |
