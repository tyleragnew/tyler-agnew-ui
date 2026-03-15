# Implementation Plan: GitHub Actions CI Pipeline

**Branch**: `003-github-actions-ci` | **Date**: 2026-03-14 | **Spec**: `specs/003-github-actions-ci/spec.md`
**Input**: User request — create a GitHub Actions CI workflow with 3 phases: lint (+ build), unit tests, integration tests

## Summary

Add a `.github/workflows/ci.yml` file that runs three sequential jobs on every push and pull request: (1) lint + TypeScript build, (2) Vitest unit tests, (3) Playwright integration/E2E tests. This enforces quality gates defined in the constitution automatically on every code change.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax); Node.js 20 LTS
**Primary Dependencies**: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`, Playwright CLI for browser install
**Storage**: N/A
**Testing**: Vitest (unit), Playwright (E2E/integration)
**Target Platform**: GitHub Actions (`ubuntu-latest`)
**Project Type**: CI/CD configuration file
**Performance Goals**: Fast feedback — npm cache + Playwright browser cache to minimize cold-start time
**Constraints**: Playwright requires browsers installed; dev server must start before E2E tests run (handled by `webServer` in `playwright.config.ts`)
**Scale/Scope**: Single workflow file; runs on push to any branch and on pull_request

## Constitution Check

*Pre-Phase 0 gate evaluation:*

| Gate | Status | Notes |
|------|--------|-------|
| Gate 1 — Code Quality | ✅ PASS | The CI workflow enforces this gate — it runs `npm run lint`, `npm run lint:css`, and `npm run build` |
| Gate 2 — Tests | ✅ PASS | CI runs both unit (Vitest) and E2E (Playwright) test jobs |
| Gate 3 — Performance | N/A | CI config; no Lighthouse CI in scope for this feature |
| Gate 4 — UX Consistency | N/A | No UI components in this feature |
| Gate 5 — TDD/BDD Compliance | ✅ PASS | This is a configuration artifact, not a behavioral feature; no application logic is added; TDD cycle is not applicable |

**Complexity Tracking**: No violations — this is a single YAML file with no application logic.

## Project Structure

### Documentation (this feature)

```text
specs/003-github-actions-ci/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # N/A — no data entities; omitted
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A — no external interfaces; omitted
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── ci.yml           # The only deliverable
```

**Structure Decision**: Single-file delivery into `.github/workflows/ci.yml`. No source tree changes required.

## Phase 0: Research

See `research.md` for full findings. Key decisions:

- **Job dependency chain**: `lint → unit-test → integration-test` (sequential via `needs:`) to fail fast
- **Node.js caching**: `actions/setup-node` with `cache: 'npm'` for automatic dependency caching
- **Playwright browsers**: Cache `~/.cache/ms-playwright` keyed on Playwright version from `package-lock.json`
- **E2E server**: `playwright.config.ts` already has `webServer` configured; `npm run dev` starts automatically in the job
- **Branch trigger**: `push` + `pull_request` on all branches

## Phase 1: Design

### Workflow Job Design

**Job 1 — `lint`**
Runs on `ubuntu-latest`. Steps: checkout → setup-node (cache npm) → `npm ci` → `npm run lint` → `npm run lint:css` → `npm run build`

**Job 2 — `unit-test`**
Needs: `lint`. Runs on `ubuntu-latest`. Steps: checkout → setup-node (cache npm) → `npm ci` → `npm run test`

**Job 3 — `integration-test`**
Needs: `unit-test`. Runs on `ubuntu-latest`. Steps: checkout → setup-node (cache npm) → `npm ci` → restore Playwright browser cache → `npx playwright install --with-deps chromium` → `npm run test:e2e`

> Note: E2E runs only Chromium in CI (not Firefox/WebKit) to keep the pipeline fast. The `playwright.config.ts` multi-browser setup is preserved for local runs.

### Trigger Strategy

```yaml
on:
  push:
    branches: ['**']
  pull_request:
    branches: ['**']
```

This matches the constitution's requirement that `main` is always deployable and feature branches are short-lived.
