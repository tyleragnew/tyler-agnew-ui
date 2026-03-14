import type { Metadata } from "next";
import PlaceholderSection from "@/components/ui/PlaceholderSection";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <PlaceholderSection
      title="Projects"
      description="Open source work, side projects, and tools."
    />
  );
}
