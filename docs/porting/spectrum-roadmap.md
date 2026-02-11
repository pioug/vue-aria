# React Spectrum Components Roadmap

This roadmap defines how to port the `@react-spectrum/*` UI component layer to Vue with parity goals.

The React Aria hook layer is already complete; this is the next phase on top of that foundation.

## Master Tracker

The package-by-package checklist lives in `/SPECTRUM_PORTING_TRACKER.md`.

## Current Status

- Task progress: `59 / 76` completed.
- Phase 0 is complete; Phase 1 foundation migration is in progress.
- Initial baseline packages exist: `@vue-spectrum/provider`, `@vue-spectrum/icon`, `@vue-spectrum/utils`, `@vue-spectrum/vue-spectrum`.
- Foundation packages marked complete: `@vue-spectrum/icon`, `@vue-spectrum/form`, `@vue-spectrum/label`, `@vue-spectrum/text`, `@vue-spectrum/view`, `@vue-spectrum/layout`.
- Display/status package progress: `@vue-spectrum/divider`, `@vue-spectrum/well`, `@vue-spectrum/statuslight`, `@vue-spectrum/badge`, `@vue-spectrum/avatar`, `@vue-spectrum/image`, `@vue-spectrum/progress`, `@vue-spectrum/meter`, and `@vue-spectrum/labeledvalue` are now complete.
- Actions/navigation package progress: `@vue-spectrum/link`, `@vue-spectrum/buttongroup`, `@vue-spectrum/accordion`, and `@vue-spectrum/breadcrumbs` are now complete.
- Inputs/selection package progress: `@vue-spectrum/checkbox`, `@vue-spectrum/radio`, and `@vue-spectrum/switch` are now complete.
- `@vue-spectrum/slider` baseline is now in progress with initial `Slider`, `RangeSlider`, `SliderBase`, and `SliderThumb` ports, localized range-thumb labels, min/max/step clamping normalization for initial and controlled values, parity-style starter tests (single/range controlled/uncontrolled behavior, form/reset flows, label/value output behavior, keyboard page/home/end coverage, track-click handling, and SSR coverage), plus docs and umbrella wiring; advanced interaction and formatting parity remains.
- `@vue-spectrum/steplist` baseline is now in progress with initial `StepList` and `StepListItem` ports, including baseline progression and selection-state behavior (completed-step gating, controlled/uncontrolled selected step handling, and disabled/read-only behavior) with docs and umbrella wiring; advanced upstream collection integration and localized state-message parity remain.
- `@vue-spectrum/actiongroup` baseline is now in progress with initial `ActionGroup` port, including baseline item rendering, single/multiple selection state handling, disabled-key behavior, and arrow-key roving focus semantics (LTR/RTL) with docs and umbrella wiring; overflow-collapse/menu parity and icon-label collapse behavior remain.
- `@vue-spectrum/actionbar` baseline is now in progress with initial `ActionBar` and `ActionBarContainer` ports, including selection-count-driven open/close behavior, clear-selection handling (button + Escape), and `ActionGroup` action wiring with docs and umbrella wiring; transition/announcement parity remains.
- `@vue-spectrum/tag` baseline is now in progress with initial `TagGroup` and `Tag` ports, including baseline grid semantics (`grid`/`row`/`gridcell`), keyboard roving focus with RTL/LTR behavior, and removable-tag handling with docs and umbrella wiring; advanced upstream action-area/max-rows and field-validation integration remain.
- `@vue-spectrum/picker` baseline is now in progress with initial `Picker` port, including trigger/listbox open-close behavior, keyboard navigation (`Arrow*`, `Home`, `End`, `Enter`, `Space`, `Escape`), and controlled/uncontrolled selection behavior with docs and umbrella wiring; advanced popover/tray, async loading, and full form/validation parity remain.
- `@vue-spectrum/menu` baseline is now in progress with initial `Menu`, `MenuItem`, `MenuTrigger`, and `ActionMenu` ports, including trigger/menu open-close behavior, keyboard navigation (`Arrow*`, `Home`, `End`, `Enter`, `Space`, `Escape`), and single/multiple selection-state handling with docs and umbrella wiring; advanced sections/submenus/contextual-help and full popover positioning parity remain.
- `@vue-spectrum/list` baseline is now in progress with initial `ListView` and `ListViewItem` ports, including grid/list semantics (`grid` + `row` + `gridcell`), keyboard row navigation, controlled/uncontrolled single and multiple selection behavior, and loading/empty-state plus `onLoadMore` behavior with starter/SSR tests and docs/umbrella wiring; advanced child-action focus model and drag-and-drop parity remain.
- `@vue-spectrum/listbox` baseline is now in progress with initial `ListBox`, `ListBoxBase`, `ListBoxOption`, and `ListBoxSection` ports, including grouped-option semantics (`group` + heading/divider), keyboard navigation (with optional focus-wrap behavior), controlled/uncontrolled single and multiple selection behavior, and starter/SSR tests with docs and umbrella wiring; advanced virtualizer/layout parity remains.
- `@vue-spectrum/table` baseline is now in progress with initial `TableView`, `Column`, `TableHeader`, `TableBody`, `Section`, `Row`, and `Cell` ports, including static table semantics (`grid` + `rowgroup` + `row` + `columnheader` + `rowheader` + `gridcell`), keyboard row navigation, controlled/uncontrolled row selection, and starter sort-state/SSR coverage with docs and umbrella wiring; advanced upstream parity for resizing, nested rows, virtualization, and drag-and-drop remains.
- `@vue-spectrum/tree` baseline is now in progress with initial `TreeView`, `TreeViewItem`, and `TreeViewItemContent` ports, including nested treegrid semantics (`treegrid` + `row` + `gridcell`), controlled/uncontrolled expansion and selection state handling, keyboard navigation, and starter/SSR coverage with docs and umbrella wiring; richer static-composition parity and advanced drag-and-drop/collection behavior remain.
- `@vue-spectrum/illustratedmessage` baseline is now in progress with initial `IllustratedMessage` port, including root illustrated-message rendering behavior, slot-based heading/content styling wiring, and starter/SSR tests with docs and umbrella wiring; advanced visual/theming parity remains.
- `@vue-spectrum/inlinealert` baseline is now in progress with initial `InlineAlert` port, including alert role semantics, variant class behavior (`neutral`/`info`/`positive`/`notice`/`negative`), and autofocus handling with starter/SSR tests plus docs/umbrella wiring; advanced icon/theming parity remains.
- `@vue-spectrum/overlays` baseline is now in progress with initial `Overlay` and `OpenTransition` ports, including portal mounting behavior, transition lifecycle callback wiring, and starter/SSR tests with docs and umbrella wiring; `Modal`/`Popover`/`Tray` parity remains.
- `@vue-spectrum/dialog` baseline is now in progress with initial `Dialog`, `AlertDialog`, `DialogTrigger`, and `DialogContainer` ports, including baseline trigger/container overlay wiring, dismiss/escape handling, and alert-dialog action behavior with starter/SSR tests plus docs/umbrella wiring; advanced context/overlay integration parity remains.
- `@vue-spectrum/contextualhelp` baseline is now in progress with initial `ContextualHelp` port, including quiet-trigger popover wiring, default and custom ARIA label behavior, and starter/SSR tests plus docs/umbrella wiring; advanced icon/placement parity remains.
- `@vue-spectrum/tooltip` baseline is now in progress with initial `Tooltip` and `TooltipTrigger` ports, including focus/hover trigger behavior, Escape/press close handling, and starter/SSR tests with docs and umbrella wiring; advanced placement/overlay parity remains.
- `@vue-spectrum/toast` baseline is now in progress with initial `ToastContainer`/`ToastQueue` port, including global toast queue helpers, single active container behavior, timeout and action/close handling, and starter/SSR tests with docs/umbrella wiring; advanced icon/transition/focus-management parity remains.
- `@vue-spectrum/dnd` baseline is now in progress with initial `useDragAndDrop` port, including draggable/droppable hook composition over `@vue-aria/dnd` + `@vue-aria/dnd-state`, option forwarding overrides, and starter/SSR tests with docs/umbrella wiring; advanced preview/component-integration parity remains.
- `@vue-spectrum/dropzone` baseline is now in progress with initial `DropZone` port, including drag/drop lifecycle wiring via `@vue-aria/dnd`, filled-state banner behavior, and starter/SSR tests with docs/umbrella wiring; advanced heading-context and full visual parity remain.
- `@vue-spectrum/tabs` baseline is now in progress with initial `Tabs`, `TabList`, and `TabPanels` ports, including keyboard navigation coverage (horizontal/vertical, automatic/manual activation, disabled-key behavior), controlled/uncontrolled selection behavior, and docs/umbrella wiring; overflow/collapse-to-picker parity remains.
- `@vue-spectrum/textfield` baseline is now in progress with initial `TextField` and `TextArea` ports, including label/help/error wiring, controlled/uncontrolled value handling, native/ARIA validation behavior, and docs/umbrella wiring; advanced upstream icon/loading/auto-resize behavior remains.
- `@vue-spectrum/searchfield` baseline is now in progress with initial `SearchField` port, including Enter-submit and Escape/clear-button behavior parity, controlled/uncontrolled value handling, custom/default icon behavior, and docs/umbrella wiring; advanced upstream visual/theming parity remains.
- `@vue-spectrum/numberfield` baseline is now in progress with initial `NumberField` port, including min/max clamping, controlled/uncontrolled value behavior, stepper increment/decrement handling, hide-stepper and hidden-input support, and docs/umbrella wiring; advanced upstream locale/inputMode and wheel/long-press parity remains.
- `@vue-spectrum/combobox` baseline is now in progress with initial `ComboBox` port, including combobox/input/listbox ARIA wiring, type-to-filter behavior, button-trigger opening, controlled/uncontrolled selection/input/open state behavior, and starter/SSR tests with docs and umbrella wiring; advanced popover/mobile-tray, sectioned collections, and full async parity remain.
- `@vue-spectrum/autocomplete` baseline is now in progress with initial `SearchAutocomplete` port, including combobox/search/listbox ARIA wiring, type-to-filter behavior, clear-button handling, submit callbacks, and starter/SSR tests with docs and umbrella wiring; advanced popover/mobile-tray behavior, sectioned collections, and full async UX parity remain.
- `@vue-spectrum/calendar` baseline is now in progress with initial `Calendar` and `RangeCalendar` ports, including month paging behavior, selected-date/range semantics, click and keyboard date selection flow, and starter/SSR tests with docs and umbrella wiring; advanced visual/theming parity and deeper locale-formatting parity remain.
- `@vue-spectrum/color` baseline is now in progress with initial `ColorArea`, `ColorWheel`, `ColorSlider`, `ColorField`, `ColorSwatch`, `ColorPicker`, `ColorEditor`, `ColorSwatchPicker`, and `ColorThumb` ports, including baseline hex-color parse/edit flows, slider/area/wheel interactions, and starter/SSR tests with docs and umbrella wiring; advanced color-space conversion behavior and full visual/theming parity remain.
- `@vue-spectrum/datepicker` baseline is now in progress with initial `DateField`, `TimeField`, `DatePicker`, and `DateRangePicker` ports, including native input-backed date/time field behavior, popover calendar selection flow for single and range values, and starter/SSR tests with docs and umbrella wiring; segmented-field rendering, full range-time behavior, and visual/theming parity remain.
- `@vue-spectrum/filetrigger` baseline is now in progress with initial `FileTrigger` port, including pressable-child trigger behavior, hidden file-input wiring, accepted-file/multiple/capture/directory options, and docs/umbrella wiring; advanced upstream interoperability edge cases remain.
- `@vue-spectrum/button` baseline is now in progress with `Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, and `ToggleButton` ports plus expanded parity-style tests (press lifecycle callbacks, pending-state spinner behavior, disabled/focus behavior, anchor rendering, toggle state, and SSR coverage including `FieldButton`), including localized pending announcements; pending parity still includes deeper interaction edge cases.
- `@vue-spectrum/card` baseline is now in progress with initial `Card`, `CardView`, and layout class ports plus parity-aligned starter tests (including keyboard-nav with `Arrow*`, `Home`/`End`, `PageUp`/`PageDown`, and RTL left/right mapping, single/multiple selection handling with single-mode deselection behavior, controlled/falsy-key selection behavior, loading/empty-state behavior (`loading`, `loadingMore`, `filtering`, `renderEmptyState`), scroll-bottom `onLoadMore` callback behavior with loading-state suppression, checkbox interaction, `selectionMode="none"` behavior, focusable-child warning behavior, and falsy-id coverage); advanced interaction/layout parity remains.
- `@vue-spectrum/provider` now includes a `Provider` component surface, React Spectrum-style alias exports (`useProvider*`), and component-level parity tests (package still in-progress for full parity).
- `@vue-spectrum/utils` now includes React Spectrum-style `classNames` CSS-module mapping plus compatibility toggles (`keepSpectrumClassNames`/`shouldKeepSpectrumClassNames`), slot utilities (`useSlotProps`, `SlotProvider`, `ClearSlots`), `getWrappedElement`, media/device helpers (`useMediaQuery`, `useIsMobileDevice`, `useHasChild`), breakpoint utilities (`BreakpointProvider`, `useMatchedBreakpoints`, `useBreakpoint`), DOM-ref helpers (`createDOMRef`, `useDOMRef`, `useFocusableRef`, unwrap helpers), style-prop conversion primitives (`convertStyleProps`/`useStyleProps`), and `@react-aria/utils` parity re-exports (`useValueEffect`, `useResizeObserver`); remaining utility surfaces stay in progress.
- `@vue-spectrum/theme-default` baseline is now in progress with initial `theme` export wired to the provider class-map contract (`global`, `light`, `dark`, `medium`, `large`) plus starter integration tests/docs; full upstream token/CSS parity remains.
- `@vue-spectrum/theme-light` baseline is now in progress with initial `theme` export wired to provider-compatible theme sections plus light/dark class-variant coverage (`lightest`/`darkest`) and starter integration tests/docs; full upstream token/CSS parity remains.
- `@vue-spectrum/theme-dark` baseline is now in progress with initial `theme` export wired to provider-compatible theme sections plus dark-biased class-variant coverage (`dark`/`darkest`) and starter integration tests/docs; full upstream token/CSS parity remains.
- `@vue-spectrum/theme-express` baseline is now in progress with initial `theme` export layered on top of `@vue-spectrum/theme-default`, adding express global and scale class variants (`spectrum--express`, `spectrum--express-medium`, `spectrum--express-large`) plus starter integration tests/docs; full upstream token/CSS parity remains.
- `@vue-spectrum/style-macro-s1` baseline is now in progress with upstream-compatible package layout (`index.ts`, `src/runtime.ts`, `src/style-macro.ts`, `src/spectrum-theme.ts`, `src/types.ts`), starter runtime/helper tests (`mergeStyles`, `baseColor`, `lightDark`, `focusRing`, `raw`, `keyframes`), docs, and umbrella wiring; full macro/token parity remains.
- `@vue-spectrum/test-utils` baseline is now in progress with upstream-style package layout (`index.ts`, `src/index.ts`, `src/testSetup.ts`), mobile/desktop screen-width simulation helpers (`simulateMobile`, `simulateDesktop`) supporting global `jest`/`vi` spy APIs, starter tests, docs, and umbrella wiring; parity re-export coverage for `@react-aria/test-utils` remains.
- `@vue-spectrum/story-utils` baseline is now in progress with upstream-style package layout (`index.ts`, `src/index.ts`, `src/ErrorBoundary.tsx`, `src/GeneratePowerset.tsx`) adapted to Vue equivalents (`ErrorBoundary`, `generatePowerset`) plus starter tests, docs, and umbrella wiring; storybook-specific parity hardening remains.
- Spectrum parity gate script is available at `npm run test:spectrum-parity`.
- Spectrum docs now include cross-browser demos at `/spectrum/cross-browser-demos`.
- CI now runs `npm run test:spectrum-parity` on pull requests and pushes to `main`.

## Progress Breakdown

- Program setup tasks: `8 / 8` completed.
- Foundation/theme/infrastructure packages: `6 / 16` completed.
- Actions/navigation packages: `4 / 12` completed.
- Inputs/selection packages: `3 / 13` completed.
- Lists/tables/trees packages: `0 / 4` completed.
- Overlays/messaging packages: `0 / 7` completed.
- Drag/drop packages: `0 / 2` completed.
- Display/status packages: `9 / 10` completed.
- Dependency-baseline tasks: `0 / 4` completed.

## Current Critical Path

1. Move in-progress foundation packages from baseline to complete parity: `provider`, `icon`, and `utils`.
2. Continue infrastructure support package migration needed for large-scale component work: `s2` (with `style-macro-s1`, `test-utils`, and `story-utils` baselines now in progress).
3. Lock theme layer strategy and harden parity for `theme-default`, `theme-light`, `theme-dark`, and `theme-express`.
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
3. Continue support package track: `@vue-spectrum/style-macro-s1`, `@vue-spectrum/test-utils`, `@vue-spectrum/story-utils`, and `@vue-spectrum/s2`.
4. Continue infrastructure track by porting `@vue-spectrum/s2` next.
