"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { routes } from "@/lib/routes";

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (isActive: boolean) =>
    `text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) rounded-sm ${
      isActive
        ? "font-semibold text-(--color-text-primary) underline decoration-(--color-accent) underline-offset-4"
        : "font-medium text-(--color-text-secondary) hover:text-(--color-text-primary)"
    }`;

  return (
    <nav aria-label="Main navigation">
      {/* Desktop nav — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-6">
        {routes.map((route) => {
          const isActive =
            route.path === "/" ? pathname === "/" : pathname.startsWith(route.path);
          return (
            <li key={route.path}>
              <Link
                href={route.path}
                aria-current={isActive ? "page" : undefined}
                className={linkClass(isActive)}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile hamburger toggle — hidden on md+ */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent) rounded-sm"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`block w-5 h-0.5 bg-(--color-text-primary) transition-transform ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block w-5 h-0.5 bg-(--color-text-primary) transition-opacity ${isOpen ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-(--color-text-primary) transition-transform ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <ul
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-(--color-surface) border-b border-(--color-border) px-6 py-4 flex flex-col gap-4 shadow-sm"
        >
          {routes.map((route) => {
            const isActive =
              route.path === "/" ? pathname === "/" : pathname.startsWith(route.path);
            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  aria-current={isActive ? "page" : undefined}
                  className={linkClass(isActive)}
                  onClick={() => setIsOpen(false)}
                >
                  {route.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
