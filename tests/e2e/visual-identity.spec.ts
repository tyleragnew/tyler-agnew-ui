import { test, expect } from "@playwright/test";

const ALL_ROUTES = ["/", "/blog", "/music", "/projects", "/records", "/does-not-exist"];

test.describe("GL-01–04: Global layout invariants", () => {
  for (const route of ALL_ROUTES) {
    test(`Given route ${route}, Then header, footer, nav, and site name are all present`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" })
      ).toBeVisible();
      await expect(
        page.locator("header").getByText("Tyler Agnew")
      ).toBeVisible();
    });
  }
});

test.describe("GL-05–06: CSS custom properties from design tokens", () => {
  test("Given any page, Then font CSS variables are defined on <html>", async ({
    page,
  }) => {
    await page.goto("/");
    const fontDisplay = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--font-display"
      )
    );
    const fontBody = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--font-body")
    );
    expect(fontDisplay.trim()).not.toBe("");
    expect(fontBody.trim()).not.toBe("");
  });

  test("Given any page, Then background color matches design token #fafaf8", async ({
    page,
  }) => {
    await page.goto("/");
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-background"
      )
    );
    expect(bg.trim().toLowerCase()).toBe("#fafaf8");
  });
});

test.describe("Typography: display vs body font distinction", () => {
  test("Given any page, Then --font-milker CSS variable is set on <html>", async ({
    page,
  }) => {
    await page.goto("/");
    const milker = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--font-milker")
    );
    expect(milker.trim()).not.toBe("");
  });
});
