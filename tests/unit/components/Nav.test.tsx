import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "@/components/layout/Nav";
import { routes } from "@/lib/routes";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Nav component", () => {
  it("renders all 5 navigation items", () => {
    render(<Nav />);
    for (const route of routes) {
      expect(screen.getByRole("link", { name: route.label })).toBeDefined();
    }
  });

  it("sets aria-current=page on the active link when on /", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Nav />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.getAttribute("aria-current")).toBe("page");
  });

  it("sets aria-current=page on Blog when on /blog", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/blog");
    render(<Nav />);
    const blogLink = screen.getByRole("link", { name: "Blog" });
    expect(blogLink.getAttribute("aria-current")).toBe("page");
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.getAttribute("aria-current")).toBeNull();
  });

  it("all nav links have correct hrefs", () => {
    render(<Nav />);
    for (const route of routes) {
      const link = screen.getByRole("link", { name: route.label });
      expect(link.getAttribute("href")).toBe(route.path);
    }
  });

  it("renders inside a nav element with correct aria-label", () => {
    render(<Nav />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeDefined();
  });
});
