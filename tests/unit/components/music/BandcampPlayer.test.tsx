import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BandcampPlayer from "@/components/music/BandcampPlayer";
import type { Release } from "@/lib/music";

const testRelease: Release = {
  id: 654321,
  title: "My Great Record",
  artistName: "Some Artist",
  releaseDate: "2024-03-01T00:00:00.000Z",
  embedUrl:
    "https://bandcamp.com/EmbeddedPlayer/album=654321/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
};

describe("BandcampPlayer", () => {
  it("renders iframe with src matching release.embedUrl", () => {
    render(<BandcampPlayer release={testRelease} onClose={vi.fn()} />);
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("src")).toBe(testRelease.embedUrl);
  });

  it("iframe has title attribute containing release title", () => {
    render(<BandcampPlayer release={testRelease} onClose={vi.fn()} />);
    const iframe = document.querySelector("iframe");
    const title = iframe!.getAttribute("title") ?? "";
    expect(title).toContain("My Great Record");
  });

  it("renders close button with aria-label Close player", () => {
    render(<BandcampPlayer release={testRelease} onClose={vi.fn()} />);
    const btn = screen.getByRole("button", { name: "Close player" });
    expect(btn).toBeInTheDocument();
  });

  it("clicking close button calls onClose", async () => {
    const onClose = vi.fn();
    render(<BandcampPlayer release={testRelease} onClose={onClose} />);
    const user = userEvent.setup();
    const btn = screen.getByRole("button", { name: "Close player" });
    await user.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders release title and artist name as context", () => {
    render(<BandcampPlayer release={testRelease} onClose={vi.fn()} />);
    expect(screen.getByText(/My Great Record/)).toBeInTheDocument();
    expect(screen.getByText(/Some Artist/)).toBeInTheDocument();
  });
});
