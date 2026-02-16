# Vue Aria / Vue Spectrum Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Current parity snapshot

- Reference scope packages (`@react-aria`, `@react-stately`, `@react-spectrum`): `150`
- Local package inventory in-scope: synced with current references (all mapped).
- Directly mapped packages: `150 / 150`.
- Historical `-state` suffix packages: resolved to `@vue-stately/*`.
- Additional stately-aligned package renames completed:
  - `autocomplete`, `collections`, `color`, `dnd`, `menu`, `select`, `steplist`, `virtualizer`
- Remaining unmapped gaps: `0`.

## 2) Remaining inconsistencies to close

- None.

## 3) Sequencing (complete)

1. Resolve stately-aligned naming for in-scope `@react-*` packages (`autocomplete`, `collections`, `color`, `dnd`, `menu`, `select`, `steplist`, `virtualizer`) by mapping to `@vue-stately/*`.
2. Remove duplicate shim directories for `color`, `steplist`, and `virtualizer` now that canonical packages are renamed.
3. Keep package alias configuration aligned (`tsconfig.json` and `vitest.config.ts`).
4. Remove legacy package `@vue-spectrum/theme` and remap docs/examples to `@vue-spectrum/theme-default`.
5. Re-run parity checks and keep roadmap docs synchronized.

## 4) Completion criteria

- Zero unmapped packages in all in-scope families.
- Naming for state packages follows `@react-stately/*` -> local `@vue-stately/*`.
- `ROADMAP.md` and `PLAN.md` remain synchronized.
