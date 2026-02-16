# Vue Aria / Vue Spectrum Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Reference sync snapshot

### Mapped scope totals

| Scope | Upstream packages | Mapped local packages | Missing | Status |
| --- | ---: | ---: | ---: | --- |
| `@react-aria` | 54 | 54 | 0 | Open |
| `@react-spectrum` | 64 | 64 | 0 | Open |
| `@react-stately` | 32 | 32 | 0 | Open |

### Overall count
- Reference scope packages considered: **150**
- Local packages currently present: **146**
- Current package-level gaps discovered: **0**
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
- Added `@vue-spectrum/text` compatibility package in
  `packages/@vue-spectrum/text` with placeholder `Text`, `Heading`, and
  `Keyboard` components.
- Added `@vue-spectrum/view` compatibility package in
  `packages/@vue-spectrum/view` with placeholder `View`, `Content`, `Footer`,
  and `Header` components.
- Added `@vue-spectrum/well` compatibility package in
  `packages/@vue-spectrum/well` with placeholder `Well` component.
- Added `@vue-spectrum/avatar` compatibility package in
  `packages/@vue-spectrum/avatar` with a placeholder `Avatar` component.
- Added `@vue-spectrum/badge` compatibility package in
  `packages/@vue-spectrum/badge` with a placeholder `Badge` component.
- Added `@vue-spectrum/icon` compatibility package in
  `packages/@vue-spectrum/icon` with placeholder `Icon`, `UIIcon`, and
  `Illustration` components.
- Added `@vue-spectrum/image` compatibility package in
  `packages/@vue-spectrum/image` with placeholder `Image` component.
- Added `@vue-spectrum/inlinealert` compatibility package in
  `packages/@vue-spectrum/inlinealert` with placeholder `InlineAlert`
  component.
- Added `@vue-spectrum/card` compatibility package in
  `packages/@vue-spectrum/card` with placeholder `Card`-related components.
- Added `@vue-spectrum/accordion` compatibility package in
  `packages/@vue-spectrum/accordion` with placeholder `Accordion` and
  `AccordionItem` components.
- Added `@vue-spectrum/actionbar` compatibility package in
  `packages/@vue-spectrum/actionbar` with placeholder `ActionBar` and `Item`
  components.
- Added `@vue-spectrum/actiongroup` compatibility package in
  `packages/@vue-spectrum/actiongroup` re-exporting `@vue-aria/actiongroup`
  hooks and placeholder components.
- Added `@vue-spectrum/autocomplete` compatibility package in
  `packages/@vue-spectrum/autocomplete` re-exporting `@vue-aria/autocomplete`.
- Added `@vue-spectrum/buttongroup` compatibility package in
  `packages/@vue-spectrum/buttongroup` with a placeholder `ButtonGroup`
  component.
- Added `@vue-spectrum/color` compatibility package in
  `packages/@vue-spectrum/color` with `@vue-aria/color` re-exports.
- Added `@vue-spectrum/contextualhelp` compatibility package in
  `packages/@vue-spectrum/contextualhelp` with placeholder `ContextualHelp`
  component.
- Added `@vue-spectrum/divider` compatibility package in
  `packages/@vue-spectrum/divider` with placeholder `Divider` component.
- Added `@vue-spectrum/dnd` compatibility package in `packages/@vue-spectrum/dnd`
  as a re-export layer over `@vue-aria/dnd`.
- Added `@vue-spectrum/dropzone` compatibility package in
  `packages/@vue-spectrum/dropzone` with placeholder `Dropzone` component.
- Added `@vue-spectrum/filetrigger` compatibility package in
  `packages/@vue-spectrum/filetrigger` with placeholder `FileTrigger`
  component.
- Added `@vue-spectrum/form` compatibility package in `packages/@vue-spectrum/form`
  as a re-export layer over `@vue-aria/form`.
- Added `@vue-spectrum/illustratedmessage` compatibility package in
  `packages/@vue-spectrum/illustratedmessage` with placeholder components.
- Added `@vue-spectrum/labeledvalue` compatibility package in
  `packages/@vue-spectrum/labeledvalue` with placeholder `LabeledValue`
  component.
- Added `@vue-spectrum/layout` compatibility package in
  `packages/@vue-spectrum/layout` as a re-export layer over `@vue-aria/layout`.
- Added `@vue-spectrum/list` compatibility package in
  `packages/@vue-spectrum/list` with placeholder `List`/`Item` components.
- Added `@vue-spectrum/overlays` compatibility package in
  `packages/@vue-spectrum/overlays` as a re-export layer over
  `@vue-aria/overlays`.
- Added `@vue-spectrum/s2` compatibility package in
  `packages/@vue-spectrum/s2` with minimal style macro helpers.
- Added `@vue-spectrum/steplist` compatibility package in
  `packages/@vue-spectrum/steplist` with `@vue-stately/steplist` re-exports
  and placeholder `StepList`/`Item` components.
- Added `@vue-spectrum/story-utils` compatibility package in
  `packages/@vue-spectrum/story-utils` with `ErrorBoundary` and
  `generatePowerset` placeholders.
- Added `@vue-spectrum/style-macro-s1` compatibility package in
  `packages/@vue-spectrum/style-macro-s1` exporting minimal style utility
  helpers.
- Added `@vue-spectrum/tag` compatibility package in
  `packages/@vue-spectrum/tag` as a re-export layer over `@vue-aria/tag`.
- Added `@vue-spectrum/test-utils` compatibility package in
  `packages/@vue-spectrum/test-utils` as a re-export layer over
  `@vue-aria/test-utils`.

## 3) Remaining inconsistencies to close

### 3.1) Namespace exceptions still open
- `@vue-aria/types` remains an internal Vue utility package that currently handles shared Vue typing for this repo. If we need strict `@react-types/*` parity, this requires a separate migration/adapter package strategy.

### 3.2) Missing upstream mirrors

#### Missing `@react-aria` packages

#### Missing `@react-spectrum` packages
- None

#### Missing `@react-stately` packages
- None

Local targets for remaining stately work are `@vue-stately/<name>`.

## 4) Gap-close order (next)

### Phase 1 — Close namespace exceptions
1. Decide whether `@vue-aria/types` should remain internal-only or be formalized into a mapped `@react-types` adapter layer.

### Phase 2 — Add missing `@react-aria` packages

### Phase 3 — Add missing `@react-spectrum` packages
- None

### Phase 4 — Add missing `@react-stately` packages
No remaining `@react-stately` gaps.
