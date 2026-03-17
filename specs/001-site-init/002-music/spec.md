### 2. Music

A discography browser spanning all of Tyler's Bandcamp projects, with an in-page streaming player, sorted descending by release date.

#### Artist roster

| Artist          | Bandcamp URL                             |
| --------------- | ---------------------------------------- |
| Tyler Agnew     | https://tyleragnew.bandcamp.com          |
| Scarry Burdz    | https://scarryburdz.bandcamp.com/        |
| Howling Boil    | https://howlingboil.bandcamp.com/        |
| Blue Plutos     | https://blueplutos.bandcamp.com/         |
| Toy Factory     | https://https://toyfactory.bandcamp.com/ |
| Pesci Devito    | https://pescidevito.bandcamp.com/        |
| Covered Bridges | https://coveredbridges.bandcamp.com/     |

_(Bandcamp subdomain handles needed to finalize — format is `{handle}.bandcamp.com`)_

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
