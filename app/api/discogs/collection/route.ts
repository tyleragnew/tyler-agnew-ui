import { mapRelease } from "@/lib/discogs";
import type { DiscogsRelease, RawDiscogsItem } from "@/lib/discogs";
import fallbackData from "@/lib/discogs-fallback.json";

export const revalidate = 3600;

const DISCOGS_USER = "Tagnuisance";
const BASE_URL = "https://api.discogs.com";

async function fetchAllReleases(token: string): Promise<DiscogsRelease[]> {
  const all: DiscogsRelease[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${BASE_URL}/users/${DISCOGS_USER}/collection/folders/0/releases?sort=added&sort_order=asc&per_page=100&page=${page}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        "User-Agent": "TylerAgnewSite/1.0",
      },
    });

    if (!res.ok) break;

    const json = await res.json();
    const items: RawDiscogsItem[] = json.releases ?? [];
    all.push(...items.map(mapRelease));

    totalPages = json.pagination?.pages ?? 1;
    page++;
  }

  return all;
}

export async function GET() {
  const token = process.env.DISCOGS_TOKEN;

  if (!token) {
    return new Response(JSON.stringify(fallbackData), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await fetchAllReleases(token);
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
