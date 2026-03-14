# Quickstart: Site Foundation & Navigation (001-site-init)

**Purpose**: Step-by-step validation guide. After implementation, run these steps in
order to confirm the feature is complete and all contracts are satisfied.

---

## Prerequisites

- Node.js ≥ 20 installed
- Repository cloned, on branch `001-site-init`
- Dependencies installed: `npm install`

---

## Step 1: Run the full test suite (TDD/BDD gate)

```bash
# Unit tests (Vitest)
npm run test

# E2E acceptance tests (Playwright)
npm run test:e2e
```

**Expected**: All tests pass. Zero failures. No skipped tests.

**TDD compliance check**: Confirm in git history that test files were committed
before their corresponding implementation files (Red-Green-Refactor cycle).

---

## Step 2: Start the dev server and verify routing

```bash
npm run dev
```

Visit each route and confirm the page renders without error:

| URL | Expected heading | Nav item active |
|-----|-----------------|-----------------|
| `http://localhost:3000/` | Tyler Agnew | Home |
| `http://localhost:3000/blog` | Blog | Blog |
| `http://localhost:3000/music` | Music | Music |
| `http://localhost:3000/projects` | Projects | Projects |
| `http://localhost:3000/records` | Records | Records |
| `http://localhost:3000/does-not-exist` | (404 message) | (none active) |

---

## Step 3: Verify design token enforcement

```bash
# Lint for hardcoded values
npm run lint
npm run lint:css
```

**Expected**: Zero warnings or errors. No hardcoded hex values or font-family strings
outside `app/globals.css`.

Open browser DevTools → Console. Run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--color-background')
// Expected: " #FAFAF8" (or equivalent)

getComputedStyle(document.documentElement).getPropertyValue('--font-display')
// Expected: non-empty string (the Milker font family)
```

---

## Step 4: Responsive layout check

Resize browser (or use DevTools device toolbar) to each breakpoint:

| Width | Check |
|-------|-------|
| 320px | No horizontal scroll; nav accessible; text not clipped |
| 768px | Layout adapts; no overflow |
| 1280px | Content centered with margins; comfortable reading width |

---

## Step 5: Accessibility audit

```bash
# Run axe-core via Playwright (included in E2E suite)
npm run test:e2e -- --grep "accessibility"
```

Alternatively, open each route in Chrome and run Lighthouse:

```
Lighthouse → Accessibility score ≥ 90 on all routes
```

Manual checks:
- [ ] Tab through the page — every interactive element receives visible focus
- [ ] Screen reader (NVDA/VoiceOver) announces nav landmark and active link correctly
- [ ] Active nav link has `aria-current="page"` (inspect element)

---

## Step 6: Performance audit

```bash
npm run build
npm run start
```

Run Lighthouse against `http://localhost:3000/`:

```
Target: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90
Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1
```

---

## Step 7: Reduced-motion verification

In browser DevTools → Rendering → Enable "Emulate CSS media feature prefers-reduced-motion".

Reload each page. **Expected**: No animations or transitions fire; state changes are
instant.

---

## Step 8: TypeScript build check

```bash
npm run build
```

**Expected**: Zero TypeScript errors. Build completes successfully.

---

## Done ✓

If all steps pass:
- All five routes render correctly
- Navigation active state works
- 404 page displays with layout intact
- Design tokens enforced (no hardcoded values)
- Responsive at 320px / 768px / 1280px
- Accessibility: axe clean, keyboard navigable, ARIA correct
- Lighthouse ≥ 90 Performance / Accessibility / Best Practices
- TypeScript strict build passes
- Full test suite green (TDD Red-Green-Refactor cycle evidenced in git history)

Ready to merge and begin the next feature branch.
