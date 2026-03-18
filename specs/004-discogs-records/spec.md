# Records Page — SpecKit Plan

**Project:** Personal site  
**Feature:** Records  
**Discogs username:** Tagnuisance  
**Last updated:** March 2026

---

## Feature Overview & Goals

### What this page does

The Records page surfaces your Discogs vinyl collection on your personal site. It has two primary sections:

1. **Recent additions** — the last 5 albums added to your collection, displayed with album art and metadata, similar in pattern to your existing Music page.
2. **Collection growth chart** — a bar chart (MUI X React Charts) showing how many records you've added over time, bucketed by month.

### Goals

- Give visitors a live, low-maintenance window into your collection without manual curation.
- Reuse the visual language of the Music page (album art + metadata card pattern) for consistency.
- Show the growth chart as a personal artifact — a record of the collecting habit over time.
- Keep the implementation lean: read-only Discogs API, no backend database, cache-friendly.

### Non-goals

- Full collection browsing / search (out of scope for v1).
- Wantlist display.
- Marketplace or pricing data.

---

## API & Data Shape

### Authentication

Discogs supports two auth methods. For a personal site reading your own public collection, a **personal access token** is the simplest approach.

```
Authorization: Discogs token=YOUR_PERSONAL_TOKEN
User-Agent: YourSiteName/1.0
```

> **Important:** Do not expose the token client-side if this is a static/SPA build. Route API calls through a thin server function (Next.js API route, Vercel function, Netlify edge, etc.) that holds the token and forwards responses.

---

### Endpoints

#### 1. Recent 5 additions

```
GET https://api.discogs.com/users/Tagnuisance/collection/folders/0/releases
    ?sort=added&sort_order=desc&per_page=5&page=1
```

- Folder `0` = the "All" folder — includes everything.
- Returns `releases[]` sorted by `date_added` descending.
- Used to power the Recent Additions section.

#### 2. Total collection count (lightweight)

```
GET https://api.discogs.com/users/Tagnuisance/collection/folders/0/releases
    ?per_page=1&page=1
```

- Only fetches 1 item; use `pagination.items` for the total count.
- Avoids loading the full collection just to show a headline number.

#### 3. Full collection (for growth chart)

```
GET https://api.discogs.com/users/Tagnuisance/collection/folders/0/releases
    ?sort=added&sort_order=asc&per_page=100&page=N
```

- Paginate through all pages until `pagination.page === pagination.pages`.
- Used to build the `date_added` histogram for the chart.
- **Cache in `localStorage` with a 24-hour TTL** to avoid re-fetching on every visit and stay well under the 60 req/min rate limit.

---

### Rate limits

| Auth state      | Limit           |
| --------------- | --------------- |
| Unauthenticated | 25 requests/min |
| Personal token  | 60 requests/min |

For a large collection (200+ records), full pagination can exceed 2–3 API calls. Always use a token and cache the result.

---

### Release item — data shape

Each item in `releases[]` has this structure. Fields used by this feature are marked.

```json
{
  "date_added": "2024-11-03T22:10:00-08:00", // ← used
  "id": 12345678, // ← used (Discogs link)
  "basic_information": {
    "title": "Structures from Silence", // ← used
    "year": 1984, // ← used (may be 0 if unknown)
    "thumb": "https://i.discogs.com/...", // ← used (150px image)
    "cover_image": "https://i.discogs.com/...", // ← used (full-res)
    "artists": [
      { "name": "Steve Roach (2)" } // ← used (strip disambiguation suffix)
    ],
    "labels": [
      { "name": "Fortuna Records" } // ← used
    ],
    "formats": [
      { "name": "Vinyl", "descriptions": ["LP"] } // ← used
    ],
    "genres": ["Electronic", "Ambient"] // ← optional display
  }
}
```

#### Data transform notes

