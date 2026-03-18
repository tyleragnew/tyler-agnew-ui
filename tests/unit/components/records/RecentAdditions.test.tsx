import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecentAdditions from "@/components/records/RecentAdditions";
import type { DiscogsRelease } from "@/lib/discogs";

const makeRelease = (id: number): DiscogsRelease => ({
  id,
  dateAdded: "2024-06-01T00:00:00.000Z",
  title: `Album ${id}`,
  year: 2020 + id,
  artistName: `Artist ${id}`,
  label: "Some Label",
  format: "Vinyl",
  thumb: "",
  coverImage: "",
});

const fiveReleases = Array.from({ length: 5 }, (_, i) => makeRelease(i + 1));

describe("RecentAdditions", () => {
  it("renders section heading 'Recently added'", () => {
    render(<RecentAdditions releases={fiveReleases} />);
    expect(
      screen.getByRole("heading", { name: /recently added/i })
    ).toBeInTheDocument();
  });

  it("renders 'View on Discogs' link to user collection", () => {
    render(<RecentAdditions releases={fiveReleases} />);
    const link = screen.getByRole("link", { name: /view on discogs/i });
    expect(link).toHaveAttribute(
      "href",
      "https://www.discogs.com/user/Tagnuisance/collection"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a card for each release", () => {
    render(<RecentAdditions releases={fiveReleases} />);
    const cards = screen.getAllByRole("link", { name: /album/i });
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });

  it("shows loading skeletons when loading prop is true", () => {
    render(<RecentAdditions releases={[]} loading />);
    const skeletons = document.querySelectorAll('[data-testid="record-skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
