import { unstable_cache } from "next/cache";
import bcfetch from "bandcamp-fetch";
import { ARTIST_URLS, buildEmbedUrl } from "@/lib/music";
import type { Release } from "@/lib/music";
import fallbackData from "@/lib/music-fallback.json";

export const revalidate = 86400;

const getDiscography = unstable_cache(
  async (): Promise<Release[]> => {
    const results = await Promise.allSettled(
      ARTIST_URLS.map((url) =>
        bcfetch.band.getDiscography({ bandUrl: url, imageFormat: 10 })
      )
    );

    const releases: Release[] = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<unknown[]>).value)
      .filter((item): item is Record<string, unknown> => {
        return (
          typeof item === "object" &&
          item !== null &&
          (item as Record<string, unknown>).type === "album"
        );
      })
      .map((album) => {
        const id = album.id as number;
        const artist = album.artist as
          | { name?: string; url?: string }
          | undefined;
        return {
          id,
          title: (album.name as string) ?? "",
          artistName: artist?.name ?? "",
          artistUrl: artist?.url as string | undefined,
          releaseDate: (album.releaseDate as string) ?? "",
          imageUrl: album.imageUrl as string | undefined,
          url: album.url as string | undefined,
          embedUrl: buildEmbedUrl(id),
        };
      });

    if (releases.length === 0) return fallbackData as Release[];

    return releases.sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  },
  ["discography"],
  { revalidate: 86400, tags: ["discography"] }
);

export async function GET() {
  try {
    const data = await getDiscography();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new Response(JSON.stringify(fallbackData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  }
}
