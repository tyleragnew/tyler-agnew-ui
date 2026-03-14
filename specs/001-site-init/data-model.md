# Data Model: Site Foundation & Navigation (001-site-init)

**Date**: 2026-03-14
**Branch**: `001-site-init`

---

## Overview

The site foundation has no persistent data store (no database, no CMS in this phase).
All entities in this document describe **structural/configuration data** — defined in
code and configuration files — that shape how the site is rendered and navigated.

---

## Entity: Route

A distinct addressable page in the site. Each route is a combination of a URL path,
display name, and nav position.

| Field | Type | Constraints |
|-------|------|-------------|
| `path` | string | Unique; one of `/`, `/blog`, `/music`, `/projects`, `/records` |
| `label` | string | Human-readable nav label; displayed in navigation |
| `description` | string | One-sentence section description shown on placeholder pages |
| `navOrder` | number | Integer, 1–5; determines left-to-right nav item order |
| `isActive` | boolean (runtime) | True when current URL matches this route's path |

**Validation rules**:
- `path` MUST begin with `/`
- `label` MUST be non-empty; max 20 characters
- `navOrder` MUST be unique across all routes; values 1–5

**Defined routes** (static, no dynamic generation in this phase):

| path | label | navOrder |
|------|-------|----------|
| `/` | Home | 1 |
| `/blog` | Blog | 2 |
| `/music` | Music | 3 |
| `/projects` | Projects | 4 |
| `/records` | Records | 5 |

---

## Entity: DesignToken

A named, typed value in the design system. Tokens are defined once in `globals.css`
inside the Tailwind `@theme {}` block and referenced everywhere else symbolically.

**Token categories**:

### Color Tokens

| Token name | Value | Semantic role |
|------------|-------|---------------|
| `--color-background` | `#FAFAF8` | Page background (warm white) |
| `--color-surface` | `#FFFFFF` | Cards and elevated surfaces |
| `--color-text-primary` | `#111110` | Body copy and primary headings |
| `--color-text-secondary` | `#6B6B67` | Captions, metadata, secondary text |
| `--color-accent` | `#D97706` | Interactive elements, highlights |
| `--color-accent-hover` | `#B45309` | Accent on hover/focus |
| `--color-border` | `#E5E5E3` | Borders and horizontal dividers |

### Typography Tokens

| Token name | Value | Role |
|------------|-------|------|
| `--font-display` | `var(--font-milker)` | Headings, site name, section titles |
| `--font-body` | `var(--font-geist)` | Body copy, nav, UI labels |
| `--font-mono` | `var(--font-geist-mono)` | Code blocks, technical accents |

### Spacing Tokens

Tailwind v4 inherits a default spacing scale (4px base). No custom spacing tokens are
added in this phase — the default 4px grid (`space-1` = 4px through `space-96` = 384px)
is sufficient for the foundation.

**Validation rules**:
- Every color used in any component MUST reference a color token (`var(--color-*)`)
  — hardcoded hex values MUST NOT appear outside `globals.css`.
- Every font-family declaration MUST reference a typography token.

---

## Entity: GlobalLayout

The shared wrapper applied to every page. Defines the visual chrome that is consistent
across all routes.

| Field | Type | Description |
|-------|------|-------------|
| `header` | Header component | Site name + navigation |
| `mainContent` | React slot (children) | Page-specific content area |
| `footer` | Footer component | Attribution and minimal links |
| `fontVariables` | CSS class string | Injects font CSS variables into `<html>` |
| `colorScheme` | `'light'` | Fixed to light mode in this phase |

**Constraints**:
- Layout MUST NOT impose a max-width on the `<body>` — each page/section manages
  its own content width.
- `fontVariables` MUST be applied to the `<html>` element to make CSS custom properties
  available globally.

---

## Entity: NavigationItem

A single item in the global navigation. Derived from Route at render time.

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Display name from Route.label |
| `href` | string | URL path from Route.path |
| `isActive` | boolean | True when href matches current pathname |

**State transitions**:
```
INACTIVE → ACTIVE  (when user navigates to this route's path)
ACTIVE → INACTIVE  (when user navigates away)
```

**Accessibility requirements**:
- Active item MUST have `aria-current="page"` attribute.
- Navigation landmark MUST use `<nav>` element with `aria-label="Main navigation"`.
- Each link MUST have a visible focus ring meeting 3:1 contrast against its background.

---

## Entity: PlaceholderPage

Each non-home section renders a placeholder in this phase (real content added in later
feature branches). A placeholder page communicates the section's purpose.

| Field | Type | Description |
|-------|------|-------------|
| `sectionName` | string | Display name of the section (e.g., "Blog") |
| `sectionDescription` | string | One paragraph describing what will be here |
| `sectionPath` | string | URL path for this section |
| `comingSoon` | boolean | Whether to show a "coming soon" indicator |

---

## Entity: HomePage

The root `/` page. Different from a placeholder — it presents Tyler's identity and
provides entry points to all sections.

| Field | Type | Description |
|-------|------|-------------|
| `ownerName` | string | "Tyler Agnew" — displayed as primary heading |
| `tagline` | string | One-line description of Tyler and the site's purpose |
| `sectionLinks` | NavigationItem[] | Links to all five sections with brief descriptions |

**Content values** (static, defined in source):
- `ownerName`: "Tyler Agnew"
- `tagline`: To be finalized during implementation (something establishing the
  software engineer + musician dual identity)

---

## Entity: ErrorPage (404)

Displayed when no matching route is found.

| Field | Type | Description |
|-------|------|-------------|
| `errorCode` | `404` | HTTP status code |
| `message` | string | User-friendly "page not found" message |
| `homeLink` | NavigationItem | Link back to `/` |

**Constraints**:
- MUST render with the full GlobalLayout (header + footer) intact.
- MUST NOT expose internal error details to the visitor.

---

## Relationships

```
GlobalLayout
  ├── Header
  │     └── NavigationItem[] (derived from Route[])
  ├── mainContent (children)
  │     ├── HomePage (path: /)
  │     ├── PlaceholderPage × 4 (blog, music, projects, records)
  │     └── ErrorPage (404)
  └── Footer

DesignToken (singleton config)
  └── referenced by all components via CSS custom properties
```
