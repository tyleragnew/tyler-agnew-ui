import type { Release } from "@/lib/music";

interface BandcampPlayerProps {
  release: Release;
  onClose: () => void;
}

export default function BandcampPlayer({
  release,
  onClose,
}: BandcampPlayerProps) {
  return (
    <div
      data-testid="bandcamp-player"
      className="px-4 pb-3"
    >
      <div className="flex items-center justify-between pb-1 px-1">
        <p className="text-xs text-(--color-text-secondary) truncate">
          {release.title} — {release.artistName}
        </p>
        <button
          aria-label="Close player"
          onClick={onClose}
          className="ml-3 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-(--color-text-secondary) hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <iframe
        src={release.embedUrl}
        title={`${release.title} by ${release.artistName} player`}
        width="100%"
        height="120"
        allow="autoplay"
        className="block border-0 rounded"
      />
    </div>
  );
}
