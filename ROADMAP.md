# Vue Aria / Vue Spectrum Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Reference sync snapshot

### Mapped scope totals

| Scope | Upstream packages | Mapped local packages | Missing | Status |
| --- | ---: | ---: | ---: | --- |
| `@react-aria` | 54 | 54 | 0 | Open |
| `@react-spectrum` | 64 | 32 | 32 | Open |
| `@react-stately` | 32 | 32 | 0 | Open |

### Overall count
- Reference scope packages considered: **150**
- Local packages currently present: **114**
- Current package-level gaps discovered: **32**
- Namespace exceptions to close: **1** (`@vue-aria/types`)

## 2) Closed gaps

### 2.1) Namespace alignment (completed)
- Added `@vue-spectrum/theme-default` compatibility package in
  `packages/@vue-spectrum/theme-default`.
- `@vue-spectrum/theme-default` re-exports `theme` from `@vue-spectrum/theme`.
- Added path alias so `@vue-spectrum/theme-default` resolves consistently in TS tooling.
- Added `@vue-aria/toolbar` package scaffold and hook parity implementation.
- Added `@vue-aria/autocomplete` compatibility package and hooks for
  `useAutocomplete`/`useSearchAutocomplete`.
- Added `@vue-aria/example-theme` compatibility package and upstream CSS export.
- Added `@vue-aria/steplist` compatibility package.
- Added `@vue-aria/tag` compatibility package.
- Added `@vue-aria/test-utils` compatibility package.
- Added `@vue-aria/virtualizer` compatibility package.
- Added `@vue-aria/dnd` compatibility package.
- Added `@vue-aria/color` compatibility package.
- Added `@vue-aria/layout` compatibility package in `packages/@vue-aria/layout` with parity implementation for
  `GridLayout`, `ListLayout`, `TableLayout`, and `WaterfallLayout`.
- Migrated internal/stately imports and workspace aliases from
  `@vue-aria/<name>-state` to `@vue-stately/<name>` for existing state-backed
  packages so historical `-state` suffixes are removed from usage and docs.
- Added `@vue-stately/data`-compat target alias to `packages/@vue-aria/data`, and aligned
  `@vue-stately/table` to resolve to `table-state` so `TableColumnLayout`/`TableState`
  consumers follow reference contracts.
- Added `@vue-stately/steplist` package at `packages/@vue-stately/steplist` with the
  `useStepListState`, `StepListProps`, and `StepListState` exports.
- Added `@vue-stately/color` package at `packages/@vue-stately/color` and routed
  `@vue-stately/color` resolution there.
- Added `@vue-stately/virtualizer` package at `packages/@vue-stately/virtualizer` and
  routed `@vue-stately/virtualizer` resolution there.
- Updated `tsconfig.json` and `vitest.config.ts` aliases so
  `@vue-stately/color`, `@vue-stately/steplist`, and `@vue-stately/virtualizer`
  resolve from canonical `packages/@vue-stately/*` paths.
- Added `@vue-spectrum/label` compatibility package in
  `packages/@vue-spectrum/label`, currently exporting label utilities from
  `@vue-aria/label`.
- Added `@vue-spectrum/statuslight` compatibility package in
  `packages/@vue-spectrum/statuslight` with a lightweight `StatusLight`
  placeholder component.

## 3) Remaining inconsistencies to close

### 3.1) Namespace exceptions still open
- `@vue-aria/types` remains an internal Vue utility package that currently handles shared Vue typing for this repo. If we need strict `@react-types/*` parity, this requires a separate migration/adapter package strategy.

### 3.2) Missing upstream mirrors

#### Missing `@react-aria` packages

#### Missing `@react-spectrum` packages
- `@react-spectrum/accordion`
- `@react-spectrum/actionbar`
- `@react-spectrum/actiongroup`
- `@react-spectrum/autocomplete`
- `@react-spectrum/avatar`
- `@react-spectrum/badge`
- `@react-spectrum/buttongroup`
- `@react-spectrum/card`
- `@react-spectrum/color`
- `@react-spectrum/contextualhelp`
- `@react-spectrum/divider`
- `@react-spectrum/dnd`
- `@react-spectrum/dropzone`
- `@react-spectrum/filetrigger`
- `@react-spectrum/form`
- `@react-spectrum/icon`
- `@react-spectrum/illustratedmessage`
- `@react-spectrum/image`
- `@react-spectrum/inlinealert`
- `@react-spectrum/labeledvalue`
- `@react-spectrum/layout`
- `@react-spectrum/list`
- `@react-spectrum/overlays`
- `@react-spectrum/s2`
- `@react-spectrum/steplist`
- `@react-spectrum/story-utils`
- `@react-spectrum/style-macro-s1`
- `@react-spectrum/tag`
- `@react-spectrum/test-utils`
- `@react-spectrum/text`
- `@react-spectrum/view`
- `@react-spectrum/well`

#### Missing `@react-stately` packages
- None

Local targets for remaining stately work are `@vue-stately/<name>`.

## 4) Gap-close order (next)

### Phase 1 — Close namespace exceptions
1. Decide whether `@vue-aria/types` should remain internal-only or be formalized into a mapped `@react-types` adapter layer.

### Phase 2 — Add missing `@react-aria` packages

### Phase 3 — Add missing `@react-spectrum` packages
1. `text`, `view`, `well`
2. `avatar`, `badge`, `icon`, `image`, `inlinealert`, `card`
3. `list`, `dropzone`, `autocomplete`, `dnd`, `tag`, `steplist`

### Phase 4 — Add missing `@react-stately` packages
No remaining `@react-stately` gaps.
