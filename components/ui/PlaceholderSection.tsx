interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export default function PlaceholderSection({
  title,
  description,
}: PlaceholderSectionProps) {
  return (
    <div className="py-8">
      <h1 className="font-display text-4xl font-bold text-(--color-text-primary) mb-4">
        {title}
      </h1>
      <p className="text-lg text-(--color-text-secondary) max-w-xl">
        {description}
      </p>
      <p className="mt-8 text-sm text-(--color-text-secondary) border border-(--color-border) rounded-lg px-4 py-3 inline-block">
        Coming soon
      </p>
    </div>
  );
}
