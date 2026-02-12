# React Spectrum -> Vue Spectrum Port Tracker

This is the master checklist for parity with React Spectrum UI components in Vue.
It is the canonical source of truth for package completion status.

Companion docs:

- Consolidated status/process: `docs/porting/status.md`
- Strategy and phases: `docs/porting/spectrum-roadmap.md`

## Progress Snapshot

- Completed packages: `22 / 64`
- Remaining packages: `42`
- Current stage: phase-1 foundation migration
- Priority mode: complete React Spectrum v1 package parity first; S2 feature work is paused until v1 reaches completion gates.
- Active focus lane: v1 package parity/hardening only (runtime + tests + docs usability/styling + CI stability).

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

- In progress baseline: `@react-spectrum/provider` (Provider component, alias hooks, nested-direction warning parity, and expanded component-level tests now ported including OS light/dark defaults plus nested ancestor color-scheme update coverage), `@react-spectrum/utils` (classNames compatibility flags, slot utilities, `getWrappedElement`, media/device hooks, breakpoint utilities, DOM-ref utilities, style-prop conversion helpers, and `@react-aria/utils` parity re-exports `useValueEffect`/`useResizeObserver` now ported, with additional slot-id override coverage for `useId`-generated slot props), `@react-spectrum/theme-default` (baseline `theme` export now ported with provider-compatible theme sections and starter integration tests/docs), `@react-spectrum/theme-light` (baseline `theme` export now ported with provider-compatible sections and light/dark class-variant coverage plus starter integration tests/docs), `@react-spectrum/theme-dark` (baseline `theme` export now ported with provider-compatible sections and dark-biased class-variant coverage plus starter integration tests/docs), `@react-spectrum/theme-express` (baseline `theme` export now ported on top of `theme-default` with express global + scale class variants and starter integration tests/docs), `@react-spectrum/style-macro-s1` (baseline package layout/runtime helpers now ported with starter merge/helper tests and docs), `@react-spectrum/test-utils` (baseline package layout now ported with screen-width test helpers and starter docs/tests), `@react-spectrum/story-utils` (baseline package layout now ported with Vue `ErrorBoundary` + `generatePowerset` equivalents and starter docs/tests), `@react-spectrum/s2` (baseline package now includes shared utility exports `pressScale`/`isDocsEnv`/`createIcon`/`createIllustration` and first component primitives `Provider`/`Accordion`/`AccordionItem`/`AccordionItemHeader`/`AccordionItemTitle`/`AccordionItemPanel`/`Disclosure`/`DisclosurePanel`/`DisclosureTitle`/`ActionBar`/`ActionMenu`/`AlertDialog`/`Breadcrumbs`/`Breadcrumb`/`BreadcrumbItem`/`Button`/`LinkButton`/`ActionButton`/`ActionButtonGroup`/`Avatar`/`Badge`/`ButtonGroup`/`Card`/`CardView`/`ComboBox`/`ComboBoxItem`/`ComboBoxSection`/`ColorArea`/`ColorField`/`ColorSlider`/`ColorSwatch`/`ColorSwatchPicker`/`ColorWheel`/`Heading`/`Header`/`Content`/`Text`/`Keyboard`/`Footer`/`Checkbox`/`CheckboxGroup`/`CloseButton`/`ContextualHelp`/`DateField`/`DatePicker`/`DateRangePicker`/`TimeField`/`Dialog`/`CustomDialog`/`FullscreenDialog`/`DialogTrigger`/`DialogContainer`/`useDialogContainer`/`Divider`/`DropZone`/`Form`/`Image`/`IllustratedMessage`/`InlineAlert`/`Link`/`Meter`/`Menu`/`MenuItem`/`MenuTrigger`/`NumberField`/`Picker`/`PickerItem`/`PickerSection`/`ProgressBar`/`ProgressCircle`/`SearchField`/`TableView`/`TableHeader`/`TableBody`/`Column`/`Row`/`Cell`/`TreeView`/`TreeViewItem`/`TreeViewItemContent`/`TreeViewLoadMoreItem`/`Radio`/`RadioGroup`/`SelectBox`/`SelectBoxGroup`/`Slider`/`RangeSlider`/`StatusLight`/`Switch`/`TagGroup`/`Tag`/`TextField`/`TextArea`/`ToastContainer`/`ToastQueue`/`ToggleButton`/`ToggleButtonGroup`/`Tooltip`/`TooltipTrigger`/`Well`, plus starter docs/tests, keyboard parity hardening for `SelectBoxGroup` navigation/selection edge cases, sortable-header callback coverage for `TableView`, trigger/menu action-flow coverage for `MenuTrigger`, `isHidden` unmount coverage for content primitives, baseline date/time-range wrapper coverage, baseline tag-grid/removal coverage, baseline tooltip trigger coverage, baseline action-bar wrapper coverage, baseline breadcrumb export-name parity coverage, baseline dialog wrapper/hook coverage, baseline color wrapper coverage, and baseline form/contextual-help/dropzone coverage)
- Priority note: `@react-spectrum/s2` is currently paused for new scope until v1 package parity (`64 / 64`) is complete and quality gates pass.
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

## S2 Detailed Export Tracker

- Scope: runtime exports from `references/react-spectrum/packages/@react-spectrum/s2/src/index.ts`, excluding `*Context` and type-only exports.
- Current export parity in `packages/@vue-spectrum/s2/src/index.ts`: `103 / 133`.
- Priority lane: paused/deferred while v1 package parity remains in progress.
- Execution policy: keep this tracker for visibility, but do not schedule new S2 feature slices until v1 parity completion gates are met.
- Normalization note: this tracker checks exact upstream export names, so wrapper renames (for example `BreadcrumbItem` vs upstream `Breadcrumb`) remain visible as pending.
- Local-only utility note: `isDocsEnv` exists in Vue S2 but is not part of the upstream runtime export set and is not counted below.

