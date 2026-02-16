# Vue Aria / Vue Spectrum Gap-Closure Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Working objective

Close implementation and test parity gaps package-by-package across mapped `@react-*` and `@react-spectrum/*` families.

## 2) Current baseline

- Reference package scope:
  - `@react-aria`: 54 packages
  - `@react-stately`: 32 packages
  - `@react-spectrum`: 64 packages
  - `@react-types`: 47 packages
- Local implementation inventory:
  - `@vue-aria`: 78 packages (includes `*-state` and mapped `@vue-stately/*` package names),
  - `@vue-spectrum`: 64 packages,
  - `@vue-types`: 1 package (`@vue-types/shared`),
  - `@vue-stately`: 0 directories (implementation is currently co-located in `@vue-aria` for state-derived names).
- Coverage status:
  - Naming/alias gaps from previous phase: closed.
  - `@react-aria` logical coverage: `54 / 54`.
  - `@react-stately` logical coverage: `32 / 32` (via mapped `@vue-aria/*-state` and `@vue-stately/*` package names).
  - `@react-spectrum` logical coverage: `64 / 64`.
  - `@react-types` logical coverage: `22 / 47`.

## 3) Gap target for this pass

Primary gap now: implementation + test parity for `@react-types/*` packages (25 packages remain to map/implement).

## 4) Active queue (package-by-package)

Status: `Todo` / `In progress` / `Done`.

- [x] `@react-types/actionbar`
- [x] `@react-types/actiongroup`
- [x] `@react-types/autocomplete`
- [x] `@react-types/avatar`
- [x] `@react-types/badge`
- [x] `@react-types/breadcrumbs`
- [x] `@react-types/button`
- [x] `@react-types/buttongroup`
- [x] `@react-types/calendar`
- [x] `@react-types/card`
- [x] `@react-types/checkbox`
- [x] `@react-types/color`
- [x] `@react-types/combobox`
- [x] `@react-types/contextualhelp`
- [x] `@react-types/datepicker`
- [x] `@react-types/dialog`
- [x] `@react-types/divider`
- [x] `@react-types/form`
- [x] `@react-types/grid`
- [x] `@react-types/illustratedmessage`
- [x] `@react-types/image`
- [ ] `@react-types/label`
- [ ] `@react-types/layout`
- [ ] `@react-types/link`
- [ ] `@react-types/list`
- [ ] `@react-types/listbox`
- [ ] `@react-types/menu`
- [ ] `@react-types/meter`
- [ ] `@react-types/numberfield`
- [ ] `@react-types/overlays`
- [ ] `@react-types/progress`
- [ ] `@react-types/provider`
- [ ] `@react-types/radio`
- [ ] `@react-types/searchfield`
- [ ] `@react-types/select`
- [ ] `@react-types/sidenav`
- [ ] `@react-types/slider`
- [ ] `@react-types/statuslight`
- [ ] `@react-types/switch`
- [ ] `@react-types/table`
- [ ] `@react-types/tabs`
- [ ] `@react-types/text`
- [ ] `@react-types/textfield`
- [ ] `@react-types/tooltip`
- [ ] `@react-types/view`
- [ ] `@react-types/well`

## 5) Per-package completion criteria

For each package marked done:

- Upstream exports/signatures are mirrored in local package surface.
- Public API and behavior tests added/updated in `packages/@vue-types/<package>/` and aligned test directories.
- Package-level tests pass.
- Import path/alias references remain valid.
- `ROADMAP.md` checkbox is marked done and commit pushed.

## 6) Execution rules

1. One package at a time.
2. Complete implementation + tests before moving on.
3. Commit only when package scope is stable.
4. Push on every stable commit.
5. Keep `PLAN.md` and `ROADMAP.md` synchronized after each committed item.
