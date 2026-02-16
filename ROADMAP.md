# Vue Aria / Vue Spectrum Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Reference sync snapshot

### Mapped scope totals

| Scope | Upstream packages | Mapped local packages | Missing | Status |
| --- | ---: | ---: | ---: | --- |
| `@react-aria` | 54 | 49 | 5 | Open |
| `@react-spectrum` | 64 | 30 | 34 | Open |
| `@react-stately` | 32 | 25 | 7 | Open |

### Overall count
- Reference scope packages considered: **150**
- Local packages currently present: **102**
- Current package-level gaps discovered: **46**
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

## 3) Remaining inconsistencies to close

### 3.1) Namespace exceptions still open
- `@vue-aria/types` remains an internal Vue utility package that currently handles shared Vue typing for this repo. If we need strict `@react-types/*` parity, this requires a separate migration/adapter package strategy.

### 3.2) Missing upstream mirrors

#### Missing `@react-aria` packages
- `@react-aria/color`
- `@react-aria/dnd`
- `@react-aria/tag`
- `@react-aria/test-utils`
- `@react-aria/virtualizer`

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
- `@react-spectrum/label`
- `@react-spectrum/labeledvalue`
- `@react-spectrum/layout`
- `@react-spectrum/list`
- `@react-spectrum/overlays`
- `@react-spectrum/s2`
- `@react-spectrum/statuslight`
- `@react-spectrum/steplist`
- `@react-spectrum/story-utils`
- `@react-spectrum/style-macro-s1`
- `@react-spectrum/tag`
- `@react-spectrum/test-utils`
- `@react-spectrum/text`
- `@react-spectrum/view`
- `@react-spectrum/well`

#### Missing `@react-stately` packages
- `@react-stately/autocomplete`
- `@react-stately/color`
- `@react-stately/data`
- `@react-stately/dnd`
- `@react-stately/layout`
- `@react-stately/steplist`
- `@react-stately/virtualizer`

## 4) Gap-close order (next)

### Phase 1 — Close namespace exceptions
1. Decide whether `@vue-aria/types` should remain internal-only or be formalized into a mapped `@react-types` adapter layer.

### Phase 2 — Add missing `@react-aria` packages
1. `@react-aria/test-utils`, `@react-aria/virtualizer`
2. `@react-aria/dnd`
3. `@react-aria/color`, `@react-aria/tag`

### Phase 3 — Add missing `@react-spectrum` packages
1. `label`, `statuslight`, `text`, `view`, `well`
2. `avatar`, `badge`, `icon`, `image`, `inlinealert`, `card`
3. `list`, `dropzone`, `autocomplete`, `dnd`, `tag`, `steplist`

### Phase 4 — Add missing `@react-stately` packages
1. `data`, `layout`
2. `autocomplete`, `dnd`, `steplist`
3. `color`, `virtualizer`
