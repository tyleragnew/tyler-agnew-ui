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
      className="fixed bottom-0 left-0 right-0 bg-(--color-surface) border-t border-(--color-border) z-50"
    >
      {/* Context row */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--color-text-primary) truncate">
            {release.title}
          </p>
          <p className="text-xs text-(--color-text-secondary) truncate">
            {release.artistName}
          </p>
        </div>
        <button
          aria-label="Close player"
          onClick={onClose}
          className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-(--color-text-secondary) hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) transition-colors"
        >
          <svg
            width="16"
            height="16"
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

      {/* Iframe */}
      <iframe
        src={release.embedUrl}
        title={`${release.title} by ${release.artistName} player`}
        width="100%"
        height="120"
        allow="autoplay"
        className="block border-0"
      />
    </div>
  );
}
