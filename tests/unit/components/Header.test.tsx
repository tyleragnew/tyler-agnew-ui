import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";

// Mock next/navigation for Nav child
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

describe("Header component", () => {
  it("renders the site name 'Tyler Agnew'", () => {
    render(<Header />);
    expect(screen.getByText("Tyler Agnew")).toBeDefined();
  });

  it("site name links to /", () => {
    render(<Header />);
    const siteNameLinks = screen
      .getAllByRole("link", { name: "Tyler Agnew" })
      .filter((el) => el.getAttribute("href") === "/");
    expect(siteNameLinks.length).toBeGreaterThan(0);
  });

  it("renders the Nav component (navigation landmark)", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeDefined();
  });

  it("renders inside a header element", () => {
    render(<Header />);
    const header = document.querySelector("header");
    expect(header).not.toBeNull();
  });
});
