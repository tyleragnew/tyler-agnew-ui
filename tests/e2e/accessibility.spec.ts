import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/blog", "/music", "/projects", "/records", "/does-not-exist"];

test.describe("A11Y-01: Zero axe critical/serious violations on all routes", () => {
  for (const route of ROUTES) {
    test(`Given route ${route}, Then axe reports no critical or serious violations`, async ({
      page,
    }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const criticalOrSerious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );
      expect(criticalOrSerious).toEqual([]);
    });
  }
});

test.describe("A11Y-02: Single h1 per page", () => {
  for (const route of ROUTES.filter((r) => r !== "/does-not-exist")) {
    test(`Given route ${route}, Then exactly one h1 exists`, async ({ page }) => {
      await page.goto(route);
      const h1s = await page.locator("h1").count();
      expect(h1s).toBe(1);
    });
  }
});

test.describe("A11Y-06: Language attribute set", () => {
  test("Given any page, Then <html lang='en'> is present", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });
});
