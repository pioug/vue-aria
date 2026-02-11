# Spectrum Component Layer

This section tracks the Vue port of React Spectrum UI component packages.

## Scope

- Upstream source: `references/react-spectrum/packages/@react-spectrum/*`
- Local target scope: `packages/@vue-spectrum/*`
- Current stage: phase-1 foundation migration plus initial display/action packages (`@vue-spectrum/icon`, `@vue-spectrum/form`, `@vue-spectrum/label`, `@vue-spectrum/text`, `@vue-spectrum/view`, `@vue-spectrum/layout`, `@vue-spectrum/link`, `@vue-spectrum/breadcrumbs`, `@vue-spectrum/buttongroup`, `@vue-spectrum/accordion`, `@vue-spectrum/divider`, `@vue-spectrum/well`, `@vue-spectrum/statuslight`, `@vue-spectrum/badge`, `@vue-spectrum/avatar`, `@vue-spectrum/image`, `@vue-spectrum/progress`, `@vue-spectrum/meter`, `@vue-spectrum/labeledvalue`, `@vue-spectrum/checkbox`, `@vue-spectrum/radio`, and `@vue-spectrum/switch` complete) with active foundation/theming baseline work (`@vue-spectrum/provider`, `@vue-spectrum/utils`, `@vue-spectrum/theme-default`, `@vue-spectrum/theme-light`, `@vue-spectrum/theme-dark`, `@vue-spectrum/theme-express`, `@vue-spectrum/style-macro-s1`, `@vue-spectrum/test-utils`, `@vue-spectrum/story-utils`, and `@vue-spectrum/s2`), active controls baseline work (`@vue-spectrum/button`, `@vue-spectrum/actionbar`, `@vue-spectrum/actiongroup`, `@vue-spectrum/tag`, `@vue-spectrum/picker`, `@vue-spectrum/menu`, `@vue-spectrum/list`, `@vue-spectrum/listbox`, `@vue-spectrum/table`, `@vue-spectrum/tree`, `@vue-spectrum/slider`, `@vue-spectrum/textfield`, `@vue-spectrum/tabs`, `@vue-spectrum/searchfield`, `@vue-spectrum/numberfield`, `@vue-spectrum/combobox`, `@vue-spectrum/autocomplete`, `@vue-spectrum/calendar`, `@vue-spectrum/color`, `@vue-spectrum/datepicker`, `@vue-spectrum/filetrigger`, and `@vue-spectrum/steplist`) and messaging/overlay baseline work (`@vue-spectrum/illustratedmessage`, `@vue-spectrum/inlinealert`, `@vue-spectrum/overlays`, `@vue-spectrum/dialog`, `@vue-spectrum/contextualhelp`, `@vue-spectrum/tooltip`, and `@vue-spectrum/toast`) plus drag/drop baseline work (`@vue-spectrum/dnd`, `@vue-spectrum/dropzone`).

## Current Baseline

