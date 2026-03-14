# API Contracts: Music Discography Browser

**Feature**: 002-music-discography
**Date**: 2026-03-14

---

## MUSIC-API-01: GET /api/music

**Purpose**: Returns the merged, sorted discography from all seven artist projects.

### Request

```
GET /api/music
```

No parameters, headers, or body required.

### Response — Success (200)

```json
[
  {
    "id": 1234567890,
    "title": "Album Title",
    "artistName": "Artist Name",
    "artistUrl": "https://artist.bandcamp.com",
    "releaseDate": "2024-06-15T00:00:00.000Z",
    "imageUrl": "https://f4.bcbits.com/img/a1234567890_10.jpg",
    "url": "https://artist.bandcamp.com/album/album-slug",
    "embedUrl": "https://bandcamp.com/EmbeddedPlayer/album=1234567890/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/"
  }
]
```

**Guarantees**:
- Array is never empty (falls back to static data if all external sources fail)
- Sorted descending by `releaseDate` (newest first)
- `id`, `title`, `artistName`, `releaseDate`, `embedUrl` are always present
- `imageUrl`, `artistUrl`, `url` may be absent (optional fields)
- Response is cached for up to 24 hours; stale data served while revalidating

### Response — All sources failed (200 with fallback data)

Returns the same shape as a success response, using static fallback data.
The response is indistinguishable from a live response to the caller.

### Caching Behaviour

| Scenario | Behaviour |
|----------|-----------|
| First request after cold start | Fetches all 7 sources, caches result for 24h |
| Requests within 24h window | Returns cached data instantly |
| First request after 24h expiry | Returns stale cached data; triggers background refresh |
| Partial source failure | Returns releases from successful sources + empty from failed |
| Total source failure | Returns static fallback from `lib/music-fallback.json` |

### Test Scenarios

**MUSIC-API-01-T1**: `GET /api/music` returns HTTP 200 with a non-empty JSON array.

**MUSIC-API-01-T2**: All items in the response have `id`, `title`, `artistName`,
`releaseDate`, and `embedUrl` fields present.

**MUSIC-API-01-T3**: Items are sorted by `releaseDate` descending (first item is
the most recent release).

**MUSIC-API-01-T4**: When external sources are mocked to return errors,
`GET /api/music` still returns HTTP 200 with a non-empty array (fallback data).

**MUSIC-API-01-T5**: The `embedUrl` for each item matches the pattern
`https://bandcamp.com/EmbeddedPlayer/album={id}/...` where `{id}` matches
the item's `id` field.

---

## MUSIC-API-02: Embed URL Contract

**Purpose**: Defines the Bandcamp iframe embed URL format for player rendering.

### URL Pattern

```
https://bandcamp.com/EmbeddedPlayer/album={id}/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/
```

### Parameters

| Parameter      | Value       | Notes |
|----------------|-------------|-------|
| `album`        | `{id}`      | Numeric album ID from Release entity |
| `size`         | `large`     | Full-width player (350px tall) |
| `bgcol`        | `fafaf8`    | Matches `--color-background` design token (no `#`) |
| `linkcol`      | `d97706`    | Matches `--color-accent` design token (no `#`) |
| `tracklist`    | `false`     | Compact player without tracklist |
| `artwork`      | `small`     | Show cover art in the player |

**Note**: Contrast requirements do not apply inside the Bandcamp iframe — Bandcamp
controls the internal CSS. The `linkcol` is used for Bandcamp's own UI elements,
not for text that our accessibility audit scans.

### Test Scenarios

**MUSIC-API-02-T1**: The iframe `src` attribute for any rendered player matches
the embed URL pattern exactly.

**MUSIC-API-02-T2**: The `album=` parameter in the embed URL matches the `id`
field of the selected release.
