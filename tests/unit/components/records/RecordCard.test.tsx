import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecordCard from "@/components/records/RecordCard";
import type { DiscogsRelease } from "@/lib/discogs";

const testRelease: DiscogsRelease = {
  id: 99999,
  dateAdded: "2024-01-15T00:00:00.000Z",
  title: "Test Album",
  year: 2022,
  artistName: "Test Artist",
  label: "Test Label",
  format: "Vinyl",
  thumb: "",
  coverImage: "",
};

describe("RecordCard", () => {
  it("renders artist name", () => {
    render(<RecordCard release={testRelease} />);
    expect(screen.getByText(/Test Artist/)).toBeInTheDocument();
  });

  it("renders album title", () => {
    render(<RecordCard release={testRelease} />);
    expect(screen.getByText(/Test Album/)).toBeInTheDocument();
  });

  it("renders label and year", () => {
    render(<RecordCard release={testRelease} />);
    expect(screen.getByText(/Test Label/)).toBeInTheDocument();
    expect(screen.getByText(/2022/)).toBeInTheDocument();
  });

  it("renders format badge", () => {
    render(<RecordCard release={testRelease} />);
    expect(screen.getByText("Vinyl")).toBeInTheDocument();
  });

  it("links to the Discogs release page", () => {
    render(<RecordCard release={testRelease} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://www.discogs.com/release/99999"
    );
  });

  it("opens link in new tab with rel noopener", () => {
    render(<RecordCard release={testRelease} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders year as dash when year is 0", () => {
    render(<RecordCard release={{ ...testRelease, year: 0 }} />);
    expect(screen.getByText(/—/)).toBeInTheDocument();
  });
});
