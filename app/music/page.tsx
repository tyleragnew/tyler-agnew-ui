import type { Metadata } from "next";
import PlaceholderSection from "@/components/ui/PlaceholderSection";

export const metadata: Metadata = {
  title: "Music",
};

export default function MusicPage() {
  return (
    <PlaceholderSection
      title="Music"
      description="Discography across all of Tyler's Bandcamp projects."
    />
  );
}
