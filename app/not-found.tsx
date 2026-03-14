import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div className="py-8">
      <h1 className="font-display text-4xl font-bold text-(--color-text-primary) mb-4">
        Page Not Found
      </h1>
      <p className="text-lg text-(--color-text-secondary) mb-8">
        This page doesn&apos;t exist. Maybe you were looking for something else?
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-(--color-text-primary) underline decoration-(--color-accent) underline-offset-4 hover:text-(--color-accent-hover) hover:decoration-(--color-accent-hover) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) rounded-sm"
      >
        ← Go home
      </Link>
    </div>
  );
}