- `@vue-spectrum/provider`: provider context primitives and media query helpers
- `@vue-spectrum/theme-default` (in progress): default theme package baseline (`theme`) aligned to the provider class-map contract (`global`, `light`, `dark`, `medium`, `large`)
- `@vue-spectrum/theme-light` (in progress): light theme package baseline (`theme`) with provider-compatible theme sections and light/dark class variants (`lightest`/`darkest`)
- `@vue-spectrum/theme-dark` (in progress): dark theme package baseline (`theme`) with provider-compatible theme sections and dark-biased class variants (`dark`/`darkest`)
- `@vue-spectrum/theme-express` (in progress): express theme package baseline (`theme`) layered on top of the default contract with express global and scale variants
- `@vue-spectrum/style-macro-s1` (in progress): style-macro baseline with upstream-compatible runtime/theme helper exports (`style`, `baseColor`, `lightDark`, `focusRing`, `raw`, `keyframes`)
- `@vue-spectrum/test-utils` (in progress): test utility baseline with screen-width helpers for mobile/desktop simulation (`simulateMobile`, `simulateDesktop`)
- `@vue-spectrum/story-utils` (in progress): story utility baseline with Vue `ErrorBoundary` and powerset generation helper (`generatePowerset`)
- `@vue-spectrum/s2` (in progress): early S2 baseline with shared utility exports (`pressScale`, `isDocsEnv`) plus first component primitives (`Provider`, `ActionMenu`, `Button`, `LinkButton`, `ActionButton`, `ActionButtonGroup`, `ButtonGroup`, `ColorField`, `CloseButton`, `DateField`, `NumberField`, `SearchField`, `SelectBox`, `SelectBoxGroup`, `Slider`, `Switch`, `ToggleButton`, `ToggleButtonGroup`)
- `@vue-spectrum/icon`: icon wrapper component primitives (`Icon`, `UIIcon`, `Illustration`)
- `@vue-spectrum/utils`: shared class-name utility baseline
- `@vue-spectrum/form`: form wrapper and form context primitives (`Form`, `useFormProps`, `useFormValidationErrors`)
- `@vue-spectrum/label`: field/label/help text primitives (`Field`, `Label`, `HelpText`)
- `@vue-spectrum/text`: typography primitives (`Text`, `Heading`, `Keyboard`)
- `@vue-spectrum/view`: semantic container primitives (`View`, `Content`, `Header`, `Footer`)
- `@vue-spectrum/layout`: grid/flex layout primitives (`Grid`, `Flex`, helper functions)
- `@vue-spectrum/button` (in progress): button primitives (`Button`, `ActionButton`, `ClearButton`, `FieldButton`, `LogicButton`, `ToggleButton`) with pending-state and expanded press lifecycle behavior
- `@vue-spectrum/actionbar` (in progress): action-bar primitives (`ActionBar`, `ActionBarContainer`) with baseline selected-count rendering and clear-selection/action wiring
- `@vue-spectrum/actiongroup` (in progress): action-group primitive (`ActionGroup`) with baseline item rendering, selection state, and keyboard roving behavior
- `@vue-spectrum/tag` (in progress): tag primitives (`TagGroup`, `Tag`) with baseline grid semantics, roving focus, and removable-tag behavior
- `@vue-spectrum/picker` (in progress): picker primitive (`Picker`) with baseline trigger/listbox interaction, keyboard navigation, and controlled/uncontrolled selection behavior
- `@vue-spectrum/menu` (in progress): menu primitives (`Menu`, `MenuItem`, `MenuTrigger`, `ActionMenu`) with baseline trigger/menu interaction and selection behavior
- `@vue-spectrum/list` (in progress): list primitives (`ListView`, `ListViewItem`) with baseline grid/list semantics, keyboard row navigation, and single/multiple selection behavior
- `@vue-spectrum/listbox` (in progress): listbox primitives (`ListBox`, `ListBoxBase`, `ListBoxOption`, `ListBoxSection`) with baseline section semantics, keyboard navigation, and single/multiple selection behavior
- `@vue-spectrum/table` (in progress): table primitives (`TableView`, `Column`, `TableHeader`, `TableBody`, `Section`, `Row`, `Cell`) with baseline static table semantics, row selection, keyboard navigation, and sortable header-state behavior
- `@vue-spectrum/tree` (in progress): tree primitives (`TreeView`, `TreeViewItem`, `TreeViewItemContent`) with baseline treegrid semantics, nested expansion state, keyboard navigation, and controlled/uncontrolled selection behavior
- `@vue-spectrum/illustratedmessage` (in progress): illustrated-message primitive (`IllustratedMessage`) with baseline heading/content slot styling and SSR coverage
- `@vue-spectrum/inlinealert` (in progress): inline-alert primitive (`InlineAlert`) with baseline alert semantics, variant classes, and autofocus behavior
- `@vue-spectrum/overlays` (in progress): overlay primitives (`Overlay`, `OpenTransition`) with baseline portal rendering and transition lifecycle wiring
- `@vue-spectrum/dialog` (in progress): dialog primitives (`Dialog`, `AlertDialog`, `DialogTrigger`, `DialogContainer`) with baseline trigger/container wiring and action flows
- `@vue-spectrum/contextualhelp` (in progress): contextual-help primitive (`ContextualHelp`) with baseline trigger/popover rendering and default/custom label behavior
- `@vue-spectrum/tooltip` (in progress): tooltip primitives (`Tooltip`, `TooltipTrigger`) with baseline focus/hover trigger behavior and Escape/press close handling
- `@vue-spectrum/toast` (in progress): toast primitives (`ToastContainer`, `ToastQueue`) with baseline global queue behavior, action/close handling, and timeout/event support
- `@vue-spectrum/dnd` (in progress): collection dnd hooks (`useDragAndDrop`) with baseline drag/drop hook composition over `@vue-aria/dnd` and `@vue-aria/dnd-state`
- `@vue-spectrum/dropzone` (in progress): dropzone primitive (`DropZone`) with baseline drop-target lifecycle, filled banner behavior, and starter drag/drop coverage
- `@vue-spectrum/buttongroup`: button-group primitive (`ButtonGroup`) with overflow-to-vertical behavior and disabled-context propagation
- `@vue-spectrum/accordion`: disclosure-group primitives (`Accordion`, `Disclosure`, `DisclosureTitle`, `DisclosurePanel`) with keyboard, controlled/uncontrolled expansion, and SSR parity coverage
- `@vue-spectrum/checkbox`: checkbox primitives (`Checkbox`, `CheckboxGroup`) with standalone/group state handling and validation semantics
- `@vue-spectrum/radio`: radio primitives (`Radio`, `RadioGroup`) with controlled/uncontrolled behavior, orientation, and group validation semantics
- `@vue-spectrum/switch`: switch field primitive (`Switch`) with controlled/uncontrolled behavior, read-only/disabled support, and ARIA labeling parity
- `@vue-spectrum/slider` (in progress): slider primitives (`Slider`, `RangeSlider`) with controlled/uncontrolled value handling, output label behavior, and baseline interaction coverage
- `@vue-spectrum/tabs` (in progress): tabs primitives (`Tabs`, `TabList`, `TabPanels`) with keyboard navigation and controlled/uncontrolled selection behavior
- `@vue-spectrum/textfield` (in progress): text input primitives (`TextField`, `TextArea`) with label/help/error semantics and controlled/uncontrolled value behavior
- `@vue-spectrum/searchfield` (in progress): search input primitive (`SearchField`) with Enter submit behavior, Escape/clear-button clearing semantics, and controlled/uncontrolled value behavior
- `@vue-spectrum/numberfield` (in progress): numeric input primitive (`NumberField`) with controlled/uncontrolled value support, clamped min/max behavior, and baseline stepper interactions
- `@vue-spectrum/combobox` (in progress): combobox primitive (`ComboBox`) with baseline input/listbox ARIA wiring, filter-on-type behavior, and controlled/uncontrolled selection/input/open state handling
- `@vue-spectrum/autocomplete` (in progress): search autocomplete primitive (`SearchAutocomplete`) with baseline combobox/search/listbox ARIA wiring, type-to-filter behavior, clear-button semantics, submit callbacks, and loading/load-more handling
- `@vue-spectrum/calendar` (in progress): calendar primitives (`Calendar`, `RangeCalendar`) with baseline month paging, keyboard/click date selection behavior, range selection flow, and SSR coverage
- `@vue-spectrum/color` (in progress): color primitives (`ColorArea`, `ColorWheel`, `ColorSlider`, `ColorField`, `ColorSwatch`, `ColorPicker`, `ColorEditor`, `ColorSwatchPicker`, `ColorThumb`) with baseline hex-color editing and selection flows
- `@vue-spectrum/datepicker` (in progress): date-entry primitives (`DateField`, `TimeField`, `DatePicker`, `DateRangePicker`) with baseline native field behavior, popover calendar selection flows, and SSR coverage
- `@vue-spectrum/filetrigger` (in progress): file selection trigger primitive (`FileTrigger`) with pressable-child integration, hidden input behavior, and file-selection callbacks
- `@vue-spectrum/steplist` (in progress): step navigation primitives (`StepList`, `StepListItem`) with baseline progression and selection state behavior
- `@vue-spectrum/link`: navigation link primitive (`Link`)
- `@vue-spectrum/breadcrumbs`: breadcrumb primitives (`Breadcrumbs`, `BreadcrumbItem`) with overflow/menu collapsing and link/action semantics
- `@vue-spectrum/divider`: divider primitive (`Divider`)
- `@vue-spectrum/well`: content well primitive (`Well`)
- `@vue-spectrum/statuslight`: status indicator primitive (`StatusLight`)
- `@vue-spectrum/badge`: metadata badge primitive (`Badge`)
- `@vue-spectrum/avatar`: avatar primitive (`Avatar`)
- `@vue-spectrum/image`: image primitive (`Image`)
- `@vue-spectrum/progress`: progress primitives (`ProgressBar`, `ProgressCircle`)
- `@vue-spectrum/meter`: meter primitive (`Meter`)
- `@vue-spectrum/labeledvalue`: labeled read-only value primitive (`LabeledValue`)
- `@vue-spectrum/card` (in progress): card primitives (`Card`, `CardView`, `GridLayout`, `GalleryLayout`, `WaterfallLayout`) with baseline keyboard and selection-state support
- `@vue-spectrum/vue-spectrum`: umbrella export package for the component layer

## Rules For Marking A Package Complete

1. Runtime behavior ported from upstream package intent.
2. Upstream-equivalent tests ported and passing.
3. Package docs page added under `docs/spectrum/`.
4. Package exported via `@vue-spectrum/vue-spectrum`.
5. Parity and repo checks pass:

```bash
npm run check
npm run test
npm run test:spectrum-parity
npm run test:cross-browser
```

## Tracker

- Checklist: `/SPECTRUM_PORTING_TRACKER.md`
- Strategy and phases: `/docs/porting/spectrum-roadmap.md`
- Cross-browser demos: `/docs/spectrum/cross-browser-demos.md`
- Theming baseline: `/docs/spectrum/theming-baseline.md`

## Scaffolding Helper

Create new package/docs/test stubs with:

```bash
npm run scaffold:spectrum-package -- <package-name>
```
