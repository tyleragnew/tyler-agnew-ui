export interface DiscogsRelease {
  id: number;
  dateAdded: string;
  title: string;
  year: number;
  artistName: string;
  label: string;
  format: string;
  thumb: string;
  coverImage: string;
}

export interface ChartDataPoint {
  month: string;
  count: number;
  cumulative: number;
}

/** Strip Discogs disambiguation suffixes like "(2)" from artist names. */
export function cleanArtistName(name: string): string {
  return name.replace(/\s\(\d+\)$/, "");
}

/**
 * Format a date_added ISO string for display.
 * Returns relative format ("3 days ago") if within 30 days, absolute otherwise ("Nov 3, 2024").
 */
export function formatDateAdded(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (diffDays === 0) return rtf.format(0, "day");
    return rtf.format(-diffDays, "day");
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Build a sorted array of monthly chart data points from an array of releases.
 * Each point includes a cumulative running total.
 */
export function buildChartData(releases: DiscogsRelease[]): ChartDataPoint[] {
  const histogram: Record<string, number> = {};

  for (const release of releases) {
    const month = release.dateAdded.slice(0, 7);
    histogram[month] = (histogram[month] ?? 0) + 1;
  }

  const sorted = Object.entries(histogram).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  let cumulative = 0;
  return sorted.map(([month, count]) => {
    cumulative += count;
    return { month, count, cumulative };
  });
}

/** Raw Discogs API release item shape (subset of fields we use). */
export interface RawDiscogsItem {
  id: number;
  date_added: string;
  basic_information: {
    title: string;
    year: number;
    thumb: string;
    cover_image: string;
    artists: Array<{ name: string }>;
    labels: Array<{ name: string }>;
    formats: Array<{ name: string; descriptions?: string[] }>;
  };
}

/** Map a raw Discogs API item to our normalized DiscogsRelease shape. */
export function mapRelease(item: RawDiscogsItem): DiscogsRelease {
  const info = item.basic_information;
  const rawArtist = info.artists[0]?.name ?? "Unknown Artist";
  const labelName = info.labels[0]?.name ?? "";
  const formatName = info.formats[0]?.name ?? "Vinyl";

  return {
    id: item.id,
    dateAdded: item.date_added,
    title: info.title,
    year: info.year,
    artistName: cleanArtistName(rawArtist),
    label: labelName,
    format: formatName,
    thumb: info.thumb,
    coverImage: info.cover_image,
  };
}
