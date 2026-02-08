# Roadmap

The full tracker lives in `/PORTING_TRACKER.md`.

## Snapshot

- Tracked items completed: `104 / 133` (about `78.2%`)
- Tracked items remaining: `29`
- Current parity focus: stately + date/time hardening

## Done So Far

- Foundation primitives: `mergeProps`, `useId`, `provideSSR`, `useIsSSR`, `filterDOMProps`, `provideI18n`, `useLocale`, `announce`, `provideRouter`, `useRouter`
- Focus and interactions: `useFocusVisible`, `useFocusRing`, `usePress`, `useKeyboard`, `useFocus`, `useFocusWithin`, `useHover`, `useLongPress`, `useMove`, `useInteractOutside`
- Core semantics: `useButton`, `useToggleButton`, `useLink`, `useLabel`, `useField`, `useSeparator`
- Accessibility utility/component: `useVisuallyHidden`, `VisuallyHidden`, `useDescription`, `useErrorMessage`
- Form controls: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`
- Selection controls: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`
- Date/time: `useDateField`, `useDateSegment`
- Date/time pickers: `useDatePickerGroup`, `useDatePicker`, `useDateRangePicker`, `useTimeField`
- Calendar: `useCalendarBase`, `useCalendar`, `useCalendarCell`, `useRangeCalendar`
- Navigation: `useBreadcrumbItem`
- Disclosure: `useDisclosure`, `useDisclosureState`
- Disclosure groups: `useDisclosureGroupState`
- Accordion item behavior: `useAccordionItem`
- Collections foundation: `buildCollection`
- Menu stack: `useMenuTriggerState`, `useSubmenuTriggerState`, `useMenuTrigger`, `useMenu`, `useMenuItem`, `useMenuSection`, `useSubmenuTrigger`
- Overlay primitives: `useOverlayTriggerState`, `useOverlayTrigger`, `useOverlay`, `useOverlayPosition`, `useModal`, `useModalOverlay`, `useOverlayFocusContain`, `usePreventScroll`, `usePopover`
- Stately primitives: `useToggleState`, `useListState`, `useSingleSelectListState`, `useMultipleSelectionState`, `useComboBoxState`, `useCalendarState`, `useRangeCalendarState`, `useDatePickerState`
- Dialog: `useDialog`
- Tooltip: `useTooltip`, `useTooltipTrigger`
- Tabs: `useTabs`, `useTabListState`, `useTabList`, `useTab`, `useTabPanel`
- Listbox: `useListBoxState`, `useListBox`, `useOption`, `useListBoxSection`
- Selection primitives: `useListKeyboardDelegate`, `useTypeSelect`
- Select: `useSelectState`, `useSelect`
- ComboBox: `useComboBoxState`, `useComboBox`
- Feedback/status: `useProgressBar`, `useProgressCircle`, `useMeter`

## What Is Left (By Area)

- Foundation: `0` remaining
- Interactions: `0` remaining
- Core semantics: `0` remaining
- Text/number inputs: `0` remaining
- Selection controls: `0` remaining
- Date/time: `1` remaining
- Collections/lists: `0` remaining
- Menus/actions: `0` remaining
- Tabs/disclosure/navigation: `0` remaining
- Overlays/dialogs: `0` remaining
- Grids/tables/trees: `11` remaining
- Drag/drop + virtualizer: `6` remaining
- Feedback/status: `2` remaining
- Stately parity layer: `2` remaining
- Quality gates: `7` remaining

## Critical Path To Parity

### Phase 1: Finish Interaction Baseline (Completed)

- Long press, move, and interact-outside hooks are ported with parity tests.
- Press edge-case baseline parity is in place (touch scroll cancel + virtual click tests).

### Phase 2: Form Controls (Text/Number Completed)

- Text and number baseline complete: `useTextField`, `useSearchField`, `useNumberField`, `useSpinButton`, textarea behavior parity, validation wiring parity.
- Selection controls complete baseline: `useCheckbox`, `useCheckboxGroup`, `useCheckboxGroupItem`, `useRadio`, `useRadioGroup`, `useSwitch`, `useSlider`, `useSliderThumb`, `useSliderState`.
- Date/time baseline is in place across field, picker, and calendar hooks: `useDateField`, `useDateSegment`, `useDatePickerGroup`, `useDatePicker`, `useDateRangePicker`, `useTimeField`, `useCalendarBase`, `useCalendar`, `useCalendarCell`, `useRangeCalendar`.
- Remaining date/time gap: international calendar and timezone behavior parity hardening.

### Phase 3: Data + Advanced Interaction

- Table/grid/tree hooks (`useGrid`, `useTable`, `useTree` families)
- DnD and keyboard DnD parity
- Virtualizer infrastructure parity

### Phase 4: State + Hardening

- React Stately parity layer (or equivalent Vue state packages)
- SSR hydration and id consistency tests
- RTL/i18n and screen-reader validation passes
- Cross-browser validation (Chromium/WebKit/Firefox)

## Immediate Next Milestone

1. Continue stately hardening with tree/table state primitives.
2. Start table/tree/grid aria hooks.
3. Close remaining date/time parity gaps (international calendar + timezone behavior).