- [x] `Accordion` — `5 / 5` exported; missing: none
- [x] `ActionBar` — `1 / 1` exported; missing: none
- [x] `ActionButton` — `1 / 1` exported; missing: none
- [x] `ActionButtonGroup` — `1 / 1` exported; missing: none
- [x] `ActionMenu` — `1 / 1` exported; missing: none
- [x] `AlertDialog` — `1 / 1` exported; missing: none
- [x] `Avatar` — `1 / 1` exported; missing: none
- [ ] `AvatarGroup` — `0 / 1` exported; missing: `AvatarGroup`
- [x] `Badge` — `1 / 1` exported; missing: none
- [x] `Breadcrumbs` — `2 / 2` exported; missing: none
- [x] `Button` — `2 / 2` exported; missing: none
- [x] `ButtonGroup` — `1 / 1` exported; missing: none
- [x] `Calendar` — `1 / 1` exported; missing: none
- [ ] `Card` — `1 / 6` exported; missing: `CardPreview`, `CollectionCardPreview`, `AssetCard`, `UserCard`, `ProductCard`
- [x] `CardView` — `1 / 1` exported; missing: none
- [x] `Checkbox` — `1 / 1` exported; missing: none
- [x] `CheckboxGroup` — `1 / 1` exported; missing: none
- [x] `CloseButton` — `1 / 1` exported; missing: none
- [x] `ColorArea` — `1 / 1` exported; missing: none
- [x] `ColorField` — `1 / 1` exported; missing: none
- [x] `ColorSlider` — `1 / 1` exported; missing: none
- [x] `ColorSwatch` — `1 / 1` exported; missing: none
- [x] `ColorSwatchPicker` — `1 / 1` exported; missing: none
- [x] `ColorWheel` — `1 / 1` exported; missing: none
- [x] `ComboBox` — `3 / 3` exported; missing: none
- [x] `ContextualHelp` — `1 / 1` exported; missing: none
- [x] `DateField` — `1 / 1` exported; missing: none
- [x] `DatePicker` — `1 / 1` exported; missing: none
- [x] `DateRangePicker` — `1 / 1` exported; missing: none
- [x] `Disclosure` — `4 / 4` exported
- [x] `Content` — `6 / 6` exported; missing: none
- [x] `Dialog` — `1 / 1` exported; missing: none
- [x] `CustomDialog` — `1 / 1` exported; missing: none
- [x] `FullscreenDialog` — `1 / 1` exported; missing: none
- [x] `DialogTrigger` — `1 / 1` exported; missing: none
- [x] `DialogContainer` — `2 / 2` exported; missing: none
- [x] `Divider` — `1 / 1` exported; missing: none
- [x] `DropZone` — `1 / 1` exported; missing: none
- [x] `Form` — `1 / 1` exported; missing: none
- [x] `Icon` — `2 / 2` exported; missing: none
- [x] `IllustratedMessage` — `1 / 1` exported; missing: none
- [x] `Image` — `1 / 1` exported; missing: none
- [ ] `ImageCoordinator` — `0 / 1` exported; missing: `ImageCoordinator`
- [x] `InlineAlert` — `1 / 1` exported; missing: none
- [x] `Link` — `1 / 1` exported; missing: none
- [x] `Menu` — `5 / 5` exported
- [x] `Meter` — `1 / 1` exported; missing: none
- [x] `Modal` — `1 / 1` exported; missing: none
- [ ] `NotificationBadge` — `0 / 1` exported; missing: `NotificationBadge`
- [x] `NumberField` — `1 / 1` exported; missing: none
- [x] `Picker` — `3 / 3` exported; missing: none
- [x] `Popover` — `1 / 1` exported; missing: none
- [x] `ProgressBar` — `1 / 1` exported; missing: none
- [x] `ProgressCircle` — `1 / 1` exported; missing: none
- [x] `Provider` — `1 / 1` exported; missing: none
- [x] `Radio` — `1 / 1` exported; missing: none
- [x] `RadioGroup` — `1 / 1` exported; missing: none
- [x] `RangeCalendar` — `1 / 1` exported; missing: none
- [x] `RangeSlider` — `1 / 1` exported; missing: none
- [x] `SearchField` — `1 / 1` exported; missing: none
- [ ] `SegmentedControl` — `0 / 2` exported; missing: `SegmentedControl`, `SegmentedControlItem`
- [x] `SelectBoxGroup` — `2 / 2` exported; missing: none
- [x] `Slider` — `1 / 1` exported; missing: none
- [ ] `Skeleton` — `0 / 2` exported; missing: `Skeleton`, `useIsSkeleton`
- [ ] `SkeletonCollection` — `0 / 1` exported; missing: `SkeletonCollection`
- [x] `StatusLight` — `1 / 1` exported; missing: none
- [x] `Switch` — `1 / 1` exported; missing: none
- [x] `TableView` — `7 / 7` exported
- [ ] `Tabs` — `0 / 4` exported; missing: `Tabs`, `TabList`, `Tab`, `TabPanel`
- [x] `TagGroup` — `2 / 2` exported; missing: none
- [x] `TextField` — `2 / 2` exported; missing: none
- [x] `TimeField` — `1 / 1` exported; missing: none
- [x] `Toast` — `2 / 2` exported; missing: none
- [x] `ToggleButton` — `1 / 1` exported; missing: none
- [x] `ToggleButtonGroup` — `1 / 1` exported; missing: none
- [x] `Tooltip` — `2 / 2` exported; missing: none
- [x] `Tray` — `1 / 1` exported; missing: none
- [x] `TreeView` — `4 / 4` exported; missing: none
- [x] `pressScale` — `1 / 1` exported; missing: none
- [ ] `react-aria-components` — `0 / 5` exported; missing: `Autocomplete`, `Collection`, `FileTrigger`, `parseColor`, `useLocale`
- [ ] `react-stately` — `0 / 3` exported; missing: `useListData`, `useTreeData`, `useAsyncList`

