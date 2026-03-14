export default function ReleaseSkeleton() {
  return (
    <div
      data-testid="release-skeleton"
      className="animate-pulse rounded-lg overflow-hidden border border-(--color-border)"
    >
      {/* Square image area */}
      <div className="aspect-square bg-(--color-border)" />
      {/* Text lines */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-(--color-border) rounded w-3/4" />
        <div className="h-3 bg-(--color-border) rounded w-1/2" />
      </div>
    </div>
  );
}
