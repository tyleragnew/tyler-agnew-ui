# UI Contracts: Site Foundation & Navigation (001-site-init)

**Date**: 2026-03-14
**Branch**: `001-site-init`

These contracts define the observable behavior of each UI surface from the outside.
They are the basis for Playwright BDD acceptance tests — each contract maps directly
to one or more Given/When/Then test scenarios.

---

## Contract: GlobalLayout

**Description**: Every page on the site MUST render within the global layout wrapper.

### Invariants (always true on any route)

| # | Invariant | Testable via |
|---|-----------|--------------|
| GL-01 | A `<header>` element is present | DOM query |
| GL-02 | A `<footer>` element is present | DOM query |
| GL-03 | A `<nav aria-label="Main navigation">` is present inside the header | DOM query |
| GL-04 | The site name "Tyler Agnew" is visible in the header | Text content check |
| GL-05 | Font CSS variables `--font-display`, `--font-body`, `--font-mono` are defined on `<html>` | CSS property check |
| GL-06 | Background color matches `--color-background` (`#FAFAF8`) | CSS computed style |

---

## Contract: Navigation

**Description**: The global navigation exposes all five sections and communicates the active route.

### Behavior

| # | Given | When | Then | Test ID |
|---|-------|------|------|---------|
| NAV-01 | Any page is loaded | User views the nav | All five labels are visible: Home, Blog, Music, Projects, Records | `navigation.spec.ts` |
| NAV-02 | User is on the home page (`/`) | Nav renders | The "Home" link has `aria-current="page"` | `navigation.spec.ts` |
| NAV-03 | User is on `/blog` | Nav renders | The "Blog" link has `aria-current="page"` | `navigation.spec.ts` |
| NAV-04 | User is on `/music` | Nav renders | The "Music" link has `aria-current="page"` | `navigation.spec.ts` |
| NAV-05 | User is on `/projects` | Nav renders | The "Projects" link has `aria-current="page"` | `navigation.spec.ts` |
| NAV-06 | User is on `/records` | Nav renders | The "Records" link has `aria-current="page"` | `navigation.spec.ts` |
| NAV-07 | User is on any page | User clicks any nav link | Browser navigates to the correct route with no error | `navigation.spec.ts` |
| NAV-08 | Any page is loaded | User tabs through nav | Focus ring is visible on each nav link | `navigation.spec.ts` |

### Accessibility invariants

| # | Requirement | WCAG criterion |
|---|-------------|----------------|
| NAV-A01 | `<nav>` has `aria-label="Main navigation"` | 4.1.2 Name, Role, Value |
| NAV-A02 | Active nav item has `aria-current="page"` | 4.1.2 |
| NAV-A03 | All nav links have visible focus indicators (≥ 3:1 contrast) | 2.4.7 Focus Visible |

---

## Contract: Responsive Layout

**Description**: Every page adapts correctly to three defined breakpoints.

| # | Given | When | Then |
|---|-------|------|------|
| RL-01 | Viewport is 320px wide | Any page is visited | No horizontal scrollbar; all nav links accessible |
| RL-02 | Viewport is 768px wide | Any page is visited | Layout adapts; no horizontal scrollbar |
| RL-03 | Viewport is 1280px wide | Any page is visited | Content is contained within max-width; comfortable margins |
| RL-04 | Viewport is 320px wide | User interacts with nav | All navigation items remain accessible (collapsed or visible) |
| RL-05 | Any viewport | User has `prefers-reduced-motion: reduce` | No CSS transitions or keyframe animations fire |

---

## Contract: Route Behavior

**Description**: Each route renders the correct content.

| Route | Expected `<h1>` content | Page title (`<title>`) |
|-------|------------------------|------------------------|
| `/` | "Tyler Agnew" (or equivalent primary heading) | "Tyler Agnew" |
| `/blog` | "Blog" | "Blog — Tyler Agnew" |
| `/music` | "Music" | "Music — Tyler Agnew" |
| `/projects` | "Projects" | "Projects — Tyler Agnew" |
| `/records` | "Records" | "Records — Tyler Agnew" |
| (unknown path) | Custom 404 message | "Not Found — Tyler Agnew" |

---

## Contract: 404 Page

| # | Given | When | Then |
|---|-------|------|------|
| E404-01 | User visits `/anything-unknown` | Page renders | HTTP status is 404 |
| E404-02 | User visits `/anything-unknown` | Page renders | GlobalLayout is intact (header + nav + footer visible) |
| E404-03 | User visits `/anything-unknown` | Page renders | A link to `/` (Home) is present and functional |
| E404-04 | User visits `/anything-unknown` | Page renders | No stack trace or internal error message is visible |

---

## Contract: Design Token Enforcement

**Description**: All color and font values reference design tokens — no hardcoded values.

| # | Rule | Enforcement mechanism |
|---|------|-----------------------|
| DT-01 | No hardcoded hex color values outside `app/globals.css` | Stylelint rule |
| DT-02 | No hardcoded `font-family` strings outside `app/globals.css` | Stylelint rule |
| DT-03 | All interactive elements use `--color-accent` or `--color-text-primary` | Visual audit + Stylelint |
| DT-04 | Text contrast ratio ≥ 4.5:1 for normal text (primary text on background) | axe-core automated scan |
| DT-05 | Text contrast ratio ≥ 3:1 for large/bold text (accent on background) | axe-core automated scan |

**Computed contrast ratios** (based on chosen palette):
- `--color-text-primary` (#111110) on `--color-background` (#FAFAF8): ~17:1 ✅
- `--color-text-secondary` (#6B6B67) on `--color-background` (#FAFAF8): ~5.5:1 ✅
- `--color-accent` (#D97706) on `--color-background` (#FAFAF8): ~3.2:1 (acceptable
  for large/bold interactive elements; MUST NOT be used for body copy)

---

## Contract: Accessibility (WCAG 2.1 AA)

Summary of mandatory accessibility requirements verified in every Playwright test run.

| # | Requirement | WCAG criterion |
|---|-------------|----------------|
| A11Y-01 | No axe-core critical or serious violations on any route | WCAG 2.1 AA (automated) |
| A11Y-02 | Each page has a single `<h1>` matching the route content | 1.3.1 Info and Relationships |
| A11Y-03 | Heading hierarchy is logical (no skipped levels) | 1.3.1 |
| A11Y-04 | All images have meaningful `alt` attributes (or `alt=""` if decorative) | 1.1.1 Non-text Content |
| A11Y-05 | All interactive elements are keyboard reachable and operable | 2.1.1 Keyboard |
| A11Y-06 | Page language is set (`<html lang="en">`) | 3.1.1 Language of Page |