- **Artist name disambiguation:** Discogs appends `(N)` to artist names when there are multiple artists with the same name (e.g. `"Steve Roach (2)"`). Strip with `/\s\(\d+\)$/`.
- **Year = 0:** Some releases have `year: 0`. Display as `"—"` rather than `"0"`.
- **Images:** Both `thumb` and `cover_image` are served from `api.discogs.com` and are blocked by CORS in the browser. See [Open Questions](#open-questions--risks).
- **Date parsing:** `date_added` is ISO 8601 with timezone offset. Parse with `new Date(dateString)`.

#### Growth chart transform

To build the histogram, group all `date_added` values by `YYYY-MM`:

```js
const histogram = releases.reduce((acc, r) => {
  const month = r.date_added.slice(0, 7); // "2024-11"
  acc[month] = (acc[month] || 0) + 1;
  return acc;
}, {});

// Sort and shape for MUI X BarChart
const chartData = Object.entries(histogram)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([month, count]) => ({ month, count }));
```

---

## Component Specs

### `<RecentAdditions />`

Displays the 5 most recently added records.

**Layout**

- Desktop: 5-column grid, same card pattern as the Music page.
- Mobile: horizontally scrollable row, or 2-column grid.
- Each card: square album art (1:1) above, metadata stacked below.

**Album art**

- Source: `basic_information.cover_image`, fallback to `thumb`.
- Placeholder: SVG vinyl record icon if no image available.
- Images must be proxied (see Open Questions).

**Metadata display order**

1. Artist name — 13px, medium weight
2. Album title — 12px, secondary color
3. Label + year — 12px, tertiary color (e.g. `Fortuna Records · 1984`)
4. Format badge — small pill chip (e.g. `Vinyl`)
5. Date added — muted, below the chip

**Date formatting**

- If added within the last 30 days: relative (`"3 days ago"`)
- Otherwise: absolute (`"Nov 3, 2024"`)
- Use `Intl.RelativeTimeFormat` or `date-fns/formatDistanceToNow`

**Linking**

- Each card links to `https://www.discogs.com/release/{id}` — open in new tab (`target="_blank" rel="noopener"`).

**Section header**

- Heading: `"Recently added"`
- Right side: small `"View on Discogs ↗"` text link to `https://www.discogs.com/user/Tagnuisance/collection`

**Props**

```ts
interface RecentAdditionsProps {
  releases: DiscogsRelease[]; // pre-fetched, shaped
  loading?: boolean;
}
```

---

### `<CollectionGrowthChart />`

Bar chart of records added per month using MUI X React Charts.

**Install**

```bash
npm install @mui/x-charts @mui/material @emotion/react @emotion/styled
```

**MUI X component**

```tsx
import { BarChart } from "@mui/x-charts/BarChart";

<BarChart
  dataset={chartData} // [{ month: "2024-01", count: 4 }, ...]
  xAxis={[{ scaleType: "band", dataKey: "month" }]}
  series={[{ dataKey: "count", label: "Records added" }]}
  width="100%"
  height={300}
/>;
```

**Axis**

- X-axis: `YYYY-MM` keys, formatted as `"Jan '24"` labels. Rotate 45° if more than 12 bars.
- Y-axis: integer ticks only, label `"Records added"`.

**Tooltip**
On hover, show:

- Month (formatted)
- Records added that month
- Cumulative total at that point (compute as running sum during transform)

**Stat header**
Above the chart, show the total collection count as a headline metric:

```
342
records in collection
```

Source: `pagination.items` from the lightweight count endpoint.

**Caching**

```js
const CACHE_KEY = "discogs_collection_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedCollection() {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const { data, timestamp } = JSON.parse(raw);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  return data;
}
```

**Chart granularity — decision needed**

- Monthly: good for collections under ~5 years of active adding.
- Quarterly: better for long-running collections to avoid a very wide chart.
- Default to monthly; consider a toggle if the range exceeds 4 years.

**Props**

```ts
interface CollectionGrowthChartProps {
  releases: DiscogsRelease[]; // full collection
  totalCount: number;
  loading?: boolean;
}
```

---

### `<CollectionStat />` _(optional)_

Standalone metric card for use in a page header or sidebar.

```tsx
<CollectionStat count={342} label="records in collection" />
```

Source: single lightweight API call using `pagination.items`. Can be fetched independently of the full collection pagination.

---

### UI States — all components

| State                      | Behavior                                                                        |
| -------------------------- | ------------------------------------------------------------------------------- |
| Loading                    | Skeleton cards (matching card dimensions); chart area shows shimmer placeholder |
| API error                  | Inline error message with retry button; no crash                                |
| Empty / private collection | "Collection is private or unavailable" message                                  |
| No album art               | Vinyl record SVG placeholder at same dimensions                                 |
| Partial chart load         | Show chart with data loaded so far; progress indicator                          |
| Rate limited               | Catch 429 response; retry after `Retry-After` header delay                      |

---

## Open Questions & Risks

### 1. Image CORS (blocker)

Discogs image URLs (`i.discogs.com`) block cross-origin browser requests. You cannot `<img src="https://i.discogs.com/...">` directly in a client-side app without either:

**Option A — Proxy route (recommended)**  
Create an API route (e.g. `/api/discogs-image?url=...`) that fetches the image server-side and streams it back. The token stays server-side, and images flow through your domain.

**Option B — Store URLs server-side**  
If you're already running a build step, fetch the collection at build time (SSG) and embed the image URLs in the rendered HTML. Works well with Next.js `getStaticProps` + ISR.

**Option C — `next/image` with remote patterns**  
If using Next.js, add `i.discogs.com` to `remotePatterns` in `next.config.js`. Next's image optimization layer proxies the fetch server-side.

---

### 2. Token exposure

Your Discogs personal token must **not** be bundled into client-side JavaScript. Mitigate with:

- A thin API route that holds the token in an environment variable and proxies Discogs responses.
- Or: fetch at build time (SSG) so the token is only used during the build, not at runtime.

---

### 3. Full collection pagination cost

For a large collection, building the growth chart requires fetching every page at 100 items/page. At 60 req/min with a token, this is fine for most collections, but a 500+ record collection will take several seconds on first load.

**Mitigation:** `localStorage` cache with 24hr TTL (spec above). Show the chart with a stale-data indicator if the cache is older than the TTL.

---

### 4. Chart granularity

For a collection spanning many years with sparse early additions, monthly buckets produce a very wide, sparse chart. Consider:

- Defaulting to **monthly** and switching to **quarterly** if the date range exceeds 3 years.
- Or a toggle control (Monthly / Quarterly / Yearly).

---

### 5. Artist name disambiguation

Discogs appends `(2)`, `(3)` etc. to artist names when there are collisions in their database. Strip this before display:

```js
const cleanName = name.replace(/\s\(\d+\)$/, "");
```

---

_End of spec_