## Actions and Navigation

- In progress baseline: `@react-spectrum/button` now has Vue `Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, and `ToggleButton` primitives with parity-aligned press lifecycle callbacks (`onPressStart`/`onPressEnd`/`onPressUp`/`onPressChange`/`onPress`), keyboard handler passthrough parity (`onKeydown`/`onKeyup`), native key-default behavior parity (prevent default for non-submit keyboard activation while preserving native submit default for `type="submit"` including explicit Space/Enter form-submit key-path coverage), pending-state behavior (`isPending` delayed spinner visibility plus repeated-press suppression) including localized pending announcements, anchor-element edge-case behavior, and expanded upstream-style test coverage (`Button`, `ActionButton`, `ToggleButton`, `ClearButton`, and SSR scenarios including `FieldButton`); pending parity includes remaining edge-case interaction nuances.
- In progress baseline: `@react-spectrum/actionbar` now has Vue `ActionBar`, `ActionBarItem`, compatibility `Item`, and `ActionBarContainer` primitives with baseline selection-count open/close behavior, clear-selection handling (`clear` action button + Escape key), `ActionGroup` action wiring (including overflow-collapse handoff for constrained layouts), locale-aware default built-in labels (`actions`, clear-selection aria label, clear button text, selected-count copy, and all-selected copy), live selection announcements via `role="status"`, focus restore to the pre-toolbar element on close, close-transition lifecycle wiring (including retaining the last non-zero selected-count label while closing), and static slot composition support with starter test/docs/umbrella coverage; richer animation parity remains.
- In progress baseline: `@react-spectrum/actiongroup` now has Vue `ActionGroup`, `ActionGroupItem`, and compatibility `Item` primitives with baseline item rendering and selection semantics (single/multiple state handling (including no select-all on Cmd/Ctrl+A in multiple mode), disabled-key behavior, orientation classes, roving keyboard focus including RTL handling, tab entry/exit behavior with remembered focused item (including reverse Shift+Tab entry), static slot composition support, static-item data-attribute passthrough, `buttonLabelBehavior="hide"` icon-only class/aria-label wiring, and `buttonLabelBehavior="collapse"` label-collapse/restore behavior under constrained horizontal space), plus baseline `overflowMode="collapse"` behavior (overflow items moved into a menu trigger, full collapse when selection mode is enabled and not all items fit, locale-aware default overflow trigger labels (`more`) for both visible and aria-label fallback behavior, and aria-label forwarding to the overflow menu trigger when fully collapsed, plus group-level aria-labelledby/aria-describedby passthrough, root custom-prop passthrough, and static-item aria-label semantics), with additional upstream-style toolbar composition test coverage (nested action groups, divider orientation parity, toolbar label precedence, and combined action/selection flows) and starter test/docs/umbrella wiring; advanced visual/theming parity remains.
- In progress baseline: `@react-spectrum/tag` now has Vue `TagGroup`, `Tag`, and compatibility `Item` primitives with baseline grid semantics (`grid`/`row`/`gridcell`), keyboard roving focus (LTR/RTL arrow behavior plus Home/End/PageUp/PageDown), tab entry/exit with remembered focused tag (including reverse Shift+Tab entry to the last tag), disabled-key handling, removable-tag callbacks with focus handoff after removal (next tag or grid when empty), explicit remove-button click support, and non-removal on Space key presses, static slot composition support, baseline `maxRows` collapse/expand behavior with locale-aware collapse labels, baseline action-area support (`actionLabel` + `onAction`) including keyboard tab navigation across tags/actions, custom empty-state rendering support (`renderEmptyState`) plus locale-aware default empty-state text, baseline field semantics (`label`/`description`/`errorMessage`) including `Form.validationErrors` integration by field `name`, and baseline tag item passthrough support for data attributes + link-style tags (`href`) + static class overrides (`UNSAFE_className`) with starter test/docs/umbrella wiring; advanced visual/theming parity remains.
- In progress baseline: `@react-spectrum/picker` now has Vue `Picker`, `PickerItem`, `PickerSection`, and compatibility `Item`/`Section` primitives with baseline trigger/listbox interactions (open/close, keyboard navigation, click/keyboard selection, controlled/uncontrolled selection handling, trigger-anchored popover placement support, trigger autofocus support, locale-aware default placeholder copy, mobile tray rendering support, async loading coverage via `isLoading` + `onLoadMore` with trigger `aria-describedby` progress wiring and locale-aware loading labels, form submission/reset wiring via hidden-input `name`/`form` support, validation behavior coverage across `aria` + `native` modes including `validate(value)`, function-style `errorMessage` validation-context support, native `checkValidity` invalid-message/focus lifecycle, native reset-clearing behavior, `Form.validationErrors` integration by field `name` with clear-on-selection behavior, static slot composition support, empty-string key coverage, and dedicated upstream-style `TempUtilTest` coverage plus `test/data` fixture parity for real/fake timer interaction flows and mobile tray behavior) with starter test/docs/umbrella wiring; advanced visual/theming parity remains.
- In progress baseline: `@react-spectrum/menu` now has Vue `Menu`, `MenuSection`, `MenuItem`, compatibility `Item`/`Section`, `SubmenuTrigger`, `ContextualHelpTrigger`, `MenuTrigger`, and `ActionMenu` primitives with baseline trigger/menu interactions (open/close, keyboard navigation, click/keyboard item activation, controlled/default open state, selection-state handling for `none`/`single`/`multiple` plus pointer/keyboard `closeOnSelect` behavior and tab-key focus retention while open, trigger-anchored placement support and custom overlay-container targeting support, section grouping support, static slot composition support, submenu trigger behavior with static `trigger + Menu` composition support, locale-aware default trigger labels when `label` is omitted, Escape-key close without firing submenu `onClose` callbacks plus single-open sibling submenu coordination, locale-aware ArrowLeft/ArrowRight open-close semantics in LTR/RTL, hover-open behavior with hover-leave close to neighboring items while preserving open state during pointer movement between trigger and submenu content, disabled-state propagation from static trigger `Item` content and static trigger key membership in `disabledKeys`, suppression of `onAction` and submenu selection callbacks when activating submenu-trigger items, submenu `selectionMode`/`onSelectionChange` support, submenu close-on-focus-leave to neighboring items with Tab-key focus containment inside submenu content, and submenu `onClose` callbacks on selection-close (including combined submenu `onAction` + `onClose` flows), `MenuTrigger` static `trigger + Menu` composition support, ActionMenu trigger-label/aria/autofocus parity coverage including locale-aware default trigger aria labels, `aria-labelledby` precedence, and trigger-id-to-menu labeling, accessibility parity for menu label guardrails plus section/item `aria-label` semantics, static contextual-help composition support where unavailable items show a locale-aware indicator icon label, open dialogs, and suppress action callbacks with click/hover/`ArrowRight` opening (gated to unavailable items) plus close-on-hover/focus-move behavior, and upstream-style submenu suite naming parity via `SubMenuTrigger.test`) with starter test/docs/umbrella wiring; additional upstream submenu close edge-cases and visual overlay parity remain.
- In progress baseline: `@react-spectrum/tabs` now has Vue `Tabs`, `TabList`, `TabPanels`, and compatibility `Item` primitives with keyboard navigation and selection-state coverage (horizontal/vertical orientation behavior, automatic/manual activation, disabled-key handling, initial tab-entry focus parity including selected-tab entry and disabled-tabpanel fallback focus, controlled/uncontrolled selection, onSelectionChange firing when activating the already selected tab, all-disabled fallback selection callback parity, selected-tab-removal fallback parity when the current tab is removed, tab-root custom-prop passthrough, scoped-slot and static `Item` compatibility composition including tab-item data/ARIA prop passthrough, corrected static per-item label/panel mapping, and fragment composition support across static children, renderer slots, and mapped static-item fragments, link-tab anchor rendering via `href`, user-ref `UNSAFE_getDOMNode` exposure parity, tabpanel tabbable-child `tabIndex` parity behavior with child-subtree isolation across panel switches, baseline horizontal overflow collapse-to-picker behavior (including no-collapse coverage when all tabs fit, disabled-option selection suppression in the collapsed picker, and dynamic collapse/expand behavior across item-count/orientation rerenders), baseline selection-indicator positioning parity including RTL transform coverage, collapsed tabpanel labeling by picker id, collapsed picker aria-labeling composition for `aria-label` + external `aria-labelledby`, and SSR/docs/umbrella wiring); pending parity includes full visual/theming polish.
- In progress baseline: `@react-spectrum/textfield` now has Vue `TextField` and `TextArea` primitives with label/help/error semantics, controlled/uncontrolled value handling, controlled form-reset parity, placeholder deprecation warning parity, validation behavior coverage (`aria` + `native`), `validate(value)` support for ARIA realtime validation messaging plus native custom-validity wiring, native required/invalid messaging lifecycle support (`checkValidity`-triggered display with valid-blur clearing), function-style native `errorMessage` customizer support from validation context, native-mode `Form.validationErrors` custom-validity integration (including repeated-submit persistence until edit), `Form.validationErrors` integration by field `name` including server-error clearing on field edits, textarea auto-resize parity based on content `scrollHeight` (including quiet variant growth and explicit-height no-resize behavior), icon/loading indicator + validation icon behavior (including locale-aware valid-icon labels), ARIA/data passthrough coverage (including `aria-errormessage` and `excludeFromTabOrder`), dedicated upstream-style TextField/TextArea split test files (including separate SSR suites), and SSR/docs/umbrella wiring; pending parity includes deeper native-form validation and interaction edge cases.
- In progress baseline: `@react-spectrum/steplist` now has Vue `StepList`, `StepListItem`, and compatibility `Item` primitives with baseline progression and selection-state behavior (completed-step gating, controlled/uncontrolled selected step handling, disabled/read-only handling, static slot composition support, localized step-state messages, segment/chevron visuals with RTL handling, and SSR/docs/umbrella wiring); advanced visual/theming parity remains.
- [ ] `@react-spectrum/button` -> `@vue-spectrum/button`
- [ ] `@react-spectrum/actionbar` -> `@vue-spectrum/actionbar`
- [ ] `@react-spectrum/actiongroup` -> `@vue-spectrum/actiongroup`
- [x] `@react-spectrum/buttongroup` -> `@vue-spectrum/buttongroup`
- [x] `@react-spectrum/link` -> `@vue-spectrum/link`
- [x] `@react-spectrum/breadcrumbs` -> `@vue-spectrum/breadcrumbs` (includes `Item` compatibility alias and dedicated `BreadcrumbItem` parity test coverage)
- [ ] `@react-spectrum/tabs` -> `@vue-spectrum/tabs`
- [x] `@react-spectrum/accordion` -> `@vue-spectrum/accordion`
- [ ] `@react-spectrum/steplist` -> `@vue-spectrum/steplist`
- [ ] `@react-spectrum/tag` -> `@vue-spectrum/tag`
- [ ] `@react-spectrum/menu` -> `@vue-spectrum/menu`
- [ ] `@react-spectrum/picker` -> `@vue-spectrum/picker`

## Inputs and Selection

- In progress baseline: `@react-spectrum/slider` now has Vue `Slider`, `RangeSlider`, `SliderBase`, and `SliderThumb` primitives with baseline parity-style tests/docs and umbrella wiring (controlled/uncontrolled behavior, value output semantics, localized range-thumb labels, expanded controlled/uncontrolled clamp matrix coverage for min/max/step normalization, keyboard page/home/end coverage for single and range sliders including upstream-style default page-size snapping to step multiples across uneven ranges, upstream-style keyboard test helper parity via `test/utils`, track-click behavior, and SSR coverage); advanced interaction and formatting parity remains.
- In progress baseline: `@react-spectrum/searchfield` now has Vue `SearchField` primitive with baseline parity-style tests/docs and umbrella wiring (search input semantics, Enter submit behavior, Escape and clear-button clear semantics including locale-aware clear-button aria labels plus read-only Enter passthrough behavior, custom/default icon support, controlled/uncontrolled value behavior, slot-prop override parity via `searchfield` slot context, placeholder deprecation warning parity, description/error wiring, `validate(value)` support across ARIA/native validation modes including native custom error-message functions, `Form.validationErrors` integration by field `name` with clear-on-input behavior, and SSR coverage); advanced upstream visual polish and theming parity remains.
- In progress baseline: `@react-spectrum/numberfield` now has Vue `NumberField` primitive with baseline parity-style tests/docs and umbrella wiring (numeric input semantics, min/max clamping, controlled/uncontrolled value handling, step-boundary snapping for stepped values across value/default normalization + blur commit + non-step increment recovery, locale-aware parser behavior for currency/percent inputs with invalid partial-character rejection plus full-selection paste commit behavior and invalid non-empty blur reversion to the last valid formatted value, stepper increment/decrement behavior including empty-field initial-step parity for unbounded/min-bounded/max-bounded flows plus pointer-type-aware stepper focus behavior (mouse -> input, non-mouse -> pressed control), typed out-of-range and min/max-step edge disable-state parity for steppers with clear-input re-enable coverage, upstream roledescription/label wiring parity (`aria-roledescription="Number field"`), long-press auto-repeat stepper behavior, upstream-style platform inputMode selection (including currency-without-decimals behavior), focused wheel-step behavior with zoom/horizontal guards, minus-sign empty-input blur handling without spurious `onChange` emission, custom increment/decrement aria-label support, hide-stepper support, hidden form-input support, uncontrolled form-reset behavior plus controlled null-like reset-to-blank handling, `data-*` passthrough to the native input, component-ref DOM/focus helpers (`UNSAFE_getDOMNode`, `focus`), `validate(value)` support across ARIA/native modes, native required/invalid messaging lifecycle behavior (`checkValidity` display with valid-blur clearing), function-style native `errorMessage` customizers, `Form.validationErrors` integration by field `name` including submit-driven native server-error flows with clear-on-input behavior, and SSR coverage); advanced locale nuances remain.
- In progress baseline: `@react-spectrum/combobox` now has Vue `ComboBox`, `ComboBoxItem`, `ComboBoxSection`, and compatibility `Item`/`Section` primitives with baseline input/listbox ARIA wiring via `@vue-aria/combobox` + `@vue-aria/combobox-state`, type-to-filter behavior, button-trigger opening plus `menuTrigger="focus"` open behavior (including trigger-click focus-open semantics with `onOpenChange(..., "focus")`, input-focus retention, and no initial `aria-activedescendant` until keyboard navigation), keyboard-open parity (`ArrowUp` opens with last option focused) with manual-trigger `onOpenChange` semantics, no-match menu suppression including close-after-open filtering behavior, `menuTrigger="manual"` typing behavior, space-only input no-match coverage, `menuTrigger="input"` and `menuTrigger="focus"` clear-input reopen behavior, readonly keyboard-open suppression with value retention, controlled/uncontrolled selection/input/open state handling including controlled `inputValue` and `selectedKey` prop updates plus dual-controlled clear behavior without spurious `onSelectionChange` emission and uncontrolled clear-to-null selection parity, open-list refresh parity when controlled `items` update plus mapped-slot item refresh parity when list labels change (including selected-text refresh while unfocused without overwriting focused user input), uncontrolled input/selection free-update flow parity, `defaultInputValue` no-preselection parity, `defaultSelectedKey` initial-input parity, combined `defaultSelectedKey + defaultInputValue` matching/mismatch parity, invalid-input semantics (`validationState="invalid"` and `isInvalid` set `aria-invalid`), root/field validation-state class parity (`is-invalid`/`is-valid`), provider/form inherited state parity for `isDisabled`/`isReadOnly`/`isRequired`/`validationState`, `Form.validationErrors` integration by field `name` with clear-on-input behavior, and baseline validation callback behavior (`validate`) with `validationBehavior` support (`aria` errors and native custom-validity wiring) plus function-style native `errorMessage` customizer context support and submit/checkValidity-driven native required-error display parity (no blur-only commit), delayed input loading-indicator parity (500ms timer with filtering/manual gating plus early-finish cancel, loading-to-filtering no-reset, input-change reset, and idle-hide) plus locale-aware loading-empty placeholder and loading aria-label parity (`loading` / `loadingMore`) with initial-open `onLoadMore` parity when the listbox is already at scroll end, reopen suppression once the listbox is no longer at that threshold, duplicate-call suppression while remaining at that threshold, reset parity when scrolling away and back to the threshold, and `onLoadMore` suppression while loading/loadingMore is active, disabled-key filtering semantics (disabled matches remain unfocused), grouped-section semantics for slot-defined sections (`role="group"` + heading wiring with filtering-aware section visibility), placeholder deprecation warning parity, native form wiring (`name`/`form`) plus `formValue="key"` hidden-input behavior (with `allowsCustomValue` forcing text form submission), form-reset behavior (including `defaultSelectedKey` restore), close behavior when the already selected item is committed via Enter or click, scroll-dismiss parity for open menus on page scroll, tab/shift-tab focused-item commit flow parity, mouse-down focus-retention parity while pressing options with commit on release, blur-commit parity coverage for selected-value reset, controlled-selected custom-value commit, selected-key retention when input matches on outside blur and unchanged-value Tab/Enter commits, manual-trigger unmatched-input clearing on blur, disabled-option blur clearing, and focused-item non-selection on blur, NVDA parity behavior where Left/Right clears `aria-activedescendant`, explicit input `onBlur` callback coverage, component-ref parity (`UNSAFE_getDOMNode` + `focus()`), root `data-*` passthrough support, static slot composition support, and starter/SSR tests plus docs/umbrella wiring; advanced popover/mobile-tray and full async UX parity remain.
- In progress baseline: `@react-spectrum/autocomplete` now has Vue `SearchAutocomplete`, `SearchAutocompleteItem`, `SearchAutocompleteSection`, and compatibility `Item`/`Section` primitives with baseline combobox/search/listbox ARIA wiring via `@vue-aria/combobox` + `@vue-aria/combobox-state`, type-to-filter behavior, clear-button handling including locale-aware clear-button aria labels and validation-state visibility when input is empty, submit callbacks, keyboard-open parity (`ArrowUp` opens with last option focused) with manual-trigger `onOpenChange` semantics, readonly arrow-key open suppression, `menuTrigger="focus"` open behavior (including no initial `aria-activedescendant` on focus-open), disabled-key filtering semantics (disabled matches remain unfocused), grouped-section semantics for slot-defined sections (`role="group"` + heading wiring with filtering-aware section visibility), no-match menu suppression including close-after-open filtering behavior, `menuTrigger="manual"` typing behavior, space-only input no-match coverage, `menuTrigger="input"` and `menuTrigger="focus"` clear-input reopen behavior, placeholder deprecation warning parity, native form wiring (`name`/`form`) with form-reset behavior (including `defaultInputValue` restore), Enter-close behavior when the focused item is already selected, blur-commit parity coverage for custom-value retention and selected-key retention when input matches on outside blur, single-fire callback parity for key/focus/input/blur interaction events, controlled-items custom-filter update parity via `onInputChange` plus open-list refresh parity when controlled `items` update and mapped-slot item refresh parity when list labels change (without overwriting focused user input), uncontrolled input/selection free-update flow parity, `defaultInputValue` no-preselection parity, invalid-input semantics (`validationState="invalid"` and `isInvalid` set `aria-invalid`), root/field validation-state class parity (`is-invalid`/`is-valid`), provider/form inherited state parity for `isDisabled`/`isReadOnly`/`isRequired`/`validationState`, `Form.validationErrors` integration by field `name` with clear-on-input behavior, and baseline validation callback behavior (`validate`) with `validationBehavior` support (`aria` errors and native custom-validity wiring) plus function-style native `errorMessage` customizer context support and submit/checkValidity-driven native required-error display parity (no blur-only commit), delayed input loading-indicator parity (500ms timer with filtering/manual gating plus early-finish cancel, loading-to-filtering no-reset, idle-hide, and input-change reset behavior) plus locale-aware loading/no-results labeling parity and loading aria-label parity (`loading` / `loadingMore`) with initial-open `onLoadMore` parity when the listbox is already at scroll end, reopen suppression once the listbox is no longer at that threshold, duplicate-call suppression while remaining at that threshold, reset parity when scrolling away and back to the threshold, and `onLoadMore` suppression while loading/loadingMore is active, mouse-down focus-retention parity while pressing options with commit on release, NVDA parity behavior where Left/Right clears `aria-activedescendant`, controlled `inputValue` and `selectedKey` prop update behavior, explicit input `onBlur` callback coverage, component-ref parity (`UNSAFE_getDOMNode` + `focus()`), static slot composition support, and starter/SSR tests plus docs/umbrella wiring; advanced popover/mobile-tray behavior and full async UX parity remain.
- In progress baseline: `@react-spectrum/calendar` now has Vue `Calendar` and `RangeCalendar` primitives with baseline month paging behavior, selected-date/range semantics, click and keyboard date selection flow, dedicated upstream-style `CalendarBase` + `RangeCalendar` test-file coverage, and starter/SSR tests plus docs/umbrella wiring; advanced visual/theming parity and deeper locale-formatting parity remain.
- In progress baseline: `@react-spectrum/color` now has Vue `ColorArea`, `ColorWheel`, `ColorSlider`, `ColorField`, `ColorSwatch`, `ColorPicker`, `ColorEditor`, `ColorSwatchPicker`, and `ColorThumb` primitives with baseline hex-color parsing/editing flows, picker popover behavior, locale-aware default swatch labels in `ColorField`/`ColorPicker`, dedicated upstream-style per-component test-file coverage (`ColorArea`/`ColorField`/`ColorPicker`/`ColorSlider`/`ColorSwatchPicker`/`ColorWheel`), and starter/SSR tests plus docs/umbrella wiring; advanced color-space interactions and full visual/theming parity remain.
- In progress baseline: `@react-spectrum/datepicker` now has Vue `DateField`, `TimeField`, `DatePicker`, and `DateRangePicker` primitives with baseline native date/time field behavior, popover calendar selection for single and range values, dedicated upstream-style split test-file coverage (`DateField`/`TimeField`/`DatePickerBase`/`DateRangePicker`), and starter/SSR tests plus docs/umbrella wiring; segmented-field parity, full range-time behavior, and deeper visual/theming parity remain.
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

- In progress baseline: `@react-spectrum/list` now has Vue `ListView`, `Collection`, `ListViewItem`, and compatibility `Item` primitives with baseline grid/list semantics (`grid` + `row` + `gridcell`), keyboard row navigation, controlled/uncontrolled single and multiple selection behavior, static slot composition support (including `Collection` scoped-item rendering), row-focus marshalling on cell press, row child-action focus cycling (`ArrowLeft`/`ArrowRight`) including RTL ordering, disabled-row propagation to nested native controls, loading/empty-state rendering with locale-aware loading progress labels, and scroll-bottom `onLoadMore` behavior with starter/SSR tests plus docs/umbrella wiring; advanced drag-and-drop and full visual parity remain.
- In progress baseline: `@react-spectrum/listbox` now has Vue `ListBox`, `ListBoxBase`, `Collection`, `ListBoxOption`, `ListBoxSection`, and compatibility `Item`/`Section` primitives with baseline grouped-option semantics (`group` + heading + divider behavior), keyboard navigation coverage (including optional wrap focus), controlled/uncontrolled single and multiple selection behavior, static slot composition support (including `Collection` scoped-item rendering), disabled-key handling, locale-aware loading progress labels, and starter/SSR tests plus docs/umbrella wiring; advanced virtualizer and full visual/theming parity remain.
- In progress baseline: `@react-spectrum/table` now has Vue `TableView`, `Column`, `TableHeader`, `TableBody`, `Section`, `Row`, `Cell`, and `EditableCell` primitives with baseline static table semantics (`grid` + `rowgroup` + `row` + `columnheader` + `rowheader` + `gridcell`), expanded ARIA matrix parity (`aria-rowcount`, row/column index attributes, and unsorted-header `aria-sort` omission), keyboard row navigation, row-focus marshalling on non-focusable cell press, focused-child retention with left/right child-control cycling (including RTL ordering) and ArrowDown continuation after pressing interactive cell content, controlled/uncontrolled selection behavior, sort-state handling, and starter/SSR tests plus docs/umbrella wiring (including upstream-style `Table.test` / `Table.ssr.test` suite naming and shared `TableTests` fixture scaffolding parity); advanced upstream resizing/nested-row/virtualization and drag-and-drop parity remain.
- In progress baseline: `@react-spectrum/tree` now has Vue `Collection`, `TreeView`, `TreeViewItem`, and `TreeViewItemContent` primitives with baseline treegrid semantics (`treegrid` + `row` + `gridcell`), nested expansion-state handling, controlled/uncontrolled selection behavior, keyboard navigation, static slot composition support (including `Collection` scoped-item rendering), and starter/SSR tests plus docs/umbrella wiring; advanced drag-and-drop parity remains.
- [ ] `@react-spectrum/list` -> `@vue-spectrum/list`
- [ ] `@react-spectrum/listbox` -> `@vue-spectrum/listbox`
- [ ] `@react-spectrum/table` -> `@vue-spectrum/table`
- [ ] `@react-spectrum/tree` -> `@vue-spectrum/tree`

## Overlays and Messaging

- In progress baseline: `@react-spectrum/overlays` now has Vue `Overlay`, `Popover`, `Modal`, `Tray`, and `OpenTransition` primitives with baseline portal-mount behavior (including `@vue-aria/overlays` `UNSAFE_PortalProvider` container context + nested `getContainer={null}` reset parity), transition lifecycle callback wiring, Popover positioning/dismiss semantics (`Escape` close, modal underlay press close behavior + focus-within blur-close support + non-modal mode support, locale-aware hidden dismiss buttons, and arrow visibility toggles), Modal overlay semantics (`Escape` close, optional outside-dismiss, underlay, and modal scroll-lock/focus-containment behavior), and Tray semantics (always-dismissable outside click, `Escape` close, optional blur-close via `shouldCloseOnBlur`, locale-aware hidden dismiss buttons, and fixed-height class support) plus starter/SSR tests and docs/umbrella wiring; advanced visual/theming and mobile edge-case parity remains.
- In progress baseline: `@react-spectrum/dialog` now has Vue `Dialog`, `AlertDialog`, `DialogTrigger`, and `DialogContainer` primitives with baseline trigger/container wiring, dismiss/escape behavior, alert-dialog action parity (primary/secondary/cancel flows, disabled-action suppression, warning/error alert-type icon semantics with localized labels, `autoFocusButton` coverage, and test-id support), mobile popover fallback parity in `DialogTrigger` (`popover` -> `modal` by default on mobile with `mobileType` override) with forced modal dismissability matching upstream fallback behavior, expanded `DialogTrigger` dismissal and state parity (outside-click gating across overlay modes including nested-overlay exclusion for popover interaction continuity, hidden dismiss-button close with focus restoration and locale-aware dismiss labels, trigger-toggle close, `Escape` close focus restoration, focus-restore fallback for outside-dismiss with `defaultOpen` mount cases, controlled/uncontrolled open-state coverage with `onOpenChange` assertions including outside-dismiss callback semantics across modal/popover paths, keyboard-dismiss-disabled behavior, injected close-callback flows, built-in `Dialog` dismiss-button close coverage, modal last-focused-element containment for nested focus stacks, and modal/tray `aria-hidden` isolation of non-overlay body content), keyboard focus-containment loop coverage (`Tab`/`Shift+Tab`) across trigger/container overlays, expanded `DialogContainer` dismissal semantics (Escape close, keyboard-dismiss-disabled behavior, and outside-click dismissal gating via `isDismissable`), custom portal-container targeting support across trigger/container overlays (`container`) with modal/tray/popover coverage plus provider-based routing through `UNSAFE_PortalProvider` (including nested null override reset coverage for trigger overlays), popover anchor targeting via `targetRef`, popover scroll-dismiss parity (including external `targetRef` anchors), popover-like `hideArrow` prop forwarding for compatible content wrappers, and `Dialog` label hardening (`aria-labelledby` / `aria-label` explicit-prop precedence plus automatic first-heading linkage when no explicit label props are supplied) plus starter/SSR tests and docs/umbrella wiring; advanced overlay/context parity remains.
- In progress baseline: `@react-spectrum/illustratedmessage` now has Vue `IllustratedMessage` primitive with baseline root rendering behavior, slot-based heading/content styling wiring, and starter/SSR tests plus docs/umbrella wiring; advanced visual/theming parity remains.
- In progress baseline: `@react-spectrum/inlinealert` now has Vue `InlineAlert` primitive with baseline alert semantics, variant class behavior, variant-specific icon semantics (`info`/`positive`/`notice`/`negative` with localized accessible labels), autofocus handling, and starter/SSR tests plus docs/umbrella wiring; advanced icon/theming parity remains.
- In progress baseline: `@react-spectrum/tooltip` now has Vue `Tooltip` and `TooltipTrigger` primitives with baseline focus/hover trigger behavior (including default hover-delay parity (1500ms), default hover close-delay parity (500ms), configurable hover timing via `delay`/`closeDelay`, focus-overrides-delay coverage, focus-only trigger mode (`trigger="focus"`), single-visible-tooltip coordination across multiple triggers, and warmup/cooldown parity including immediate reopen within cooldown and no warmup carryover when a trigger is left before delayed open completes), Escape/press/scroll close handling (including global keyboard-dismiss from outside trigger focus, scroll-dismiss parity, combined focus+hover close edge cases, and `shouldCloseOnPress=false` coverage for pointer + keyboard paths), controlled/uncontrolled visibility flows (`isOpen` / `defaultOpen`, including concurrent controlled-open behavior), trigger `aria-describedby` semantics while open, tooltip ref parity via `UNSAFE_getDOMNode`, disabled-trigger behavior (`isDisabled`), portal-container parity through `UNSAFE_PortalProvider` (including nested null override reset semantics), trigger-anchored placement positioning support (including logical `start`/`end` direction mapping), `showIcon` variant semantics (`info`/`positive`/`negative`), and starter/SSR tests plus docs/umbrella wiring; advanced icon-asset/transition and full overlay parity remains.
- In progress baseline: `@react-spectrum/contextualhelp` now has Vue `ContextualHelp` primitive with baseline quiet-trigger popover behavior (including hidden-arrow parity), default/custom ARIA label handling (including locale-aware default label localization), placement support, trigger-ref parity (`UNSAFE_getDOMNode`/`focus()` to the action button), and portal-container routing parity via `UNSAFE_PortalProvider` (including nested null override reset behavior), plus starter/SSR tests and docs/umbrella wiring; advanced icon/animation parity remains.
- In progress baseline: `@react-spectrum/toast` now has Vue `ToastContainer` and `ToastQueue` primitives with baseline global queue helpers, timeout and action/close behavior (including hover/focus timer pause-resume and locale-aware close-button labeling), programmatic close callbacks returned from queue APIs, single-active-container rendering (including rerender stability across container topology changes), focus-restore coverage when dismissing toasts back to previously focused elements, modality-aware stacked-toast dismissal focus parity (keyboard focus handoff to remaining toast and pointer restore to the prior focused element), `F6` keyboard focus transfer into the toast region (including focused-region `focus-ring` class behavior), custom toast-event interception coverage including detail payload parity, localized variant icon semantics, portal-container routing parity via `UNSAFE_PortalProvider` (including nested null override reset behavior), and starter/SSR tests plus docs/umbrella wiring; advanced icon/transition parity remains.
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

- In progress baseline: `@react-spectrum/card` now has Vue `Card`, `CardView`, and layout class primitives with baseline tests/docs plus keyboard navigation (`Arrow*`, `Home`/`End`, `PageUp`/`PageDown`, and RTL-aware left/right navigation), selection state handling (`selectedKeys`/`defaultSelectedKeys`/`disabledKeys`/`onSelectionChange`) including controlled updates and falsy-key support, single/multiple selection coverage (including single-mode deselection on re-activate), loading-state and empty-state rendering (`loading`, `loadingMore`, `filtering`, `renderEmptyState`) with locale-aware loading progress labels, scroll-bottom `onLoadMore` callback behavior (suppressed while loading), checkbox interaction behavior, `selectionMode="none"` behavior checks, focusable-child warnings (excluding internal checkbox), and falsy-id coverage; advanced layout and interaction parity is still pending.
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
