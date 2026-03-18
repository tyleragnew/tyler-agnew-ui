import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CollectionGrowthChart from "@/components/records/CollectionGrowthChart";
import type { DiscogsRelease } from "@/lib/discogs";

const makeRelease = (id: number, dateAdded: string): DiscogsRelease => ({
  id,
  dateAdded,
  title: `Album ${id}`,
  year: 2020,
  artistName: "Artist",
  label: "Label",
  format: "Vinyl",
  thumb: "",
  coverImage: "",
});

const releases: DiscogsRelease[] = [
  makeRelease(1, "2024-01-10T00:00:00Z"),
  makeRelease(2, "2024-01-20T00:00:00Z"),
  makeRelease(3, "2024-03-05T00:00:00Z"),
];

describe("CollectionGrowthChart", () => {
  it("renders total count headline", () => {
    render(<CollectionGrowthChart releases={releases} totalCount={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/records in collection/i)).toBeInTheDocument();
  });

  it("renders chart container", () => {
    render(<CollectionGrowthChart releases={releases} totalCount={42} />);
    const chart = document.querySelector('[data-testid="collection-chart"]');
    expect(chart).not.toBeNull();
  });

  it("shows loading skeleton when loading prop is true", () => {
    render(<CollectionGrowthChart releases={[]} totalCount={0} loading />);
    const skeleton = document.querySelector('[data-testid="chart-skeleton"]');
    expect(skeleton).not.toBeNull();
  });
});
