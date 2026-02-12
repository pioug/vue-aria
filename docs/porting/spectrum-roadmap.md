# React Spectrum Components Roadmap

This roadmap defines execution strategy for `@react-spectrum/*` -> `@vue-spectrum/*`.

For live package-by-package completion, use the canonical tracker:

- `SPECTRUM_PORTING_TRACKER.md`

## Strategy

- Keep repository/package structure close to upstream.
- Port complete package slices: behavior, upstream-equivalent tests, docs/preview, exports, and tracker updates in one pass.
- Reuse parity helpers only when an equivalent reusable helper exists upstream for that scope; otherwise keep tests local/explicit.
- Run horizontal lanes to deliver visible, end-to-end progress faster.
- Prioritize React Spectrum v1 parity before S2 expansion.
- Deprioritize S2 execution: no new S2 feature lanes while v1 parity remains incomplete.
- Keep one active package at a time via `SPECTRUM_WIP.md` (`npm run check:spectrum-workflow`).
- Track migration progress by upstream named-case parity using `SPECTRUM_TESTCASE_TRACKER.md` (`npm run update:spectrum-case-tracker`).
- Run docs style alias mining in dedicated batches (`npm run docs:style-alias-gaps`) and apply aliases in `docs/.vitepress/theme/spectrum-base.css`.

## Current Priority

- Active lane: v1 package completion and hardening across remaining incomplete `@vue-spectrum/*` packages.
- Objective in this lane: usable docs previews + behavior/test parity hardening + CI stability for v1.
- S2 lane status: paused except regression or unblocker fixes.
- Active package lock: see `SPECTRUM_WIP.md`.

## Phases

### Phase 1: Foundation and Themes

- Provider/context infrastructure
- Utils and style helpers
- Theme packages and baseline visual tokens

### Phase 2: Core Controls and Navigation

- Buttons, text/number/search inputs, selection controls
- Menus, pickers, tabs, action/navigation primitives

### Phase 3: Data and Overlay Systems

- Lists, listbox, table, tree, combobox/autocomplete
- Overlay stack: popovers, dialogs, tooltip, toast, contextual help

### Phase 4: Remaining v1 Components

- Display/status and long-tail packages
- Drag/drop integration and hardening

### Phase 5: Sign-off and Expansion

- Close remaining v1 parity gaps
- Freeze quality gates for v1
- Re-enable and expand S2 parity after v1 completion criteria are met

## Completion Criteria

A package is considered complete only when all conditions are met:

1. Behavior parity is implemented and verified against upstream scenarios.
2. API parity is implemented (public exports + component surface semantics aligned to upstream intent).
3. Upstream test parity is complete for the package:
missing upstream named cases = `0`
missing upstream test files = `none`
4. Docs page and preview are available and reflect the upstream-like API/composition model.
5. Base component visual parity lane is covered:
shared docs base styles and aliases are sufficient for usable Spectrum-like appearance.
6. Quality gates pass (`check`, tests, parity scripts, docs build).

## Guardrails

- Avoid status duplication across multiple docs.
- Treat `SPECTRUM_PORTING_TRACKER.md` as the only canonical checklist.
- Treat `SPECTRUM_TESTCASE_TRACKER.md` as the canonical upstream parity indicator.
- Keep local-only test counts as optional diagnostics (`npm run update:spectrum-case-tracker:diagnostics`), not as primary progress targets.
- Keep WIP to one package lock at a time in `SPECTRUM_WIP.md`.
- Update this roadmap only for strategy/priority changes, not granular package counts.
