# Roadmap

The full tracker lives in `/PORTING_TRACKER.md`.

## Snapshot

- Tracked items completed: `61 / 133` (about `45.9%`)
- Tracked items remaining: `72`
- Current parity focus: tabs wrapper parity plus collection/listbox/select stack

## Done So Far

- Foundation primitives: `mergeProps`, `useId`, `provideSSR`, `useIsSSR`, `filterDOMProps`, `provideI18n`, `useLocale`, `announce`
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
- Tabs: `useTabListState`, `useTabList`, `useTab`, `useTabPanel`
- Feedback/status: `useProgressBar`, `useProgressCircle`, `useMeter`

## What Is Left (By Area)

- Foundation: `3` remaining
- Interactions: `0` remaining
- Core semantics: `0` remaining
- Text/number inputs: `0` remaining
- Selection controls: `0` remaining
- Date/time: `1` remaining
- Collections/lists: `8` remaining
- Menus/actions: `7` remaining
- Tabs/disclosure/navigation: `2` remaining
- Overlays/dialogs: `11` remaining
- Grids/tables/trees: `11` remaining
- Drag/drop + virtualizer: `6` remaining
- Feedback/status: `2` remaining
- Stately parity layer: `13` remaining
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

### Phase 3: Overlay + Navigation Systems

- `useSelect`, `useComboBox`, `useListBox`, `useOption`, `useListBoxSection`
- `useMenu`, `useMenuItem`, `useMenuSection`, `useMenuTrigger`
- `useTabs`
- Overlay stack: `useOverlay`, `useOverlayTrigger`, `usePopover`, `useDialog`, `useTooltip`

### Phase 4: Data + Advanced Interaction

- Table/grid/tree hooks (`useGrid`, `useTable`, `useTree` families)
- DnD and keyboard DnD parity
- Virtualizer infrastructure parity

### Phase 5: State + Hardening

- React Stately parity layer (or equivalent Vue state packages)
- SSR hydration and id consistency tests
- RTL/i18n and screen-reader validation passes
- Cross-browser validation (Chromium/WebKit/Firefox)

## Immediate Next Milestone

1. Harden date/time i18n and timezone behavior parity.
2. Move into collection/listbox/select stack after date/time baseline closes.
3. Add state-layer equivalents for calendar/date-picker state where needed.
