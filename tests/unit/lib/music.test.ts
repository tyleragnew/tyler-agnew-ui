import { describe, it, expect } from "vitest";
import { buildEmbedUrl, ARTIST_URLS } from "@/lib/music";
import fallbackData from "@/lib/music-fallback.json";

describe("buildEmbedUrl", () => {
  it("returns URL containing the album ID", () => {
    const url = buildEmbedUrl(123456);
    expect(url).toContain("album=123456");
  });

  it("includes bgcol=fafaf8 design token", () => {
    const url = buildEmbedUrl(123456);
    expect(url).toContain("bgcol=fafaf8");
  });

  it("includes linkcol=d97706 design token", () => {
    const url = buildEmbedUrl(123456);
    expect(url).toContain("linkcol=d97706");
  });

  it("returns a valid HTTPS URL starting with bandcamp.com embed path", () => {
    const url = buildEmbedUrl(999);
    expect(url).toMatch(/^https:\/\/bandcamp\.com\/EmbeddedPlayer\//);
  });
});

describe("ARTIST_URLS", () => {
  it("has exactly 10 entries", () => {
    expect(ARTIST_URLS).toHaveLength(10);
  });

  it("every entry starts with https://", () => {
    for (const url of ARTIST_URLS) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("contains the 10 known artist Bandcamp URLs", () => {
    const urls = Array.from(ARTIST_URLS);
    expect(urls).toContain("https://tyleragnew.bandcamp.com");
    expect(urls).toContain("https://scarryburdz.bandcamp.com");
    expect(urls).toContain("https://howlingboil.bandcamp.com");
    expect(urls).toContain("https://blueplutos.bandcamp.com");
    expect(urls).toContain("https://toyfactory.bandcamp.com");
    expect(urls).toContain("https://pescidevito.bandcamp.com");
    expect(urls).toContain("https://coveredbridges.bandcamp.com");
    expect(urls).toContain("https://luzagnew.bandcamp.com");
    expect(urls).toContain("https://the-watermelons.bandcamp.com");
    expect(urls).toContain("https://busybeds.bandcamp.com");
  });
});

// ============================================================
// US3: Fallback JSON validation
// ============================================================

describe("music-fallback.json", () => {
  it("is valid JSON with at least 5 entries", () => {
    expect(Array.isArray(fallbackData)).toBe(true);
    expect(fallbackData.length).toBeGreaterThanOrEqual(5);
  });

  it("each entry has required fields: id, title, artistName, releaseDate, embedUrl", () => {
    for (const entry of fallbackData) {
      expect(typeof entry.id).toBe("number");
      expect(typeof entry.title).toBe("string");
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.artistName).toBe("string");
      expect(entry.artistName.length).toBeGreaterThan(0);
      expect(typeof entry.releaseDate).toBe("string");
      expect(entry.releaseDate.length).toBeGreaterThan(0);
      expect(typeof entry.embedUrl).toBe("string");
      expect(entry.embedUrl.length).toBeGreaterThan(0);
    }
  });

  it("embedUrl values match the Bandcamp embed URL pattern", () => {
    for (const entry of fallbackData) {
      expect(entry.embedUrl).toMatch(
        /^https:\/\/bandcamp\.com\/EmbeddedPlayer\/album=\d+/
      );
    }
  });
});
