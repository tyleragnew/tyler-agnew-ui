# Data Model: Music Discography Browser

**Feature**: 002-music-discography
**Date**: 2026-03-14

---

## Entities

### Release

The primary data entity — represents a single album or EP from any of the seven
artist projects.

| Field        | Type      | Required | Description |
|--------------|-----------|----------|-------------|
| `id`         | `number`  | Yes      | Numeric Bandcamp album ID, used to construct the embed URL |
| `title`      | `string`  | Yes      | Album or EP title |
| `artistName` | `string`  | Yes      | Display name of the artist project (e.g. "Howling Boil") |
| `artistUrl`  | `string`  | No       | Bandcamp artist page URL |
| `releaseDate`| `string`  | Yes      | ISO 8601 date string — primary sort key |
| `imageUrl`   | `string`  | No       | Cover art URL (Bandcamp CDN); may be absent for older releases |
| `url`        | `string`  | No       | Full Bandcamp album page URL |
| `embedUrl`   | `string`  | Yes      | Constructed Bandcamp iframe embed URL (derived from `id`) |

**Validation rules**:
- `id` must be a positive integer
- `releaseDate` must be a parseable date string
- `embedUrl` is always derived: `https://bandcamp.com/EmbeddedPlayer/album={id}/...`
- If `imageUrl` is absent, render a text placeholder (initials + title)

**TypeScript definition**:
```ts
export interface Release {
  id: number;
  title: string;
  artistName: string;
  artistUrl?: string;
  releaseDate: string;
  imageUrl?: string;
  url?: string;
  embedUrl: string;
}
```

---

### Artist (configuration, not a database entity)

The artist roster is a static configuration constant — not stored or fetched
dynamically. It maps display names to Bandcamp URLs for the discography fetch.

| Field        | Type     | Description |
|--------------|----------|-------------|
| `name`       | `string` | Display name shown on release cards |
| `bandcampUrl`| `string` | Full Bandcamp artist page URL |

**Artist roster** (static, defined in `lib/music.ts`):

| Name              | Bandcamp URL |
|-------------------|-------------|
| Tyler Agnew       | https://tyleragnew.bandcamp.com |
| Scarry Burdz      | https://scarryburdz.bandcamp.com |
| Howling Boil      | https://howlingboil.bandcamp.com |
| Blue Plutos       | https://blueplutos.bandcamp.com |
| Toy Factory       | https://toyfactory.bandcamp.com |
| Pesci Devito      | https://pescidevito.bandcamp.com |
| Covered Bridges   | https://coveredbridges.bandcamp.com |

---

### PlayerState (client-side, not persisted)

Tracks which release is currently loaded in the player. Lives in React component
state only — not persisted to localStorage or any backend.

| Field              | Type               | Description |
|--------------------|-------------------|-------------|
| `selectedRelease`  | `Release \| null`  | The release currently loaded in the player; `null` means no player visible |

**State transitions**:
```
null → Release        (user clicks a release card → player opens)
Release A → Release B (user clicks a different card → player switches)
Release → null        (user closes player → player hidden)
```

---

## API Response Shape

`GET /api/music` returns a JSON array of `Release` objects, sorted descending
by `releaseDate`:

```ts
type MusicApiResponse = Release[];
```

**Example**:
```json
[
  {
    "id": 1234567890,
    "title": "Some Album",
    "artistName": "Howling Boil",
    "artistUrl": "https://howlingboil.bandcamp.com",
    "releaseDate": "2024-06-15T00:00:00.000Z",
    "imageUrl": "https://f4.bcbits.com/img/a1234567890_10.jpg",
    "url": "https://howlingboil.bandcamp.com/album/some-album",
    "embedUrl": "https://bandcamp.com/EmbeddedPlayer/album=1234567890/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/"
  }
]
```

---

## Fallback Data (`lib/music-fallback.json`)

A manually-maintained static array of `Release` objects. Used when all
Bandcamp fetches fail. Structure identical to the API response. Must be
updated by the maintainer when new releases are published and the scraper
is unavailable.
