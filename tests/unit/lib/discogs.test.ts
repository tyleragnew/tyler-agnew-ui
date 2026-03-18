import { describe, it, expect } from "vitest";
import { cleanArtistName, formatDateAdded, buildChartData } from "@/lib/discogs";
import type { DiscogsRelease } from "@/lib/discogs";

describe("cleanArtistName", () => {
  it("strips disambiguation suffix (2)", () => {
    expect(cleanArtistName("Steve Roach (2)")).toBe("Steve Roach");
  });

  it("strips disambiguation suffix (10)", () => {
    expect(cleanArtistName("Various (10)")).toBe("Various");
  });

  it("leaves names without suffix unchanged", () => {
    expect(cleanArtistName("Brian Eno")).toBe("Brian Eno");
  });

  it("does not strip parenthetical that is part of the name (not at end)", () => {
    expect(cleanArtistName("The (International) Noise Conspiracy")).toBe(
      "The (International) Noise Conspiracy"
    );
  });
});

describe("formatDateAdded", () => {
  it("returns relative format for a date added today", () => {
    const today = new Date().toISOString();
    const result = formatDateAdded(today);
    expect(result).toMatch(/today|0 days|ago/i);
  });

  it("returns relative format for a date added 5 days ago", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatDateAdded(fiveDaysAgo);
    expect(result).toMatch(/5 days ago/i);
  });

  it("returns absolute format for a date added more than 30 days ago", () => {
    const old = new Date("2024-01-15T00:00:00.000Z").toISOString();
    const result = formatDateAdded(old);
    expect(result).toContain("2024");
    expect(result).not.toMatch(/ago/i);
  });
});

describe("buildChartData", () => {
  const releases: DiscogsRelease[] = [
    { id: 1, dateAdded: "2024-01-10T00:00:00Z", title: "A", year: 2020, artistName: "Artist", label: "L", format: "Vinyl", thumb: "", coverImage: "" },
    { id: 2, dateAdded: "2024-01-20T00:00:00Z", title: "B", year: 2021, artistName: "Artist", label: "L", format: "Vinyl", thumb: "", coverImage: "" },
    { id: 3, dateAdded: "2024-03-05T00:00:00Z", title: "C", year: 2022, artistName: "Artist", label: "L", format: "Vinyl", thumb: "", coverImage: "" },
  ];

  it("produces sorted array of { month, count, cumulative } objects", () => {
    const result = buildChartData(releases);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe("2024-01");
    expect(result[0].count).toBe(2);
    expect(result[1].month).toBe("2024-03");
    expect(result[1].count).toBe(1);
  });

  it("computes running cumulative totals", () => {
    const result = buildChartData(releases);
    expect(result[0].cumulative).toBe(2);
    expect(result[1].cumulative).toBe(3);
  });

  it("returns empty array for empty input", () => {
    expect(buildChartData([])).toEqual([]);
  });
});
