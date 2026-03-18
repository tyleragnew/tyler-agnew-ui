import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import RecentAdditions from "@/components/records/RecentAdditions";
import CollectionGrowthChart from "@/components/records/CollectionGrowthChart";
import type { DiscogsRelease } from "@/lib/discogs";
import { mapRelease } from "@/lib/discogs";
import type { RawDiscogsItem } from "@/lib/discogs";
import fallbackData from "@/lib/discogs-fallback.json";

export const metadata: Metadata = {
  title: "Records",
  description:
    "Tyler Agnew's vinyl record collection, pulled live from Discogs.",
};

const DISCOGS_USER = "Tagnuisance";
const BASE_URL = "https://api.discogs.com";

const getRecentReleases = unstable_cache(
  async (): Promise<DiscogsRelease[]> => {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return fallbackData as DiscogsRelease[];

    try {
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
    } catch {
      return fallbackData as DiscogsRelease[];
    }
  },
  ["discogs-recent"],
  { revalidate: 3600, tags: ["discogs-recent"] }
);

const getTotalCount = unstable_cache(
  async (): Promise<number> => {
    const token = process.env.DISCOGS_TOKEN;
    if (!token) return fallbackData.length;

    try {
      const url = `${BASE_URL}/users/${DISCOGS_USER}/collection/folders/0/releases?per_page=1&page=1`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Discogs token=${token}`,
          "User-Agent": "TylerAgnewSite/1.0",
        },
      });

      if (!res.ok) return fallbackData.length;

      const json = await res.json();
      return (json.pagination?.items as number) ?? fallbackData.length;
    } catch {
      return fallbackData.length;
    }
  },
  ["discogs-total"],
  { revalidate: 3600, tags: ["discogs-total"] }
);

export default async function RecordsPage() {
  const [releases, totalCount] = await Promise.all([
    getRecentReleases(),
    getTotalCount(),
  ]);

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">
        Records
      </h1>
      <p className="text-(--color-text-secondary) mb-8">
        Vinyl I&apos;ve collected over the years, pulled live from my Discogs collection.
      </p>

      <div className="flex flex-col gap-12">
        <RecentAdditions releases={releases} />
        <CollectionGrowthChart totalCount={totalCount} />
      </div>
    </div>
  );
}
