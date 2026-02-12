# Port of React Aria & React Spectrum to Vue using Codex

---

# 1. Objective

Port React Aria and React Spectrum to Vue with strict:

- Structural parity
- API parity
- Behavioral parity
- Visual parity
- Documentation parity

This is a framework port.
No redesign.
Upstream is the source of truth.

---

# 2. Upstream Baseline

- Add the upstream repository as a Git submodule.
- Lock a specific commit SHA as the baseline.
- Record the SHA in:
  - PORT_BASELINE.md
  - root package.json
- All parity decisions reference this SHA.
- No silent divergence is allowed.

---

# 3. Baseline Upgrade Policy

The baseline SHA is frozen for a port cycle.

Do not change the upstream submodule SHA during a port cycle.

## Upgrading the Baseline (New Port Cycle)

A baseline upgrade must include:

1. Update the submodule to the new SHA.
2. Update PORT_BASELINE.md with:
   - new SHA
   - commit date
   - relevant upstream package versions
3. Recompute and update status.json:
   - upstreamTests totals
   - docsTotal totals
   - any baseline-derived totals
4. Run full CI:
   - tests
   - SSR
   - visual regression
   - docs build
5. Record any behavioral or API differences in DEVIATIONS.md.

If any step is missing, the upgrade is invalid.

---

# 4. Execution Model (Incremental Only)

Work incrementally.

Rules:

- Work on one package at a time.
- Follow dependency order (leaf-first via dependency graph).
- Keep CI green at all times.
- Avoid cross-package refactors unless strictly required.
- Avoid large multi-package commits.

Every change must:
- Pass all checks
- Update status.json if relevant
- Keep documentation buildable

No large “big bang” changes.

---

# 5. Port Order (Dependency-Graph Driven)

Infer port order from the workspace dependency graph.

Rules:

- Build the internal dependency graph.
- Start with leaf packages (no internal dependencies).
- After completing a package, recompute available leaves.
- Only begin a package when all internal dependencies are complete.
- If dependency cycles exist:
  - Stop
  - Document the cycle in DEVIATIONS.md
  - Propose minimal resolution

Multiple valid topological orders are acceptable.

---

# 6. Repository Structure

- Mirror upstream monorepo layout.
- Preserve package boundaries.
- Align folder structure where possible.
- Public exports must conceptually match upstream.

All deviations must be documented in DEVIATIONS.md.

---

# 7. API Parity Rules

React → Vue mapping:

| React | Vue |
|--------|------|
| Hooks | Composables |
| Render props | Slots |
| Controlled props | Props + `v-model` |
| Ref forwarding | Template refs + `defineExpose` |
| Context | Provide / Inject |

No feature removal.
No API redesign.

---

# 8. Package Classification

Before porting each package:

1. Framework-agnostic → reuse via npm
2. Thin adapter → wrap
3. React-specific → rewrite

Prefer reuse.
Fork only if necessary.
Document forks in FORKS.md.

---

# 9. Testing Policy

## 9.1 1:1 Test Adaptation

For every upstream test:

- Create a Vue equivalent.
- Preserve test intent and assertions.
- Only adapt rendering and event harness.

Do not invent new behavioral tests unless upstream lacks coverage.

---

## 9.2 Canonical Progress File

Root-level source of truth:

/status.json

This file must include:

- baseline SHA
- global totals:
  - upstreamTests
  - portedTests
  - passingTests
  - snapshotTotal
  - snapshotPassing
  - docsTotal
  - docsComplete
- per-package:
  - status (not_started | in_progress | complete)
  - upstreamTests
  - portedTests
  - passingTests
  - snapshotTotal
  - snapshotPassing
  - docsTotal
  - docsComplete
  - hasDeviations
  - upstreamPackageName
  - upstreamPath
  - upstreamUrl

Update status.json in the same commit as any change affecting:
- tests
- snapshots
- documentation
- package status

---

# 10. Port-Specific Gates

## 10.1 SSR Gate

Environment:

- Vue 3
- Vite
- Vue SSR + Vite SSR

Requirements:

- SSR render succeeds.
- Hydration produces zero warnings.
- No DOM mismatch.

---

## 10.2 Visual Parity Gate (Spectrum UI)

- Mirror documentation examples as stories.
- Capture states:
  - Default
  - Hover
  - Focus-visible
  - Active
  - Disabled
  - Invalid
  - Loading
  - RTL (if applicable)
