export default function ReleaseSkeleton() {
  return (
    <div
      data-testid="release-skeleton"
      className="animate-pulse flex items-center gap-3 px-4 py-3"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded bg-(--color-border)" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-(--color-border) rounded w-2/3" />
        <div className="h-3 bg-(--color-border) rounded w-1/3" />
      </div>
    </div>
  );
}
