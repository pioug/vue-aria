# Vue Aria / Vue Spectrum Gap-Closure Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Working objective

Close implementation and test parity gaps package-by-package, then complete the naming migration:

- Move all `@react-stately` primitives out of legacy `@vue-aria/*-state` package layouts.
- Define and use definitive `@vue-stately/*` packages directly so no mapping layer is required.

## 2) Current baseline

- Reference package scope:
  - `@react-aria`: 54 packages
  - `@react-stately`: 32 packages
  - `@react-spectrum`: 64 packages
  - `@react-types`: 47 packages
- Local implementation inventory:
  - `@vue-aria`: 46 packages,
  - `@vue-spectrum`: 64 packages,
  - `@vue-types`: 47 packages (`@vue-types/shared` + all mapped `@react-types/*` packages),
- `@vue-stately`: 32 directories now moved out of legacy `@vue-aria/*-state`.
- Coverage status:
  - Naming/alias gaps from previous phase: closed.
  - `@react-aria` canonical coverage (mapped to either `@vue-aria/*` or `@vue-stately/*` where applicable): `54 / 54`.
  - `@react-stately` logical coverage: `32 / 32` (now implemented as definitive `@vue-stately/*` packages).
  - `@react-spectrum` logical coverage: `64 / 64`.
- `@react-types` logical coverage: `47 / 47`.

Canonical parity check:

- Run `node scripts/check-parity.mjs` for a strict missing/extra report that avoids false gaps from canonicalized `@react-aria` packages now represented in `@vue-stately/*`.

## 3) Gap target for this pass

Primary pass: definitive state-package migration.

- Remove legacy `@vue-aria/*-state` naming.
- Add/verify package directories under `packages/@vue-stately/*`.
- Eliminate mapping dependencies and re-import/resolve all `@vue-stately/*` package references directly.
- Keep `@react-types` package parity intact while migration runs.

- State migration remaining: 0 packages.

## 4) Active queue (package-by-package)

Status: `Todo` / `In progress` / `Done`.

- [x] `@vue-stately/calendar`
- [x] `@vue-stately/checkbox`
- [x] `@vue-stately/combobox`
- [x] `@vue-stately/datepicker`
- [x] `@vue-stately/disclosure`
- [x] `@vue-stately/form`
- [x] `@vue-stately/grid`
- [x] `@vue-stately/list`
- [x] `@vue-stately/numberfield`
- [x] `@vue-stately/overlays`
- [x] `@vue-stately/radio`
- [x] `@vue-stately/searchfield`
- [x] `@vue-stately/selection`
- [x] `@vue-stately/slider`
- [x] `@vue-stately/table`
- [x] `@vue-stately/tabs`
- [x] `@vue-stately/toast`
- [x] `@vue-stately/toggle`
- [x] `@vue-stately/tooltip`
- [x] `@vue-stately/tree`
- [x] `@vue-stately/utils`
- [x] `@vue-stately/autocomplete`
- [x] `@vue-stately/collections`
- [x] `@vue-stately/color`
- [x] `@vue-stately/data`
- [x] `@vue-stately/dnd`
- [x] `@vue-stately/flags`
- [x] `@vue-stately/layout`
- [x] `@vue-stately/menu`
- [x] `@vue-stately/select`
- [x] `@vue-stately/steplist`
- [x] `@vue-stately/virtualizer`

## 4b) Completed packages preserved from previous pass

- `@react-types/*` parity is closed at `47 / 47`.

## 5) Per-package completion criteria

For each package marked done:

- Upstream exports/signatures are mirrored in local package surface.
- Legacy `*-state` locations are removed or left behind only as temporary transition artifacts.
- All imports for moved packages use definitive `@vue-stately/<package>` paths.
- Public API and behavior tests added/updated in `packages/@vue-stately/<package>/` and aligned test directories.
- Package-level tests pass.
- Import path regressions are eliminated.
- `ROADMAP.md` checkbox is marked done and commit pushed.

## 6) Execution rules

1. One package at a time.
2. Complete implementation + tests before moving on.
3. Commit only when package scope is stable.
4. Push on every stable commit.
5. Keep `PLAN.md` and `ROADMAP.md` synchronized after each committed item.
