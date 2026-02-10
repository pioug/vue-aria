# React Spectrum -> Vue Spectrum Port Tracker

This is the master checklist for parity with React Spectrum UI components in Vue.

## Progress Snapshot

- Completed packages: `22 / 64`
- Remaining packages: `42`
- Current stage: phase-1 foundation migration

## Upstream Source of Truth

- Repo submodule: `references/react-spectrum`
- Spectrum package roots: `references/react-spectrum/packages/@react-spectrum/*`
- Component behavior dependencies: `references/react-spectrum/packages/@react-aria/*` and `references/react-spectrum/packages/@react-stately/*`

## Completion Rules (Per Package)

1. Port runtime behavior in `packages/@vue-spectrum/<pkg>/src` with APIs and semantics aligned to upstream intent.
2. Port test scenarios from upstream into `packages/@vue-spectrum/<pkg>/test` and adapt for Vue.
3. Add docs page in `docs/spectrum/<pkg>.md` with usage, accessibility notes, and parity caveats.
4. Add/verify exports in umbrella entry (`@vue-spectrum/vue-spectrum`).
5. Mark package complete only after `npm run check`, `npm run test`, `npm run test:cross-browser`, and docs build pass.

## Program Setup (Not Counted In 64 Packages)

- [x] Create workspace scope `packages/@vue-spectrum/*` and monorepo TS references.
- [x] Add umbrella package `packages/@vue-spectrum/vue-spectrum`.
- [x] Add parity gate script `scripts/check-spectrum-parity.mjs` (tests + docs + exports coverage).
- [x] Add npm script `test:spectrum-parity` and wire into CI.
- [x] Add shared Spectrum docs section (`docs/spectrum/*`) and overview page.
- [x] Add cross-browser component harness pages for Spectrum components.
- [x] Define visual/theming baseline (tokens, scales, color schemes).
- [x] Add package scaffolding generator for one-package-per-upstream parity.

## Foundation, Theme, and Infrastructure

- In progress baseline: `@react-spectrum/provider` (Provider component, alias hooks, and component-level tests now ported), `@react-spectrum/utils` (classNames compatibility flags, slot utilities, `getWrappedElement`, media/device hooks, breakpoint utilities, DOM-ref utilities, style-prop conversion helpers, and `@react-aria/utils` parity re-exports `useValueEffect`/`useResizeObserver` now ported)
- [ ] `@react-spectrum/provider` -> `@vue-spectrum/provider`
- [ ] `@react-spectrum/utils` -> `@vue-spectrum/utils`
- [x] `@react-spectrum/icon` -> `@vue-spectrum/icon`
- [x] `@react-spectrum/form` -> `@vue-spectrum/form`
- [x] `@react-spectrum/label` -> `@vue-spectrum/label`
- [x] `@react-spectrum/layout` -> `@vue-spectrum/layout`
- [x] `@react-spectrum/text` -> `@vue-spectrum/text`
- [x] `@react-spectrum/view` -> `@vue-spectrum/view`
- [ ] `@react-spectrum/theme-default` -> `@vue-spectrum/theme-default`
- [ ] `@react-spectrum/theme-light` -> `@vue-spectrum/theme-light`
- [ ] `@react-spectrum/theme-dark` -> `@vue-spectrum/theme-dark`
- [ ] `@react-spectrum/theme-express` -> `@vue-spectrum/theme-express`
- [ ] `@react-spectrum/style-macro-s1` -> `@vue-spectrum/style-macro-s1`
- [ ] `@react-spectrum/test-utils` -> `@vue-spectrum/test-utils`
- [ ] `@react-spectrum/story-utils` -> `@vue-spectrum/story-utils` (internal)
- [ ] `@react-spectrum/s2` -> `@vue-spectrum/s2`

## Actions and Navigation

