import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReleaseCard from "@/components/music/ReleaseCard";
import type { Release } from "@/lib/music";

const baseRelease: Release = {
  id: 123456,
  title: "Test Album",
  artistName: "Test Artist",
  releaseDate: "2023-06-15T00:00:00.000Z",
  embedUrl:
    "https://bandcamp.com/EmbeddedPlayer/album=123456/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
  imageUrl: "https://f4.bcbits.com/img/0012345678_10.jpg",
  url: "https://testartist.bandcamp.com/album/test-album",
};

describe("ReleaseCard", () => {
  it("renders cover art img with non-empty alt text", () => {
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={vi.fn()} />
    );
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("alt")).toBeTruthy();
    expect(img.getAttribute("alt")!.length).toBeGreaterThan(0);
  });

  it("renders artist name", () => {
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={vi.fn()} />
    );
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("renders album title", () => {
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={vi.fn()} />
    );
    expect(screen.getByText("Test Album")).toBeInTheDocument();
  });

  it("renders release year derived from releaseDate when valid", () => {
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={vi.fn()} />
    );
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("does not render year element when releaseDate is empty/missing", () => {
    const noDate: Release = { ...baseRelease, releaseDate: "" };
    render(
      <ReleaseCard release={noDate} isSelected={false} onClick={vi.fn()} />
    );
    const yearEl = document.querySelector('[data-testid="card-year"]');
    expect(yearEl).toBeNull();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={onClick} />
    );
    const user = userEvent.setup();
    const card = screen.getByRole("button");
    await user.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has aria-label containing Play, title, and artistName", () => {
    render(
      <ReleaseCard release={baseRelease} isSelected={false} onClick={vi.fn()} />
    );
    const btn = screen.getByRole("button");
    const ariaLabel = btn.getAttribute("aria-label") ?? "";
    expect(ariaLabel).toContain("Play");
    expect(ariaLabel).toContain("Test Album");
    expect(ariaLabel).toContain("Test Artist");
  });

  it("applies selected visual indicator when isSelected is true", () => {
    const { container } = render(
      <ReleaseCard release={baseRelease} isSelected={true} onClick={vi.fn()} />
    );
    // The selected state adds a data-selected attribute or a class; just verify aria-pressed or data
    const btn = container.querySelector('[data-selected="true"]');
    expect(btn).not.toBeNull();
  });

  it("renders placeholder when imageUrl is absent", () => {
    const releaseNoImage: Release = { ...baseRelease, imageUrl: undefined };
    render(
      <ReleaseCard
        release={releaseNoImage}
        isSelected={false}
        onClick={vi.fn()}
      />
    );
    // No img element when imageUrl is absent
    const imgs = screen.queryAllByRole("img");
    expect(imgs).toHaveLength(0);
    // Placeholder div should be in the DOM
    const placeholder = document.querySelector(
      '[data-testid="cover-placeholder"]'
    );
    expect(placeholder).not.toBeNull();
  });
});
