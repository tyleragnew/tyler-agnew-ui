# Tasks: GitHub Actions CI Pipeline

**Input**: Design documents from `specs/003-github-actions-ci/`
**Prerequisites**: plan.md ✅, research.md ✅, quickstart.md ✅

**Note**: This feature delivers a single configuration file (`.github/workflows/ci.yml`). There are no user stories or application logic — tasks are organized by CI job phase as defined in `plan.md`.

## Format: `[ID] [P?] [Phase] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Phase]**: Which CI job phase this task belongs to (P1=lint, P2=unit-test, P3=integration-test)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the GitHub Actions directory structure and workflow file skeleton

- [x] T001 Create `.github/workflows/` directory and empty `ci.yml` file at `.github/workflows/ci.yml`
- [x] T002 Add workflow name, trigger block (`push` + `pull_request` on all branches), and top-level `jobs:` key to `.github/workflows/ci.yml`

---

## Phase 2: CI Job 1 — Lint + Build (Priority: P1) 🎯 First deliverable

**Goal**: Gate 1 enforcement — ESLint, Stylelint, and TypeScript build check on every push

**Independent Test**: Push a branch with a lint error and verify the job fails; fix it and verify it passes

### Implementation for Lint Phase

- [x] T003 [P1] Add the `lint` job to `.github/workflows/ci.yml`: `runs-on: ubuntu-latest`, steps for `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: 20` and `cache: 'npm'`, and `npm ci`
- [x] T004 [P1] Add lint steps to the `lint` job in `.github/workflows/ci.yml`: `npm run lint`, `npm run lint:css`, and `npm run build`

**Checkpoint**: `lint` job is complete and independently testable

---

## Phase 3: CI Job 2 — Unit Tests (Priority: P2)

**Goal**: Gate 2 unit-test enforcement — Vitest suite runs only after lint passes

**Independent Test**: Introduce a failing unit test, verify this job catches it; lint job should not re-run

### Implementation for Unit Test Phase

- [x] T005 [P2] Add the `unit-test` job to `.github/workflows/ci.yml`: `needs: lint`, `runs-on: ubuntu-latest`, steps for checkout, `actions/setup-node@v4` (node 20, npm cache), `npm ci`, and `npm run test`

**Checkpoint**: `unit-test` job is complete; full lint → unit pipeline now testable

---

## Phase 4: CI Job 3 — Integration Tests (Priority: P3)

**Goal**: Gate 2 E2E enforcement — Playwright Chromium tests run only after unit tests pass, with browser caching

**Independent Test**: Introduce a failing E2E test, verify this job catches it; earlier jobs should not re-run

### Implementation for Integration Test Phase

- [x] T006 [P3] Add the `integration-test` job to `.github/workflows/ci.yml`: `needs: unit-test`, `runs-on: ubuntu-latest`, steps for checkout and `actions/setup-node@v4` (node 20, npm cache), and `npm ci`
- [x] T007 [P3] Add Playwright browser cache step to `integration-test` in `.github/workflows/ci.yml`: `actions/cache@v4` with `path: ~/.cache/ms-playwright` and key `${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`
- [x] T008 [P3] Add browser install and test steps to `integration-test` in `.github/workflows/ci.yml`: `npx playwright install --with-deps chromium` and `npm run test:e2e`

**Checkpoint**: Full 3-job pipeline is complete and runnable end-to-end

---

## Phase 5: Polish & Validation

**Purpose**: Final checks and cross-cutting quality

- [x] T009 [P] Validate YAML syntax of `.github/workflows/ci.yml` (e.g., paste into https://yaml-online-parser.appspot.com or run `npx js-yaml .github/workflows/ci.yml`)
- [x] T010 Add a `name:` field to each job step in `.github/workflows/ci.yml` for readable CI logs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Lint Job)**: Depends on Phase 1 — builds the first job
- **Phase 3 (Unit Job)**: Depends on Phase 2 — adds `needs: lint`
- **Phase 4 (Integration Job)**: Depends on Phase 3 — adds `needs: unit-test`
- **Phase 5 (Polish)**: Depends on all jobs being in the file

### Task Dependencies (within phases)

- T003 before T004 (job skeleton before adding steps)
- T006 before T007 before T008 (job scaffold → cache step → run step)
- T001 before everything (file must exist)

### Parallel Opportunities

- T003 and T004 are sequential (same job build-up), but Phases 2–4 each target the same single file, so only one phase is worked at a time
- T009 and T010 in Phase 5 can run in parallel

---

## Implementation Strategy

### MVP First (Lint Job Only)

1. Complete Phase 1: Create the file
2. Complete Phase 2: Add the `lint` job
3. **STOP and VALIDATE**: Push to GitHub, verify lint job runs and passes

### Incremental Delivery

1. Phase 1 + Phase 2 → Lint CI live
2. Add Phase 3 → Unit test CI live
3. Add Phase 4 → Full 3-job pipeline live
4. Phase 5 → Polished, named steps

---

## Notes

- All tasks modify the single file `.github/workflows/ci.yml`
- No application source code changes required
- Playwright `webServer` in `playwright.config.ts` starts the dev server automatically — no manual server step needed in the integration job
- Chromium-only in CI is intentional; all 3 browsers still run locally
