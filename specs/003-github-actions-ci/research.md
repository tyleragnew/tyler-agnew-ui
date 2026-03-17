# Research: GitHub Actions CI Pipeline

**Feature**: 003-github-actions-ci | **Date**: 2026-03-14

## Decision Log

### 1. Node.js dependency caching

**Decision**: Use `actions/setup-node@v4` with `cache: 'npm'`
**Rationale**: Built-in caching in `setup-node` automatically caches `~/.npm` keyed on `package-lock.json` hash. Eliminates the need for a separate `actions/cache` step for npm.
**Alternatives considered**: Manual `actions/cache` step — more verbose with no added benefit when using npm.

---

### 2. Playwright browser caching

**Decision**: Use `actions/cache@v4` to cache `~/.cache/ms-playwright`, keyed on `${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`
**Rationale**: Browser binaries are large (~300MB); caching them cuts the integration job install time significantly. Cache key includes the lock file so the cache busts automatically when Playwright version changes.
**Alternatives considered**: No cache (re-download every run) — too slow; caching only by OS — risk of stale binaries on version upgrade.

---

### 3. Browser scope for E2E in CI

**Decision**: Install and run only Chromium in CI (`npx playwright install --with-deps chromium`)
**Rationale**: The Playwright config already runs all 3 browsers locally. Running all 3 in CI triples E2E time and cost with minimal additional coverage for a personal site. Chromium is the highest-fidelity representation of the target audience.
**Alternatives considered**: All browsers — retained for local dev; running in parallel matrix jobs — over-engineered for a personal site.

---

### 4. Job ordering strategy

**Decision**: Sequential via `needs:` — `lint → unit-test → integration-test`
**Rationale**: Fail-fast — no point running tests if the build is broken. Constitution's Gate 1 must pass before Gate 2, which must pass before the full E2E suite.
**Alternatives considered**: Fully parallel jobs — wastes runner minutes when lint fails; lint + unit parallel, then integration — marginal gain, adds complexity.

---

### 5. Trigger configuration

**Decision**: `push` on all branches + `pull_request` on all branches
**Rationale**: Every branch push gets CI coverage, matching the constitution's requirement for `main` to always be deployable and short-lived feature branches to be validated immediately.
**Alternatives considered**: Only on `main` and PRs — insufficient for the short-lived branch workflow; only on PR — misses direct push to main.

---

### 6. Dev server for Playwright

**Decision**: Let `playwright.config.ts`'s built-in `webServer` block handle it (no additional CI step needed)
**Rationale**: The existing config already runs `npm run dev` and waits for `http://localhost:3000` before tests begin. `reuseExistingServer: !process.env.CI` ensures a fresh server is always started in CI.
**Alternatives considered**: Manual `npx next dev &` before test step — redundant and fragile vs. the built-in mechanism.

---

### 7. Node.js version

**Decision**: Node.js 20 LTS
**Rationale**: Current LTS; matches `@types/node: ^20` in `package.json` devDependencies. Next.js 15 and Vitest 4 are both compatible.
**Alternatives considered**: Node 22 — not yet LTS at time of writing; Node 18 — approaching EOL.

---

## Open Questions

None — all decisions resolved above.
