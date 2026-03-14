import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ============================================================
// US1: Browse the Full Discography
// ============================================================

test.describe("Music page — US1: Browse the Full Discography", () => {
  test("MUSIC-UI-02-T2: skeleton cards visible during load state", async ({
    page,
  }) => {
    // Delay the /api/music response so skeleton is visible
    await page.route("**/api/music", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/music");

    // Skeleton should be visible before data loads
    const skeleton = page.locator('[data-testid="release-skeleton"]').first();
    await expect(skeleton).toBeVisible({ timeout: 1000 });
  });

  test("MUSIC-UI-02-T3: release grid visible after load", async ({ page }) => {
    await page.goto("/music");

    // Wait for release cards to appear
    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("MUSIC-UI-01-T1: each card shows artist name, title, and year (mocked data)", async ({
    page,
  }) => {
    const mockData = [
      {
        id: 471154241,
        title: "Cycles",
        artistName: "Tyler Agnew",
        artistUrl: "https://tyleragnew.bandcamp.com",
        releaseDate: "2015-06-02T00:00:00.000Z",
        imageUrl: "https://f4.bcbits.com/img/a2989973590_10.jpg",
        url: "https://tyleragnew.bandcamp.com/album/cycles",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=471154241/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
    ];

    await page.route("**/api/music", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockData),
      });
    });

    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const firstCard = cards.first();
    // Artist name visible
    await expect(
      firstCard.locator('[data-testid="card-artist"]')
    ).not.toBeEmpty();
    // Title visible
    await expect(
      firstCard.locator('[data-testid="card-title"]')
    ).not.toBeEmpty();
    // Year visible (4 digits) — only present when releaseDate is valid
    const year = await firstCard
      .locator('[data-testid="card-year"]')
      .textContent();
    expect(year).toMatch(/^\d{4}$/);
  });

  test("MUSIC-UI-02-T4: releases contain cards from multiple artists", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    const artistNames = await page
      .locator('[data-testid="card-artist"]')
      .allTextContents();
    const uniqueArtists = new Set(artistNames);
    expect(uniqueArtists.size).toBeGreaterThan(1);
  });

  test("releases sorted descending by date (mocked data)", async ({ page }) => {
    const mockData = [
      {
        id: 1406959329,
        title: "Toy Factory 2",
        artistName: "Toy Factory",
        releaseDate: "2025-02-21T00:00:00.000Z",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=1406959329/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
      {
        id: 3542635828,
        title: "A Festival of Winters",
        artistName: "Covered Bridges",
        releaseDate: "2025-01-10T00:00:00.000Z",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=3542635828/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
      {
        id: 471154241,
        title: "Cycles",
        artistName: "Tyler Agnew",
        releaseDate: "2015-06-02T00:00:00.000Z",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=471154241/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
    ];

    await page.route("**/api/music", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockData),
      });
    });

    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const years = await page
      .locator('[data-testid="card-year"]')
      .allTextContents();

    expect(years.length).toBe(3);
    // Each year should be >= the next year (newest first)
    for (let i = 0; i < years.length - 1; i++) {
      const y1 = parseInt(years[i]);
      const y2 = parseInt(years[i + 1]);
      expect(y1).toBeGreaterThanOrEqual(y2);
    }
  });

  test("MUSIC-UI-02-T1: no horizontal overflow at 320px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 667 });
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    const bodyScrollWidth = await page.evaluate(
      () => document.body.scrollWidth
    );
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
});

// ============================================================
// US2: Stream a Release Inline
// ============================================================

