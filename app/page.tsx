import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Tyler Agnew",
};

export default function HomePage() {
  const sections = routes.filter((r) => r.path !== "/");

  return (
    <div className="py-8">
      <h1 className="font-display text-5xl font-bold text-(--color-text-primary) mb-4">
        Tyler Agnew
      </h1>
      <p className="text-lg text-(--color-text-secondary) mb-12 max-w-xl">
        Software engineer and musician. This is my home on the web — writing,
        projects, records, and music all in one place.
      </p>

      <nav aria-label="Site sections" className="grid gap-4 sm:grid-cols-2">
        {sections.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="group block rounded-lg border border-(--color-border) bg-(--color-surface) p-6 hover:border-(--color-accent) transition-colors"
          >
            <h2 className="font-display text-xl font-semibold text-(--color-text-primary) group-hover:text-(--color-accent) transition-colors mb-2">
              {route.label}
            </h2>
            <p className="text-sm text-(--color-text-secondary)">
              {route.description}
            </p>
          </Link>
        ))}
      </nav>
    </div>
  );
}
