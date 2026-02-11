# React Spectrum Components Roadmap

This roadmap defines execution strategy for `@react-spectrum/*` -> `@vue-spectrum/*`.

For live package-by-package completion, use the canonical tracker:

- `SPECTRUM_PORTING_TRACKER.md`

## Strategy

- Keep repository/package structure close to upstream.
- Port behavior first, then upstream-equivalent tests, then docs.
- Run horizontal lanes to deliver visible, end-to-end progress faster.
- Prioritize React Spectrum v1 parity before S2 expansion.

## Current Priority

- Active lane: `@vue-spectrum/button`, `@vue-spectrum/textfield`, `@vue-spectrum/dialog`.
- Objective in this lane: usable docs previews + behavior/test parity hardening.

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
- Expand S2 parity after v1 completion criteria are met

## Completion Criteria

A package is considered complete only when all conditions are met:

1. Runtime parity implementation exists.
2. Upstream-style tests are ported and passing.
3. Docs page and preview are available.
4. Umbrella exports are wired.
5. Quality gates pass (`check`, tests, parity scripts, docs build).

## Guardrails

- Avoid status duplication across multiple docs.
- Treat `SPECTRUM_PORTING_TRACKER.md` as the only canonical checklist.
- Update this roadmap only for strategy/priority changes, not granular package counts.
