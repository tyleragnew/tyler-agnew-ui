import { unstable_cache } from "next/cache";
import { mapRelease } from "@/lib/discogs";
import type { DiscogsRelease, RawDiscogsItem } from "@/lib/discogs";
import fallbackData from "@/lib/discogs-fallback.json";

export const revalidate = 3600;

const DISCOGS_USER = "Tagnuisance";
const BASE_URL = "https://api.discogs.com";

const getRecentReleases = unstable_cache(
  async (): Promise<DiscogsRelease[]> => {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return fallbackData as DiscogsRelease[];

    const url = `${BASE_URL}/users/${DISCOGS_USER}/collection/folders/0/releases?sort=added&sort_order=desc&per_page=5&page=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        "User-Agent": "TylerAgnewSite/1.0",
      },
    });

    if (!res.ok) return fallbackData as DiscogsRelease[];

    const json = await res.json();
    const items: RawDiscogsItem[] = json.releases ?? [];
    return items.map(mapRelease);
  },
  ["discogs-recent"],
  { revalidate: 3600, tags: ["discogs-recent"] }
);

export async function GET() {
  try {
    const data = await getRecentReleases();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch {
    return new Response(JSON.stringify(fallbackData), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
