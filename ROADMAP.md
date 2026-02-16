# Vue Aria / Vue Spectrum Roadmap

Generated: 2026-02-16
Source: `/Users/piou/Dev/vue-aria-copy`
Reference baseline: `references/react-spectrum`

## 1) Current parity snapshot

- Reference scope packages (`@react-aria`, `@react-stately`, `@react-spectrum`): `150`
- Local package inventory in-scope: synced with current references (no unresolved mirrors).
- Directly mapped packages: all in scope.
- Historical `-state` suffix candidates: resolved to `@vue-stately/*`.
- Remaining unmapped gaps: `0`.

## 2) Remaining inconsistencies to close

- None.

## 3) Sequencing (complete)

1. Close direct-mirror gaps for `@react-aria/data`, `@react-aria/flags`, `@react-aria/layout`, `@react-spectrum/theme` (`@vue-aria/data`, `@vue-aria/flags`, `@vue-aria/layout`, `@vue-spectrum/theme`).
2. Normalize state package naming from `@vue-aria/*-state` to `@vue-stately/*` without changing package folder names.
3. Replace obsolete `@vue-aria/types` with `@vue-types/shared`.
4. Re-run parity checks and keep `PLAN.md` and `ROADMAP.md` synchronized.

## 4) Completion criteria

- Zero unmapped packages in all in-scope families.
- Naming for state packages follows `@react-stately/*` -> local `@vue-stately/*`.
- `ROADMAP.md` and `PLAN.md` remain synchronized.