- Zero-diff baseline required.

Snapshot counts must be reflected in status.json.

Headless components:
- Style documentation examples exactly like upstream.

---

## 10.3 Stable Visual Environment

Visual regression must run in a pinned environment:

- Fixed browser version
- Fixed viewport size
- Deterministic fonts
- Animations disabled
- Fixed locale and timezone

Prevent flaky builds.

---

# 11. Accessibility & Behavioral Parity

Preserve:

- ARIA attributes
- Keyboard interaction model
- Focus management
- Overlay stacking
- Scroll locking
- Roving tabindex
- Active descendant behavior
- Focus restoration

Upstream behavior is the contract.

---

# 12. Stable IDs

- Provide shared useId().
- IDs must be SSR-deterministic.
- No random ID generation during render.

---

# 13. Documentation Parity

Documentation must match upstream:

- Same page grouping
- Same sections
- Same prop tables
- Same examples
- Vue syntax examples
- Same visual styling

Documentation is part of the API contract.

---

# 14. Documentation Completion Metrics

Documentation progress must be measurable.

Definitions:

- docsTotal (per package):
  Number of upstream documentation pages that correspond to the package.

- docsComplete (per package):
  True only when all required pages:
    - Exist
    - Match section structure
    - Include all examples
    - Include prop descriptions
    - Build successfully

status.json must include:
- global docsTotal
- global docsComplete
- per-package docsTotal
- per-package docsComplete

Docs completion must never be manually reported.

---

# 15. Static Progress Reporting (Hybrid Model)

## 15.1 Canonical File

/status.json

Machine-maintained and CI-validated.

## 15.2 Human-Readable File

/status.md

Auto-generated from status.json.
Never manually edited.

## 15.3 Documentation Status Page

Include a static Port Status page built from status.json.

Display:

- Test totals
- Snapshot totals
- Docs totals
- Package completion counts

No manual reporting.

## 15.4 Per-Package Static Header

Each package documentation page must declare:

---
package: button
---

During build:

- Import status.json
- Render static header showing:
  - Status
  - Test parity %
  - Snapshot parity %
  - Docs completion
  - Baseline SHA
  - Deviation indicator
  - Upstream reference link

No runtime fetching.

---

# 16. Commit & Push Rules

Commits go directly to the default branch (main or master).

Rules:

1. Every commit must leave the repository fully passing:
   - Unit tests pass
   - SSR checks pass
   - Visual regression passes
   - Documentation builds successfully

2. Update status.json in the same commit as any relevant change.

3. Regenerate status.md before committing.

4. Do not push code that fails CI.

5. Work incrementally and commit small logical units of progress.

The main branch must always remain stable.
CI is authoritative.

---

# 17. CI Enforcement (GitHub Actions)

CI must:

1. Lint
2. Typecheck
3. Run unit tests
4. Run SSR tests
5. Run visual regression tests
6. Build documentation
7. Validate status.json against computed metrics
8. Regenerate status.md
9. Deploy docs to GitHub Pages

CI fails if:

- Test parity decreases
- Snapshot parity decreases
- Docs build fails
- status.json inconsistent
- Undocumented deviations exist

---

# 18. Packaging Strategy

- ESM-only distribution
- Full TypeScript types
- Proper exports map
- Tree-shaking safe
- Vanilla CSS per package
- CSS imported into SFCs

---

# 19. Support Matrix

- Vue 3 (latest stable)
- Vite
- Latest Chrome, Firefox, Safari
- Vue SSR + Vite SSR

---

# 20. Versioning

- Mirror upstream version numbers exactly.
- Record upstream baseline SHA.
- Use upstream version format.
- No suffixes.
- No semantic divergence without documentation.

---

# 21. Deviations

All divergences must be documented in:

/DEVIATIONS.md

Template:

- Package
- Upstream reference
- Difference
- Reason
- User impact
- Removal plan

---

# 22. Definition of Done (Per Package)

A package is complete only when:

- All upstream tests are ported
- All ported tests pass
- SSR gate passes (if applicable)
- Visual gate passes (if UI)
- Documentation complete
- status.json updated
- No undocumented deviations

---

# 23. Guiding Principles

- Follow upstream closely.
- Minimize divergence.
- Prefer reuse.
- Work incrementally.
- Make progress visible.
- CI is the authority.
- Documentation is part of the API.
