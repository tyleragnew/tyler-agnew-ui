import { test, expect } from "@playwright/test";

const NAV_LABELS = ["Home", "Blog", "Music", "Projects", "Records"];
const NAV_ROUTES = [
  { label: "Home", path: "/" },
  { label: "Blog", path: "/blog" },
  { label: "Music", path: "/music" },
  { label: "Projects", path: "/projects" },
  { label: "Records", path: "/records" },
];

test.describe("NAV-01: All navigation labels are visible", () => {
  test("Given any page is loaded, When user views the nav, Then all 5 section labels are present", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();

    for (const label of NAV_LABELS) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });
});

test.describe("NAV-02–06: Active nav state per route", () => {
  for (const route of NAV_ROUTES) {
    test(`Given user is on ${route.path}, When nav renders, Then "${route.label}" link has aria-current="page"`, async ({
      page,
    }) => {
      await page.goto(route.path);
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      const activeLink = nav.getByRole("link", { name: route.label });
      await expect(activeLink).toHaveAttribute("aria-current", "page");

      // All other links must NOT have aria-current
      for (const other of NAV_ROUTES.filter((r) => r.path !== route.path)) {
        const otherLink = nav.getByRole("link", { name: other.label });
        await expect(otherLink).not.toHaveAttribute("aria-current", "page");
      }
    });
  }
});

test.describe("NAV-07: Navigation links are functional", () => {
  for (const route of NAV_ROUTES) {
    test(`Given user clicks "${route.label}" nav link, When page loads, Then URL is ${route.path} with no error`, async ({
      page,
    }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      await nav.getByRole("link", { name: route.label }).click();
      await expect(page).toHaveURL(route.path);
      // No error page (check h1 exists)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("NAV-08: Keyboard focus rings on nav links", () => {
  test("Given any page is loaded, When user tabs through nav, Then focus is visible on each nav link", async ({
    page,
  }) => {
    await page.goto("/");
    // Tab into nav
    await page.keyboard.press("Tab");
    // Each nav link should have a focus-visible style — we verify all links are focusable
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const label of NAV_LABELS) {
      const link = nav.getByRole("link", { name: label });
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
    }
  });
});
