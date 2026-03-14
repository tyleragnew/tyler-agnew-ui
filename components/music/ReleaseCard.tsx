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
      className="w-full flex items-center gap-5 px-6 py-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-(--color-border)">
        {release.imageUrl ? (
          <Image
            src={release.imageUrl}
            alt={`${release.title} cover art`}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            data-testid="cover-placeholder"
            className="w-full h-full flex items-center justify-center text-(--color-text-secondary) text-sm font-bold"
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

      {/* Metadata */}
      <div className="flex-1 min-w-0">
        <p
          data-testid="card-title"
          className="text-base font-semibold text-(--color-text-primary) truncate"
        >
          {release.title}
        </p>
        <p
          data-testid="card-artist"
          className="text-sm text-(--color-text-secondary) truncate mt-0.5"
        >
          {release.artistName}
        </p>
        {year !== null && (
          <p
            data-testid="card-year"
            className="text-sm text-(--color-text-secondary) mt-0.5"
          >
            {year}
          </p>
        )}
      </div>

      {/* Chevron */}
      <div
        aria-hidden="true"
        className={`flex-shrink-0 text-(--color-text-secondary) transition-transform duration-200 ${
          isSelected ? "rotate-180" : ""
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
