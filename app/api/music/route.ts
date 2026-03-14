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
        const type = (item as Record<string, unknown>)?.type;
        return (
          typeof item === "object" &&
          item !== null &&
          (type === "album" || type === "track")
        );
      })
      .map((item) => {
        const id = item.id as number;
        const type = item.type as "album" | "track";
        const artist = item.artist as
          | { name?: string; url?: string }
          | undefined;
        return {
          id,
          title: (item.name as string) ?? "",
          artistName: artist?.name ?? "",
          artistUrl: artist?.url as string | undefined,
          releaseDate: (item.releaseDate as string) ?? "",
          imageUrl: item.imageUrl as string | undefined,
          url: item.url as string | undefined,
          embedUrl: buildEmbedUrl(id, type),
        };
      });

    if (releases.length === 0) return fallbackData as Release[];

    const fallbackById = new Map(
      (fallbackData as Release[]).map((r) => [r.id, r.releaseDate])
    );

    const afterFallback = releases.map((r) =>
      r.releaseDate ? r : { ...r, releaseDate: fallbackById.get(r.id) ?? "" }
    );

    // For releases still missing a date, fetch info individually
    const needsDates = afterFallback.filter((r) => !r.releaseDate && r.url);
    if (needsDates.length > 0) {
      const infoResults = await Promise.allSettled(
        needsDates.map((r) =>
          r.url?.includes("/track/")
            ? bcfetch.track.getInfo({ trackUrl: r.url! })
            : bcfetch.album.getInfo({ albumUrl: r.url! })
        )
      );
      const dateById = new Map<number, string>();
      infoResults.forEach((result, i) => {
        if (result.status === "fulfilled" && result.value.releaseDate) {
          dateById.set(needsDates[i].id, result.value.releaseDate as string);
        }
      });
      afterFallback.forEach((r, i) => {
        if (!r.releaseDate) {
          const date = dateById.get(r.id);
          if (date) afterFallback[i] = { ...r, releaseDate: date };
        }
      });
    }

    return afterFallback.sort(
      (a, b) =>
        new Date(b.releaseDate || 0).getTime() -
        new Date(a.releaseDate || 0).getTime()
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
