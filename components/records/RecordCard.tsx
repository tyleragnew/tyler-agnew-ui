import Image from "next/image";
import type { DiscogsRelease } from "@/lib/discogs";
import { formatDateAdded } from "@/lib/discogs";

interface RecordCardProps {
  release: DiscogsRelease;
}

export default function RecordCard({ release }: RecordCardProps) {
  const year = release.year === 0 ? "—" : String(release.year);
  const dateLabel = formatDateAdded(release.dateAdded);
  const labelYear = [release.label, year].filter(Boolean).join(" · ");

  return (
    <a
      href={`https://www.discogs.com/release/${release.id}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="record-card"
      aria-label={`${release.title} by ${release.artistName}`}
      className="group flex flex-col gap-2 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) rounded-sm"
    >
      {/* Album art */}
      <div className="relative aspect-square w-full overflow-hidden rounded bg-(--color-border)">
        {release.coverImage || release.thumb ? (
          <Image
            src={release.coverImage || release.thumb}
            alt={`${release.title} cover`}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover"
          />
        ) : (
          <VinylPlaceholder />
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-0.5">
        <p
          data-testid="record-artist"
          className="text-[13px] font-medium text-(--color-text-primary) truncate"
        >
          {release.artistName}
        </p>
        <p
          data-testid="record-title"
          className="text-[12px] text-(--color-text-secondary) truncate"
        >
          {release.title}
        </p>
        <p className="text-[12px] text-(--color-text-secondary) truncate">
          {labelYear}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-(--color-border) text-(--color-text-primary) font-medium">
            {release.format}
          </span>
          <span className="text-[11px] text-(--color-text-secondary)">
            {dateLabel}
          </span>
        </div>
      </div>
    </a>
  );
}

function VinylPlaceholder() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width="60%"
        height="60%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="currentColor"
          strokeWidth="2"
          className="text-(--color-text-secondary) opacity-30"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-(--color-text-secondary) opacity-20"
        />
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="currentColor"
          className="text-(--color-text-secondary) opacity-25"
        />
        <circle
          cx="50"
          cy="50"
          r="3"
          fill="currentColor"
          className="text-(--color-text-secondary) opacity-40"
        />
      </svg>
    </div>
  );
}
