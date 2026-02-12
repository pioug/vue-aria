# Porting Status

This page is the consolidated entry point for migration status and execution model.

## Current Mode

- React Aria layer (`@vue-aria/*`): parity-complete baseline, maintenance/hardening mode.
- React Spectrum layer (`@vue-spectrum/*`): active migration.
- Priority: complete React Spectrum v1 parity before any further S2 expansion.
- S2 execution state: paused/deprioritized (new S2 feature slices are deferred until v1 completion gates pass).
- Active horizontal lane: v1 packages only (behavior parity, test parity, docs/preview usability, and CI stability).
- Active styling lane: shared Spectrum docs base styles include broad runtime alias coverage for both `spectrum-*` and `react-spectrum-*` classes (`docs/.vitepress/theme/spectrum-base.css`), and alias gaps are mined in batch via `npm run docs:style-alias-gaps` (`docs/porting/style-alias-gaps.md`).
- Active WIP lock: exactly one package is active at a time via `SPECTRUM_WIP.md` and `npm run check:spectrum-workflow`.
- Progress indicator baseline: test-case parity totals in `SPECTRUM_TESTCASE_TRACKER.md` (`npm run update:spectrum-case-tracker`).

## Source of Truth

- Canonical Spectrum package checklist: `SPECTRUM_PORTING_TRACKER.md`
- Canonical test-case parity counts: `SPECTRUM_TESTCASE_TRACKER.md`
- Active package lock and slice discipline: `SPECTRUM_WIP.md`
- Spectrum strategy/phases and priorities: `/porting/spectrum-roadmap`
- React Aria completed tracker: `PORTING_TRACKER.md`
- React Aria historical roadmap (archived): `/porting/roadmap`

## How Work Is Executed

1. Select a horizontal lane (small set of related components).
2. Port upstream runtime behavior from `references/react-spectrum`.
3. Port/adapt upstream test scenarios.
4. Update component docs with a usable preview and parity notes.
5. Update trackers/roadmap immediately after each merged batch.
6. Keep CI gates green before marking progress.
7. Regenerate case-count progress (`npm run update:spectrum-case-tracker`) after parity slices.

## Definition Of Done (Per Package)

1. Runtime behavior in `packages/@vue-spectrum/<pkg>/src` is parity-aligned.
2. Test coverage in `packages/@vue-spectrum/<pkg>/test` includes upstream scenarios adapted to Vue.
3. Docs page exists at `docs/spectrum/<pkg>.md` with preview + parity notes.
4. Package is exported by `@vue-spectrum/vue-spectrum`.
5. Validation passes:

```bash
npm run check
npm run test
npm run test:parity
npm run test:spectrum-parity
npm run test:spectrum-case-parity
npm run check:spectrum-workflow
npm run docs:build
```

## Why This Structure

- One canonical tracker avoids status drift.
- A strategy roadmap captures decisions and priorities.
- Package docs stay focused on usage and parity notes, not global planning detail.
