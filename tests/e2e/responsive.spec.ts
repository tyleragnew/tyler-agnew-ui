import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/blog", "/music", "/projects", "/records"];

const VIEWPORTS = [
  { width: 320, height: 667, label: "mobile (320px)" },
  { width: 768, height: 1024, label: "tablet (768px)" },
  { width: 1280, height: 800, label: "desktop (1280px)" },
];

test.describe("RL-01: No horizontal scroll at any breakpoint", () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`Given route ${route} at ${vp.label}, Then no horizontal scrollbar`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth
        );
        const clientWidth = await page.evaluate(
          () => document.documentElement.clientWidth
        );
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      });
    }
  }
});

test.describe("RL-02: Nav links accessible at all breakpoints", () => {
  for (const vp of VIEWPORTS) {
    test(`Given viewport ${vp.label}, Then all nav links are accessible`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      await expect(nav).toBeVisible();

      const navEl = page.getByRole("navigation", { name: "Main navigation" });

      if (vp.width < 768) {
        // Mobile: either links visible or toggle button is visible
        const toggleBtn = navEl.getByRole("button", {
          name: "Toggle navigation",
        });
        const linksVisible = await navEl
          .getByRole("link", { name: "Home" })
          .isVisible()
          .catch(() => false);
        const hasToggle = await toggleBtn.isVisible().catch(() => false);
        expect(linksVisible || hasToggle).toBe(true);

        if (hasToggle) {
          await toggleBtn.click();
          await expect(navEl.getByRole("link", { name: "Home" })).toBeVisible();
          await expect(navEl.getByRole("link", { name: "Blog" })).toBeVisible();
          await expect(navEl.getByRole("link", { name: "Music" })).toBeVisible();
          await expect(navEl.getByRole("link", { name: "Projects" })).toBeVisible();
          await expect(navEl.getByRole("link", { name: "Records" })).toBeVisible();
        }
      } else {
        // Tablet/desktop: all links visible directly in the nav
        await expect(navEl.getByRole("link", { name: "Home" })).toBeVisible();
        await expect(navEl.getByRole("link", { name: "Blog" })).toBeVisible();
        await expect(navEl.getByRole("link", { name: "Music" })).toBeVisible();
        await expect(navEl.getByRole("link", { name: "Projects" })).toBeVisible();
        await expect(navEl.getByRole("link", { name: "Records" })).toBeVisible();
      }
    });
  }
});

test.describe("RL-03: prefers-reduced-motion suppresses animations", () => {
  test("Given reduced-motion preference, Then transition durations are minimal", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Find an element with a transition class (nav links have transition-colors)
    const navLink = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link").first();
    const transitionDuration = await navLink.evaluate((el) =>
      getComputedStyle(el).transitionDuration
    );
    // With reduced motion, duration should be 0.01ms (0.00001s)
    // browsers may return "0.00001s" or "0.01ms" — both indicate near-zero
    const durationMs = parseFloat(transitionDuration) * (transitionDuration.endsWith("ms") ? 1 : 1000);
    expect(durationMs).toBeLessThanOrEqual(1);
  });
});

test.describe("RL-04: Main content fills available width", () => {
  for (const vp of VIEWPORTS) {
    test(`Given viewport ${vp.label}, Then main content has no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const mainOverflow = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return false;
        return main.scrollWidth > main.clientWidth;
      });
      expect(mainOverflow).toBe(false);
    });
  }
});
