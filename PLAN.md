# Vue Aria Migration Plan

## Objective
Close remaining reference and naming gaps between this workspace and
`references/react-spectrum` while preserving local package boundaries.

## Baseline
- Reference scope: `@react-aria`, `@react-stately`, `@react-spectrum`
- In-scope package count: `150`
- Closed gap status: `All known gaps resolved`

## Completed package-gap backlog

- `@vue-aria/data` → `@react-aria/data` now mapped.
- `@vue-aria/flags` → `@react-aria/flags` now mapped.
- `@vue-aria/layout` → `@react-aria/layout` now mapped.
- `@vue-spectrum/theme` → `@react-spectrum/theme` now mapped.
- `@react-stately/list` now mirrors local `@vue-stately/list` package.
- State package naming normalization:
  - `@vue-aria/calendar-state` → `@vue-stately/calendar`
  - `@vue-aria/checkbox-state` → `@vue-stately/checkbox`
  - `@vue-aria/combobox-state` → `@vue-stately/combobox`
  - `@vue-aria/datepicker-state` → `@vue-stately/datepicker`
  - `@vue-aria/disclosure-state` → `@vue-stately/disclosure`
  - `@vue-aria/form-state` → `@vue-stately/form`
  - `@vue-aria/grid-state` → `@vue-stately/grid`
  - `@vue-aria/numberfield-state` → `@vue-stately/numberfield`
  - `@vue-aria/overlays-state` → `@vue-stately/overlays`
  - `@vue-aria/radio-state` → `@vue-stately/radio`
  - `@vue-aria/searchfield-state` → `@vue-stately/searchfield`
  - `@vue-aria/selection-state` → `@vue-stately/selection`
  - `@vue-aria/slider-state` → `@vue-stately/slider`
  - `@vue-aria/table-state` → `@vue-stately/table`
  - `@vue-aria/tabs-state` → `@vue-stately/tabs`
  - `@vue-aria/toast-state` → `@vue-stately/toast`
  - `@vue-aria/toggle-state` → `@vue-stately/toggle`
  - `@vue-aria/tooltip-state` → `@vue-stately/tooltip`
  - `@vue-aria/tree-state` → `@vue-stately/tree`
  - `@vue-aria/utils-state` → `@vue-stately/utils`
- `@vue-aria/types` removed in favor of `@vue-types/shared`.

## Next status
- No remaining package gaps in current reference scope.
- Keep `ROADMAP.md` synchronized with this list if any new gaps are introduced.
