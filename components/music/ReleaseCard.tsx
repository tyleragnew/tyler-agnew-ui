import Image from "next/image";
import type { Release } from "@/lib/music";

interface ReleaseCardProps {
  release: Release;
  isSelected: boolean;
  onClick: () => void;
}

export default function ReleaseCard({
  release,
  isSelected,
  onClick,
}: ReleaseCardProps) {
  const parsedYear = release.releaseDate
    ? new Date(release.releaseDate).getFullYear()
    : NaN;
  const year = Number.isNaN(parsedYear) ? null : parsedYear;

  return (
    <button
      data-testid="release-card"
      data-selected={isSelected ? "true" : undefined}
      aria-label={`Play ${release.title} by ${release.artistName}`}
      onClick={onClick}
      className={`group w-full text-left rounded-lg overflow-hidden border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) ${
        isSelected
          ? "border-(--color-accent)"
          : "border-(--color-border) hover:border-(--color-accent)"
      }`}
    >
      {/* Cover art */}
      <div className="aspect-square relative bg-(--color-border)">
        {release.imageUrl ? (
          <Image
            src={release.imageUrl}
            alt={`${release.title} by ${release.artistName} cover art`}
            width={300}
            height={300}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            data-testid="cover-placeholder"
            className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary) text-xl font-bold"
          >
            {release.artistName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* Card text */}
      <div className="p-3 space-y-0.5">
        <p
          data-testid="card-title"
          className="text-sm font-semibold text-(--color-text-primary) leading-tight line-clamp-2"
        >
          {release.title}
        </p>
        <p
          data-testid="card-artist"
          className="text-xs text-(--color-text-secondary)"
        >
          {release.artistName}
        </p>
        {year !== null && (
          <p
            data-testid="card-year"
            className="text-xs text-(--color-text-secondary)"
          >
            {year}
          </p>
        )}
      </div>
    </button>
  );
}
