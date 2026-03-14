import { test, expect } from "@playwright/test";

test.describe("E404-01: 404 returns HTTP 404 status", () => {
  test("Given user visits an unknown URL, Then HTTP status is 404", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});

test.describe("E404-02: Global layout intact on 404", () => {
  test("Given user visits an unknown URL, When page renders, Then header and footer are visible", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toBeVisible();
  });
});

test.describe("E404-03: Home link present on 404", () => {
  test("Given user is on a 404 page, When they click the home link, Then they navigate to /", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    // Scope to main content to avoid matching the nav "Home" link
    const main = page.locator("main");
    const homeLink = main.getByRole("link", { name: /home|go home|back/i });
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("E404-04: No stack trace visible on 404", () => {
  test("Given user visits an unknown URL, Then no error stack trace or internal message is visible", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    // Check visible text only (not RSC payload in script tags)
    const mainText = await page.locator("main").textContent();
    expect(mainText).not.toMatch(/Error:/);
    expect(mainText).not.toMatch(/at Object\./);
    expect(mainText).not.toMatch(/node_modules/);
  });
});
