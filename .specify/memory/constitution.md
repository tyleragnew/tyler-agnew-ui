<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Modified principles:
  - II. Testing Standards → II. Test-Driven & Behavioral-Driven Development
    (MAJOR: renamed; non-negotiable rules fundamentally changed — TDD is now the
    primary development methodology; tests MUST be written and confirmed failing
    before any implementation code; BDD Given/When/Then scenarios are mandatory
    design artifacts, not optional documentation)
Added sections:
  - V. Modern Frontend Standards (new principle)
  - 12-Factor App Standards subsection in Development Standards
  - Gate 5 — TDD/BDD Compliance (new quality gate)
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/tasks-template.md — Test tasks changed from OPTIONAL to
     MANDATORY; TDD Red-Green-Refactor order enforced in task sequencing
  ✅ .specify/templates/plan-template.md — Constitution Check gates updated to
     reflect Gate 5
  ✅ .specify/templates/spec-template.md — BDD scenarios already use Given/When/Then;
     added note that acceptance scenarios are mandatory TDD inputs, not optional
Follow-up TODOs: None — all placeholders resolved.
-->

# Tyler Agnew Site Constitution

## Core Principles

### I. Code Quality

Every line of code MUST be written for long-term maintainability, not short-term convenience.

- Components MUST have a single, clearly stated responsibility.
- Functions and components MUST be named to describe what they do, not how.
- Code MUST be readable without inline comments — if a comment is needed to explain
  logic, the logic MUST be refactored first.
- Duplication MUST be eliminated at the second occurrence; the third is never acceptable.
- Dead code, unused imports, and commented-out blocks MUST be removed before merging.
- All code MUST pass linting and formatting checks (no warnings suppressed without
  documented justification).

### II. Test-Driven & Behavioral-Driven Development (NON-NEGOTIABLE)

All software behavior MUST be specified and proven before implementation begins.
TDD and BDD are the primary design methodology, not a post-implementation step.

- Every feature MUST begin with BDD acceptance scenarios written in Given-When-Then
  format before any feature code is written. These scenarios are the authoritative
  specification and MUST be committed first.
- All implementation MUST follow the TDD Red-Green-Refactor cycle: write a failing
  test, make it pass with the minimum viable code, then refactor — in that order,
  no exceptions.
- Tests are NOT optional. They are a first-class deliverable; test files MUST be
  committed and confirmed failing before any implementation code is added.
- Unit tests MUST cover all non-trivial business logic and utility functions.
- Every user-facing feature MUST have at least one end-to-end acceptance test covering
  the primary happy path, derived directly from the BDD scenarios in the spec.
- Tests MUST be deterministic — flaky tests MUST be fixed or removed immediately.
- Test coverage MUST not regress; new code paths MUST include corresponding tests.
- Tests MUST run in under 60 seconds locally for the full suite; individual unit tests
  MUST complete in under 100ms.
- Mocks and stubs MUST only be used at system boundaries (external APIs, third-party
  services); internal logic MUST be tested with real implementations.

### III. User Experience Consistency

Every user-facing surface MUST feel like it belongs to the same product.

- Design tokens (colors, spacing, typography) MUST be sourced from a single shared
  definition — hardcoded values are not permitted.
- Interactive elements (buttons, links, forms) MUST follow consistent behavior patterns
  across the entire site.
- All pages MUST be fully responsive across mobile (320px+), tablet (768px+), and
  desktop (1280px+) breakpoints.
- Accessibility MUST meet WCAG 2.1 AA as a minimum; semantic HTML and ARIA labels
  are non-negotiable where applicable.
- Animations and transitions MUST respect `prefers-reduced-motion` and MUST NOT be
  the sole mechanism for communicating state changes.

### IV. Performance Requirements

The site MUST feel fast on real-world devices and connections.

- Core Web Vitals MUST meet "Good" thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Total page weight for any route MUST not exceed 500KB (uncompressed) without
  documented justification.
- Images MUST be served in modern formats (WebP/AVIF) with explicit `width` and
  `height` attributes to prevent layout shift.
