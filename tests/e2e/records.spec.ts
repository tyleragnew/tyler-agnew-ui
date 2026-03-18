import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ============================================================
// US1: Recent Additions
// ============================================================

test.describe("Records page — US1: Recent Additions", () => {
  test("Given user is on /records, When page loads, Then 5 record cards are visible", async ({
    page,
  }) => {
    await page.goto("/records");

    const cards = page.locator('[data-testid="record-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("Given user is on /records, When page loads, Then each card shows artist name and title", async ({
    page,
  }) => {
    await page.goto("/records");

    const firstCard = page.locator('[data-testid="record-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Each card should have an artist name and title (non-empty text nodes)
    const artistEl = firstCard.locator('[data-testid="record-artist"]');
    const titleEl = firstCard.locator('[data-testid="record-title"]');
    await expect(artistEl).toBeVisible();
    await expect(titleEl).toBeVisible();
  });

  test("Given user is on /records, When clicking View on Discogs, Then link opens to Discogs collection", async ({
    page,
  }) => {
    await page.goto("/records");
    await expect(page.locator('[data-testid="record-card"]').first()).toBeVisible({ timeout: 10000 });

    const discogsLink = page.getByRole("link", { name: /view on discogs/i });
    await expect(discogsLink).toBeVisible();
    await expect(discogsLink).toHaveAttribute(
      "href",
      "https://www.discogs.com/user/Tagnuisance/collection"
    );
  });

  test("Given user is on /records, When clicking a record card, Then it links to Discogs release page", async ({
    page,
  }) => {
    await page.goto("/records");
    const firstCard = page.locator('[data-testid="record-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    const href = await firstCard.getAttribute("href");
    expect(href).toMatch(/^https:\/\/www\.discogs\.com\/release\/\d+/);
  });
});

// ============================================================
// US2: Collection Growth Chart
// ============================================================

test.describe("Records page — US2: Collection Growth Chart", () => {
  test("Given user is on /records, When chart section is visible, Then a chart container is rendered", async ({
    page,
  }) => {
    await page.goto("/records");

    const chart = page.locator('[data-testid="collection-chart"]');
    await expect(chart).toBeVisible({ timeout: 15000 });
  });

  test("Given user is on /records, When chart loads, Then total count stat is displayed", async ({
    page,
  }) => {
    await page.goto("/records");

    const stat = page.getByText(/records in collection/i);
    await expect(stat).toBeVisible({ timeout: 15000 });
  });
});

// ============================================================
// US3: Records Page Navigation
// ============================================================

test.describe("Records page — US3: Navigation", () => {
  test("Given user is on the site, When navigating to /records via nav, Then both sections are visible", async ({
    page,
  }) => {
    await page.goto("/");

    const recordsLink = page.locator("nav").getByRole("link", { name: "Records", exact: true });
    await expect(recordsLink).toBeVisible();
    await recordsLink.click();

    await expect(page).toHaveURL(/\/records/);

    const heading = page.getByRole("heading", { name: /recently added/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});

// ============================================================
// Accessibility
// ============================================================

test.describe("Records page — Accessibility", () => {
  test("passes axe accessibility checks", async ({ page }) => {
    await page.goto("/records");
    await expect(
      page.locator('[data-testid="record-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
