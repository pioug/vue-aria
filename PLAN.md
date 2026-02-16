# Gap-Closure Plan: Package-by-Package and `@vue-stately` Migration

## Objective

Close implementation/test parity gaps package-by-package, then remove all legacy `@vue-aria/*-state` layouts by moving state packages to definitive `@vue-stately/*` directories with no mapping dependency.

## Current scope

- Reference baseline: `references/react-spectrum`
- Focus families: `@react-aria`, `@react-stately`, `@react-spectrum`, `@react-types`
- Naming rule:
  - `@react-aria/*` implementations remain in `@vue-aria/*`, with state primitives represented in canonical `@vue-stately/*` when applicable.
  - `@react-stately/*` must be implemented in `packages/@vue-stately/*`
  - Legacy `@vue-aria/*-state` package names are no longer expected after migration.
  - `@react-spectrum/*` remain in `@vue-spectrum/*`
  - `@react-types/*` remain in `@vue-types/*`

## Migration protocol (state packages first)

1. Select next `@vue-stately/*` item from `ROADMAP.md`.
2. Create/move package sources from legacy `packages/@vue-aria/<pkg>-state` to `packages/@vue-stately/<pkg>`.
3. Preserve runtime and public API exports.
4. Update all local imports/tests/docs from `@vue-aria/<pkg>-state` to `@vue-stately/<pkg>` (canonical target).
5. Update workspace config so `packages/@vue-stately/*` are included as build/test packages.
6. Remove any migration aliases left only for temporary compatibility.
7. Update `ROADMAP.md` and commit a stable checkpoint.

## Parity protocol (after migration path is clear)

1. Select the next package from active gap queue.
2. Compare upstream and local:
   - Upstream source: `references/react-spectrum/packages/<scope>/<package>/`
   - Local package: `packages/<mapped-scope>/<package>/`
3. Resolve implementation gaps (hooks, exports, types, side effects).
4. Resolve tests:
   - add missing unit/integration tests where behavior is exposed.
   - fix failing tests for parity and edge cases.
5. Validate scoped import path stability.
6. Update docs if signature/import surface changes.
7. Update `ROADMAP.md` entry status.
8. Commit + push immediately in stable state.

## Stable-state rule

- Implementation scope complete for the selected package
- Targeted package-level tests pass
- No local import/regression risk introduced

## Commit convention

- `feat(pkg): ...`
- `test(pkg): ...`
- `fix(pkg): ...`
- `chore: ...`

## Execution cadence

- One package at a time.
- Commit and push each stable checkpoint.
- Keep `ROADMAP.md` as single source of active queue status.

## Canonical gap reporting

- Run `node scripts/check-parity.mjs` for strict missing/extra parity checks.
- The checker treats `@react-aria/*` as covered when implemented as either `@vue-aria/*` or canonicalized `@vue-stately/*` variants.
