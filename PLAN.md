# Gap-Closure Plan: Package-by-Package

## Objective

Close remaining parity gaps by iterating package-by-package and resolving implementation and tests for each package before moving on.

## Current scope

- Reference baseline: `references/react-spectrum`
- Focus families: `@react-aria`, `@react-stately`, `@react-spectrum`, `@react-types`
- Implementation naming rule:
  - `@react-aria/*` implementations remain in `@vue-aria/*`
  - `@react-stately/*` implementations and related state exports are implemented with `@vue-stately/*` naming; `*-state` legacy mappings are also accepted.
  - `@react-spectrum/*` remain in `@vue-spectrum/*`
  - `@react-types/*` implementations remain in `@vue-types/*`

## Sweep protocol (per package)

1. Select one package from the active ROADMAP queue.
2. Compare upstream and local:
   - Upstream source: `references/react-spectrum/packages/<scope>/<package>/`
   - Local package: corresponding `packages/<mapped-scope>/<package>/`
3. Resolve implementation gap first (hooks, exports, types, side effects).
4. Resolve test gap:
   - Add missing unit/integration tests where behavior is exposed.
   - Fix failing tests for behavior parity and edge cases.
5. Validate locally:
   - run package-level tests for the package (and dependent consumers when needed)
   - ensure no naming/integration mismatch remains for that package.
6. Update docs if behavior signature or import surface changes.
7. Update `ROADMAP.md` entry status for that package.
8. **Commit + push immediately** if state is stable and tests are passing.

## Stable-state rule

- Stable means:
  - package implementation is complete for the scoped task,
  - package tests pass (targeted run),
  - repo is in a logically coherent state for that package,
  - no local reference/import regressions for that package.

## Commit convention

- `feat(pkg): ...`
- `test(pkg): ...`
- `fix(pkg): ...`
- `chore: ...`

## Execution cadence

- Work continuously through one package at a time.
- After each stable pass:
  - commit,
  - push,
  - then start the next package immediately.
- Do not merge multiple unstable package edits into one commit.

## Package source-of-truth

- Roadmap and status are maintained in `ROADMAP.md` and considered the active queue.
