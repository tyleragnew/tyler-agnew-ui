# Quickstart: GitHub Actions CI Pipeline

**Feature**: 003-github-actions-ci

## What gets created

One file: `.github/workflows/ci.yml`

## What it does

On every `push` or `pull_request` to any branch, three jobs run in order:

| Phase | Job | What it runs |
|-------|-----|--------------|
| 1 | `lint` | `npm run lint` + `npm run lint:css` + `npm run build` |
| 2 | `unit-test` | `npm run test` (Vitest) |
| 3 | `integration-test` | `npm run test:e2e` (Playwright, Chromium only) |

Each phase waits for the previous to pass before running.

## How to verify locally (before pushing)

```bash
# Lint phase
npm run lint && npm run lint:css && npm run build

# Unit phase
npm run test

# Integration phase (starts dev server automatically)
npm run test:e2e
```

## Playwright browser note

CI installs Chromium only. Local runs still execute all three browsers (Chrome, Firefox, Safari) as configured in `playwright.config.ts`.

## Cache behavior

- npm dependencies: cached via `actions/setup-node` (busts on `package-lock.json` change)
- Playwright browsers: cached in `~/.cache/ms-playwright` (busts on `package-lock.json` change)
