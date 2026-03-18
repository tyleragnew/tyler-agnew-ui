import RecordCard from "./RecordCard";
import type { DiscogsRelease } from "@/lib/discogs";

interface RecentAdditionsProps {
  releases: DiscogsRelease[];
  loading?: boolean;
  error?: boolean;
}

export default function RecentAdditions({
  releases,
  loading,
  error,
}: RecentAdditionsProps) {
  return (
    <section aria-labelledby="recent-additions-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="recent-additions-heading"
          className="text-xl font-semibold text-(--color-text-primary)"
        >
          Recently added
        </h2>
        <a
          href="https://www.discogs.com/user/Tagnuisance/collection"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
        >
          View on Discogs ↗
        </a>
      </div>

      {error ? (
        <p className="text-sm text-(--color-text-secondary) py-4">
          Unable to load records.
        </p>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              data-testid="record-skeleton"
              className="flex flex-col gap-2 animate-pulse"
            >
              <div className="aspect-square w-full rounded bg-(--color-border)" />
              <div className="h-3 w-3/4 rounded bg-(--color-border)" />
              <div className="h-3 w-1/2 rounded bg-(--color-border)" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {releases.map((release) => (
            <RecordCard key={release.id} release={release} />
          ))}
        </div>
      )}
    </section>
  );
}
