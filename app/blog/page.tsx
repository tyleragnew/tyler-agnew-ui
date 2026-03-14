import type { Metadata } from "next";
import PlaceholderSection from "@/components/ui/PlaceholderSection";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <PlaceholderSection
      title="Blog"
      description="Writing on software, music, and things in between."
    />
  );
}
