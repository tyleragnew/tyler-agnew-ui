import type { Metadata } from "next";
import DiscographyBrowser from "@/components/music/DiscographyBrowser";

export const metadata: Metadata = {
  title: "Music",
  description:
    "Browse the full discography across all of Tyler Agnew's Bandcamp projects.",
};

export default function MusicPage() {
  return (
    <main className="px-6 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-(--color-text-primary) mb-2">
        Music
      </h1>
      <p className="text-(--color-text-secondary) mb-8">
        Music I&apos;ve made across a handful of projects over the years.
      </p>
      <DiscographyBrowser />
    </main>
  );
}