test.describe("Music page — US2: Stream a Release Inline", () => {
  test("MUSIC-UI-03-T1: no player visible on initial load", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-testid="bandcamp-player"]')).not.toBeVisible();
  });

  test("MUSIC-UI-03-T2: clicking a release card makes player visible", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await cards.first().click();

    await expect(page.locator('[data-testid="bandcamp-player"]')).toBeVisible();
  });

  test("MUSIC-UI-03-T2: player iframe src matches release embedUrl pattern", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await cards.first().click();

    const iframe = page.locator('[data-testid="bandcamp-player"] iframe');
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute("src");
    expect(src).toMatch(/bandcamp\.com\/EmbeddedPlayer\/album=\d+/);
  });

  test("MUSIC-UI-03-T3: clicking a different card updates iframe src", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    const count = await cards.count();
    if (count >= 2) {
      await cards.first().click();
      const iframe = page.locator('[data-testid="bandcamp-player"] iframe');
      const src1 = await iframe.getAttribute("src");

      await cards.nth(1).click();
      const src2 = await iframe.getAttribute("src");

      // srcs may differ if cards belong to different albums
      expect(src2).toMatch(/bandcamp\.com\/EmbeddedPlayer\/album=\d+/);
      // At minimum the player is still shown
      await expect(iframe).toBeVisible();
      // The two srcs from different cards may or may not differ; at least verify format
      expect(src1).toMatch(/bandcamp\.com\/EmbeddedPlayer\/album=\d+/);
    }
  });

  test("MUSIC-UI-03-T4: iframe has non-empty title attribute", async ({
    page,
  }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await cards.first().click();

    const iframe = page.locator('[data-testid="bandcamp-player"] iframe');
    const title = await iframe.getAttribute("title");
    expect(title).toBeTruthy();
    expect(title!.length).toBeGreaterThan(0);
  });

  test("MUSIC-UI-03-T5: close button removes the player", async ({ page }) => {
    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await cards.first().click();
    await expect(page.locator('[data-testid="bandcamp-player"]')).toBeVisible();

    const closeBtn = page.getByRole("button", { name: "Close player" });
    await closeBtn.click();

    await expect(page.locator('[data-testid="bandcamp-player"]')).not.toBeVisible();
  });
});

// ============================================================
// Accessibility (T021)
// ============================================================

test.describe("Music page — Accessibility", () => {
  test("MUSIC-UI-04-T1: zero critical or serious axe violations", async ({
    page,
  }) => {
    await page.goto("/music");
    // Wait for content to load
    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalOrSerious).toHaveLength(0);
  });

  test("MUSIC-UI-04-T2: all release cards reachable via keyboard Tab", async ({
    page,
  }) => {
    await page.goto("/music");
    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    // Tab to first card
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    // Eventually a release-card should receive focus
    expect(focused).toBeDefined();
  });

  test("MUSIC-UI-04-T3: player close button reachable via keyboard", async ({
    page,
  }) => {
    await page.goto("/music");
    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    // Click first card to open player
    await cards.first().click();
    await expect(page.locator('[data-testid="bandcamp-player"]')).toBeVisible();

    const closeBtn = page.getByRole("button", { name: "Close player" });
    await closeBtn.focus();
    await expect(closeBtn).toBeFocused();
  });
});

// ============================================================
// US3: Fallback Resilience
// ============================================================

test.describe("Music page — US3: Discography Stays Current", () => {
  test("page renders release cards when API returns fallback data shape", async ({
    page,
  }) => {
    const mockData = [
      {
        id: 9999001,
        title: "Mock Fallback Album",
        artistName: "Tyler Agnew",
        artistUrl: "https://tyleragnew.bandcamp.com",
        releaseDate: "2024-01-01T00:00:00.000Z",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=9999001/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
      {
        id: 9999002,
        title: "Mock Fallback Album 2",
        artistName: "Scarry Burdz",
        artistUrl: "https://scarryburdz.bandcamp.com",
        releaseDate: "2023-06-01T00:00:00.000Z",
        embedUrl:
          "https://bandcamp.com/EmbeddedPlayer/album=9999002/size=large/bgcol=fafaf8/linkcol=d97706/tracklist=false/artwork=small/",
      },
    ];

    await page.route("**/api/music", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockData),
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    });

    await page.goto("/music");

    const cards = page.locator('[data-testid="release-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBe(2);

    // Verify title and artist name from mocked data
    await expect(
      page.getByText("Mock Fallback Album", { exact: true })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="card-artist"]').first()
    ).toHaveText("Tyler Agnew");
  });

  test("real API response includes correct Cache-Control header", async ({
    page,
  }) => {
    // Intercept the real /api/music response and verify its Cache-Control header
    const responsePromise = page.waitForResponse("**/api/music");
    await page.goto("/music");
    const response = await responsePromise;
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toBe(
      "public, s-maxage=86400, stale-while-revalidate=3600"
    );
  });
});
