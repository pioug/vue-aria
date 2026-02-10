# React Spectrum Components Roadmap

This roadmap defines how to port the `@react-spectrum/*` UI component layer to Vue with parity goals.

The React Aria hook layer is already complete; this is the next phase on top of that foundation.

## Master Tracker

The package-by-package checklist lives in `/SPECTRUM_PORTING_TRACKER.md`.

## Current Status

- Task progress: `29 / 76` completed.
- Phase 0 is complete; Phase 1 foundation migration is in progress.
- Initial baseline packages exist: `@vue-spectrum/provider`, `@vue-spectrum/icon`, `@vue-spectrum/utils`, `@vue-spectrum/vue-spectrum`.
- Foundation packages marked complete: `@vue-spectrum/icon`, `@vue-spectrum/form`, `@vue-spectrum/label`, `@vue-spectrum/text`, `@vue-spectrum/view`, `@vue-spectrum/layout`.
- Display/status package progress: `@vue-spectrum/divider`, `@vue-spectrum/well`, `@vue-spectrum/statuslight`, `@vue-spectrum/badge`, `@vue-spectrum/avatar`, `@vue-spectrum/image`, `@vue-spectrum/progress`, `@vue-spectrum/meter`, and `@vue-spectrum/labeledvalue` are now complete.
- Actions/navigation package progress: `@vue-spectrum/link`, `@vue-spectrum/buttongroup`, and `@vue-spectrum/accordion` are now complete.
- Inputs/selection package progress: `@vue-spectrum/checkbox`, `@vue-spectrum/radio`, and `@vue-spectrum/switch` are now complete.
- `@vue-spectrum/slider` baseline is now in progress with initial `Slider`, `RangeSlider`, `SliderBase`, and `SliderThumb` ports, localized range-thumb labels, min/max/step clamping normalization for initial and controlled values, parity-style starter tests (single/range controlled/uncontrolled behavior, form/reset flows, label/value output behavior, keyboard page/home/end coverage, track-click handling, and SSR coverage), plus docs and umbrella wiring; advanced interaction and formatting parity remains.
- `@vue-spectrum/button` baseline is now in progress with `Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, and `ToggleButton` ports plus expanded parity-style tests (press lifecycle callbacks, pending-state spinner behavior, disabled/focus behavior, anchor rendering, toggle state, and SSR coverage including `FieldButton`), including localized pending announcements; pending parity still includes deeper interaction edge cases.
- `@vue-spectrum/card` baseline is now in progress with initial `Card`, `CardView`, and layout class ports plus parity-aligned starter tests (including keyboard-nav with `Arrow*`, `Home`/`End`, `PageUp`/`PageDown`, and RTL left/right mapping, single/multiple selection handling with single-mode deselection behavior, controlled/falsy-key selection behavior, loading/empty-state behavior (`loading`, `loadingMore`, `filtering`, `renderEmptyState`), scroll-bottom `onLoadMore` callback behavior with loading-state suppression, checkbox interaction, `selectionMode="none"` behavior, focusable-child warning behavior, and falsy-id coverage); advanced interaction/layout parity remains.
- `@vue-spectrum/provider` now includes a `Provider` component surface, React Spectrum-style alias exports (`useProvider*`), and component-level parity tests (package still in-progress for full parity).
- `@vue-spectrum/utils` now includes React Spectrum-style `classNames` CSS-module mapping plus compatibility toggles (`keepSpectrumClassNames`/`shouldKeepSpectrumClassNames`), slot utilities (`useSlotProps`, `SlotProvider`, `ClearSlots`), `getWrappedElement`, media/device helpers (`useMediaQuery`, `useIsMobileDevice`, `useHasChild`), breakpoint utilities (`BreakpointProvider`, `useMatchedBreakpoints`, `useBreakpoint`), DOM-ref helpers (`createDOMRef`, `useDOMRef`, `useFocusableRef`, unwrap helpers), style-prop conversion primitives (`convertStyleProps`/`useStyleProps`), and `@react-aria/utils` parity re-exports (`useValueEffect`, `useResizeObserver`); remaining utility surfaces stay in progress.
- Spectrum parity gate script is available at `npm run test:spectrum-parity`.
- Spectrum docs now include cross-browser demos at `/spectrum/cross-browser-demos`.
- CI now runs `npm run test:spectrum-parity` on pull requests and pushes to `main`.

## Progress Breakdown

- Program setup tasks: `8 / 8` completed.
- Foundation/theme/infrastructure packages: `6 / 16` completed.
- Actions/navigation packages: `3 / 12` completed.
- Inputs/selection packages: `3 / 13` completed.
- Lists/tables/trees packages: `0 / 4` completed.
- Overlays/messaging packages: `0 / 7` completed.
- Drag/drop packages: `0 / 2` completed.
- Display/status packages: `9 / 10` completed.
- Dependency-baseline tasks: `0 / 4` completed.

## Current Critical Path

1. Move in-progress foundation packages from baseline to complete parity: `provider`, `icon`, and `utils`.
2. Complete infrastructure support packages needed for large-scale component work: `style-macro-s1`, `test-utils`, `story-utils`, and `s2`.
3. Lock theme layer strategy and implement `theme-default`, `theme-light`, `theme-dark`, and `theme-express`.
4. Start high-volume controls only after the above are stable and parity-gated.

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

1. Deepen `@vue-spectrum/provider` parity (`Provider` wrapper behavior, slot/context behavior, and SSR-focused coverage).
2. Deepen `@vue-spectrum/icon` parity (slot behavior and class/style integration edge cases), then move it from baseline to complete.
3. Begin support package track: `@vue-spectrum/style-macro-s1`, `@vue-spectrum/test-utils`, `@vue-spectrum/story-utils`, and `@vue-spectrum/s2`.
4. Begin theme package track (`@vue-spectrum/theme-default` first) now that foundation dependencies are in place.