- JavaScript MUST be code-split per route; no page MUST load JS it does not need.
- Third-party scripts MUST be audited before addition; each MUST be justified by a
  measurable user benefit and MUST NOT block the critical rendering path.

### V. Modern Frontend Standards

Frontend code MUST use current, actively-maintained tooling and follow established
component-driven patterns.

- The frontend MUST be written in TypeScript; plain JavaScript is not acceptable for
  new production code.
- Components MUST follow a component-driven architecture (atomic or feature-based)
  with clear separation of UI, state, and business logic.
- Build tooling MUST use a modern bundler (e.g., Vite, esbuild, or equivalent) that
  supports tree-shaking and route-level code-splitting.
- CSS MUST be written using a utility-first or CSS-in-JS approach consistent across
  the project; global styles are limited to design tokens and resets only.
- Third-party libraries MUST be evaluated for bundle size, active maintenance, and
  community adoption before adoption; each addition requires a brief justification.
- The chosen framework and tooling MUST be current-generation; deprecated or
  end-of-life libraries are not permitted in the critical path.

## Development Standards

Guidelines that apply to all work across every feature.

- The `main` branch MUST always be in a deployable state.
- Feature work MUST be done in short-lived branches (target: merged within 3 days).
- Commits MUST be atomic and their messages MUST describe the intent, not the diff.
- Dependencies MUST be kept up to date; stale major versions require a documented
  upgrade plan.

### 12-Factor App Standards

This project MUST follow 12-Factor App methodology where applicable:

- **Config**: All environment-specific values (API keys, URLs, feature flags, secrets)
  MUST be stored in environment variables — nothing environment-specific in source code.
- **Dependencies**: All dependencies MUST be explicitly declared in a manifest and
  isolated per project; no reliance on system-wide packages.
- **Build / Release / Run**: Build, release, and run stages MUST be strictly separated.
  The build artifact MUST be immutable once produced; environment config is injected
  at release time.
- **Processes**: The application MUST be designed as stateless processes. Any persistent
  state MUST reside in backing services, not in process memory.
- **Disposability**: The application MUST start fast (target: under 5 seconds) and
  handle graceful shutdown — in-flight requests completed, resources released cleanly.
- **Dev/Prod Parity**: Development, staging, and production environments MUST be kept
  as similar as possible to prevent environment-specific bugs.
- **Logs**: Application logs MUST be treated as event streams written to stdout. Log
  routing, aggregation, and storage are infrastructure concerns, not application concerns.

## Quality Gates

Gates that MUST pass before any feature is considered complete.

- **Gate 1 — Code Quality**: Linter passes with zero warnings; no dead code present.
- **Gate 2 — Tests**: All tests pass; no coverage regression from the prior baseline.
- **Gate 3 — Performance**: Lighthouse CI score ≥ 90 on Performance, Accessibility,
  and Best Practices for affected routes.
- **Gate 4 — UX Consistency**: Design token audit passes; responsive layout verified
  at all three breakpoints; accessibility scan clean (axe or equivalent).
- **Gate 5 — TDD/BDD Compliance**: BDD Given-When-Then scenarios committed before
  implementation; all test files committed and confirmed failing before feature code
  is added; Red-Green-Refactor cycle evidenced in commit history.

## Governance

- This constitution supersedes all other team practices and informal conventions.
- All PRs MUST include a brief Constitution Check noting which gates were verified.
- Amendments require: (1) documented rationale, (2) version bump per semver rules
  below, (3) update to this file and any affected templates.
- **Versioning policy**:
  - MAJOR: Principle removed, renamed, or its non-negotiable rules fundamentally changed.
  - MINOR: New principle or section added; material expansion of existing guidance.
  - PATCH: Clarification, wording fix, or non-semantic refinement.
- Complexity that violates a principle MUST be justified in the plan's Complexity
  Tracking table before work begins.

**Version**: 2.0.0 | **Ratified**: 2026-03-14 | **Last Amended**: 2026-03-14