- In progress baseline: `@react-spectrum/button` now has Vue `Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, and `ToggleButton` primitives with parity-aligned press lifecycle callbacks (`onPressStart`/`onPressEnd`/`onPressUp`/`onPressChange`/`onPress`), pending-state behavior (`isPending` delayed spinner visibility plus repeated-press suppression) including localized pending announcements, anchor-element edge-case behavior, and expanded upstream-style test coverage (`Button`, `ActionButton`, `ToggleButton`, `ClearButton`, and SSR scenarios including `FieldButton`); pending parity includes remaining edge-case interaction nuances.
- In progress baseline: `@react-spectrum/actionbar` now has Vue `ActionBar` and `ActionBarContainer` primitives with baseline selection-count open/close behavior, clear-selection handling (`clear` action button + Escape key), and `ActionGroup` action wiring with starter test/docs/umbrella coverage; transition/focus-restore/announcement parity remains.
- In progress baseline: `@react-spectrum/actiongroup` now has Vue `ActionGroup` primitive with baseline item rendering and selection semantics (single/multiple state handling, disabled-key behavior, orientation classes, and roving keyboard focus including RTL handling) with starter test/docs/umbrella wiring; overflow-collapse/menu integration and icon-label collapse behavior remain.
- In progress baseline: `@react-spectrum/tag` now has Vue `TagGroup` and `Tag` primitives with baseline grid semantics (`grid`/`row`/`gridcell`), keyboard roving focus (LTR/RTL arrow behavior plus Home/End/PageUp/PageDown), disabled-key handling, and removable-tag callbacks with starter test/docs/umbrella wiring; advanced upstream action-area/max-rows behavior and field-validation integration remain.
- In progress baseline: `@react-spectrum/picker` now has Vue `Picker` primitive with baseline trigger/listbox interactions (open/close, keyboard navigation, click/keyboard selection, controlled/uncontrolled selection handling, and empty-string key coverage) with starter test/docs/umbrella wiring; advanced popover/tray behavior, async loading, and form/validation integration remain.
- In progress baseline: `@react-spectrum/menu` now has Vue `Menu`, `MenuItem`, `MenuTrigger`, and `ActionMenu` primitives with baseline trigger/menu interactions (open/close, keyboard navigation, click/keyboard item activation, controlled/default open state, and selection-state handling for `none`/`single`/`multiple`) with starter test/docs/umbrella wiring; advanced section/submenu/contextual-help and full overlay positioning parity remain.
- In progress baseline: `@react-spectrum/tabs` now has Vue `Tabs`, `TabList`, and `TabPanels` primitives with keyboard navigation and selection-state coverage (horizontal/vertical orientation behavior, automatic/manual activation, disabled-key handling, controlled/uncontrolled selection, and SSR/docs/umbrella wiring); pending parity includes overflow/collapse-to-picker behavior and advanced visual indicator parity.
- In progress baseline: `@react-spectrum/textfield` now has Vue `TextField` and `TextArea` primitives with label/help/error semantics, controlled/uncontrolled value handling, validation behavior coverage (`aria` + `native`), and SSR/docs/umbrella wiring; pending parity includes advanced icon/loading/auto-resize behavior and additional interaction edge cases.
- In progress baseline: `@react-spectrum/steplist` now has Vue `StepList` and `StepListItem` primitives with baseline progression and selection-state behavior (completed-step gating, controlled/uncontrolled selected step handling, disabled/read-only handling, and SSR/docs/umbrella wiring); advanced upstream collection integration and localized state-message parity remain.
- [ ] `@react-spectrum/button` -> `@vue-spectrum/button`
- [ ] `@react-spectrum/actionbar` -> `@vue-spectrum/actionbar`
- [ ] `@react-spectrum/actiongroup` -> `@vue-spectrum/actiongroup`
- [x] `@react-spectrum/buttongroup` -> `@vue-spectrum/buttongroup`
- [x] `@react-spectrum/link` -> `@vue-spectrum/link`
- [x] `@react-spectrum/breadcrumbs` -> `@vue-spectrum/breadcrumbs`
- [ ] `@react-spectrum/tabs` -> `@vue-spectrum/tabs`
- [x] `@react-spectrum/accordion` -> `@vue-spectrum/accordion`
- [ ] `@react-spectrum/steplist` -> `@vue-spectrum/steplist`
- [ ] `@react-spectrum/tag` -> `@vue-spectrum/tag`
- [ ] `@react-spectrum/menu` -> `@vue-spectrum/menu`
- [ ] `@react-spectrum/picker` -> `@vue-spectrum/picker`

## Inputs and Selection

- In progress baseline: `@react-spectrum/slider` now has Vue `Slider`, `RangeSlider`, `SliderBase`, and `SliderThumb` primitives with baseline parity-style tests/docs and umbrella wiring (controlled/uncontrolled behavior, value output semantics, localized range-thumb labels, min/max/step clamping normalization, keyboard page/home/end coverage, track-click behavior, and SSR coverage); advanced interaction and formatting parity remains.
- In progress baseline: `@react-spectrum/searchfield` now has Vue `SearchField` primitive with baseline parity-style tests/docs and umbrella wiring (search input semantics, Enter submit behavior, Escape and clear-button clear semantics, custom/default icon support, controlled/uncontrolled value behavior, description/error wiring, and SSR coverage); advanced upstream visual polish and theming parity remains.
- In progress baseline: `@react-spectrum/numberfield` now has Vue `NumberField` primitive with baseline parity-style tests/docs and umbrella wiring (numeric input semantics, min/max clamping, controlled/uncontrolled value handling, stepper increment/decrement behavior, hide-stepper support, hidden form-input support, and SSR coverage); advanced upstream locale/inputMode and wheel/long-press interaction parity remains.
- In progress baseline: `@react-spectrum/combobox` now has Vue `ComboBox` primitive with baseline input/listbox ARIA wiring via `@vue-aria/combobox` + `@vue-aria/combobox-state`, type-to-filter behavior, button-trigger opening, controlled/uncontrolled selection/input/open state handling, and starter/SSR tests plus docs/umbrella wiring; advanced popover/mobile-tray, sections, and full async UX parity remain.
- In progress baseline: `@react-spectrum/autocomplete` now has Vue `SearchAutocomplete` primitive with baseline combobox/search/listbox ARIA wiring via `@vue-aria/combobox` + `@vue-aria/combobox-state`, type-to-filter behavior, clear-button handling, submit callbacks, and starter/SSR tests plus docs/umbrella wiring; advanced popover/mobile-tray behavior, sections, and full async UX parity remain.
- In progress baseline: `@react-spectrum/filetrigger` now has Vue `FileTrigger` primitive with baseline parity-style tests/docs and umbrella wiring (pressable-child trigger behavior, hidden file-input wiring, accepted-file/multiple/capture/directory options, ref exposure utilities, and SSR coverage); advanced upstream interoperability edge cases remain.
- [x] `@react-spectrum/checkbox` -> `@vue-spectrum/checkbox`
- [x] `@react-spectrum/radio` -> `@vue-spectrum/radio`
- [x] `@react-spectrum/switch` -> `@vue-spectrum/switch`
- [ ] `@react-spectrum/slider` -> `@vue-spectrum/slider`
- [ ] `@react-spectrum/textfield` -> `@vue-spectrum/textfield`
- [ ] `@react-spectrum/searchfield` -> `@vue-spectrum/searchfield`
- [ ] `@react-spectrum/numberfield` -> `@vue-spectrum/numberfield`
- [ ] `@react-spectrum/combobox` -> `@vue-spectrum/combobox`
- [ ] `@react-spectrum/autocomplete` -> `@vue-spectrum/autocomplete`
- [ ] `@react-spectrum/color` -> `@vue-spectrum/color`
- [ ] `@react-spectrum/datepicker` -> `@vue-spectrum/datepicker`
- [ ] `@react-spectrum/calendar` -> `@vue-spectrum/calendar`
- [ ] `@react-spectrum/filetrigger` -> `@vue-spectrum/filetrigger`

## Lists, Tables, and Trees

- In progress baseline: `@react-spectrum/list` now has Vue `ListView` and `ListViewItem` primitives with baseline grid/list semantics (`grid` + `row` + `gridcell`), keyboard row navigation, controlled/uncontrolled single and multiple selection behavior, loading/empty-state rendering, and scroll-bottom `onLoadMore` behavior with starter/SSR tests plus docs/umbrella wiring; advanced child-action focus model and full drag-and-drop/visual parity remain.
- In progress baseline: `@react-spectrum/listbox` now has Vue `ListBox`, `ListBoxBase`, `ListBoxOption`, and `ListBoxSection` primitives with baseline grouped-option semantics (`group` + heading + divider behavior), keyboard navigation coverage (including optional wrap focus), controlled/uncontrolled single and multiple selection behavior, disabled-key handling, and starter/SSR tests plus docs/umbrella wiring; advanced virtualizer and full visual/theming parity remain.
- [ ] `@react-spectrum/list` -> `@vue-spectrum/list`
- [ ] `@react-spectrum/listbox` -> `@vue-spectrum/listbox`
- [ ] `@react-spectrum/table` -> `@vue-spectrum/table`
- [ ] `@react-spectrum/tree` -> `@vue-spectrum/tree`

## Overlays and Messaging

- In progress baseline: `@react-spectrum/overlays` now has Vue `Overlay` and `OpenTransition` primitives with baseline portal-mount behavior and transition lifecycle callback wiring plus starter/SSR tests and docs/umbrella wiring; `Modal`/`Popover`/`Tray` parity remains.
- In progress baseline: `@react-spectrum/dialog` now has Vue `Dialog`, `AlertDialog`, `DialogTrigger`, and `DialogContainer` primitives with baseline trigger/container wiring, dismiss/escape behavior, and alert-dialog action flows plus starter/SSR tests and docs/umbrella wiring; advanced overlay/context parity remains.
- In progress baseline: `@react-spectrum/illustratedmessage` now has Vue `IllustratedMessage` primitive with baseline root rendering behavior, slot-based heading/content styling wiring, and starter/SSR tests plus docs/umbrella wiring; advanced visual/theming parity remains.
- In progress baseline: `@react-spectrum/inlinealert` now has Vue `InlineAlert` primitive with baseline alert semantics, variant class behavior, autofocus handling, and starter/SSR tests plus docs/umbrella wiring; advanced icon/theming parity remains.
- In progress baseline: `@react-spectrum/tooltip` now has Vue `Tooltip` and `TooltipTrigger` primitives with baseline focus/hover trigger behavior, Escape/press close handling, and starter/SSR tests plus docs/umbrella wiring; advanced positioning and full overlay parity remains.
- In progress baseline: `@react-spectrum/contextualhelp` now has Vue `ContextualHelp` primitive with baseline quiet-trigger popover behavior, default/custom ARIA label handling, and starter/SSR tests plus docs/umbrella wiring; advanced icon/placement parity remains.
- In progress baseline: `@react-spectrum/toast` now has Vue `ToastContainer` and `ToastQueue` primitives with baseline global queue helpers, timeout and action/close behavior, single-active-container rendering, and starter/SSR tests plus docs/umbrella wiring; advanced icon/transition/focus-management parity remains.
- In progress baseline: `@react-spectrum/dnd` now has Vue `useDragAndDrop` composition hook with baseline draggable/droppable hook wiring over `@vue-aria/dnd` + `@vue-aria/dnd-state`, option-forwarding overrides, and starter/SSR tests plus docs/umbrella wiring; advanced preview/component-integration parity remains.
- In progress baseline: `@react-spectrum/dropzone` now has Vue `DropZone` primitive with baseline drag/drop lifecycle wiring (`@vue-aria/dnd`), filled-state banner behavior, and starter/SSR tests plus docs/umbrella wiring; advanced heading-context and full visual parity remain.
- [ ] `@react-spectrum/overlays` -> `@vue-spectrum/overlays`
- [ ] `@react-spectrum/dialog` -> `@vue-spectrum/dialog`
- [ ] `@react-spectrum/tooltip` -> `@vue-spectrum/tooltip`
- [ ] `@react-spectrum/contextualhelp` -> `@vue-spectrum/contextualhelp`
- [ ] `@react-spectrum/toast` -> `@vue-spectrum/toast`
- [ ] `@react-spectrum/inlinealert` -> `@vue-spectrum/inlinealert`
- [ ] `@react-spectrum/illustratedmessage` -> `@vue-spectrum/illustratedmessage`

## Drag and Drop

- [ ] `@react-spectrum/dnd` -> `@vue-spectrum/dnd`
- [ ] `@react-spectrum/dropzone` -> `@vue-spectrum/dropzone`

## Display and Status

- In progress baseline: `@react-spectrum/card` now has Vue `Card`, `CardView`, and layout class primitives with baseline tests/docs plus keyboard navigation (`Arrow*`, `Home`/`End`, `PageUp`/`PageDown`, and RTL-aware left/right navigation), selection state handling (`selectedKeys`/`defaultSelectedKeys`/`disabledKeys`/`onSelectionChange`) including controlled updates and falsy-key support, single/multiple selection coverage (including single-mode deselection on re-activate), loading-state and empty-state rendering (`loading`, `loadingMore`, `filtering`, `renderEmptyState`), scroll-bottom `onLoadMore` callback behavior (suppressed while loading), checkbox interaction behavior, `selectionMode="none"` behavior checks, focusable-child warnings (excluding internal checkbox), and falsy-id coverage; advanced layout and interaction parity is still pending.
- [x] `@react-spectrum/avatar` -> `@vue-spectrum/avatar`
- [x] `@react-spectrum/badge` -> `@vue-spectrum/badge`
- [ ] `@react-spectrum/card` -> `@vue-spectrum/card`
- [x] `@react-spectrum/divider` -> `@vue-spectrum/divider`
- [x] `@react-spectrum/image` -> `@vue-spectrum/image`
- [x] `@react-spectrum/labeledvalue` -> `@vue-spectrum/labeledvalue`
- [x] `@react-spectrum/meter` -> `@vue-spectrum/meter`
- [x] `@react-spectrum/progress` -> `@vue-spectrum/progress`
- [x] `@react-spectrum/statuslight` -> `@vue-spectrum/statuslight`
- [x] `@react-spectrum/well` -> `@vue-spectrum/well`

## Initial Dependency Baseline To Confirm During Setup

- [ ] Keep and reuse existing: `@internationalized/date`, `@internationalized/number`, `clsx`.
- [ ] Add icon dependencies for component parity: `@spectrum-icons/ui`, `@spectrum-icons/workflow`.
- [ ] Evaluate theme/token source strategy (`@adobe/spectrum-css-temp` parity vs Vue-native token pipeline).
- [ ] Add only package-specific dependencies when first required by a ported package.
