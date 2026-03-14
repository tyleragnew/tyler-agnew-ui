import type { Metadata } from "next";
import PlaceholderSection from "@/components/ui/PlaceholderSection";

export const metadata: Metadata = {
  title: "Records",
};

export default function RecordsPage() {
  return (
    <PlaceholderSection
      title="Records"
      description="Tyler's vinyl record collection, pulled from Discogs."
    />
  );
}
