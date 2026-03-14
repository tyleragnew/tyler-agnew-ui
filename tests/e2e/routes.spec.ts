import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: "Tyler Agnew", title: "Tyler Agnew" },
  { path: "/blog", h1: "Blog", title: "Blog — Tyler Agnew" },
  { path: "/music", h1: "Music", title: "Music — Tyler Agnew" },
  { path: "/projects", h1: "Projects", title: "Projects — Tyler Agnew" },
  { path: "/records", h1: "Records", title: "Records — Tyler Agnew" },
];

test.describe("Route behavior: correct h1 and page title per route", () => {
  for (const route of ROUTES) {
    test(`Given user visits ${route.path}, Then h1 is "${route.h1}" and title is "${route.title}"`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        route.h1
      );
      await expect(page).toHaveTitle(route.title);
    });
  }
});

test.describe("404 route: unknown path", () => {
  test("Given user visits /does-not-exist, Then a not-found page renders", async ({
    page,
  }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Not Found — Tyler Agnew/i);
  });
});
