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

export const ARTIST_URLS = [
  "https://tyleragnew.bandcamp.com",
  "https://scarryburdz.bandcamp.com",
  "https://howlingboil.bandcamp.com",
  "https://blueplutos.bandcamp.com",
  "https://toyfactory.bandcamp.com",
  "https://pescidevito.bandcamp.com",
  "https://coveredbridges.bandcamp.com",
  "https://luzagnew.bandcamp.com",
  "https://the-watermelons.bandcamp.com",
  "https://busybeds.bandcamp.com",
] as const;

export function buildEmbedUrl(id: number, type: "album" | "track" = "album"): string {
  return `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/`;
}
