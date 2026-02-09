# React Spectrum Components Roadmap

This roadmap defines how to port the `@react-spectrum/*` UI component layer to Vue with parity goals.

The React Aria hook layer is already complete; this is the next phase on top of that foundation.

## Master Tracker

The package-by-package checklist lives in `/SPECTRUM_PORTING_TRACKER.md`.

## Current Status

- Task progress: `6 / 76` completed.
- Phase 0 is in progress with workspace scaffolding complete.
- Initial baseline packages exist: `@vue-spectrum/provider`, `@vue-spectrum/icon`, `@vue-spectrum/utils`, `@vue-spectrum/vue-spectrum`.
- Spectrum parity gate script is available at `npm run test:spectrum-parity`.
- Spectrum docs now include cross-browser demos at `/spectrum/cross-browser-demos`.
- CI now runs `npm run test:spectrum-parity` on pull requests and pushes to `main`.

## Progress Breakdown

- Program setup tasks: `6 / 8` completed.
- Foundation/theme/infrastructure packages: `0 / 16` completed.
- Actions/navigation packages: `0 / 12` completed.
- Inputs/selection packages: `0 / 13` completed.
- Lists/tables/trees packages: `0 / 4` completed.
- Overlays/messaging packages: `0 / 7` completed.
- Drag/drop packages: `0 / 2` completed.
- Display/status packages: `0 / 10` completed.
- Dependency-baseline tasks: `0 / 4` completed.

## Current Critical Path

1. Finish Phase 0 remaining tasks (`2` items): theming baseline definition and scaffolding generator.
2. Move in-progress foundation packages from baseline to complete parity: `provider`, `icon`, and `utils`.
3. Complete foundation dependencies for broad component work: `form`, `label`, `text`, `layout`, `view`.
4. Lock theme layer strategy and implement `theme-default`, `theme-light`, `theme-dark`, and `theme-express`.
5. Start high-volume controls only after the above are stable and parity-gated.

## Scope

- In scope: component packages under `references/react-spectrum/packages/@react-spectrum/*`.
- Target: package structure close to upstream (`one Vue package per upstream package`).
- Goal: behavior, accessibility, testing, and docs parity.

## Parity Strategy (Same As React Aria)

1. Port behavior from upstream package sources first.
2. Port/replicate upstream test scenarios for each package.
3. Document each component package with examples and accessibility notes.
4. Keep exports and package boundaries aligned with upstream naming.
5. Gate completion on automated checks and cross-browser validation.

## Proposed Repository Structure

```text
packages/
  @vue-aria/*                # already ported hooks/state primitives
  @vue-spectrum/provider
  @vue-spectrum/button
  ...                        # one package per @react-spectrum/* package
  @vue-spectrum/vue-spectrum # umbrella exports for component layer

docs/
  spectrum/
    overview.md
    button.md
    ...
```

## Quality Gates

- Unit/integration tests for every component package.
- Keyboard and screen-reader semantics verified for every interactive component.
- Cross-browser checks in Chromium, Firefox, and WebKit for critical component flows.
- Docs page for every exported component package.
- Parity script for Spectrum layer coverage (tests + docs + export checks).

## Phased Execution Plan

### Phase 0: Program Setup

- Scaffold `@vue-spectrum/*` workspace and umbrella exports.
- Add `SPECTRUM_PORTING_TRACKER.md`-driven parity checks to CI.
- Stand up docs section at `docs/spectrum/*`.
- Lock dependency baseline (icons, theme/tokens, package-specific additions only when needed).

### Phase 1: Foundation and Theming

- Port core infra packages first: provider, utils, icon, form/label/text/layout/view.
- Port theme packages: `theme-default`, `theme-light`, `theme-dark`, `theme-express`.
- Validate global concerns: scale, color scheme, locale/direction, disabled state, overlays root.

### Phase 2: High-Leverage Controls

- Port high-volume controls first: button families, text/number/search, checkbox/radio/switch, slider.
- Port navigation/action controls: tabs, menu, picker, breadcrumbs, link, action groups.
- Ensure parity for focus management, press semantics, validation behavior, and labeling.

### Phase 3: Complex Data and Overlay Components

- Port collections/components with richer state models: list, listbox, table, tree, combobox/autocomplete.
- Port overlay/messaging stack: overlays, dialog, tooltip, contextual help, toast, inline alert.
- Port drag-and-drop UI layer: dnd and dropzone.

### Phase 4: Remaining Display and Long-Tail Components

- Port display/status components: card, avatar, image, divider, badge, status light, meter, progress, well, labeled value.
- Port date/color/file entry components with full interaction parity: datepicker/calendar, color, filetrigger.
- Evaluate `s2` and internal support packages (`style-macro-s1`, `test-utils`, `story-utils`) for Vue equivalents needed for parity tooling and docs.

### Phase 5: Hardening and Sign-off

- Close parity gaps found via cross-browser and accessibility audits.
- Freeze package API surfaces and docs completeness.
- Reach tracker state `64 / 64` completed.
- Publish stable parity baseline for building a Vue Spectrum-style component library on top.

## Dependency Plan

Dependency additions should stay incremental and justified by an actively ported package.

Baseline expected to be needed during Spectrum component migration:

- `@spectrum-icons/ui`
- `@spectrum-icons/workflow`
- Existing React Aria-port dependencies already present in this repo

Theme/tokens source (`@adobe/spectrum-css-temp` parity vs Vue-native token pipeline) should be decided in Phase 1 and documented before broad component porting starts.

## Immediate Next Steps

1. Define and document the Spectrum theming/token baseline for Phase 1 implementation.
2. Add a package scaffolding generator for one-package-per-upstream migration workflow.
3. Deepen `@vue-spectrum/provider` parity (`Provider` wrapper behavior, slot/context behavior, and SSR-focused coverage).
4. Deepen `@vue-spectrum/icon` parity (slot behavior and class/style integration edge cases), then begin `@vue-spectrum/form`.
