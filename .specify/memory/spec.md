# Personal Site — Project Spec

**Version:** 0.3 (Draft)
**Author:** Tyler
**Last Updated:** 2026-03-14
**Status:**  Ready

---

## Overview

A personal website serving as a unified creative and professional home. The site brings together four distinct facets of Tyler's identity: software engineering work, music releases, vinyl record collection, and written thoughts via a blog. The goal is a cohesive, self-hosted presence that doesn't depend on scattered third-party profiles to tell the full story.

---

## Goals

- Establish a canonical personal home on the web
- Surface music (via Bandcamp), software projects, and vinyl collection (via Discogs) in a visually engaging way — all in one place
- Publish a personal blog without relying on a third-party publishing platform
- Music listing auto-updates when a new release is published to any of Tyler's Bandcamp artist pages — zero manual maintenance
- Single repo, single deployment, minimal operational overhead

---

## Non-Goals

- Not a portfolio for client work or job seeking (though it may serve that purpose incidentally)
- Not a social platform; no user accounts, comments, or real-time interaction
- Not a storefront; no e-commerce or transaction flows

---

## Technical Architecture

### Stack

| Concern | Decision |
|---|---|
| Framework | **Next.js (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Backend | **Next.js API Routes** (same repo) |
| Bandcamp data | Server-side API route with `bandcamp-fetch`, cached + revalidated on Vercel |
| Discogs data | Client-side fetch from Discogs public API using user token |
| Blog | MDX files in `/content/blog` via Next.js content layer |
| Projects data | Static `projects.json` (optionally augmented by GitHub API at route level) |
| Hosting | **Vercel** |
| Domain | tyleragnew.dev |

### Why Next.js over Astro

The music section requires server-side scraping with revalidation caching — once a backend is in the picture, Next.js's API routes make more sense than bolting a separate service onto an Astro frontend. Next.js keeps everything in one repo and one deploy, with Vercel's edge caching making the data-fetching story clean and zero-maintenance.

---

## Sections

### 1. Blog

A personal writing space. Posts are authored in MDX and rendered as clean, readable articles.

**Requirements:**
- Post list view (title, date, short excerpt)
- Individual post view with full Markdown content
- MDX support (headings, images, code blocks, links, inline components)
- Optional: tags or categories for filtering
- Flat file approach — posts live in `/content/blog/*.mdx`, no CMS

**Data source:** Local MDX files, built at compile time via Next.js static generation

---

### 2. Music

A discography browser spanning all of Tyler's Bandcamp projects, with an in-page streaming player, sorted descending by release date.

#### Artist roster

| Artist | Bandcamp URL |
|---|---|
| Tyler Agnew | https://tyleragnew.bandcamp.com |
| Scarry Burdz | https://scarryburdz.bandcamp.com/ |
| Howling Boil | https://howlingboil.bandcamp.com/ |
| Blue Plutos | https://blueplutos.bandcamp.com/ |
| Toy Factory | https://https://toyfactory.bandcamp.com/ |
| Pesci Devito | https://pescidevito.bandcamp.com/ |
| Covered Bridges | https://coveredbridges.bandcamp.com/ |

*(Bandcamp subdomain handles needed to finalize — format is `{handle}.bandcamp.com`)*

#### Data architecture

A Next.js API route at `/api/music` handles all data fetching server-side:

1. On request, the route uses [`bandcamp-fetch`](https://github.com/patrickkfkan/bandcamp-fetch) (npm) to scrape each artist's discography page
2. Results from all 7 artists are merged and sorted by release date, descending
3. The response is cached at Vercel's edge with a `revalidate: 86400` (24-hour) window
4. The frontend React component fetches `/api/music` — data is served instantly from cache and silently refreshed in the background once per day

When Tyler publishes a new release on any of these Bandcamp pages, it will appear on the site within 24 hours, automatically, with no manual intervention.

**Important caveat:** `bandcamp-fetch` is a scraper against Bandcamp's undocumented internal structure, not an official API. It could break if Bandcamp changes their HTML. It should be treated as a dependency to monitor, with a fallback to a manually-maintained `music.json` if it stops working. Bandcamp's ToS technically disallows scraping; this is a low-risk grey area for a personal non-commercial site, but worth being aware of.

#### Streaming player

Bandcamp provides an official iframe embed player per album. The music section UI will:
- Show a grid/list of all releases (cover art, artist name, title, release year)
- On selecting a release, load the official Bandcamp embed player inline
- The embed handles streaming directly from Bandcamp — no audio proxying needed
- Player state (selected release, playing/paused) managed in React component state

**Data source:** `/api/music` (Next.js API route, Vercel edge-cached, 24hr revalidation)

---

### 3. Software Projects

A curated showcase of development work — open source repos, side projects, tools.

**Requirements:**
- Project cards: name, short description, tech stack tags, links (GitHub, live demo)
- Optional: featured/pinned projects vs. full archive
- Statically authored via `projects.json` or MDX — no dynamic fetch required at launch
- Optional future enhancement: GitHub API route (`/api/projects`) to pull live star counts and last-updated dates, with revalidation caching

**Data source:** Static `projects.json` (or optional `/api/projects` API route pulling from GitHub's public API)

---

### 4. Records

A custom UI for browsing Tyler's vinyl record collection, pulling from Discogs. The section is called **Records** throughout the site (nav, page title, URL).

**Layout:**

The page is divided into two visual sections:

**Recently Added** — a horizontal scrolling row of the 10 most recently added records, displayed as square album art cards with artist name and title below each. Sits at the top of the page beneath the header, above the full library. Gives the page a living, curated feel — a quick snapshot of what's been on the turntable lately.

**Full Library** — the complete collection as a scannable list, one row per record. Each row displays: album art thumbnail, artist, title, label, year, format, and date added. Rows are clean and legible — a well-designed table with breathing room, not a spreadsheet.

**Sorting:**
- Sort by **date added** (default: newest first)
- Sort by **artist name** (alphabetical A→Z / Z→A)
- Sort controls are visible at the top of the list as a simple toggle — no dropdowns needed given there are only two options

**Other requirements:**
- Show total record count somewhere understated near the top ("143 records" or similar)
- All records loaded client-side; pagination handled transparently (fetch all pages from Discogs API on load, display full collection)
- No search or filtering required at launch — sorting only
- Browsable without any user authentication

**API approach:**

The Discogs public API supports unauthenticated reads of any public collection:
```
GET https://api.discogs.com/users/Tagnuisance/collection/folders/0/releases
```

A personal Discogs user token (not a secret — safe to use in client-side code for read-only requests) bumps the rate limit from 25 to 60 requests/minute, which is more than sufficient. The full collection is fetched client-side in the browser, with pagination handled via the API's `page` parameter.

Unlike the Bandcamp section, this does **not** need a backend route — Discogs's API is stable, public, and officially supported for this kind of use. A client-side React component with a user token in an environment variable (prefixed `NEXT_PUBLIC_`) is the cleanest approach.

**Data source:** Discogs public API, client-side, username `Tagnuisance`

---

## Routing Structure

```
/                    → Home / landing
/blog                → Post list
/blog/[slug]         → Individual post
/music               → Discography browser + streaming player
/projects            → Software projects
/records             → Discogs collection browser

/api/music           → Bandcamp scrape endpoint (server, Vercel edge-cached)
/api/projects        → GitHub repo data endpoint (optional, future)
```

---

## Data Flow Summary

| Section | Fetch strategy | Where data lives | Auto-updates? |
|---|---|---|---|
| Blog | Static (build time) | MDX files in repo | On git push |
| Music | Server (API route, edge cache) | Bandcamp via `bandcamp-fetch` | Every 24 hours |
| Projects | Static JSON | `projects.json` in repo | On git push |
| Records | Client-side fetch | Discogs API | Real-time |

---

## Design Direction

The site should feel personal, modern, and craft-forward — reflecting someone who cares about both code and music. Not a generic developer portfolio. The aesthetic is clean and light, with strong typographic presence and restrained use of color.

### Mode
**Light mode.** White or near-white backgrounds, dark ink-toned text. Contrast comes from typography weight and composition rather than dark surfaces. Album art and cover imagery will pop naturally against light backgrounds.

### Typography

**Display / Headings: [Milker](https://www.fontshare.com/fonts/milker)**
Milker's rounded, characterful letterforms set the personality of the site — warm and distinctive without being playful to the point of losing authority. Used for section headings, the site name/logo, and any large editorial moments.

**Body / UI: a clean geometric grotesque** — candidates include:
- **DM Sans** — neutral, readable, slightly humanist
- **Geist** (Vercel's own) — modern, slightly technical, pairs well with code
- **Instrument Sans** — a bit more personality than DM Sans, still very clean

Final pairing TBD, but should contrast with Milker's roundness by being more structured and neutral.

**Monospace (code blocks / accents):** Geist Mono or JetBrains Mono

### Color

A tight, minimal palette — light mode shouldn't feel clinical. Suggested direction:

| Role | Value (approximate) |
|---|---|
| Background | `#FAFAF8` (warm white, not pure) |
| Surface / card | `#FFFFFF` |
| Text primary | `#111110` (near-black with warmth) |
| Text secondary | `#6B6B67` (muted warm gray) |
| Accent | One intentional color TBD — could be a warm amber, dusty rose, or deep teal depending on overall feel |
| Border / divider | `#E5E5E3` |

### Layout & Composition

- **Generous whitespace** — modern sleekness comes from breathing room, not density
- **Strong typographic hierarchy** — size and weight do the heavy lifting, not decorative elements
- **Grid-breaking moments** in the music and records sections — album art as the visual anchor, text secondary
- **Subtle motion** — fade-ins on scroll, smooth hover states; nothing gratuitous
- **Sharp, clean components** — cards with minimal border radius (or none), thin dividers, precise spacing

### Per-Section Notes

- **Music** — cover art grid as the primary visual; selected release expands inline with the Bandcamp player. Artist name as a filter/tab across the top
- **Records** — one row per record, clean and scannable; sort controls at the top; album art thumbnail anchors each row on the left; generous row height with clear typographic hierarchy between artist and title
- **Blog** — reading-first: `~68ch` line length, `1.75` line height, generous vertical rhythm, minimal navigation chrome
- **Projects** — clean card list or grid, tech stack shown as small pill tags, subdued and functional

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What are the Bandcamp subdomain handles for all 7 artists? | Tyler | ⬜ Open |
| 2 | Should the Discogs section show all folders or just the main collection? | Tyler | ⬜ Open |
| 3 | ~~Purchase tyleragnew.dev~~ | Tyler | ✅ Done |
| 4 | Should the blog support RSS/Atom feed output? | Tyler | ⬜ Open |
| 5 | Any desire for privacy-friendly analytics (e.g. Fathom, Plausible)? | Tyler | ⬜ Open |
| 6 | Should the music player support continuous playback across releases, or per-album only? | Tyler | ⬜ Open |
| 7 | Should the Discogs section expose Tyler's username/collection publicly, or be presented anonymously? | Tyler | ⬜ Open |
| 8 | GitHub profile handle (for projects section links)? | Tyler | ⬜ Open |

---

## Milestones (Suggested)

| Phase | Scope |
|---|---|
| **Phase 1** | Scaffold Next.js project (App Router, TypeScript, Tailwind), global layout, navigation, placeholder pages |
| **Phase 2** | Blog: MDX content layer, post list, post view, typography |
| **Phase 3** | Software projects section (static `projects.json`) |
| **Phase 4** | Music: `/api/music` route with `bandcamp-fetch`, React discography UI, Bandcamp embed player |
| **Phase 5** | Discogs collection UI (client-side API integration, custom browser, filtering) |
| **Phase 6** | Polish, responsive QA, performance audit, deploy to Vercel with custom domain |

---

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Next.js Route Handlers (API routes)](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Data Cache / revalidation](https://vercel.com/docs/infrastructure/data-cache)
- [bandcamp-fetch (npm)](https://github.com/patrickkfkan/bandcamp-fetch)
- [Discogs API Docs](https://www.discogs.com/developers)
- [Next.js MDX](https://nextjs.org/docs/app/building-your-application/configuring/mdx)